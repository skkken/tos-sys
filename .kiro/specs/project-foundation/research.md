# Research & Design Decisions

## Summary
- **Feature**: `project-foundation`
- **Discovery Scope**: New Feature（グリーンフィールド、参考実装あり）
- **Key Findings**:
  - streamer-manager の Supabase パターン（3種クライアント + middleware）をそのまま移植可能
  - シングルユーザーのため、ロール管理・チャネル権限は不要。認証ヘルパーを大幅に簡素化できる
  - `.gitignore` で `.env*` が一括除外されているため、`.env.example` を追跡するには `!.env.example` の追加が必要

## Research Log

### Supabase クライアントパターン
- **Context**: サーバー/クライアント/認証用の3種クライアントをどう構成するか
- **Sources Consulted**: streamer-manager の `lib/supabase/` ディレクトリ
- **Findings**:
  - `server.ts`: サービスロールキーで Supabase クライアント生成（データベース管理用）
  - `auth-client.ts`（→ `client.ts` に改名予定）: `createBrowserClient` でブラウザ用クライアント
  - `auth-server.ts`: `createServerClient` + Cookie 管理（Server Components 用）
  - `auth-middleware.ts`（→ `middleware.ts` に改名予定）: セッション更新ヘルパー
- **Implications**: 4ファイル構成で移植。tos-sys ではファイル名を簡潔にする（`auth-client.ts` → `client.ts`）

### 認証の簡素化
- **Context**: streamer-manager はマルチユーザー（admin/staff/pending）だが、tos-sys はシングルユーザー
- **Findings**:
  - `requireAuth` のみ必要（`requireAdminAuth`, `requireApprovedAuth`, `getPagePermissions` は不要）
  - `user_roles` テーブル不要
  - `getUserChannelIds` 不要
  - RLS ポリシーは `auth.uid()` に対するシンプルなポリシーのみ
- **Implications**: `lib/auth/index.ts` は 20-30行程度の簡素な実装になる

### API ハンドラーラッパー
- **Context**: streamer-manager の `withAuth`, `withPublic`, `withCronAuth` パターンを参考
- **Findings**:
  - `withAuth`: 認証チェック + Supabase クライアント + エラーキャッチ
  - `withPublic`: 認証不要版
  - `withCronAuth`: cron ジョブ用（tos-sys では不要）
  - Sentry 連携は初期段階では不要（`console.error` で代替）
- **Implications**: `withAuth` と `withPublic` の2つのみ実装

### エラーハンドリング
- **Context**: streamer-manager の `lib/errors/` パターン
- **Findings**:
  - `clientError(message, status)`: 任意のエラーレスポンス生成
  - `apiError(error, route, method)`: 500 エラー + Sentry 送信
  - `notFoundError(resourceName)`: 404 エラー
  - tos-sys では Sentry 不要のため、`console.error` で代替
- **Implications**: Sentry 依存を除去したシンプル版を実装

## Design Decisions

### Decision: Supabase クライアントのファイル命名
- **Context**: streamer-manager では `auth-client.ts`, `auth-server.ts`, `auth-middleware.ts` だが、tos-sys ではよりシンプルな命名にしたい
- **Alternatives Considered**:
  1. streamer-manager と同じ命名（`auth-client.ts`, `auth-server.ts`, `auth-middleware.ts`）
  2. シンプルな命名（`client.ts`, `auth-server.ts`, `middleware.ts`）
- **Selected Approach**: Option 2（シンプルな命名）
- **Rationale**: tos-sys は新規プロジェクトで名前衝突のリスクがなく、ファイル名から役割が明確
- **Trade-offs**: streamer-manager との一貫性は失われるが、tos-sys 内での可読性が向上

### Decision: エラーモニタリング
- **Context**: 初期段階のエラー監視方針
- **Alternatives Considered**:
  1. Sentry 初期導入
  2. console.error + Vercel ログ
- **Selected Approach**: Option 2（console.error + Vercel ログ）
- **Rationale**: シングルユーザーの内部ツールでは初期段階で Sentry は過剰。後から追加可能な設計にする
- **Trade-offs**: 構造化ログがないが、Vercel Runtime Logs で十分

### Decision: company_settings テーブル設計
- **Context**: 会社情報をどう保存するか
- **Alternatives Considered**:
  1. key-value テーブル（`key text PK, value text`）
  2. 単一行テーブル（`company_name text, address text, ...`）
- **Selected Approach**: Option 1（key-value テーブル）
- **Rationale**: 将来の設定項目追加でマイグレーション不要。柔軟性が高い
- **Trade-offs**: 型安全性がやや低い（value は全て text）が、TypeScript 側で型変換可能

## Risks & Mitigations
- `.gitignore` の `.env*` が `.env.example` を除外するリスク → `!.env.example` を追加
- `@react-pdf/renderer` の React 19 互換性 → `@react-pdf/renderer@^4` を指定
- shadcn/ui の Tailwind CSS v4 互換性 → `npx shadcn@latest init` 時に v4 モードを選択
