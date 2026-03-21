# ギャップ分析: layout-navigation

## 要件と既存資産のマッピング

| 要件 | 既存資産 | ギャップ |
|------|---------|---------|
| Req1: 認証フロー | `lib/supabase/client.ts` (ブラウザクライアント), `lib/supabase/auth-server.ts` (サーバー認証) | **Missing**: ログインページ、`signInWithPassword` 呼び出しロジック |
| Req2: 認証ガード | `middleware.ts` + `lib/supabase/middleware.ts` で**実装済み** | ギャップなし。matcher設定も `/login` を除外済み |
| Req3: サイドバーナビ | shadcn v4 パッケージ導入済み (`shadcn@4.1.0`) | **Missing**: `components/ui/sidebar.tsx` 未生成。`npx shadcn@latest add sidebar` が必要 |
| Req4: レスポンシブ | Tailwind CSS v4 導入済み | **Missing**: shadcn Sidebar のモバイル対応は Sheet コンポーネントに依存（自動解決の見込み） |
| Req5: 認証付きレイアウト | `app/layout.tsx` はルートレイアウト（フォント・グローバルCSS） | **Missing**: `app/(app)/layout.tsx` ルートグループ未作成 |
| Req6: ルート構成 | `app/receipts/` が既にルートグループ外に存在 | **Missing**: 9ページのプレースホルダー + `(app)` ルートグループ。既存 `app/receipts/` の移動検討 |
| Req7: ログインUI | `components/ui/button.tsx`, `input.tsx`, `label.tsx` 存在 | **Missing**: `app/(auth)/login/page.tsx`、ログインフォームコンポーネント |

## 既存アーキテクチャの状態

### 認証基盤（実装済み）
- **middleware.ts**: 未認証ユーザーを `/login` にリダイレクト。`_next/static`, `_next/image`, `favicon.ico`, `login`, `api/auth` を除外
- **lib/supabase/middleware.ts**: `updateSession()` でセッション管理・ユーザー取得
- **lib/supabase/client.ts**: クライアントサイドのSupabaseクライアント（`'use client'`）
- **lib/supabase/auth-server.ts**: サーバーサイドの認証クライアント

### UIコンポーネント（一部存在）
- `button.tsx`, `input.tsx`, `label.tsx`, `select.tsx` のみ
- **Sidebarコンポーネント未導入**

### ルート構成（初期状態）
- `app/page.tsx`: Next.jsデフォルトのホームページ（置き換え対象）
- `app/layout.tsx`: ルートレイアウト（フォント設定のみ）
- `app/receipts/`: ルートグループ外の既存ページ群
- `app/api/receipts/`: API Route（ルートグループの影響を受けない）

## 実装アプローチ

### 推奨: Option C（ハイブリッド）

1. **新規作成**:
   - `app/(auth)/login/page.tsx` — ログインページ
   - `app/(app)/layout.tsx` — サイドバー付きレイアウト
   - `app/(app)/dashboard/page.tsx` 他9ページのプレースホルダー
   - サイドバー関連コンポーネント

2. **既存拡張**:
   - `app/page.tsx` → `/dashboard` リダイレクトに変更
   - middleware.ts のmatcher調整は不要（現状で動作する）

3. **移動検討**:
   - `app/receipts/` → `app/(app)/expenses/` 配下へ（またはreceipts固有ルートとして `(app)` 内に配置）
   - API Routes (`app/api/`) はルートグループの影響を受けないため変更不要

### トレードオフ
- ✅ 認証基盤が既に完成しており、ログインページとレイアウトの追加のみで済む
- ✅ shadcn/ui Sidebarコンポーネントが標準でレスポンシブ対応
- ⚠️ 既存 `app/receipts/` の移動が必要（後方互換性への影響は低い）

## 工数・リスク

- **工数**: **S（1-3日）** — 既存パターンの活用、認証基盤実装済み、UIコンポーネントは shadcn で生成
- **リスク**: **Low** — 既知の技術スタック、明確なスコープ、既存認証基盤の活用

## 設計フェーズへの推奨事項

1. **shadcn Sidebarの依存関係調査**: `npx shadcn@latest add sidebar` で追加されるコンポーネント群の確認
2. **既存receiptsページの扱い**: `(app)` ルートグループへの移動方針を決定
3. **ログインフォームの状態管理**: React `useActionState` vs `useState` の選択
