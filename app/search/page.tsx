import Link from "next/link";
import PublicHeader from "@/components/home/PublicHeader";
import { supabase } from "@/lib/supabaseClient";
import type { Metadata } from "next";
import type { PostListItem } from "@/lib/types";

export const metadata: Metadata = {
  title: "検索",
  description: "QBLの記事をキーワードで検索できます。",
};

export const dynamic = "force-dynamic";

async function fetchPosts(keyword: string) {
  if (!keyword) {
    return [] as PostListItem[];
  }

  const sanitized = keyword.replace(/[%]/g, "");
  const likeValue = `%${sanitized}%`;

  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, title, slug, description, category, published_at, status, cover_url"
    )
    .eq("status", "published")
    .or(
      `title.ilike.${likeValue},description.ilike.${likeValue},slug.ilike.${likeValue}`
    )
    .order("published_at", { ascending: false })
    .limit(40);

  if (error) {
    console.error("Search fetch error:", error);
    return [] as PostListItem[];
  }

  return (data ?? []) as PostListItem[];
}

function decodeEscapedText(value?: string | null) {
  if (!value) return value ?? "";
  try {
    const safe = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return JSON.parse(`"${safe}"`) as string;
  } catch {
    return value;
  }
}

function Thumbnail({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />
    </div>
  );
}

function getCoverImage(post: Pick<PostListItem, "cover_url" | "category">) {
  if (post.cover_url) return post.cover_url;
  return (
    {
      "lifestyle-energy":
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80",
      "home-insulation":
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80",
      "digital-ai-energy":
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80",
      "future-energy-computing":
        "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1000&q=80",
        }[post.category] ??
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80"
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const keyword =
    typeof resolvedParams.q === "string" ? resolvedParams.q.trim() : "";
  const posts = await fetchPosts(keyword);
  const hasKeyword = keyword.length > 0;

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-gradient-to-b from-[#f8fafc] via-white to-slate-100">
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-12">
          <header className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Search
            </p>
            <h1 className="text-3xl font-bold text-slate-900">記事を検索</h1>
            <form className="w-full max-w-3xl" method="get" action="/search">
              <label className="sr-only" htmlFor="search-input">
                キーワード検索
              </label>
              <div className="flex rounded-2xl border border-slate-200 bg-white shadow-sm focus-within:border-[#0f766e] focus-within:ring-1 focus-within:ring-[#0f766e]">
                <input
                  id="search-input"
                  name="q"
                  type="search"
                  defaultValue={keyword}
                  placeholder="キーワードで検索（例: AI、半導体、量子デバイス）"
                  className="flex-1 rounded-2xl bg-transparent px-4 py-3 text-sm text-slate-800 outline-none"
                />
                <button
                  type="submit"
                  className="px-5 text-sm font-semibold text-[#0f766e] transition hover:text-[#0c5f58]"
                >
                  検索
                </button>
              </div>
            </form>
            <p className="text-sm text-slate-500">
              {hasKeyword
                ? `「${keyword}」の検索結果 ${posts.length} 件`
                : "キーワードを入力して検索してください。"}
            </p>
          </header>

          {posts.length === 0 ? (
            <p className="text-slate-500">
              {hasKeyword
                ? "該当する記事が見つかりませんでした。"
                : "キーワードを入力してください。"}
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/articles/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#0f766e]/40"
                >
                  <Thumbnail
                    src={getCoverImage(post)}
                    alt={decodeEscapedText(post.title)}
                  />
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                        {post.category}
                      </span>
                      {post.published_at && (
                        <span>{formatDate(post.published_at)}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {decodeEscapedText(post.title)}
                    </h3>
                    {post.description && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {decodeEscapedText(post.description)}
                      </p>
                    )}
                    <span className="mt-auto text-sm font-semibold text-[#0f766e]">
                      記事を読む →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
