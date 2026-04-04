# supabase/migrations

DB スキーマ変更を管理するディレクトリです。  
今回は README のみ作成し、実 migration は未追加です。

## 方針
- テーブル追加・カラム変更・インデックス・RLS 変更は migration として記録する。
- 本番 DB へ直接変更した場合でも必ず migration に反映する。
- 変更時は「目的」「影響範囲」「ロールバック方針」を残す。

## 命名例
- `20260404_add_article_metrics_table.sql`
- `20260404_update_rls_for_editorial_tables.sql`
