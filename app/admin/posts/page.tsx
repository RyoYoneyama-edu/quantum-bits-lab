// app/admin/posts/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { PostAdminSummary } from "@/lib/types";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";

type AdminRow = PostAdminSummary & {
  updated_at?: string | null;
  published_at?: string | null;
};

type StatusFilter = "all" | "draft" | "published";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      setErrorMsg(null);

      let query = supabase
        .from("posts")
        .select("id, title, slug, category, status, updated_at, published_at")
        .order("updated_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const term = search.trim();
      if (term) {
        query = query.ilike("title", `%${term}%`);
      }

      const { data, error } = await query;

      if (error) {
        setErrorMsg(error.message || "記事の取得に失敗しました。");
        setPosts([]);
      } else {
        setPosts((data ?? []) as AdminRow[]);
      }

      setLoading(false);
    }

    fetchPosts();
  }, [search, statusFilter]);

  const filteredCount = useMemo(() => posts.length, [posts]);

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                Admin
              </p>
              <h1 className="text-2xl font-bold text-slate-900">記事一覧</h1>
              <p className="text-xs text-slate-500">
                記事の検索やステータス、公開ページへのリンクを確認できます。
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/media"
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-white"
              >
                メディア一覧
              </Link>
              <Link
                href="/admin/posts/new"
                className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-sky-700"
              >
                新規作成
              </Link>
            </div>
          </header>

          <section className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="search"
                placeholder="タイトルで検索"
                className="w-full min-w-[220px] flex-1 rounded border px-3 py-2 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <span>ステータス:</span>
                {[
                  { value: "all", label: "すべて" },
                  { value: "draft", label: "下書き" },
                  { value: "published", label: "公開済み" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setStatusFilter(item.value as StatusFilter)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      statusFilter === item.value
                        ? "bg-sky-600 text-white shadow"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {errorMsg && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="flex items-center justify-between border-b bg-slate-100 px-4 py-2 text-xs text-slate-600">
              <span>{loading ? "読み込み中..." : `${filteredCount} 件`}</span>
              <span className="font-mono text-[11px] text-slate-500">/admin/posts</span>
            </div>

            {loading ? (
              <p className="px-4 py-6 text-sm text-slate-500">読み込み中...</p>
            ) : posts.length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-500">
                該当する記事がまだありません。
              </p>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-2">タイトル / カテゴリ</th>
                    <th className="px-4 py-2">ステータス</th>
                    <th className="px-4 py-2">slug</th>
                    <th className="px-4 py-2">更新日時</th>
                    <th className="px-4 py-2 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} className="border-t">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{post.title}</div>
                        <div className="text-xs text-slate-500">{post.category}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            post.status === "published"
                              ? "rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700"
                              : "rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700"
                          }
                        >
                          {post.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{post.slug}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {post.updated_at
                          ? new Date(post.updated_at).toLocaleString("ja-JP")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-semibold text-sky-700">
                        <div className="flex justify-end gap-3">
                          <Link href={`/articles/${post.slug}`} className="hover:underline">
                            公開ページ
                          </Link>
                          <Link href={`/admin/posts/${post.id}`} className="hover:underline">
                            編集
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}