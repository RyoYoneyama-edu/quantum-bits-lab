import Link from "next/link";
import { notFound } from "next/navigation";
import PublicHeader from "@/components/home/PublicHeader";
import { renderContentWithHeadings } from "@/components/article/ArticleContent";
import { supabase } from "@/lib/supabaseClient";
import type { AuthorProfile, CategoryRecord, PostRecord } from "@/lib/types";
import type { Metadata } from "next";

type ArticleParams = {
  slug: string;
};

type RelatedPost = Pick<
  PostRecord,
  "id" | "title" | "slug" | "category" | "published_at" | "cover_url"
>;

type CategoryMeta = Pick<CategoryRecord, "slug" | "label">;
type ArticleData = PostRecord & { author?: AuthorProfile | null };

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
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

function decodeEscapedText(value?: string | null) {
  if (!value) return value ?? "";
  try {
    const safe = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return JSON.parse(`"${safe}"`) as string;
  } catch {
    return value;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<ArticleParams> | ArticleParams;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);

  const { data } = await supabase
    .from("posts")
    .select("title, description, cover_url, published_at, updated_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  const title = data?.title ? decodeEscapedText(data.title) : slug;
  const description = data?.description
    ? decodeEscapedText(data.description)
    : `${title} の記事`;

  return {
    title,
    description,
    openGraph: {
      type: "article",
      title,
      description,
      url: `/articles/${slug}`,
      images: data?.cover_url ? [{ url: data.cover_url }] : undefined,
      publishedTime: data?.published_at ?? undefined,
      modifiedTime: data?.updated_at ?? undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<ArticleParams> | ArticleParams;
}) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);

  const { data, error } = await supabase
    .from("posts")
    .select(
      [
        "id",
        "title",
        "slug",
        "description",
        "lead",
        "category",
        "tags",
        "content",
        "published_at",
        "updated_at",
        "status",
        "paper_title",
        "paper_url",
        "cover_url",
        "author_id",
        "author:authors (id, pen_name, bio, avatar_url, expertise)",
      ].join(", ")
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<ArticleData>(); // 型パラメータは任意

  if (error || !data || typeof data === "string") {
    if (error) {
      console.error("Failed to load article:", error);
    }
    return notFound();
  }

  const post: ArticleData = data;
  const title = decodeEscapedText(post.title);
  const description = decodeEscapedText(post.description ?? "");

  // リード文: lead があればそれを優先し、なければ空（description はメタ用に温存）
  const leadContent = post.lead ?? null;

  const categoryMeta = await resolveCategoryMeta(post.category);
  const categoryLabel = categoryMeta?.label ?? post.category;

  const publishedAt = post.published_at ? new Date(post.published_at) : null;
  const updatedAt = post.updated_at ? new Date(post.updated_at) : null;
  const tags = Array.isArray(post.tags)
    ? post.tags.filter((tag): tag is string => Boolean(tag))
    : [];

  const { data: sidebarData, error: sidebarError } = await supabase
    .from("posts")
    .select("id, title, slug, cover_url")
    .eq("status", "published")
    .eq("category", post.category)
    .neq("id", post.id)
    .order("published_at", { ascending: false })
    .limit(3);

  if (sidebarError) {
    console.error("Failed to load sidebar posts:", sidebarError);
  }

  const sidebarPosts: RelatedPost[] = (sidebarData ?? []) as RelatedPost[];
  const thumbnail =
    post.cover_url || CATEGORY_FALLBACK_IMAGES[post.category] || DEFAULT_FALLBACK_IMAGE;
  const author = (post as ArticleData).author ?? null;
  const authorName = author?.pen_name ? decodeEscapedText(author.pen_name) : null;
  const authorBio = author?.bio ? decodeEscapedText(author.bio) : null;
  const authorExpertise = author?.expertise ? decodeEscapedText(author.expertise) : null;

  // 本文 HTML + 目次用 h2 抽出
  const { html, headings } = renderContentWithHeadings(post.content);
  const { html: leadHtml } = leadContent
    ? renderContentWithHeadings(leadContent)
    : { html: "", headings: [] };

  return (
    <>
      <PublicHeader />
      <main className="bg-gradient-to-b from-[#f8fafc] via-white to-slate-100 pb-16 pt-6">
        <div className="mx-auto max-w-6xl px-4 space-y-6">
          {/* パンくず */}
          <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:underline">
              HOME
            </Link>
            <span>›</span>
            <Link href={`/categories/${post.category}`} className="hover:underline">
              {categoryLabel}
            </Link>
            <span>›</span>
            <span className="line-clamp-1 text-slate-700">{title}</span>
          </nav>

          {/* ヘッダー領域 */}
          <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="relative overflow-hidden rounded-2xl border bg-slate-100">
              <img
                src={thumbnail}
                alt={title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="space-y-3 px-2">
              <h1 className="text-3xl font-bold leading-snug text-slate-900">{title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                {publishedAt && (
                  <span className="flex items-center gap-1">
                    公開日:
                    <time dateTime={publishedAt.toISOString()}>{formatDate(publishedAt)}</time>
                  </span>
                )}
                {updatedAt && (
                  <span className="flex items-center gap-1">
                    更新日:
                    <time dateTime={updatedAt.toISOString()}>{formatDate(updatedAt)}</time>
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                  {categoryLabel}
                </span>
                {tags.length > 0 && (
                  <ul className="flex flex-wrap gap-2 text-[11px] font-medium text-slate-600">
                    {tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full bg-slate-100 px-3 py-1 text-slate-700"
                      >
                        # {tag}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

          {/* 本文＆サイドバー */}
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            {/* 本文ブロック */}
            <article className="space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              {/* リード文（導入） */}
              {leadHtml && (
                <div
                  className="prose prose-slate max-w-none text-base leading-relaxed text-slate-700"
                  dangerouslySetInnerHTML={{ __html: leadHtml }}
                />
              )}

              {/* 論文情報 */}
              {post.paper_title && post.paper_url && (
                <div className="space-y-1 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                  <div className="font-semibold text-slate-800">論文タイトル</div>
                  <div>{post.paper_title}</div>
                  <div>
                    論文URL:{" "}
                    <Link
                      href={post.paper_url}
                      className="text-sky-700 underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {post.paper_url}
                    </Link>
                  </div>
                </div>
              )}

              {/* 目次：h2 を自動抽出 */}
              <section className="space-y-2 rounded-2xl border border-dashed border-slate-200 p-4">
                <h2 className="text-lg font-semibold text-slate-900">目次</h2>
                {headings.length === 0 ? (
                  <p className="text-sm text-slate-600">目次に表示できる見出しがありません。</p>
                ) : (
                  <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
                    {headings.map((h) => (
                      <li key={h.id}>
                        <Link href={`#${h.id}`} className="text-sky-700 hover:underline">
                          {h.text}
                        </Link>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              {/* 本文 */}
              <div
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: html }}
              />

              {/* 著者情報 */}
              {author && authorName && (
                <section className="space-y-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    この記事の著者 / 編集者
                  </p>
                  <div className="flex gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                      {author.avatar_url ? (
                        <img
                          src={author.avatar_url}
                          alt={authorName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-base font-semibold text-slate-500">
                          {authorName.slice(0, 1)}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-slate-900">{authorName}</div>
                      {authorExpertise && (
                        <div className="text-xs text-slate-500">専門: {authorExpertise}</div>
                      )}
                    </div>
                  </div>
                  {authorBio && (
                    <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                      {authorBio}
                    </p>
                  )}
                </section>
              )}
            </article>

            {/* サイドバー */}
            <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">同じカテゴリの最新記事</h3>
              {sidebarPosts.length === 0 ? (
                <p className="text-sm text-slate-500">まだ記事がありません。</p>
              ) : (
                <div className="space-y-3">
                  {sidebarPosts.map((item) => (
                    <Link
                      key={item.id}
                      href={`/articles/${item.slug}`}
                      className="block overflow-hidden rounded-xl border border-slate-100 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0f766e]/40"
                    >
                      <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100">
                        <img
                          src={
                            item.cover_url ||
                            CATEGORY_FALLBACK_IMAGES[post.category] ||
                            DEFAULT_FALLBACK_IMAGE
                          }
                          alt={decodeEscapedText(item.title)}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-3 text-sm font-semibold text-slate-900 line-clamp-2">
                        {decodeEscapedText(item.title)}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

async function resolveCategoryMeta(slug: string): Promise<CategoryMeta | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("slug, label")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.warn("Category lookup error:", error);
  }

  if (data) {
    return data as CategoryMeta;
  }

  return null;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
