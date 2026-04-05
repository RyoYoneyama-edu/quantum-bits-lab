# Admin Access Policy (Minimal)

This document defines the admin gate used by both:
- `components/admin/AdminGuard.tsx`
- server-side admin API routes under `app/api/admin/*`

## Admin decision rule

A user is treated as admin when either condition is true:
1. `user.app_metadata.role === "admin"`
2. `user.email` is included in environment allowlist:
   - `ADMIN_ALLOWLIST_EMAILS` (preferred)
   - or `ADMIN_ALLOWED_EMAILS` (fallback)

Allowlist format is a comma-separated list of emails.

## Security note

- `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed to browser code.
- Destructive operations (delete of posts/categories/storage) must go through server-side API.

## Scope in this phase

Implemented in this phase:
- post delete
- category delete
- storage delete
- admin guard check hardening

Deferred to next phase:
- category delete pre-check (`posts` count)
- search page category label normalization
- reducing legacy hard-coded slug-based image fallback

