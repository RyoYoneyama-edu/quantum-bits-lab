import "server-only";

import { createClient, type User } from "@supabase/supabase-js";

type AdminCheckResult =
  | { ok: true; user: User }
  | { ok: false; status: number; message: string };

const ALLOWLIST_ENV_KEYS = ["ADMIN_ALLOWLIST_EMAILS", "ADMIN_ALLOWED_EMAILS"] as const;

function getAllowlistedEmails() {
  const raw = ALLOWLIST_ENV_KEYS.map((key) => process.env[key]).find(Boolean) ?? "";
  return new Set(
    raw
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  );
}

function extractBearerToken(request: Request) {
  const header = request.headers.get("authorization");
  if (!header) return null;

  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

function isAdminUser(user: User) {
  const role = (user.app_metadata as { role?: string } | undefined)?.role;
  if (role === "admin") {
    return true;
  }

  const email = user.email?.toLowerCase();
  if (!email) {
    return false;
  }

  return getAllowlistedEmails().has(email);
}

export async function requireAdminFromRequest(request: Request): Promise<AdminCheckResult> {
  const token = extractBearerToken(request);
  if (!token) {
    return { ok: false, status: 401, message: "Missing bearer token." };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return {
      ok: false,
      status: 500,
      message: "Missing Supabase envs for auth verification.",
    };
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return { ok: false, status: 401, message: "Invalid or expired session." };
  }

  if (!isAdminUser(data.user)) {
    return { ok: false, status: 403, message: "Admin privilege is required." };
  }

  return { ok: true, user: data.user };
}

