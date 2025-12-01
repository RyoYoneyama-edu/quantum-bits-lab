"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminSidebar() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  return (
    <aside className="mb-6 space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:mb-0">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Admin</p>
      <nav className="space-y-2 text-sm font-semibold text-slate-700">
        <Link href="/admin/posts" className="block rounded-lg px-3 py-2 transition hover:bg-slate-100">
          記事一覧
        </Link>
        <Link href="/admin/categories" className="block rounded-lg px-3 py-2 transition hover:bg-slate-100">
          カテゴリ管理
        </Link>
        <Link href="/admin/media" className="block rounded-lg px-3 py-2 transition hover:bg-slate-100">
          メディア一覧
        </Link>
        <Link href="/" className="block rounded-lg px-3 py-2 transition hover:bg-slate-100">
          トップページへ
        </Link>
      </nav>
      <button
        type="button"
        onClick={handleLogout}
        disabled={signingOut}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
      >
        ログアウト
      </button>
    </aside>
  );
}