"use client";

import { useEffect, useMemo, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Mathematics from "@tiptap/extension-mathematics";
import katex from "katex";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Highlight from "@tiptap/extension-highlight";
import { supabase } from "@/lib/supabaseClient";
import { TextSize } from "@/components/editor/TextSize";

type MediaItem = {
  path: string;
  url: string;
};

const BUCKET = "article-images";
const ROOT_PREFIX = "media";

export default function TiptapEditor({
  content,
  onChange,
}: {
  content: any;
  onChange: (json: any) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const mediaLoaded = useMemo(() => mediaItems.length > 0, [mediaItems]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Placeholder.configure({
        placeholder: "ここに本文を入力してください…",
      }),
      Image.configure({
        HTMLAttributes: { class: "max-w-full h-auto" },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: "text-sky-700 underline hover:text-sky-900",
        },
      }),
      Mathematics,
      Table.configure({
        resizable: false,
        lastColumnResizable: false,
        allowTableNodeSelection: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      HorizontalRule.configure({
        HTMLAttributes: { class: "my-6 border-t border-slate-200" },
      }),
      Highlight.configure({
        multicolor: false,
      }),
      TextSize,
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange(json);
    },
    immediatelyRender: false,
  });

  const insertImageUrl = (url: string) => {
    if (!editor || !url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  const insertInlineMath = (latex: string) => {
    if (!editor || !latex) return;
    // @tiptap/extension-mathematics commands
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cmd = (editor.commands as any).insertInlineMath;
    if (cmd) {
      cmd({ latex });
      return;
    }
    editor.chain().focus().insertContent({ type: "math_inline", attrs: { latex } }).run();
  };

  const insertBlockMath = (latex: string) => {
    if (!editor || !latex) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cmd = (editor.commands as any).insertBlockMath;
    if (cmd) {
      cmd({ latex });
      return;
    }
    editor.chain().focus().insertContent({ type: "math_block", attrs: { latex } }).run();
  };

  const walkStorage = async (folder: string): Promise<MediaItem[]> => {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(folder, { limit: 1000, sortBy: { column: "name", order: "desc" } });
    if (error) throw error;
    const entries = data ?? [];
    const files: MediaItem[] = [];
    for (const entry of entries) {
      const nextPath = folder ? `${folder}/${entry.name}` : entry.name;
      const isFolder = !(entry as any).metadata;
      if (isFolder) {
        const nested = await walkStorage(nextPath);
        files.push(...nested);
      } else {
        const {
          data: { publicUrl },
        } = supabase.storage.from(BUCKET).getPublicUrl(nextPath);
        files.push({ path: nextPath, url: publicUrl });
      }
    }
    return files;
  };

  const fetchMediaOnce = async () => {
    if (mediaLoaded || mediaLoading) return;
    setMediaLoading(true);
    setMediaError(null);
    try {
      const rows = await walkStorage(ROOT_PREFIX);
      setMediaItems(rows);
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : "読み込みに失敗しました");
    } finally {
      setMediaLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (!file) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = `${now.getMonth() + 1}`.padStart(2, "0");
    const path = `${ROOT_PREFIX}/${year}/${month}/${file.name}`;

    setMediaLoading(true);
    setMediaError(null);
    try {
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        upsert: true,
      });
      if (error) throw error;
      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const next: MediaItem = { path, url: publicUrl };
      setMediaItems((prev) => [next, ...prev]);
      insertImageUrl(publicUrl);
      setPickerOpen(false);
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : "アップロードに失敗しました");
    } finally {
      setMediaLoading(false);
    }
  };

  useEffect(() => {
    if (pickerOpen) {
      fetchMediaOnce();
    }
  }, [pickerOpen]);

  return (
    <div className="flex gap-3">
      {/* ツールバー（左固定） */}
      <div className="sticky top-20 h-fit shrink-0 rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm shadow-sm w-44">
        {editor ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={`rounded px-2 py-1 ${
                editor.isActive("paragraph")
                  ? "bg-sky-100 text-sky-700"
                  : "hover:bg-slate-100"
              }`}
            >
              P
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`rounded px-2 py-1 ${
                editor.isActive("heading", { level: 2 })
                  ? "bg-sky-100 text-sky-700"
                  : "hover:bg-slate-100"
              }`}
            >
              H2
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`rounded px-2 py-1 ${
                editor.isActive("heading", { level: 3 })
                  ? "bg-sky-100 text-sky-700"
                  : "hover:bg-slate-100"
              }`}
            >
              H3
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
              className={`rounded px-2 py-1 ${
                editor.isActive("heading", { level: 4 })
                  ? "bg-sky-100 text-sky-700"
                  : "hover:bg-slate-100"
              }`}
            >
              H4
            </button>

            <span className="my-1 h-px w-full bg-slate-200" />
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetTextSize().run()}
              className={`rounded px-2 py-1 ${
                !editor.isActive("textSize")
                  ? "bg-sky-100 text-sky-700"
                  : "hover:bg-slate-100"
              }`}
            >
              M
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().setTextSmall().run()}
              className={`rounded px-2 py-1 ${
                editor.isActive("textSize", { size: "s" })
                  ? "bg-sky-100 text-sky-700"
                  : "hover:bg-slate-100"
              }`}
            >
              S
            </button>

            <span className="my-1 h-px w-full bg-slate-200" />

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`rounded px-2 py-1 ${
                editor.isActive("bold")
                  ? "bg-sky-100 text-sky-700"
                  : "hover:bg-slate-100"
              }`}
            >
              太字
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`rounded px-2 py-1 ${
                editor.isActive("bulletList")
                  ? "bg-sky-100 text-sky-700"
                  : "hover:bg-slate-100"
              }`}
            >
              ・リスト
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`rounded px-2 py-1 ${
                editor.isActive("orderedList")
                  ? "bg-sky-100 text-sky-700"
                  : "hover:bg-slate-100"
              }`}
            >
              番号リスト
            </button>

            <button
              type="button"
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows: 2, cols: 2, withHeaderRow: true })
                  .run()
              }
              className="rounded px-2 py-1 hover:bg-slate-100"
            >
              表
            </button>
            <button
              type="button"
              disabled={!editor.isActive("table")}
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className={`rounded px-2 py-1 ${
                editor.isActive("table")
                  ? "hover:bg-slate-100"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              行追加
            </button>
            <button
              type="button"
              disabled={!editor.isActive("table")}
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className={`rounded px-2 py-1 ${
                editor.isActive("table")
                  ? "hover:bg-slate-100"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              列追加
            </button>
            <button
              type="button"
              disabled={!editor.isActive("table")}
              onClick={() => editor.chain().focus().deleteRow().run()}
              className={`rounded px-2 py-1 ${
                editor.isActive("table")
                  ? "hover:bg-slate-100"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              行削除
            </button>
            <button
              type="button"
              disabled={!editor.isActive("table")}
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className={`rounded px-2 py-1 ${
                editor.isActive("table")
                  ? "hover:bg-slate-100"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              列削除
            </button>
            <button
              type="button"
              disabled={!editor.isActive("table")}
              onClick={() => editor.chain().focus().deleteTable().run()}
              className={`rounded px-2 py-1 ${
                editor.isActive("table")
                  ? "hover:bg-slate-100"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              表削除
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="rounded px-2 py-1 hover:bg-slate-100"
            >
              区切り線
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={`rounded px-2 py-1 ${
                editor.isActive("highlight")
                  ? "bg-sky-100 text-sky-700"
                  : "hover:bg-slate-100"
              }`}
            >
              インライン
            </button>

            <span className="my-1 h-px w-full bg-slate-200" />

            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="rounded px-2 py-1 hover:bg-slate-100"
            >
              画像
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`rounded px-2 py-1 ${
                editor.isActive("codeBlock")
                  ? "bg-sky-100 text-sky-700"
                  : "hover:bg-slate-100"
              }`}
            >
              コード
            </button>

            <button
              type="button"
              onClick={() => {
                const latex = window.prompt("インライン数式を入力（例: a^2 + b^2 = c^2）");
                if (!latex) return;
                insertInlineMath(latex);
              }}
              className="rounded px-2 py-1 hover:bg-slate-100"
            >
              数式
            </button>

            <button
              type="button"
              onClick={() => {
                const latex = window.prompt("ブロック数式を入力（例: E = mc^2）");
                if (!latex) return;
                insertBlockMath(latex);
              }}
              className="rounded px-2 py-1 hover:bg-slate-100"
            >
              ブロック数式
            </button>

            <button
              type="button"
              onClick={() => {
                const href = window.prompt("リンク先URLを入力してください");
                if (!href) return;
                editor.chain().focus().setLink({ href }).run();
              }}
              className="rounded px-2 py-1 hover:bg-slate-100"
            >
              リンク
            </button>
          </div>
        ) : (
          <div className="p-2 text-xs text-slate-500">読み込み中...</div>
        )}
      </div>

      {/* 本文 */}
      <div className="flex-1 rounded border bg-white">
        <div className="px-3 py-2">
          {editor ? (
            <div className="prose prose-slate max-w-none">
              <EditorContent editor={editor} />
            </div>
          ) : (
            <div className="rounded border border-dashed border-slate-200 p-4 text-sm text-slate-500">
              エディタを読み込み中…
            </div>
          )}
        </div>
      </div>

      {/* メディアピッカー */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold text-slate-900">画像を選択</h3>
              <button
                type="button"
                className="text-sm text-slate-500 hover:text-slate-700"
                onClick={() => setPickerOpen(false)}
              >
                閉じる
              </button>
            </div>

            <div className="mt-3 space-y-3">
              <div className="flex flex-col gap-2 rounded border border-slate-200 p-3">
                <label className="text-xs font-medium text-slate-700">新しくアップロード</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                    e.target.value = "";
                  }}
                  className="text-sm"
                />
                {mediaError && <p className="text-xs text-red-600">{mediaError}</p>}
              </div>

              <div className="rounded border border-slate-200 p-3">
                <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                  <span>アップロード済み画像</span>
                  {mediaLoading && <span>読み込み中...</span>}
                </div>
                {mediaItems.length === 0 && !mediaLoading ? (
                  <p className="text-xs text-slate-500">画像がまだありません。</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {mediaItems.map((item) => (
                      <button
                        key={item.path}
                        type="button"
                        onClick={() => {
                          insertImageUrl(item.url);
                          setPickerOpen(false);
                        }}
                        className="group overflow-hidden rounded border border-slate-200 bg-white text-left shadow-sm hover:border-sky-400"
                      >
                        <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                          <img
                            src={item.url}
                            alt={item.path}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="break-all p-2 text-[11px] text-slate-600">
                          {item.path}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
