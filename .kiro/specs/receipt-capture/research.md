# Research & Design Decisions

## Summary
- **Feature**: `receipt-capture`
- **Discovery Scope**: New Feature（グリーンフィールド）
- **Key Findings**:
  - Claude Vision APIはbase64エンコード画像をサポートし、日本語OCRに対応。API上限は5MB/画像
  - Supabase StorageはRLSポリシーでアクセス制御。`authenticated`ロールベースのポリシーが標準
  - `@anthropic-ai/sdk` TypeScript SDKでサーバーサイドからVision APIを呼び出し可能

## Research Log

### Claude Vision API — 領収書OCR
- **Context**: 領収書画像からの金額・日付・店名自動抽出に使用するAPI選定
- **Sources Consulted**: [Vision - Claude API Docs](https://platform.claude.com/docs/en/build-with-claude/vision)
- **Findings**:
  - サポート形式: JPEG, PNG, GIF, WebP
  - API画像サイズ上限: 5MB/画像
  - 最大解像度: 8000x8000px（20画像超の場合2000x2000px）
  - 推奨解像度: 1568px以下（長辺）でtime-to-first-token最適化
  - TypeScript SDK: `@anthropic-ai/sdk` — base64エンコードで画像送信
  - メッセージ構造: `{ type: "image", source: { type: "base64", media_type, data } }`
  - モデル: `claude-sonnet-4-5-20250514`（コスト効率重視）
- **Implications**:
  - 要件のファイルサイズ上限10MB → API上限5MBに合わせて調整が必要（クライアント側でリサイズ or サーバー側で圧縮）
  - Route Handlerからサーバーサイドで呼び出すことでAPIキー漏洩を防止
  - プロンプト設計で日本語領収書の金額・日付・店名抽出を指示

### Supabase Storage — 画像保存
- **Context**: 領収書画像の永続化ストレージ
- **Sources Consulted**: [Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control), [Storage Buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals)
- **Findings**:
  - バケットはデフォルトprivate
  - RLSポリシーが必要: `storage.objects`テーブルへのINSERT/SELECT/DELETE
  - 認証済みユーザーのみアクセス可能に設定
  - ファイルパス構造: `receipts/{user_id}/{timestamp}_{filename}`
  - service_role_keyはRLSをバイパス — サーバーサイド専用
- **Implications**:
  - サーバーサイド（`createServerClient`）でアップロード処理 → service_role_keyでRLSバイパス
  - クライアントからは署名付きURLで画像を取得

### @anthropic-ai/sdk — TypeScript SDK
- **Context**: Next.js Route HandlerからClaude Vision APIを呼び出すためのSDK
- **Findings**:
  - `npm install @anthropic-ai/sdk` / `pnpm add @anthropic-ai/sdk`
  - 環境変数: `ANTHROPIC_API_KEY`
  - base64画像の送信: `{ type: "image", source: { type: "base64", media_type, data } }`
  - テキスト+画像の複合メッセージ対応
- **Implications**: 既存の`withAuth`パターンと組み合わせてRoute Handlerで使用

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| App Router + Route Handler | Next.js標準のAPI Route + サーバーコンポーネント | 既存パターン踏襲、シンプル | 大ファイルアップロード時のタイムアウト | 採用 |
| Server Actions | Next.js Server Actions | フォーム処理が簡潔 | ファイルアップロードとの相性が複雑 | 不採用 |

## Design Decisions

### Decision: OCR処理モデル選定
- **Context**: 領収書画像のOCR解析に使用するClaude モデル
- **Alternatives Considered**:
  1. Claude Opus 4.6 — 最高精度だが高コスト
  2. Claude Sonnet 4.5 — 高精度かつコスト効率良好
  3. Claude Haiku 4.5 — 低コストだが精度に懸念
- **Selected Approach**: Claude Sonnet 4.5（`claude-sonnet-4-5-20250514`）
- **Rationale**: OCRタスクは比較的定型的。Sonnetで十分な精度が期待でき、コスト効率が良い
- **Trade-offs**: Opusほどの精度は得られない可能性があるが、編集可能UIでカバー
- **Follow-up**: 実運用で精度が不足する場合はモデルを環境変数で切り替え可能に設計

### Decision: 画像アップロードフロー
- **Context**: クライアントからの画像アップロード方法
- **Alternatives Considered**:
  1. クライアント直接アップロード（Supabase Storage SDK）
  2. サーバー経由アップロード（Route Handler → Supabase Storage）
- **Selected Approach**: サーバー経由アップロード
- **Rationale**: アップロードと同時にOCR解析を実行するため、サーバー側で一括処理が効率的。APIキーの管理もサーバー側に集約
- **Trade-offs**: サーバー負荷が増えるが、シングルユーザー環境では問題なし

### Decision: 画像サイズ制限
- **Context**: Claude Vision APIの5MB制限 vs 要件の10MB
- **Selected Approach**: クライアント側で5MB以下にリサイズ/圧縮してからアップロード
- **Rationale**: API制限に合わせることで確実に処理可能。Canvas APIでブラウザ側リサイズ

## Risks & Mitigations
- **日本語領収書のOCR精度**: プロンプト最適化 + 編集可能UIでユーザー修正を可能に
- **大容量画像のアップロード**: クライアント側リサイズで5MB以下に制限
- **API呼び出しタイムアウト**: ローディングUI + エラーハンドリングで対応

## References
- [Vision - Claude API Docs](https://platform.claude.com/docs/en/build-with-claude/vision) — Vision APIの仕様・制限・コード例
- [Storage Access Control | Supabase Docs](https://supabase.com/docs/guides/storage/security/access-control) — Storage RLSポリシー
- [Storage Buckets | Supabase Docs](https://supabase.com/docs/guides/storage/buckets/fundamentals) — バケット設定
