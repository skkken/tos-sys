# Research & Design Decisions: task-management

## Summary
- **Feature**: `task-management`
- **Discovery Scope**: Extension（customer-managementと同じパターンを踏襲）
- **Key Findings**:
  - 既存のcustomer-management実装がServer Actions + Zod + RLSの完全なリファレンスとして使用可能
  - カンバンビューはshadcn/uiのCardコンポーネント + CSS Gridで実現可能（外部DnDライブラリ不要）
  - projects.customer_idのON DELETEはSET NULLが適切（顧客削除時にプロジェクトを残す）

## Research Log

### カンバンビューの実装パターン
- **Context**: 要件7.2, 7.3でリスト/カンバン切り替え機能が必要
- **Sources Consulted**: shadcn/ui公式ドキュメント、Next.js App Routerパターン
- **Findings**:
  - shadcn/uiにはカンバン専用コンポーネントは存在しない
  - Card + Badge + CSS Grid（4列）でシンプルなカンバンレイアウトを構築可能
  - ドラッグ&ドロップは要件外のため、dnd-kitなどの外部ライブラリは不要
  - ビュー切り替えはURL searchParams（`?view=kanban`）で管理し、Server Componentの再レンダリングをトリガー
- **Implications**: 新規UIコンポーネント（TaskKanban, TaskCard）の作成が必要だが、既存のshadcn/uiコンポーネントのみで実現可能

### ビュー切り替え状態の管理
- **Context**: リスト/カンバンの切り替え状態をどこで保持するか
- **Findings**:
  - URL searchParams: サーバーサイドレンダリングと整合、共有可能、ブックマーク可能
  - localStorage: ユーザー設定の永続化には適するが、SSRと不整合のリスク
- **Selected**: URL searchParams（`?view=list|kanban`）。CustomerSearchBarと同じパターン

### projects.customer_id の外部キー制約
- **Context**: projectsテーブルのcustomer_idがcustomersテーブルを参照
- **Findings**:
  - ON DELETE CASCADE: 顧客削除時にプロジェクトも削除 → データロスのリスク
  - ON DELETE RESTRICT: 顧客削除をブロック → customer-managementの論理削除と矛盾しない
  - ON DELETE SET NULL: 顧客削除時にcustomer_idをnullに → プロジェクト保持、柔軟
- **Selected**: ON DELETE SET NULL。顧客が非アクティブ化されてもプロジェクトは独立して存続すべき

### タスク詳細・編集の統合パターン
- **Context**: customerは詳細ページ（`/[id]`）と編集ページ（`/[id]/edit`）を分離。taskは統合する設計
- **Findings**:
  - 詳細ページ内にインライン編集フォームを配置する方が、タスクのようにステータス更新頻度が高いエンティティに適合
  - 実装は`/tasks/[id]`の1ページ内で詳細表示とフォーム編集を切り替える
- **Selected**: 詳細ページにフォームを統合。編集モード切り替えボタンで表示/編集を切り替え

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| customer-managementパターン踏襲 | Server Actions + Server Components + shadcn/ui | 実績あり、一貫性、学習コスト低 | 2テーブル構成でActions増加 | 採用 |

## Design Decisions

### Decision: タスク削除は物理削除
- **Context**: customerは論理削除（status→inactive）だが、taskの削除方式の選択
- **Alternatives Considered**:
  1. 論理削除（status→cancelled） — customerと統一
  2. 物理削除（DELETE） — タスクの性質に合致
- **Selected Approach**: 物理削除
- **Rationale**: タスクはマスタデータではなく作業項目。完了したタスクは'done'ステータスで管理され、不要なタスクは物理削除で消去する方が自然。他のエンティティがtasksを外部キー参照することはない
- **Trade-offs**: ✅ シンプル、データ肥大化防止 / ❌ 復元不可

### Decision: プロジェクト管理はタスク管理の補助機能
- **Context**: projectsテーブルのCRUDをどの程度UIで公開するか
- **Selected Approach**: プロジェクトCRUD Server Actionsは用意するが、専用のプロジェクト管理ページは作成しない。タスク作成フォーム内のプロジェクト選択UIでプロジェクトの簡易管理（一覧表示・選択）を提供する
- **Rationale**: Issue #4のページ要件は `/tasks` 系のみ。プロジェクト専用ページはスコープ外
- **Follow-up**: プロジェクトの作成・編集はタスク作成フォーム内の簡易UIまたは将来のプロジェクト管理ページで対応

## Risks & Mitigations
- カンバンビューのレスポンシブ対応 → CSS Gridのauto-fitで対応
- タスク数増加時のパフォーマンス → 初期はページネーションなしで実装、必要に応じて追加
