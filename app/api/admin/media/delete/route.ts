import { NextResponse } from "next/server";

import { requireAdminFromRequest } from "@/lib/adminAccess";
import { createSupabaseAdminClient } from "@/lib/supabaseAdminServer";

const BUCKET = "article-images";
const SAFE_PREFIX = "media/";

type DeleteBody = {
  path?: string;
};

export async function POST(request: Request) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const body = (await request.json().catch(() => null)) as DeleteBody | null;
  const path = body?.path?.trim();

  if (!path) {
    return NextResponse.json({ error: "Path is required." }, { status: 400 });
  }

  if (!path.startsWith(SAFE_PREFIX)) {
    return NextResponse.json(
      { error: `Only ${SAFE_PREFIX}* objects are allowed.` },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

