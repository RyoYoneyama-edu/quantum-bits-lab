# Routes Overview

| Route | Type | Purpose | Notes |
| --- | --- | --- | --- |
| `/` | Public | Top page showing latest posts and category highlights. | Fetches published posts (limit 10). |
| `/articles/[slug]` | Public | Article detail page rendered from Supabase `posts` record. | Requires `status = published`; renders Tiptap JSON. |
| `/categories/[category]` | Public | Category landing page (planned in later steps). | Lists posts filtered by `category`. |
| `/tags/[tag]` | Public | Tag landing page (planned). | Uses Supabase array filtering on `tags`. |
| `/about` | Public | About Quantum Bits Lab (planned). | Static content pulled from spec. |
| `/admin/posts` | Admin (client component) | Lists all posts for editing. | Requires future auth guard. |
| `/admin/posts/new` | Admin | Create new post with Tiptap editor. | Saves as `draft` by default. |
| `/admin/posts/[id]` | Admin | Edit existing post (title/slug/category/status/content). | Includes delete action. |
| `/admin/media` | Admin | Media manager for Supabase Storage. | Handles upload/delete/copy URL. |

> **Upcoming routes:** `/preview/*` for draft previews and `/search` for FTS results will be added in later tasks (see `docs/process.md`).
