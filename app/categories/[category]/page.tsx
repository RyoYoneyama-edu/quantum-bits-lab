import Link from "next/link";
import { notFound } from "next/navigation";
import PublicHeader from "@/components/home/PublicHeader";
import { supabase } from "@/lib/supabaseClient";
import type { CategoryRecord, PostListItem } from "@/lib/types";
import type { Metadata } from "next";

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  spintronics:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80",
  semiconductors:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80",
  "ai-hardware":
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80",
  quantum:
    "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1000&q=80",
  "emerging-memory":
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1000&q=80",
};

const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80";

type CategoryMeta = Pick<CategoryRecord, "slug" | "label" | "description">;

type CategoryParams = {
  category: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<CategoryParams> | CategoryParams;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.category);
  const category = await fetchCategoryMeta(slug);

  if (!category) {
    return {
      title: "カテゴリが見つかりませんでした",
    };
  }

  const title = `${category.label} の記事一覧`;
  const description =
    category.description ?? `${category.label} に関する最新の記事一覧です。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/categories/${slug}`,
    },
  };
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

export default async function CategoryPage({
  params,
}: {
  params: Promise<CategoryParams> | CategoryParams;
}) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.category);
  const category = await fetchCategoryMeta(slug);

  if (!category) {
    return notFound();
  }

  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, title, slug, description, category, published_at, status, cover_url"
    )
    .eq("status", "published")
    .eq("category", slug)
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("Category fetch error:", error);
    return notFound();
  }

  const posts: PostListItem[] = (data ?? []) as PostListItem[];
  const intro =
    category.description ?? `${category.label} に関する最新の記事一覧です。`;

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-gradient-to-b from-[#f8fafc] via-white to-slate-100">
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-12">
          <header className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Category
            </p>
            <h1 className="text-3xl font-bold text-slate-900">{category.label}</h1>
            <p className="text-sm text-slate-600">{intro}</p>
          </header>

          {posts.length === 0 ? (
            <p className="text-slate-500">
              {category.label} に関する記事はまだありません。
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
                      <Badge label={category.label} />
                      {post.published_at && <span>{formatDate(post.published_at)}</span>}
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

function Badge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
      {label}
    </span>
  );
}

function getCoverImage(post: Pick<PostListItem, "cover_url" | "category">) {
  if (post.cover_url) {
    return post.cover_url;
  }
  return CATEGORY_FALLBACK_IMAGES[post.category] ?? DEFAULT_FALLBACK_IMAGE;
}

function formatDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

async function fetchCategoryMeta(slug: string): Promise<CategoryMeta | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("slug, label, description")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.warn("Category meta fetch error:", error);
  }

  if (data) {
    return data as CategoryMeta;
  }

  return null;
}