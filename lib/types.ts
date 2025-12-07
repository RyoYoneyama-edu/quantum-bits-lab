export type PostStatus = "draft" | "published" | string;

export type PostRecord = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  lead?: unknown;
  category: string;
  tags: string[] | null;
  content: unknown;
  cover_url?: string | null;
  published_at: string | null;
  updated_at: string | null;
  status: PostStatus;
  language?: string | null;
  paper_url?: string | null;
  paper_title?: string | null;
  created_at?: string | null;
};

export type PostListItem = Pick<
  PostRecord,
  | "id"
  | "title"
  | "slug"
  | "description"
  | "category"
  | "published_at"
  | "status"
  | "cover_url"
>;

export type PostAdminSummary = Pick<
  PostRecord,
  "id" | "title" | "slug" | "category" | "status"
>;

export type PostEditorPayload = Pick<
  PostRecord,
  "id" | "title" | "slug" | "category" | "status" | "content" | "tags" | "published_at"
>;

export type CategoryRecord = {
  id: number;
  slug: string;
  label: string;
  description: string | null;
  lead?: string | null;
  order_index: number | null;
};

export type AuthorProfile = {
  id: number;
  pen_name: string;
  bio: string | null;
  avatar_url: string | null;
  expertise?: string | null;
  links?: Record<string, string> | null;
};
