# Technology Stack

## Architecture

Next.js App Routerによるフルスタックアプリケーション。サーバーコンポーネントをデフォルトとし、必要に応じてクライアントコンポーネントを使用する。

## Core Technologies

- **Language**: TypeScript（strict mode）
- **Framework**: Next.js 16 + React 19
- **Runtime**: Node.js
- **Package Manager**: pnpm

## Key Libraries

- **Styling**: Tailwind CSS v4（PostCSS経由）
- **Fonts**: next/font（Geist Sans / Geist Mono）

## Development Standards

### Type Safety
- TypeScript strict mode有効
- `isolatedModules: true`

### Code Quality
- ESLint v9（Flat Config形式）
- eslint-config-next: core-web-vitals + typescript プリセット

### Testing
テストスイートなし（CLAUDE.mdの規約に従い、動作確認は実際のアプリで行う）

## Development Environment

### Required Tools
- Node.js（ES2017+ターゲット）
- pnpm

### Common Commands
```bash
# Dev: pnpm dev
# Build: pnpm build
# Lint: pnpm lint
```

## Key Technical Decisions

- **App Router採用**: Pages Routerではなく、Next.js推奨のApp Routerパターンを使用
- **Tailwind CSS v4**: PostCSSプラグインとして統合（`@tailwindcss/postcss`）
- **pnpm**: パッケージマネージャーとして使用（workspace対応）

---
_Document standards and patterns, not every dependency_
