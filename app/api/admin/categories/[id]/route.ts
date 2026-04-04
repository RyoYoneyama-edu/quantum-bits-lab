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
  const { error } = await supabase.from("categories").delete().eq("id", numericId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

