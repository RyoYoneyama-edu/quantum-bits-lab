import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { CategoryRecord } from "@/lib/types";

export default async function PublicHeader() {
  const { data, error } = await supabase
    .from("categories")
    .select("slug, label, order_index")
    .order("order_index", { ascending: true });

  const categories: Pick<CategoryRecord, "slug" | "label">[] =
    (data as Pick<CategoryRecord, "slug" | "label">[] | null) ?? [];

  if (error) {
    console.warn("Header categories error:", error);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center">
          <img src="/logo.png" alt="QBL" className="h-10 w-24 object-contain" />
        </Link>

        <nav className="relative hidden items-center gap-4 text-sm font-semibold text-slate-700 sm:flex">
          <div className="group relative inline-block">
            <button className="inline-flex items-center gap-1 rounded px-2 py-1 transition hover:text-[#0f766e]">
              カテゴリ
              <span className="text-xs">▼</span>
            </button>
            <div className="invisible absolute left-0 top-full min-w-[180px] rounded-xl border border-slate-200 bg-white shadow-lg opacity-0 transition group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none">
              <ul className="py-2 text-sm text-slate-700">
                {categories.length === 0 ? (
                  <li className="px-4 py-2 text-xs text-slate-500">カテゴリ未登録</li>
                ) : (
                  categories.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/categories/${c.slug}`}
                        className="block px-4 py-2 hover:bg-slate-50 hover:text-[#0f766e]"
                      >
                        {c.label}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          <Link href="/about" className="hover:text-[#0f766e]">
            About
          </Link>
        </nav>

        <form
          action="/search"
          className="ml-auto flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus-within:border-[#0f766e] focus-within:ring-1 focus-within:ring-[#0f766e]"
        >
          <input
            type="search"
            name="q"
            placeholder="キーワードで検索"
            className="w-full bg-transparent outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-[#0f766e] px-3 py-1 text-xs font-bold text-white hover:bg-[#0d625b]"
          >
            検索
          </button>
        </form>
      </div>
    </header>
  );
}
