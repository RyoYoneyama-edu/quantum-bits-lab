"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import TiptapEditor from "@/components/editor/TiptapEditor";
import TagSelector from "@/components/admin/TagSelector";
import type { CategoryRecord, PostEditorPayload } from "@/lib/types";
import AdminGuard from "@/components/admin/AdminGuard";

type CategoryOption = {
  slug: string;
  label: string;
};

type MediaItem = {
  path: string;
  url: string;
};

type AuthorOption = {
  id: number;
  pen_name: string;
};

const BUCKET = "article-images";
const ROOT_PREFIX = "media";

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [lead, setLead] = useState<any>(null);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [tags, setTags] = useState<string[]>([]);
  const [coverUrl, setCoverUrl] = useState("");
  const [language, setLanguage] = useState("ja");
  const [paperUrl, setPaperUrl] = useState("");
  const [paperTitle, setPaperTitle] = useState("");
  const [content, setContent] = useState<unknown>(null);
  const [authorId, setAuthorId] = useState<number | null>(null);

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [authors, setAuthors] = useState<AuthorOption[]>([]);

  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const mediaLoaded = useMemo(() => mediaItems.length > 0, [mediaItems]);

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("slug, label, order_index")
        .order("order_index", { ascending: true });

      if (error) {
        console.error("fetch categories error:", error);
        setCategories([]);
        return;
      }

      const list = (data as CategoryRecord[] | null) ?? [];
      const options = list.map((c) => ({ slug: c.slug, label: c.label }));
      setCategories(options);

      if (options.length > 0 && !category) {
        setCategory(options[0].slug);
      }
    }

    fetchCategories();
  }, [category]);

  useEffect(() => {
    async function fetchAuthors() {
      const { data, error } = await supabase
        .from("authors")
        .select("id, pen_name")
        .order("pen_name", { ascending: true });

      if (error) {
        console.error("fetch authors error:", error);
        setAuthors([]);
        return;
      }

      const list = (data as AuthorOption[] | null) ?? [];
      setAuthors(list);
    }

    fetchAuthors();
  }, []);

  useEffect(() => {
    async function fetchPost() {
      if (!id) return;

      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select(
          "id, title, slug, description, lead, category, status, content, tags, cover_url, language, paper_url, paper_title, author_id"
        )
        .eq("id", id)
        .maybeSingle();

      if (error) {
        setErrorMsg(error.message);
      } else if (data) {
        const post = data as PostEditorPayload & {
          cover_url?: string | null;
          language?: string | null;
          paper_url?: string | null;
          paper_title?: string | null;
          description?: string | null;
        };
        setTitle(post.title ?? "");
        setSlug(post.slug ?? "");
        setDescription(post.description ?? "");
        setLead((post as any).lead ?? null);
        setCategory(post.category ?? "");
        setStatus((post.status as "draft" | "published") ?? "draft");
        setContent(post.content ?? null);
        setTags(Array.isArray(post.tags) ? post.tags : []);
        setCoverUrl(post.cover_url ?? "");
        setLanguage(post.language ?? "ja");
        setPaperUrl(post.paper_url ?? "");
        setPaperTitle(post.paper_title ?? "");
        setAuthorId(
          typeof (post as any).author_id === "number" ? (post as any).author_id : null
        );
      } else {
        setErrorMsg("記事が見つかりませんでした。");
      }

      setLoading(false);
    }

    fetchPost();
  }, [id]);

  async function fetchMediaOnce() {
    if (mediaLoaded || mediaLoading) return;
    setMediaLoading(true);
    setMediaError(null);
    try {
      const rows = await walkStorageFolders(BUCKET, ROOT_PREFIX);
      setMediaItems(rows);
    } catch (error) {
      setMediaError(describeError(error));
    } finally {
      setMediaLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    setErrorMsg(null);

    const bodyContent =
      content ?? {
        type: "doc",
        content: [],
      };

    const { error } = await supabase
      .from("posts")
      .update({
        title,
        slug,
        description,
        lead: lead ?? null,
        category: category || null,
        status,
        tags,
        cover_url: coverUrl || null,
        language,
        paper_url: paperUrl || null,
        paper_title: paperTitle || null,
        author_id: authorId ?? null,
        content: bodyContent,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    router.push("/admin/posts");
  }

  async function handleDelete() {
    if (!id) return;
    if (!confirm("この記事を削除しますか？")) return;

    const { error } = await supabase.from("posts").delete().eq("id", id);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    router.push("/admin/posts");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-10">読み込み中...</div>
      </main>
    );
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">記事を編集</h1>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded border border-red-400 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            削除
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <form
          onSubmit={handleSave}
          className="space-y-6 rounded-xl bg-white p-6 shadow"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">タイトル</label>
            <input
              type="text"
              className="w-full rounded border px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">slug</label>
            <input
              type="text"
              className="w-full rounded border px-3 py-2"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              例: <code className="font-mono">spin-mram-intro</code>
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">説明文</label>
            <textarea
              className="w-full rounded border px-3 py-2 text-sm"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="mb-1 block text-sm font-medium">導入文（Lead）</label>
            <TiptapEditor content={lead} onChange={setLead} />
            <p className="mt-1 text-xs text-slate-500">
              記事冒頭に表示される導入ブロックです。未入力なら表示されません。
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">カテゴリ</label>
              {categories.length === 0 ? (
                <p className="text-xs text-red-500">
                  カテゴリがありません。先に「カテゴリ管理」で作成してください。
                </p>
              ) : (
                <select
                  className="w-full rounded border px-3 py-2"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">ステータス</label>
              <select
                className="w-full rounded border px-3 py-2"
                value={status}
                onChange={(e) => setStatus(e.target.value as "draft" | "published")}
              >
                <option value="draft">draft（下書き）</option>
                <option value="published">published（公開）</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">著者</label>
            {authors.length === 0 ? (
              <p className="text-xs text-slate-500">
                著者が未登録です。先に Supabase の authors テーブルへ登録してください。
              </p>
            ) : (
              <select
                className="w-full rounded border px-3 py-2"
                value={authorId ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setAuthorId(value ? Number(value) : null);
                }}
              >
                <option value="">（未設定）</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.pen_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">タグ</label>
            <TagSelector value={tags} onChange={setTags} />
            <p className="mt-1 text-xs text-slate-500">
              1文字以上入力すると候補が表示され、新規タグはそのまま Enter で追加できます。
            </p>
          </div>

          <div className="space-y-2">
            <label className="mb-1 block text-sm font-medium">カバー画像 URL</label>
            <input
              type="text"
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="https://..."
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
            />
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <button
                type="button"
                className="rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                onClick={() => {
                  setMediaOpen((v) => !v);
                  fetchMediaOnce();
                }}
              >
                ライブラリから選ぶ
              </button>
              <span>保存先: {ROOT_PREFIX}/年/月/ファイル名</span>
            </div>
            {coverUrl && (
              <div className="mt-2 flex items-center gap-3">
                <div className="h-24 w-40 overflow-hidden rounded bg-slate-100">
                  <img src={coverUrl} alt="cover preview" className="h-full w-full object-cover" />
                </div>
                <p className="text-xs text-slate-500 break-all">{coverUrl}</p>
              </div>
            )}
            {mediaOpen && (
              <div className="space-y-2 rounded border bg-slate-50 p-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>アップロード済み画像</span>
                  {mediaLoading && <span>読み込み中...</span>}
                  {mediaError && <span className="text-red-600">{mediaError}</span>}
                </div>
                {mediaItems.length === 0 && !mediaLoading ? (
                  <p className="text-xs text-slate-500">画像がまだありません。</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {mediaItems.map((item) => (
                      <button
                        key={item.path}
                        type="button"
                        onClick={() => setCoverUrl(item.url)}
                        className="flex items-center gap-3 rounded border border-slate-200 bg-white p-2 text-left shadow-sm hover:border-sky-400"
                      >
                        <div className="h-16 w-24 overflow-hidden rounded bg-slate-100">
                          <img src={item.url} alt={item.path} className="h-full w-full object-cover" />
                        </div>
                        <div className="text-[11px] text-slate-600 break-all">{item.path}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">言語</label>
              <select
                className="w-full rounded border px-3 py-2"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="ja">ja (日本語)</option>
                <option value="en">en (English)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">論文タイトル（任意）</label>
              <input
                type="text"
                className="w-full rounded border px-3 py-2 text-sm"
                value={paperTitle}
                onChange={(e) => setPaperTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">論文 URL（任意）</label>
              <input
                type="url"
                className="w-full rounded border px-3 py-2 text-sm"
                value={paperUrl}
                onChange={(e) => setPaperUrl(e.target.value)}
                placeholder="https://example.com/paper.pdf"
              />
            </div>
            <div className="text-xs text-slate-500 self-end">
              カバーや論文情報は未入力でも保存できます。
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">本文</label>
            <TiptapEditor content={content} onChange={setContent} />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded bg-sky-600 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
            >
              {saving ? "保存中..." : "保存する"}
            </button>
          </div>
        </form>
      </div>
      </main>
    </AdminGuard>
  );
}

async function walkStorageFolders(
  bucket: string,
  folder: string
): Promise<MediaItem[]> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder, { limit: 1000, sortBy: { column: "name", order: "desc" } });

  if (error) throw error;

  const entries = data ?? [];
  const files: MediaItem[] = [];

  for (const entry of entries) {
    const nextPath = folder ? `${folder}/${entry.name}` : entry.name;
    const isFolder = !(entry as any).metadata;

    if (isFolder) {
      const nested = await walkStorageFolders(bucket, nextPath);
      files.push(...nested);
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(nextPath);

    files.push({ path: nextPath, url: publicUrl });
  }

  return files;
}

function describeError(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: string }).message);
  }
  return "原因不明のエラーが発生しました。";
}
