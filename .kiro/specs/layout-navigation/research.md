# Research & Design Decisions

## Summary
- **Feature**: `layout-navigation`
- **Discovery Scope**: Extension（既存認証基盤を活用し、レイアウト・ナビゲーション・ログインUIを追加）
- **Key Findings**:
  - shadcn/ui Sidebarは `pnpm dlx shadcn@latest add sidebar` でインストール。Sheet, Collapsible等が依存として追加される
  - SidebarProviderがレスポンシブ対応を標準で処理（モバイル時はSheet/offcanvas切替）
  - 既存middleware.tsの認証ガードは変更不要。matcher設定が既にログインページを除外済み

## Research Log

### shadcn/ui Sidebar コンポーネント
- **Context**: 要件3-5で使用するサイドバーコンポーネントの技術詳細確認
- **Sources Consulted**: https://ui.shadcn.com/docs/components/radix/sidebar
- **Findings**:
  - インストール: `pnpm dlx shadcn@latest add sidebar`
  - 依存: Sheet（モバイルオフキャンバス）、Collapsible（折りたたみグループ）
  - 主要コンポーネント: SidebarProvider, Sidebar, SidebarHeader, SidebarFooter, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger
  - SidebarProvider props: `defaultOpen`, `open`, `onOpenChange`
  - SidebarMenuButton: `asChild` prop でLink等をラップ可能、`isActive` propでアクティブ状態表示
  - モバイル: `useSidebar` hookの `isMobile` でビューポート変化を追跡、Sheet経由でオフキャンバス表示
  - キーボードショートカット: cmd+b (Mac) / ctrl+b (Windows)
- **Implications**: レスポンシブ対応が標準で含まれるため、追加実装は最小限。`isActive` + `usePathname()` でアクティブハイライトを実現

### Supabase Auth ログインフロー
- **Context**: 要件1のログイン実装方式
- **Sources Consulted**: 既存コードベース（lib/supabase/client.ts, auth-server.ts）
- **Findings**:
  - クライアントサイド: `createClient()` → `supabase.auth.signInWithPassword({email, password})`
  - サーバーサイド: `createAuthServerClient()` でユーザー取得可能
  - middleware.ts: `updateSession()` でセッション管理済み
- **Implications**: ログインページはクライアントコンポーネントとして実装。成功時に `router.push('/dashboard')` でリダイレクト

## Design Decisions

### Decision: ログインフォームの状態管理
- **Context**: ログインフォームのsubmit処理とローディング状態管理
- **Alternatives Considered**:
  1. Server Actions + `useActionState` — サーバーサイドで認証処理
  2. クライアント `useState` + Supabase client — クライアントサイドで認証処理
- **Selected Approach**: クライアント `useState` + Supabase client
- **Rationale**: Supabase Auth の `signInWithPassword` はクライアントSDKで直接呼び出すのが標準パターン。Server Actionsではcookie設定が複雑になる
- **Trade-offs**: クライアントバンドルにSupabase SDKが含まれるが、既に`'use client'`の`client.ts`が存在

### Decision: 既存receiptsページの扱い
- **Context**: `app/receipts/` が現在ルートグループ外に存在
- **Selected Approach**: `app/(app)/receipts/` に移動
- **Rationale**: 全アプリケーションページを `(app)` ルートグループに統一し、サイドバーレイアウトを適用
- **Trade-offs**: ルートパスは変わらない（ルートグループはURL構造に影響しない）

### Decision: ルートリダイレクト方式
- **Context**: `/` → `/dashboard` リダイレクト
- **Selected Approach**: `app/(app)/page.tsx` で `redirect('/dashboard')` を使用
- **Rationale**: middleware.tsは認証チェック専用に保ち、ルーティングロジックを分離。Next.jsの`redirect()`関数はサーバーコンポーネントで使用可能

## Risks & Mitigations
- **shadcn sidebar依存の追加**: Sheet等の追加コンポーネントが自動インストールされるが、既存コンポーネントとの競合リスクは低い
- **receiptsページ移動**: APIルート(`app/api/receipts/`)はルートグループの影響を受けないため安全
