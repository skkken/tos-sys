# Implementation Plan

- [x] 1. 依存パッケージのインストールと shadcn/ui 初期化
- [x] 1.1 Supabase、Zod、date-fns、@react-pdf/renderer の依存パッケージを追加する
  - `@supabase/supabase-js`, `@supabase/ssr` をインストール
  - `zod` をインストール
  - `date-fns` をインストール
  - `@react-pdf/renderer` を React 19 互換バージョン（v4 以上）でインストール
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6_

- [x] 1.2 shadcn/ui を初期化し Tailwind CSS v4 互換の構成にする
  - `npx shadcn@latest init` を実行し Tailwind CSS v4 モードを選択
  - 生成された `components.json` と関連設定ファイルを確認
  - _Requirements: 1.5_

- [x] 2. 環境変数とビルド設定
- [x] 2.1 (P) 環境変数テンプレートを作成する
  - `.env.example` に `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` を定義
  - `.gitignore` に `!.env.example` を追加して `.env*` の一括除外からテンプレートを除外
  - `.env.local` が `.gitignore` に含まれていることを確認
  - _Requirements: 11.1, 11.3_

- [x] 3. Supabase クライアント生成
- [x] 3.1 サービスロールキーを使用するサーバーサイド Supabase クライアントを作成する
  - 環境変数が未設定の場合に明確なエラーメッセージをスローするバリデーション付き
  - Server Components、API Routes、Server Actions からの利用を想定
  - _Requirements: 2.1, 2.4_

- [x] 3.2 (P) ブラウザ用 Supabase クライアントを作成する
  - `"use client"` ディレクティブ付きのクライアントコンポーネント用
  - anon キーを使用（RLS 適用下）
  - _Requirements: 2.2, 2.4_

- [x] 3.3 サーバーサイド認証用 Supabase クライアントを作成する
  - Cookie ベースのセッション管理に対応
  - `next/headers` の `cookies()` を使用した Cookie 読み書き
  - Server Components での Cookie 設定失敗時の graceful handling
  - _Requirements: 2.3_

- [x] 3.4 (P) ミドルウェア用セッション更新ヘルパーを作成する
  - リクエストの Cookie を読み取り、セッションを検証・更新する（`@supabase/ssr` を直接使用、`auth-server.ts` に依存しない）
  - 更新された Cookie を含む NextResponse を返す
  - ユーザー情報（認証済み or null）を返す
  - _Requirements: 3.2, 3.4_

- [x] 4. セッション管理ミドルウェア
- [x] 4.1 ルートレベルの Next.js middleware を作成する
  - 全リクエストでセッション更新ヘルパーを呼び出す
  - 保護ルート（`(app)` 配下）への未認証アクセスを `/login` にリダイレクト
  - 静的ファイルとパブリックルート（`/login`, `/api/auth`）を `config.matcher` で除外
  - _Requirements: 3.1, 3.3_

- [x] 5. 共通ユーティリティ（エラー・バリデーション・フォーマット）
- [x] 5.1 (P) 統一エラーレスポンス生成ユーティリティを作成する
  - 任意のメッセージとステータスコードでクライアントエラーを生成する関数
  - リソースが見つからない場合の 404 エラー関数
  - 予期しない例外をログに記録し 500 エラーを返す関数
  - すべてのレスポンスを `{ error: string }` 形式の JSON で統一
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 5.2 (P) Zod スキーマによるバリデーションヘルパーと共通スキーマを作成する
  - リクエストボディの JSON パース + Zod 検証を一括で行うヘルパー
  - 任意のデータを Zod スキーマで検証するヘルパー
  - バリデーション失敗時にフィールドエラー情報付き 400 レスポンスを返す
  - 日付（YYYY-MM-DD）、UUID の共通スキーマを提供
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 5.3 (P) 日本語ロケールの通貨・日付フォーマットユーティリティを作成する
  - 整数値を `¥1,234` 形式に変換する通貨フォーマット関数
  - `ja-JP` ロケールで日付を複数形式（`2026/03/19`, `2026年3月19日`）で表示する関数
  - サーバーサイド・クライアントサイド両方で利用可能な設計
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 6. 認証ヘルパーと API ハンドラー
- [x] 6.1 シングルユーザー向け認証チェックヘルパーを作成する
  - API Route 用: 未認証時に 401 エラーレスポンスを返す関数
  - Server Component / Page 用: 未認証時に `/login` へリダイレクトする関数
  - email/password 認証のみ、サインアップ機能なし
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 6.2 API Route 用の認証・エラーハンドリング共通ラッパーを作成する
  - 認証チェック + Supabase クライアント生成 + ルートパラメータ解決を自動化
  - 例外発生時の 500 エラーレスポンスとログ出力（5.1 のエラーユーティリティを使用）
  - 認証不要の公開ルート用ラッパーも提供
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 7. 型定義と DB マイグレーション
- [x] 7.1 (P) Supabase 型定義のプレースホルダーを作成する
  - 型定義ファイルのプレースホルダーを配置
  - Supabase CLI での型生成コマンドをコメントで文書化
  - _Requirements: 10.1, 10.2_

- [x] 7.2 (P) 会社設定テーブルのマイグレーションを作成する
  - key-value 形式（key text PK, value text, updated_at）のテーブル定義
  - RLS を有効にし、認証済みユーザーのみ読み書き可能なポリシーを設定
  - 社名・住所・振込先・適格請求書番号・電話番号・メールアドレスの初期データ挿入
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 8. ビルド検証
- [x] 8.1 `pnpm build` を実行し、全コンポーネントがエラーなくビルドされることを確認する
  - 型エラーがないことを確認
  - import パスの解決が正しいことを確認
  - _Requirements: 11.2_
