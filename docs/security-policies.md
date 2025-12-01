## Supabase RLS / Auth チェック (工程12)

公開 Web（App Router 側）は Supabase の anon key を使ってデータを取得しています。  
管理画面は Next.js 側の将来的な Auth 実装を前提にしているため、RLS で以下を満たす必要があります。

### 前提

- `posts` テーブル … 記事本体。公開側は「status = published」の行だけ参照できれば良い。
- `categories` テーブル … メタ情報。公開側で参照のみ。
- `storage: article-images` バケット … 記事のカバー画像アルバム。
- 管理者系の書き込みは **service role key を使ったサーバーサイド API** で行う想定。  
  現時点では UI だけがあり、Auth 実装が完了した段階で service key を使う。

---

### 1. posts テーブル

1. Supabase Dashboard → Table editor → `posts`
2. 「RLS (Row Level Security)」を有効化
3. Policies を 2 本作成

```sql
-- anon からの参照を、公開済みの記事に限定
create policy "Allow anon read published posts"
on public.posts
for select
to anon
using (status = 'published');

-- service ロールでの管理操作（INSERT/UPDATE/DELETE）
create policy "Allow service role to manage posts"
on public.posts
for all
to service_role
using (true)
with check (true);
```

※現状の管理画面は anon key でアクセスしているため、このポリシーを有効化すると UI 側も service role key を用いたサーバーアクションへ差し替える必要があります。Auth 実装後に `NEXT_PUBLIC_SUPABASE_ANON_KEY` ではなく `SUPABASE_SERVICE_ROLE_KEY` を使った API Route を経由させてください。

### 2. categories テーブル

カテゴリは読み取り専用のため、次の 1 本で十分です。

```sql
create policy "Allow anon read categories"
on public.categories
for select
to anon
using (true);
```

### 3. `article-images` バケット

1. Storage → `article-images` → 「Policies」
2. 以下 2 本

```sql
-- 公開済み記事の画像は誰でも GET できる
create policy "Public read article images"
on storage.objects
for select
to anon
using (bucket_id = 'article-images');

-- service ロールのみ登録/削除可能
create policy "Service manage article images"
on storage.objects
for all
to service_role
using (bucket_id = 'article-images')
with check (bucket_id = 'article-images');
```

### 4. Next.js 環境変数

将来的に管理画面を保護する際は、`lib/supabaseAdminClient.ts` のような server-side client を追加して `.env.local` に service key を持たせます。

```bash
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxx
```

API ルート、またはサーバーアクションからのみ service client を import し、クライアント側へは絶対に露出させないようにします。

---

### 5. 確認手順

1. RLS 有効化後に `psql` や SQL Editor で `set role anon; select ...` を実行し、draft 記事が返ってこないことを確認。
2. service role で INSERT/UPDATE/DELETE を実行して成功することを確認。
3. Storage バケットに対して curl などで GET を試し、公開 URL では問題なく取得できるが、Anon key で PUT/DELETE が拒否されることを確認。

以上を満たせば工程12（RLS/権限チェック）は完了です。
