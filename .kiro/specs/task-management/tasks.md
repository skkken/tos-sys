# Implementation Plan

- [ ] 1. データベーススキーマとセキュリティの構築
- [x] 1.1 projects テーブルのマイグレーション作成
  - projects テーブルを作成し、name（必須）、description、customer_id（customers参照、ON DELETE SET NULL）、status（CHECK制約: active/completed/on_hold/cancelled）、start_date、end_date、timestamps、user_id を定義する
  - user_id と status にインデックスを作成する
  - RLSを有効にし、認証済みユーザーが自身のデータのみ操作できる4つのポリシー（SELECT/INSERT/UPDATE/DELETE）を設定する
  - updated_at 自動更新トリガー関数（update_updated_at_column）とトリガーを作成する
  - _Requirements: 1.1, 1.2, 1.3, 3.1_

- [x] 1.2 tasks テーブルのマイグレーション作成
  - tasks テーブルを作成し、title（必須）、description、project_id（projects参照、ON DELETE SET NULL）、status（CHECK制約: todo/in_progress/done/cancelled）、priority（CHECK制約: low/medium/high/urgent）、due_date、completed_at、timestamps、user_id を定義する
  - user_id、status、priority、project_id、due_date にインデックスを作成する
  - RLSを有効にし、認証済みユーザーが自身のデータのみ操作できる4つのポリシーを設定する
  - updated_at 自動更新トリガーを設定する（1.1で作成した共通関数を再利用）
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.2_

- [ ] 2. 型定義とバリデーションスキーマの構築
- [x] 2.1 (P) プロジェクトの型定義とバリデーションスキーマを作成する
  - Project インターフェースを定義する（id, name, description, customer_id, status, start_date, end_date, timestamps, user_id）
  - プロジェクトステータスのenum型スキーマを定義する（active/completed/on_hold/cancelled）
  - 作成用と更新用の共通バリデーションスキーマを定義する（nameは必須、statusは制約値のみ）
  - _Requirements: 4.1, 4.2, 4.6_

- [x] 2.2 (P) タスクの型定義とバリデーションスキーマを作成する
  - Task インターフェースを定義する（id, title, description, project_id, status, priority, due_date, completed_at, timestamps, user_id）
  - タスクステータスとプライオリティのenum型スキーマを定義する
  - 作成用と更新用の共通バリデーションスキーマを定義する（titleは必須、status/priorityは制約値のみ）
  - プロジェクト名付きタスクの複合型（TaskWithProject）を定義する
  - _Requirements: 4.3, 4.4, 4.5, 4.6_

- [ ] 3. Server Actions の構築
- [x] 3.1 (P) プロジェクトの CRUD Server Actions を実装する
  - プロジェクト一覧取得（ステータスフィルタ対応）、単一取得、作成、更新、削除のServer Actionsを実装する
  - 作成・更新時にZodバリデーションを実行し、エラーはActionState形式で返却する
  - 作成時にログインユーザーの user_id を自動設定する
  - 成功時は revalidatePath でキャッシュを無効化する
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 3.2 (P) タスクの CRUD Server Actions を実装する
  - タスク一覧取得（ステータス・優先度・プロジェクトフィルタ、ソート対応）、単一取得、作成、更新、削除、ステータス変更のServer Actionsを実装する
  - 一覧取得時にプロジェクト名をJOINして返却する
  - ステータスが 'done' に変更された場合は completed_at を現在日時に設定し、'done' 以外に変更された場合は null に設定する
  - 優先度ソートはCASE式で重み付けする（urgent=0, high=1, medium=2, low=3）
  - 作成・更新時にZodバリデーションを実行し、エラーはActionState形式で返却する
  - タスク削除は物理削除で実装する
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 4. (P) タスク一覧ページの構築（リストビュー）
- [x] 4.1 フィルタ・ソート・ビュー切替UIを構築する
  - ステータスフィルタ（todo/in_progress/done/cancelled/全て）、優先度フィルタ（low/medium/high/urgent/全て）、プロジェクトフィルタ、プロジェクト別グルーピング切替を提供する
  - ソート項目（優先度・期限・作成日）と昇順・降順の切替を提供する
  - リストビューとカンバンビューの切替ボタンを提供する
  - URL searchParams でフィルタ状態を管理し、Server Componentの再レンダリングをトリガーする
  - _Requirements: 7.2, 8.1, 8.2, 8.3, 8.4, 8.5, 9.3_

- [x] 4.2 リストビューのテーブル表示を構築する
  - タスクをテーブル形式で表示し、各行にタイトル、ステータスバッジ、優先度バッジ、プロジェクト名、期限を表示する
  - 期限切れのタスクは期限を赤色でハイライト表示する
  - 各タスクのタイトルをクリックすると詳細ページに遷移する
  - フィルタ結果が0件の場合は「該当するタスクがありません」メッセージを表示する
  - プロジェクト別グルーピングが有効な場合はプロジェクトごとにセクション分けして表示する
  - _Requirements: 7.1, 7.4, 7.6, 8.6, 9.1, 9.2_

- [x] 4.3 タスク一覧ページを組み立てる
  - Server Componentとしてタスク一覧ページを構築し、フィルタUI、リストビューを組み合わせる
  - URL searchParams からフィルタ・ソート条件を取得してServer Actionsに渡す
  - 新規タスク作成ページへの導線ボタンを配置する
  - プロジェクト一覧をフィルタ用に取得する
  - _Requirements: 7.1, 7.5_

- [ ] 5. (P) カンバンビューの構築
- [x] 5.1 カンバン用カードコンポーネントを構築する
  - タスクのタイトル、優先度バッジ、プロジェクト名、期限を表示するカードを実装する
  - 期限切れタスクの期限を赤色でハイライト表示する
  - カードクリックでタスク詳細ページに遷移する
  - _Requirements: 7.3, 7.4, 7.6, 9.1, 9.2_

- [x] 5.2 カンバンビューレイアウトを構築する
  - ステータス列（todo / in_progress / done / cancelled）の4列グリッドレイアウトを実装する
  - 各列にステータスラベルとタスクカードを配置する
  - フィルタ結果が0件の場合は空状態メッセージを表示する
  - _Requirements: 7.3, 8.6_

- [x] 5.3 タスク一覧ページにカンバンビューを統合する
  - ビュー切替の状態（URL searchParams: view=list|kanban）に応じてリストビューまたはカンバンビューを表示する
  - デフォルトはリストビュー
  - _Requirements: 7.2_

- [ ] 6. (P) タスク作成ページの構築
- [ ] 6.1 タスク入力フォームを構築する
  - タイトル（必須）、説明、プロジェクト選択（セレクトボックス）、ステータス、優先度、期限の入力フィールドを提供する
  - useActionState でServer Actionの実行と状態管理を行う
  - バリデーションエラーはフィールドごとにエラーメッセージを表示する
  - 送信処理中はボタンを無効化しローディング状態を表示する
  - 作成と編集の両方で再利用可能な設計にする
  - _Requirements: 10.2, 10.4, 10.5_

- [ ] 6.2 新規タスク作成ページを構築する
  - プロジェクト一覧を取得してフォームに渡す
  - フォーム送信成功時にタスク一覧ページにリダイレクトする
  - _Requirements: 10.1, 10.3_

- [ ] 7. タスク詳細・編集ページの構築
- [ ] 7.1 タスク詳細表示コンポーネントを構築する
  - タスクの全情報（タイトル、説明、ステータス、優先度、プロジェクト名、期限、完了日時、作成日時、更新日時）を表示する
  - 編集モードへの切替ボタンを提供する
  - タスク一覧ページへの戻る導線を提供する
  - _Requirements: 11.1, 11.2, 11.4_

- [ ] 7.2 タスク詳細・編集ページを構築する
  - Server Componentとしてタスク詳細ページを構築し、タスクデータを取得する
  - 詳細表示と編集フォームの切り替えをサポートする（6.1で作成したフォームを再利用）
  - 更新成功時は詳細表示に戻る
  - 指定IDのタスクが存在しない場合は404ページを表示する
  - _Requirements: 11.1, 11.3, 11.5_

- [ ] 7.3 タスク削除機能を構築する
  - 削除確認ダイアログを実装し、タスクタイトルを表示して誤削除を防止する
  - 確認後にServer Actionで物理削除を実行する
  - 削除成功後はタスク一覧ページにリダイレクトする
  - _Requirements: 11.6, 11.7_

- [ ] 8. 統合確認とビルド検証
- [ ] 8.1 全体統合の確認とビルド検証を実施する
  - サイドバーナビゲーションにタスクページへのリンクが正しく設定されていることを確認する
  - `pnpm build` が成功することを確認する
  - 型エラーやlintエラーがないことを確認する
  - _Requirements: 12.1_
