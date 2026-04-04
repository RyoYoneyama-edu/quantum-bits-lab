# supabase

EnerTech Lab 向けの Supabase 運用ファイル置き場です。  
今回はディレクトリと README のみを作成し、実関数はまだ追加しません。

## 構成
- `migrations/`: DB schema 変更履歴
- `functions/`: Edge Functions 実装置き場

## 運用原則
- スキーマ変更は migration で管理し、DB 実体と同期する。
- `service_role` は server-only / Edge Functions で扱う。
- 本番権限変更は RLS 前提で慎重にレビューする。
