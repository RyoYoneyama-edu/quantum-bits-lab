import HeroSection from "@/components/home/HeroSection";
import PublicHeader from "@/components/home/PublicHeader";
import { supabase } from "@/lib/supabaseClient";
import type { CategoryRecord, PostListItem } from "@/lib/types";
import Link from "next/link";

const CATEGORY_FALLBACK_IMAGE: Record<string, string> = {
  "lifestyle-energy":
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80",
  "home-insulation":
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80",
  "digital-ai-energy":
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80",
  "future-energy-computing":
    "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1000&q=80",
};

const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80";

type CategoryData = {
  meta: Pick<CategoryRecord, "slug" | "label" | "description">;
  posts: PostListItem[];
  count: number;
};

export default async function Home() {
  const { data: categoriesData, error: categoriesError } = await supabase
    .from("categories")
    .select("slug, label, description, order_index")
    .order("order_index", { ascending: true });

  if (categoriesError) {
    console.error("Supabase categories error:", categoriesError);
  }

  const { data: latestData, error: latestError } = await supabase
    .from("posts")
    .select(
      "id, title, slug, description, category, published_at, status, cover_url"
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(9);

  if (latestError) {
    console.error("Supabase latest posts error:", latestError);
  }

  const latestPosts: PostListItem[] = (latestData ?? []) as PostListItem[];
  const [featuredPost, ...restPosts] = latestPosts;
  const insightPosts = restPosts.slice(0, 4);
  const quickPosts = restPosts.slice(4, 8);

  const categoriesList =
    (categoriesData as Pick<CategoryRecord, "slug" | "label" | "description">[] | null) ??
    [];

  const labelMap = categoriesList.reduce<Record<string, string>>((acc, cur) => {
    acc[cur.slug] = cur.label;
    return acc;
  }, {});

  const categoryData: CategoryData[] = await Promise.all(
    categoriesList.map(async (meta) => {
      const { data, error, count } = await supabase
        .from("posts")
        .select(
          "id, title, slug, description, category, published_at, status, cover_url",
          { count: "exact" }
        )
        .eq("status", "published")
        .eq("category", meta.slug)
        .order("published_at", { ascending: false })
        .limit(3);

      if (error) {
        console.error(`Supabase category error (${meta.slug}):`, error);
      }

      return {
        meta,
        posts: (data ?? []) as PostListItem[],
        count: count ?? data?.length ?? 0,
      };
    })
  );

  return (
    <>
      <PublicHeader />
      <main className="relative min-h-screen">
        <div className="dot-grid" />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12">
          <HeroSection />

          <BentoGrid
            featuredPost={featuredPost}
            insightPosts={insightPosts}
            quickPosts={quickPosts}
            categories={categoryData}
            labelMap={labelMap}
          />
        </div>
      </main>
    </>
  );
}

function BentoGrid({
  featuredPost,
  insightPosts,
  quickPosts,
  categories,
  labelMap,
}: {
  featuredPost?: PostListItem;
  insightPosts: PostListItem[];
  quickPosts: PostListItem[];
  categories: CategoryData[];
  labelMap: Record<string, string>;
}) {
  return (
    <section className="bento-grid">
      {featuredPost && (
        <article className="glass-card col-span-2 row-span-2 overflow-hidden">
          <Link href={`/articles/${featuredPost.slug}`} className="flex h-full flex-col">
            <BentoImage post={featuredPost} />
            <div className="flex flex-1 flex-col gap-3 p-6">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <Badge category={featuredPost.category} labelMap={labelMap} />
                {featuredPost.published_at && (
                  <span>{formatDate(featuredPost.published_at)}</span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                {featuredPost.title}
              </h3>
              {featuredPost.description && (
                <p className="text-sm text-slate-600">
                  {featuredPost.description}
                </p>
              )}
              <span className="mt-auto text-sm font-semibold text-[#0f766e]">
                記事を読む →
              </span>
            </div>
          </Link>
        </article>
      )}

      <article className="glass-card col-span-2 row-span-2 p-6">
        <h3 className="text-sm font-bold text-slate-500">最新の論文解説</h3>
        <div className="mt-4 space-y-4">
          {insightPosts.map((post) => (
            <Link
              key={post.id}
              href={`/articles/${post.slug}`}
              className="block rounded-xl border border-transparent px-3 py-2 transition hover:border-[#0f766e]/30 hover:bg-white"
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <Badge category={post.category} labelMap={labelMap} />
                {post.published_at && (
                  <span>{formatDate(post.published_at)}</span>
                )}
              </div>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {post.title}
              </p>
            </Link>
          ))}
        </div>
      </article>

      <article className="glass-card col-span-2 p-6">
        <h3 className="text-sm font-bold text-slate-500">カテゴリ別の投稿</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {categories.map(({ meta, count }) => (
            <Link
              key={meta.slug}
              href={`/categories/${meta.slug}`}
              className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm text-slate-600 transition hover:border-[#0f766e]/40 hover:text-[#0f766e]"
            >
              <span>{meta.label}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                {count}
              </span>
            </Link>
          ))}
        </div>
      </article>

      

      
    </section>
  );
}

function BentoImage({ post }: { post: PostListItem }) {
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
      <img
        src={getCoverImage(post)}
        alt={post.title}
        loading="lazy"
        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 img-mask bg-gradient-to-t from-black/40 to-transparent" />
    </div>
  );
}

function Badge({
  category,
  labelMap,
}: {
  category: string;
  labelMap: Record<string, string>;
}) {
  const label = labelMap[category] ?? category;
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
      {label}
    </span>
  );
}

function getCoverImage(post: Pick<PostListItem, "cover_url" | "category">) {
  if (post.cover_url) return post.cover_url;
  return CATEGORY_FALLBACK_IMAGE[post.category] ?? DEFAULT_FALLBACK_IMAGE;
}

function formatDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}