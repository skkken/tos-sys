# Requirements Document

## Introduction
tos-sys の技術基盤を構築する。Supabase連携（認証・クライアント・セッション管理）、shadcn/ui初期化、共通ユーティリティ（エラーハンドリング・バリデーション・フォーマット）、およびcompany_settingsテーブル作成を含む。後続の全機能（CRM、請求書、見積もり、タスク管理等）が依存する共通インフラレイヤーを整備する。

## Requirements

### Requirement 1: 依存パッケージのインストールと初期化
**Objective:** As a 開発者, I want 必要な依存パッケージがすべてインストールされ、shadcn/uiが初期化された状態にしたい, so that 後続の機能開発をすぐに開始できる

#### Acceptance Criteria
1. The tos-sys shall `@supabase/supabase-js` と `@supabase/ssr` を依存パッケージとして含む
2. The tos-sys shall `zod` を依存パッケージとして含む
3. The tos-sys shall `date-fns` を依存パッケージとして含む
4. The tos-sys shall `@react-pdf/renderer` を依存パッケージとして含む
5. The tos-sys shall shadcn/ui が初期化され、Tailwind CSS v4 と互換性のある状態で構成される
6. When `pnpm install` を実行した場合, the tos-sys shall すべての依存パッケージをエラーなくインストールする

### Requirement 2: Supabase クライアント生成
**Objective:** As a 開発者, I want サーバーサイド・クライアントサイド両方で Supabase クライアントを利用できるようにしたい, so that データベース操作や認証をどこからでも行える

#### Acceptance Criteria
1. The tos-sys shall サーバーサイド用 Supabase クライアント (`lib/supabase/server.ts`) を提供し、サービスロールキーを使用してサーバーコンポーネントや API Route から呼び出せる
2. The tos-sys shall ブラウザ用 Supabase クライアント (`lib/supabase/client.ts`) を提供し、anon キーを使用してクライアントコンポーネントから呼び出せる
3. The tos-sys shall サーバーサイド認証用 Supabase クライアント (`lib/supabase/auth-server.ts`) を提供し、Cookie ベースのセッション管理に対応する
4. If 環境変数 `NEXT_PUBLIC_SUPABASE_URL` または `NEXT_PUBLIC_SUPABASE_ANON_KEY` が未設定の場合, the tos-sys shall 明確なエラーメッセージをスローする

### Requirement 3: セッション管理ミドルウェア
**Objective:** As a ユーザー, I want セッションが自動的に管理されるようにしたい, so that ログイン状態が適切に維持される

#### Acceptance Criteria
1. The tos-sys shall Next.js middleware (`middleware.ts`) でリクエストごとにセッションを更新する
2. The tos-sys shall Supabase Auth の Cookie ベースセッション管理用ヘルパー (`lib/supabase/middleware.ts`) を提供する
3. When 認証が必要なルートに未認証ユーザーがアクセスした場合, the tos-sys shall `/login` にリダイレクトする
4. While ユーザーが認証済みの場合, the tos-sys shall セッショントークンを自動的にリフレッシュする

### Requirement 4: 認証ヘルパー
**Objective:** As a 開発者, I want 認証チェックを簡潔に記述できるヘルパーを利用したい, so that 各ページや API で認証ロジックを繰り返し記述しなくて済む

#### Acceptance Criteria
1. The tos-sys shall シングルユーザー（管理者1名）のみを想定し、認証方式は email/password のみとする
2. The tos-sys shall `requireAuth` 関数 (`lib/auth/index.ts`) を提供し、サーバーコンポーネントや Server Actions で認証済みユーザーを取得できる
3. When `requireAuth` を呼び出して未認証の場合, the tos-sys shall `/login` へのリダイレクトまたは 401 エラーレスポンスを返す
4. When `requireAuth` を呼び出して認証済みの場合, the tos-sys shall Supabase User オブジェクトを返す
5. The tos-sys shall サインアップ機能を提供しない（ユーザーは Supabase Dashboard で直接作成する）

### Requirement 5: API ハンドラーラッパー
**Objective:** As a 開発者, I want API Route で認証チェック・エラーハンドリングを共通化したい, so that 各 API Route の実装がシンプルになる

#### Acceptance Criteria
1. The tos-sys shall `withAuth` ラッパー関数 (`lib/api/handler.ts`) を提供し、認証チェック・Supabase クライアント生成・エラーキャッチを自動的に行う
2. When `withAuth` でラップされた API ハンドラーが呼ばれた場合, the tos-sys shall 認証済みユーザー、Supabase クライアント、ルートパラメータをコンテキストとして提供する
3. If `withAuth` でラップされたハンドラー内で例外がスローされた場合, the tos-sys shall 500 エラーレスポンスを返し、エラーをログに記録する
4. The tos-sys shall 認証不要の公開ルート用 `withPublic` ラッパーも提供する

### Requirement 6: エラーハンドリング
**Objective:** As a 開発者, I want 統一されたエラーレスポンス形式を使いたい, so that クライアント側でのエラー処理が一貫する

#### Acceptance Criteria
1. The tos-sys shall `clientError` 関数 (`lib/errors/index.ts`) を提供し、任意のメッセージとステータスコードでエラーレスポンスを生成できる
2. The tos-sys shall `apiError` 関数を提供し、予期しないエラーをログに記録した上で 500 エラーレスポンスを返す
3. The tos-sys shall `notFoundError` 関数を提供し、リソースが見つからない場合の 404 レスポンスを生成する
4. The tos-sys shall すべてのエラーレスポンスを `{ error: string }` 形式の JSON で返す

### Requirement 7: バリデーションユーティリティ
**Objective:** As a 開発者, I want Zod スキーマによるリクエストバリデーションを簡潔に記述したい, so that 入力値検証のボイラープレートを削減できる

#### Acceptance Criteria
1. The tos-sys shall `parseRequest` 関数 (`lib/validations/index.ts`) を提供し、Zod スキーマでリクエストボディを検証して型安全なデータまたはエラーレスポンスを返す
2. The tos-sys shall `parseBody` 関数を提供し、任意のデータを Zod スキーマで検証できる
3. If バリデーションが失敗した場合, the tos-sys shall 400 エラーレスポンスと具体的なフィールドエラー情報を返す
4. The tos-sys shall 共通スキーマ（`dateSchema`, `uuidSchema` 等）を提供する

### Requirement 8: フォーマットユーティリティ
**Objective:** As a ユーザー, I want 金額や日付が日本語形式で表示されるようにしたい, so that 日本のビジネス慣行に沿った表示になる

#### Acceptance Criteria
1. The tos-sys shall 通貨フォーマット関数 (`lib/format.ts`) を提供し、整数値を `¥1,234` 形式に変換する
2. The tos-sys shall 日付フォーマット関数を提供し、`ja-JP` ロケールで日付を表示する（例: `2026年3月19日`、`2026/03/19`）
3. The tos-sys shall フォーマット関数はサーバーサイド・クライアントサイドの両方で利用できる

### Requirement 9: 会社設定テーブル
**Objective:** As a ユーザー, I want 会社情報（社名・住所・振込先等）を管理できるようにしたい, so that 請求書や見積もりのPDFに正確な会社情報を出力できる

#### Acceptance Criteria
1. The tos-sys shall `company_settings` テーブルを作成するマイグレーションを提供する
2. The tos-sys shall `company_settings` テーブルは key-value 形式（`key text primary key`, `value text`）で設計する
3. The tos-sys shall `company_settings` テーブルに RLS ポリシーを設定し、認証済みユーザーのみアクセス可能にする
4. The tos-sys shall 以下のキーをデフォルトで管理できるようにする: `company_name`（社名）、`address`（住所）、`bank_info`（振込先）、`invoice_registration_number`（適格請求書番号）、`phone`（電話番号）、`email`（メールアドレス）

### Requirement 10: 型定義
**Objective:** As a 開発者, I want Supabase のデータベーススキーマに対応する TypeScript 型を利用したい, so that データアクセス時に型安全性が確保される

#### Acceptance Criteria
1. The tos-sys shall `lib/types/database.ts` に Supabase 生成の TypeScript 型定義を配置する構成とする
2. The tos-sys shall 型定義ファイルのプレースホルダーを作成し、Supabase CLI での型生成コマンドを文書化する

### Requirement 11: 環境変数とビルド
**Objective:** As a 開発者, I want 必要な環境変数が明確に定義され、ビルドが正常に通る状態にしたい, so that 開発・デプロイがスムーズに行える

#### Acceptance Criteria
1. The tos-sys shall `.env.example` に必要な環境変数テンプレート（`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`）を提供する
2. When `pnpm build` を実行した場合, the tos-sys shall エラーなくビルドが完了する
3. The tos-sys shall `.env.example` を `.gitignore` に含めず、`.env.local` を `.gitignore` に含める
