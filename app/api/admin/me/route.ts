import { NextResponse } from "next/server";

import { requireAdminFromRequest } from "@/lib/adminAccess";

export async function GET(request: Request) {
  const result = await requireAdminFromRequest(request);
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: result.user.id,
      email: result.user.email ?? null,
    },
  });
}

