# ギャップ分析: task-management

## 1. 現状の調査結果

### 既存アセット
| カテゴリ | 既存パターン | 適用可能性 |
|----------|-------------|-----------|
| マイグレーション | `supabase/migrations/` — RLS + トリガー + インデックス含む SQL | ✅ そのまま踏襲 |
| Server Actions | `lib/actions/customer.ts` — ActionState型、Zod検証、createAuthServerClient | ✅ そのまま踏襲 |
| バリデーション | `lib/validations/customer.ts` — base→create/update派生パターン | ✅ そのまま踏襲 |
| 型定義 | `lib/types/customer.ts` — interface定義 | ✅ そのまま踏襲 |
| UIコンポーネント | `components/customers/` — テーブル、フォーム、詳細、削除ダイアログ、検索バー | ✅ パターン踏襲（新規作成） |
| ページ | `app/(app)/customers/` — 一覧/新規/詳細/編集 | ✅ パターン踏襲 |
| UIライブラリ | shadcn/ui — table, badge, card, dialog, button, input, select, textarea | ✅ 活用可能 |
| プレースホルダー | `app/(app)/tasks/page.tsx` — 空ページ存在 | ✅ 上書き |

### 既存規約
- **認証**: `createAuthServerClient()` → `supabase.auth.getUser()` → `user.id`
- **Server Actions**: `'use server'`、FormData受取、Zod検証、ActionState返却、revalidatePath + redirect
- **削除ダイアログ**: `"use client"` コンポーネントで確認UI提供
- **RLS**: 4ポリシー（SELECT/INSERT/UPDATE/DELETE）、`auth.uid() = user_id`
- **updated_at**: DB トリガーで自動更新

## 2. 要件と既存資産のマッピング

| 要件 | 既存資産 | ギャップ |
|------|---------|---------|
| Req 1: projects テーブル | customersマイグレーションパターン | **Missing**: 新規マイグレーション作成が必要 |
| Req 2: tasks テーブル | customersマイグレーションパターン | **Missing**: 新規マイグレーション作成が必要 |
| Req 3: RLS | customersのRLSパターン | **Missing**: 2テーブル分のRLS作成が必要 |
| Req 4: バリデーション | customer.tsのZodパターン | **Missing**: project/task用スキーマ新規作成 |
| Req 5: プロジェクトCRUD | customer.tsのActionsパターン | **Missing**: project用Actions新規作成 |
| Req 6: タスクCRUD | customer.tsのActionsパターン | **Missing**: task用Actions新規作成。completed_at自動設定は新規ロジック |
| Req 7: タスク一覧 + カンバン | customer-table.tsx（リスト） | **Missing**: カンバンビューは新規UI。リスト/カンバン切り替えUIも新規 |
| Req 8: フィルタ・ソート・グルーピング | customer-search-bar.tsx | **Missing**: 複合フィルタ（ステータス+優先度+プロジェクト）、グルーピングは新規 |
| Req 9: 期限管理 | なし | **Missing**: 期限ハイライトロジック新規 |
| Req 10: タスク作成 | customer-form.tsx, customers/new/page.tsx | **Missing**: task用フォーム新規作成。プロジェクト選択UIが必要 |
| Req 11: タスク詳細・編集 | customer-detail.tsx, customers/[id]/page.tsx | **Missing**: 詳細+編集統合ページ（customerは分離パターン） |
| Req 12: ビルド検証 | 既存パターン | ギャップなし |

## 3. 実装アプローチ

### 推奨: Option B（新規コンポーネント作成）

**理由**: タスク管理はcustomerとは独立した機能ドメイン。既存パターンを踏襲しつつ、すべて新規ファイルとして作成するのが最も明確。

#### 新規作成ファイル一覧（想定）

**DB/バックエンド:**
- `supabase/migrations/XXXXXX_create_projects.sql`
- `supabase/migrations/XXXXXX_create_tasks.sql`
- `lib/types/project.ts`, `lib/types/task.ts`
- `lib/validations/project.ts`, `lib/validations/task.ts`
- `lib/actions/project.ts`, `lib/actions/task.ts`

**フロントエンド:**
- `components/tasks/task-list.tsx` — リストビュー
- `components/tasks/task-kanban.tsx` — カンバンビュー
- `components/tasks/task-card.tsx` — カンバン用カード
- `components/tasks/task-filters.tsx` — フィルタ・ソートUI
- `components/tasks/task-form.tsx` — 作成・編集フォーム
- `components/tasks/task-detail.tsx` — 詳細表示
- `components/tasks/delete-task-dialog.tsx` — 削除確認
- `app/(app)/tasks/page.tsx` — 一覧ページ（上書き）
- `app/(app)/tasks/new/page.tsx` — 新規作成ページ
- `app/(app)/tasks/[id]/page.tsx` — 詳細・編集ページ

**Trade-offs:**
- ✅ 既存コードへの影響ゼロ
- ✅ customer-managementと同じパターンで一貫性が高い
- ✅ 各ファイルの責務が明確
- ❌ ファイル数は多い（約15-18ファイル）

## 4. 技術的な注意点

1. **カンバンビュー**: shadcn/uiにカンバンコンポーネントはないため、CardコンポーネントとCSS Gridで自前実装。ドラッグ&ドロップは要件外（スコープ外）
2. **プロジェクト選択**: タスクフォーム内でプロジェクト一覧をセレクトで表示。`getProjects()`をServer Actionで提供
3. **customer_id FK**: projects→customersの外部キー。ON DELETE動作は設計フェーズで決定（SET NULLが妥当）
4. **タスク削除**: customerの論理削除とは異なり物理削除。確認ダイアログパターンは既存のdelete-customer-dialog.tsxを参考にする
5. **ビュー切り替え**: クライアントサイドの状態管理。URL searchParamsまたはlocalStorageで保持

## 5. 複雑度とリスク

- **工数**: M（3-7日） — 2テーブルのCRUD + カンバンビュー + フィルタ。既存パターンの踏襲が多く、新規ロジックはカンバン・フィルタ・期限ハイライト程度
- **リスク**: Low — 確立されたパターン（customer-management）をそのまま踏襲。カンバンビューのUI実装が唯一の新規パターンだが、基本的なCSS Grid + Cardで実現可能

## 6. 設計フェーズへの申し送り

- **Research Needed**: カンバンビューのCSS Grid実装パターン（ドラッグ&ドロップは不要）
- **設計判断**: projects.customer_id の ON DELETE 動作（SET NULL推奨）
- **設計判断**: リスト/カンバン切り替え状態の保持方法（searchParams vs localStorage）
- **設計判断**: タスク詳細ページの編集UI（インライン編集 vs 編集モード切り替え）
