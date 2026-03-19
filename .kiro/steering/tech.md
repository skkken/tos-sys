# Technology Stack

## Architecture

Next.js App Routerによるフルスタックアプリケーション。サーバーコンポーネントをデフォルトとし、必要に応じてクライアントコンポーネントを使用する。Supabase をバックエンドとし、Vercel にデプロイする。

## Core Technologies

- **Language**: TypeScript（strict mode）
- **Framework**: Next.js 16 + React 19
- **Runtime**: Node.js
- **Package Manager**: pnpm
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Hosting**: Vercel

## Key Libraries

- **Styling**: Tailwind CSS v4（PostCSS経由）
- **UI Components**: shadcn/ui
- **Fonts**: next/font（Geist Sans / Geist Mono）
- **Validation**: Zod
- **PDF Generation**: @react-pdf/renderer（API Routeで生成）
- **Date Handling**: date-fns
- **Supabase Client**: @supabase/supabase-js, @supabase/ssr

## Development Standards

### Type Safety
- TypeScript strict mode有効
- `isolatedModules: true`
- Supabase の型は `supabase gen types` で生成し `lib/types/database.ts` に配置

### Code Quality
- ESLint v9（Flat Config形式）
- eslint-config-next: core-web-vitals + typescript プリセット

### Testing
テストスイートなし（動作確認は実際のアプリで行う）

## Development Environment

### Required Tools
- Node.js（ES2017+ターゲット）
- pnpm
- Supabase CLI（型生成・マイグレーション用）

### Common Commands
```bash
# Dev: pnpm dev
# Build: pnpm build
# Lint: pnpm lint
# Supabase types: pnpm supabase gen types typescript --local > lib/types/database.ts
```

## Key Technical Decisions

- **App Router採用**: Pages Routerではなく、Next.js推奨のApp Routerパターンを使用
- **Tailwind CSS v4**: PostCSSプラグインとして統合（`@tailwindcss/postcss`）
- **pnpm**: パッケージマネージャーとして使用
- **Supabase Auth**: シングルユーザー認証（email/password）、RLS有効
- **shadcn/ui**: コンポーネントライブラリ（Tailwind v4対応）
- **Zod**: フォーム・APIバリデーション
- **@react-pdf/renderer**: 請求書・見積もりPDF生成（API Routeで実行）
- **金額は integer (円)**: 浮動小数点を避けるため整数で保存
- **自動採番**: 年度プレフィックス形式（INV-2026-001, EST-2026-001）
- **会社情報**: `company_settings` テーブル（key-value）で管理

## Infrastructure

- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth（signup不要、Dashboard直接作成）
- **File Storage**: Supabase Storage（領収書・契約書PDF）
- **Error Monitoring**: Vercel ログ（初期）、Sentry（後から追加可）

---
_Document standards and patterns, not every dependency_
