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
  if (!id) {
    return NextResponse.json({ error: "Post id is required." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

