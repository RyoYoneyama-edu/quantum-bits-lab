# supabase/functions

Supabase Edge Functions の配置先です。  
今回は README のみ作成し、実装コードは未作成です。

## 将来配置する想定関数
- `ingest_ga4`
- `ingest_gsc`
- `analyze_weekly`
- `collect_themes`
- `build_source_pack`
- `generate_outline`
- `generate_draft`
- `critique_draft`
- `publish_guard`

## 実装時の注意
- 秘密情報は Supabase Secrets / 環境変数で管理する。
- service_role をクライアントへ返さない。
- 失敗時ログに機密値を含めない。
