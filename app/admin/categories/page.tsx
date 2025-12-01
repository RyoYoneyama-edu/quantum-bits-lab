"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { CategoryRecord } from "@/lib/types";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";

type NewCategory = {
  label: string;
  slug: string;
  description: string;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [form, setForm] = useState<NewCategory>({
    label: "",
    slug: "",
    description: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase
      .from("categories")
      .select("id, slug, label, description, order_index")
      .order("order_index", { ascending: true });

    if (error) {
      setErrorMsg(error.message);
      setCategories([]);
    } else {
      setCategories((data as CategoryRecord[] | null) ?? []);
    }

    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    const baseSlug =
      form.slug.trim() ||
      form.label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    if (!baseSlug) {
      setErrorMsg("slug を入力するか、ラベルを英字で作成してください。");
      return;
    }

    const { error } = await supabase.from("categories").insert([
      {
        slug: baseSlug,
        label: form.label.trim(),
        description: form.description.trim() || null,
      },
    ]);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setForm({ label: "", slug: "", description: "" });
    await fetchCategories();
  }

  async function handleUpdateOrder(id: number, order_index: number | null) {
    const value = order_index ?? 0;
    const { error } = await supabase
      .from("categories")
      .update({ order_index: value })
      .eq("id", id);

    if (error) {
      alert("並び順の更新に失敗しました: " + error.message);
      return;
    }

    await fetchCategories();
  }

  async function handleDelete(id: number) {
    if (
      !confirm(
        "このカテゴリを削除しますか？\nカテゴリに紐づく記事がある場合は注意してください。"
      )
    ) {
      return;
    }

    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      alert("削除に失敗しました: " + error.message);
      return;
    }

    await fetchCategories();
  }

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <header>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Admin
            </p>
            <h1 className="text-2xl font-bold text-slate-900">カテゴリ管理</h1>
            <p className="mt-1 text-sm text-slate-600">
              トップページやカテゴリページで使用するカテゴリを管理します。
            </p>
          </header>

          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">カテゴリを追加</h2>
            {errorMsg && (
              <div className="mb-3 rounded bg-red-100 px-3 py-2 text-sm text-red-700">
                {errorMsg}
              </div>
            )}
            <form
              onSubmit={handleCreate}
              className="grid gap-4 md:grid-cols-[2fr_2fr] md:items-end"
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  表示名（例: 電力使用量を減らす方法）
                </label>
                <input
                  type="text"
                  className="w-full rounded border px-3 py-2 text-sm"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  slug（例: lifestyle-energy）
                </label>
                <input
                  type="text"
                  className="w-full rounded border px-3 py-2 text-sm"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  説明（任意）
                </label>
                <textarea
                  className="w-full rounded border px-3 py-2 text-sm"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="rounded bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                >
                  追加
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">既存カテゴリ</h2>
            {loading ? (
              <p className="text-sm text-slate-500">読み込み中...</p>
            ) : categories.length === 0 ? (
              <p className="text-sm text-slate-500">カテゴリがまだありません。</p>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-2">表示名</th>
                    <th className="px-4 py-2">slug</th>
                    <th className="px-4 py-2">説明</th>
                    <th className="px-4 py-2">並び順</th>
                    <th className="px-4 py-2 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-t">
                      <td className="px-4 py-3">{category.label}</td>
                      <td className="px-4 py-3 text-xs font-mono">
                        {category.slug}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {category.description}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          className="w-20 rounded border px-2 py-1 text-xs"
                          defaultValue={category.order_index ?? 0}
                          onBlur={(e) =>
                            handleUpdateOrder(
                              category.id,
                              Number(e.target.value) || 0
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-semibold text-red-600">
                        <button
                          type="button"
                          onClick={() => handleDelete(category.id)}
                          className="hover:underline"
                        >
                          削除
                        </button>
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