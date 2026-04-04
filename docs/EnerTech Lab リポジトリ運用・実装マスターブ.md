# EnerTech Lab / QBL リポジトリ運用・実装マスターブリーフ

## 0. このドキュメントの目的

このドキュメントは、現在の `qbl/` リポジトリ上で EnerTech Lab の
- サイト運営
- 実装修正
- 記事運用
- 自動化準備
- Git運用
を一貫して進めるための実行方針をまとめたものです。

このドキュメントを読む対象は CodeX / Claude Code / Cursor 上の AI エージェントです。
以後の作業は、ここに書かれた優先順位・制約・方針を前提に進めてください。

---

## 1. プロジェクトの前提

### 1-1. サイトの目的
EnerTech Lab は、以下の領域を「エネルギー効率 × 物理」でわかりやすく翻訳する技術メディアです。

- 暮らしの電気代・空調
- 住まいと断熱
- AI・データセンター電力
- 次世代省エネデバイス

### 1-2. 中核ポジショニング
EnerTech Lab は、**暮らしの電気代から AI・データセンター・次世代デバイスまでを、「エネルギー効率 × 物理」で再計算できる形に翻訳するメディア**です。

### 1-3. 初期フェーズの方針
初期は量産しない。  
少数精鋭で、以下を優先する。

- 生活者向けミドルテールで検索流入を取る
- AI電力 / GPU / データセンターで差別化する
- 次世代デバイスで専門性・権威性を作る
- AIは下書きに使うが、ファクトチェックと品質担保は人間が行う
- 自動化は「無人公開」ではなく「人間承認つき半自動化」を目指す

### 1-4. やらないこと
- ランキング量産
- 雑なアフィリエイト記事
- 速報偏重
- 無人での自動公開
- 大規模な front/back 分離
- 今の repo を壊す大移設

---

## 2. 現在の技術前提

### 2-1. 現在の実装
このサイトは現状、以下の構成で動いている。

- Next.js App Router
- React
- Tailwind CSS
- Supabase
  - Database
  - Auth
  - Storage
- Tiptap
- KaTeX

### 2-2. 構成上の特徴
- 公開サイトと CMS が 1 つの Next.js アプリに同居
- 記事本文は Tiptap JSON 保存
- 管理画面あり
- Supabase Storage に画像保存
- カテゴリ正本は `categories` テーブル前提
- `qbl/` というルートフォルダ名だが、現時点では変更しない

### 2-3. 現在の repo で採る戦略
今は repo 分割しない。  
代わりに、**論理分離**で運用する。

- アプリ本体: `app/`, `components/`, `lib/`
- 運用資産: `content-ops/`
- 補助スクリプト: `scripts/`
- 将来の Supabase 実装置き場: `supabase/`
- AI運用ルール: `.claude/`

---

## 3. 現在のフォルダ運用方針

### 3-1. 既存を壊さずに追加済み / 追加前提の領域
以下は追加済み、または追加方針が固まっている。

- `.claude/`
- `.claude/rules/`
- `.claude/agents/`
- `content-ops/`
- `content-ops/prompts/`
- `content-ops/briefs/`
- `content-ops/source-packs/`
- `content-ops/calendars/`
- `content-ops/checks/`
- `scripts/`
- `scripts/ga4/`
- `scripts/gsc/`
- `scripts/content/`
- `supabase/`
- `supabase/functions/`
- `supabase/migrations/`

### 3-2. ディレクトリの役割
#### `.claude/`
AI エージェントへのルール定義を置く。  
- 共通ルール
- app コード用ルール
- editorial 用ルール
- security 用ルール
- subagent 定義

#### `content-ops/`
記事運用資産を置く。  
- プロンプト
- 記事ブリーフ
- ソースパック
- 編集カレンダー
- 公開前チェック

#### `scripts/`
将来の補助スクリプト置き場。  
今は雛形と README が中心。  
本格実装は GA4/GSC 設定後。

#### `supabase/`
今後の migrations / functions の置き場。  
現時点では README と設計メモ中心。  
本格的な Edge Functions や migration の乱発はまだしない。

---

## 4. 記事運用の編集原則

### 4-1. 記事テンプレート
EnerTech Lab の記事は原則として以下の固定テンプレートに従う。

1. 導入
2. 結論
3. 物理解説
4. 実用パート
5. 参考ソース
6. FAQ

### 4-2. 記事の核
記事の価値は、単なる結論ではなく以下にある。

- 再計算できる
- 条件分岐がある
- 物理的な理由が説明されている
- 読者が判断材料を持ち帰れる

### 4-3. 優先ソース
以下を優先する。

1. 公的機関
2. 制度公式
3. 学術論文
4. メーカー一次情報
5. 自社の既存記事

### 4-4. 禁止事項
- 根拠のない断定
- 数値の創作
- 「おすすめ○選」への逃避
- アフィリエイト前提の雑比較
- ソース不明の比較表
- 速報翻訳だけの記事

---

## 5. 既に完了している / 進行済みのこと

### 5-1. 戦略面
以下はすでに整理済みである。

- 競合調査結果あり
- 媒体方針あり
- 初期90日方針あり
- 初期12本案あり
- 自動化設計方針あり

### 5-2. 運用ファイル
以下は作成済み、または方針が確定している。

- `.claude/CLAUDE.md`
- `.claude/rules/*`
- `.claude/agents/*`
- `content-ops/README.md`
- `content-ops/checks/pre-publish-checklist.md`
- `scripts/*/README.md`
- `supabase/*/README.md`

### 5-3. 監査済み項目
以下は監査済み。

- カテゴリ整合性
- 管理画面の権限設計
- `next.config.ts` の画像設定

### 5-4. すでに高優先3点を修正済みと扱う前提
以下は反映済みとして扱う。

- 破壊操作の一部を server-side API 経由化
  - 投稿削除
  - カテゴリ削除
  - Storage 削除
- AdminGuard をサーバー側 admin 判定必須へ強化
- `next.config.ts` の Supabase hostname 修正

ただし、これは**完了ではなく第一段階**である。

---

## 6. 今の残課題

### 6-1. まだ client 直の管理操作が残る
- 投稿作成
- 投稿更新
- カテゴリ作成
- カテゴリ更新
- 並び順更新
- Storage upload
- Storage list

### 6-2. カテゴリまわり
- カテゴリ削除時の posts 件数チェック未実装
- 検索画面のカテゴリ表示が label と完全統一されていない可能性
- 旧 slug 前提 fallback が残る可能性

### 6-3. 自動化まわり
- GA4 未設定
- Search Console 未設定
- 実データ取り込みスクリプト未実装
- Supabase 側の本格的な分析基盤未実装

### 6-4. 運用まわり
- 初期記事の source pack 運用が未定着
- Git push / 反映確認の定型運用がまだ未固化
- 手動テストと承認フローの定着が必要

---

## 7. 最重要の作業原則

### 7-1. 原則
- 小さく直す
- 壊さない
- 既存の URL 構造を変えない
- 大規模リファクタを避ける
- AI は補助。公開判断は人間
- まず security、次に整合性、次に記事、最後に自動化

### 7-2. 作業の順番
1. 動作確認
2. 小さな不整合修正
3. Git 反映
4. GA4/GSC 設定
5. 記事制作開始
6. 最小スクリプト実装
7. 改善ループ作成

### 7-3. 今やらないこと
- repo 分割
- root フォルダ大移動
- front/back 分離
- 全画像の `next/image` 化
- 全管理操作の一気通貫 server-side 化
- 無人量産パイプライン

---

## 8. これからの具体的ロードマップ

# Phase 0: 現状修正の確認と固定化
## 目的
最近入れた security 修正が本当に有効かを確認し、壊れていない状態を Git に固定する。

## やること
1. 環境変数の確認
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_ALLOWLIST_EMAILS`
2. 手動テスト
   - admin で投稿削除できるか
   - non-admin で admin 画面に入れないか
   - API 直叩きでも削除できないか
   - カテゴリ削除できるか
   - Storage 削除できるか
3. `npx tsc --noEmit` 実行
4. lint の既存警告は把握するが、今回の新規差分に致命的エラーがないか見る
5. Git にコミット・push する

## 完了条件
- security 修正がローカルで動く
- GitHub に反映されている
- `.env.local` や秘密情報が漏れていない

---

# Phase 1: 小さな整合性修正
## 目的
security の次に、壊れにくくて効果が高い整合性修正を入れる。

## 今回の対象
1. カテゴリ削除時の posts 件数チェック
2. 検索画面のカテゴリ表示を label に統一

## やること
- カテゴリ削除APIで対象カテゴリ slug の投稿件数確認
- 件数 > 0 なら削除拒否
- 検索画面で `categories` を参照して slug -> label map を作る
- 表示は label 優先、URL は slug 維持

## 完了条件
- 紐づく記事があるカテゴリは削除できない
- 検索画面のカテゴリ表示がトップや記事詳細と揃う

---

# Phase 2: Git 運用を定型化
## 目的
今後の小修正を安全に積み上げるため、毎回の Git 操作を定型化する。

## やること
- push 前確認手順を `docs/` か `content-ops/checks/` にまとめてもよい
- 毎回の流れを以下に固定する

### 作業フロー
1. `git status`
2. `git diff`
3. `.env.local` が対象に入っていないか確認
4. `git add ...`
5. `git diff --cached`
6. `git commit -m "..."`
7. `git push -u origin main`
8. GitHub 上で差分確認
9. 秘密情報検索
10. `git status` で clean 確認

## 完了条件
- push 手順が毎回再現できる
- CodeX 内でも Git 手順を迷わない

---

# Phase 3: GA4 / Search Console の設定
## 目的
今後の改善ループと自動化の前提となるデータ取得基盤を整える。

## やること
1. GA4 プロパティ作成
2. Search Console 登録
3. サイト所有権確認
4. sitemap 提出
5. `env.example` 整理
6. `scripts/ga4/README.md` と `scripts/gsc/README.md` に必要変数を追記

## 注意
- この段階では cron や Edge Functions をまだ作らない
- まず接続と確認だけ行う

## 完了条件
- GA4 でアクセス確認できる
- GSC でプロパティ確認できる
- sitemap が受理されている

---

# Phase 4: 初期記事の制作開始
## 目的
媒体の“らしさ”を最初の数本で固定する。

## 初期優先4本
1. エアコンの電気代はどう計算する？
2. エアコンはつけっぱなしの方が安い？
3. 31円/kWhとは何か？
4. エアコンの自動運転はなぜ節電になりやすいか？

## 記事制作フロー
1. キーワード決定
2. 検索意図整理
3. `content-ops/briefs/` にブリーフ作成
4. `content-ops/source-packs/` にソース束作成
5. 見出し案作成
6. AI 下書き生成
7. 数値・定義・因果のファクトチェック
8. FAQ 追加
9. 内部リンク追加
10. `pre-publish-checklist.md` で確認
11. 公開

## 完了条件
- 最初の1本がテンプレどおり公開される
- 以後、同じ型で回せる

---

# Phase 5: 最小スクリプト実装
## 目的
自動化の前に、まず手動で使える取得スクリプトを用意する。

## 今回作る候補
- `scripts/ga4/fetch-ga4.ts`
- `scripts/gsc/fetch-gsc.ts`

## 役割
- API からデータを取得する
- JSON / CSV 保存する
- まだ Supabase 保存しない
- まだ cron 化しない

## 禁止
- 本番自動ジョブまで一気に作らない
- いきなり大規模 ingest を作らない
- 取得データ構造を膨らませすぎない

## 完了条件
- ローカルで手動実行できる
- 基本的な項目が取れる
- 取得結果が確認できる

---

# Phase 6: 最小の改善ループ
## 目的
データを使って「何を直すか」を決められるようにする。

## 見る指標
- impressions
- clicks
- CTR
- average position
- page ごとの推移
- query ごとの伸び

## 最初にやること
- 表示回数はあるのに CTR が低い記事を探す
- 関連 query が伸びているのに記事がないテーマを探す
- 既存記事間リンクが弱い箇所を見つける

## 完了条件
- 「次に書く記事」「次に直す記事」をデータで決められる

---

# Phase 7: 本格的な半自動化
## 目的
運用を半自動化する。ただし公開は必ず人間承認。

## 将来構成
- GA4 / GSC 取り込み
- 週次分析
- 改善提案のタスク化
- テーマ候補収集
- source pack 作成
- outline 生成
- draft 生成
- critique
- publish guard
- 人間承認

## 当面のルール
- 無人公開は禁止
- source pack なしの生成は禁止
- 数値根拠なし公開は禁止
- claim-level の確認を意識する

---

## 9. CodeX が従うべき実装優先順位

### 最優先
1. すでに入れた security 修正の動作確認
2. Git への固定化
3. カテゴリ削除ガード
4. 検索カテゴリ label 統一

### 高優先
5. GA4 / GSC 設定の補助
6. 初期記事ブリーフ運用
7. source pack 運用

### 中優先
8. `fetch-ga4.ts`
9. `fetch-gsc.ts`
10. 投稿作成/更新の server-side 化
11. Storage upload の server-side 化

### 低優先
12. 全面的な `next/image` 化
13. repo 分割
14. 高度な自動化
15. 外部トレンド API 連携

---

## 10. Git 運用方針

### 原則
- push 前に diff を見る
- `.env.local` は絶対にコミットしない
- service role は絶対に公開しない
- 1コミット1目的を意識する

### 推奨コミット単位
- security 修正
- カテゴリ整合修正
- 記事運用ファイル追加
- GA4/GSC 準備
- 記事1本分の運用資産追加

### push 前チェック
- `git status`
- `git diff`
- `git diff --cached`
- `.gitignore` 確認
- 秘密情報混入の有無

---

## 11. セキュリティ方針

### 絶対ルール
- `SUPABASE_SERVICE_ROLE_KEY` をブラウザに出さない
- `.env.local` をコミットしない
- server-only で処理すべきものを client に置かない
- 危険操作は server-side admin 判定必須
- RLS を緩める変更は慎重に扱う

### admin 判定
- `app_metadata.role === "admin"` を優先
- 未設定時は allowlist
- UI 側だけではなく server-side 側でも同じ判定を通す

---

## 12. CodeX への一般指示

以後の作業では以下を守ること。

1. まず調査してから直す
2. 大規模変更はしない
3. 小さい差分で進める
4. 変更理由を明確にする
5. 変更ファイル一覧を出す
6. 今回見送ったものも書く
7. 影響範囲を短く示す
8. できれば `npx tsc --noEmit` で確認する
9. lint は既存警告と今回差分を分けて説明する
10. 秘密情報やローカル環境依存情報を出力しない

---

## 13. 直近の最優先 ToDo

今すぐ着手すべき具体タスクは以下。

### ToDo 1
security 修正の手動動作確認を行う

### ToDo 2
Git にコミット・push する

### ToDo 3
カテゴリ削除ガードを実装する

### ToDo 4
検索画面のカテゴリ label 統一を実装する

### ToDo 5
GA4 / GSC 設定に入る

### ToDo 6
1本目の記事ブリーフを作る

---

## 14. 今回の作業スコープ外

このドキュメントを読んでも、以下は今はやらない。

- 全管理操作の全面 server-side 化
- 全ページの大幅デザイン変更
- front/back 分離
- repo 分割
- 全画像最適化
- 自動公開
- 大量記事生成
- X / Perplexity 連携の本格化

---

## 15. 最後に

このプロジェクトは、**小さく安全に積み上げる**ことが重要です。

当面の優先順位は次の一文で表せます。

**security を締める → 整合性を直す → Git に固定する → データ計測を入れる → 少数精鋭の記事を出す → その後に半自動化する**

以後の提案・実装・修正は、必ずこの優先順位に従ってください。