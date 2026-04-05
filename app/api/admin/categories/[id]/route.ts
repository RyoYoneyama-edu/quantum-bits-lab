import { NextResponse } from "next/server";

import { requireAdminFromRequest } from "@/lib/adminAccess";
import { createSupabaseAdminClient } from "@/lib/supabaseAdminServer";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(request: Request, context: Context) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { id } = await context.params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    return NextResponse.json({ error: "Invalid category id." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("slug")
    .eq("id", numericId)
    .maybeSingle<{ slug: string }>();

  if (categoryError) {
    return NextResponse.json({ error: categoryError.message }, { status: 500 });
  }

  if (!category?.slug) {
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  }

  const { count, error: countError } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("category", category.slug);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  const linkedPosts = count ?? 0;
  if (linkedPosts > 0) {
    return NextResponse.json(
      {
        error:
          "このカテゴリに紐づく記事があるため削除できません。記事のカテゴリを変更してから再実行してください。",
        linkedPosts,
      },
      { status: 409 }
    );
  }

  const { error } = await supabase.from("categories").delete().eq("id", numericId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

