# Requirements Document

## Introduction
タスク管理機能は、プロジェクトとタスクの進捗管理を提供する。プロジェクトで作業を組織化し、タスクのステータス・優先度・期限を管理する。他のビジネスデータに依存しない独立した機能として、シングルユーザー向けの個人利用システム内で動作する。顧客（customers）との任意の紐付けをサポートする。

## Requirements

### Requirement 1: データベーススキーマ（projects テーブル）
**Objective:** As a システム管理者, I want プロジェクトデータが安全に永続化されること, so that タスクをプロジェクト単位で組織化できる

#### Acceptance Criteria
1. The projects テーブル shall id（UUID, PK, デフォルト gen_random_uuid()）、name（TEXT, NOT NULL）、description（TEXT）、customer_id（UUID, FK to customers）、status（TEXT, NOT NULL, デフォルト 'active'）、start_date（DATE）、end_date（DATE）、created_at（TIMESTAMPTZ, NOT NULL, デフォルト now()）、updated_at（TIMESTAMPTZ, NOT NULL, デフォルト now()）、user_id（UUID, NOT NULL, FK to auth.users）のカラムを持つ
2. The projects テーブル shall status カラムに CHECK 制約を持ち、'active'、'completed'、'on_hold'、'cancelled' のみ許容する
3. The マイグレーション shall Supabase CLI で実行可能な SQL マイグレーションファイルとして作成される

### Requirement 2: データベーススキーマ（tasks テーブル）
**Objective:** As a システム管理者, I want タスクデータが安全に永続化されること, so that 個々の作業項目を管理できる

#### Acceptance Criteria
1. The tasks テーブル shall id（UUID, PK, デフォルト gen_random_uuid()）、title（TEXT, NOT NULL）、description（TEXT）、project_id（UUID, FK to projects）、status（TEXT, NOT NULL, デフォルト 'todo'）、priority（TEXT, NOT NULL, デフォルト 'medium'）、due_date（DATE）、completed_at（TIMESTAMPTZ）、created_at（TIMESTAMPTZ, NOT NULL, デフォルト now()）、updated_at（TIMESTAMPTZ, NOT NULL, デフォルト now()）、user_id（UUID, NOT NULL, FK to auth.users）のカラムを持つ
2. The tasks テーブル shall status カラムに CHECK 制約を持ち、'todo'、'in_progress'、'done'、'cancelled' のみ許容する
3. The tasks テーブル shall priority カラムに CHECK 制約を持ち、'low'、'medium'、'high'、'urgent' のみ許容する
4. The マイグレーション shall Supabase CLI で実行可能な SQL マイグレーションファイルとして作成される

### Requirement 3: RLS ポリシー
**Objective:** As a システム管理者, I want 認証済みユーザーのみがデータにアクセスできること, so that データのセキュリティが保証される

#### Acceptance Criteria
1. The Supabase shall projects テーブルに RLS を有効にし、認証済みユーザーが自身の user_id に紐づくレコードのみ SELECT / INSERT / UPDATE / DELETE できるポリシーを適用する
2. The Supabase shall tasks テーブルに RLS を有効にし、認証済みユーザーが自身の user_id に紐づくレコードのみ SELECT / INSERT / UPDATE / DELETE できるポリシーを適用する

### Requirement 4: バリデーション
**Objective:** As a ユーザー, I want 入力データが適切にバリデーションされること, so that 不正なデータが保存されない

#### Acceptance Criteria
1. The プロジェクトバリデーションスキーマ shall name を必須フィールドとして検証する
2. The プロジェクトバリデーションスキーマ shall status を 'active'、'completed'、'on_hold'、'cancelled' のいずれかに制限する
3. The タスクバリデーションスキーマ shall title を必須フィールドとして検証する
4. The タスクバリデーションスキーマ shall status を 'todo'、'in_progress'、'done'、'cancelled' のいずれかに制限する
5. The タスクバリデーションスキーマ shall priority を 'low'、'medium'、'high'、'urgent' のいずれかに制限する
6. The バリデーションスキーマ shall 作成時と更新時の両方で共通のバリデーションルールを適用する

### Requirement 5: Server Actions（プロジェクト CRUD）
**Objective:** As a 開発者, I want プロジェクトのデータ操作が Server Actions で実装されること, so that Next.js App Router のベストプラクティスに沿った実装になる

#### Acceptance Criteria
1. The Server Actions shall プロジェクト一覧取得、プロジェクト作成、プロジェクト更新、プロジェクト削除の操作を提供する
2. The Server Actions shall 操作前に Zod バリデーションを実行する
3. The Server Actions shall Supabase クライアントを使用してデータベース操作を行う
4. If データベース操作が失敗した場合, the Server Actions shall 適切なエラーメッセージを返す

### Requirement 6: Server Actions（タスク CRUD）
**Objective:** As a 開発者, I want タスクのデータ操作が Server Actions で実装されること, so that タスクのライフサイクルを管理できる

#### Acceptance Criteria
1. The Server Actions shall タスク一覧取得（フィルタ・ソート対応）、タスク作成、タスク更新、タスク削除、タスクステータス変更の操作を提供する
2. The Server Actions shall 操作前に Zod バリデーションを実行する
3. The Server Actions shall Supabase クライアントを使用してデータベース操作を行う
4. When タスクのステータスが 'done' に変更された時, the Server Actions shall completed_at を現在日時に設定する
5. When タスクのステータスが 'done' 以外に変更された時, the Server Actions shall completed_at を null に設定する
6. If データベース操作が失敗した場合, the Server Actions shall 適切なエラーメッセージを返す

### Requirement 7: タスク一覧ページ
**Objective:** As a ユーザー, I want 登録済みのタスクを一覧で確認できること, so that タスクの全体像を素早く把握できる

#### Acceptance Criteria
1. When ユーザーが `/tasks` ページにアクセスした時, the タスク一覧ページ shall タスクをリスト形式で表示する
2. The タスク一覧ページ shall リストビューとカンバンビュー（ステータス別の列表示）の切り替え機能を提供する
3. While カンバンビューが選択されている場合, the タスク一覧ページ shall タスクをステータス列（todo / in_progress / done / cancelled）ごとにカード形式で表示する
4. The タスク一覧ページ shall 各タスクのタイトル、ステータス、優先度、プロジェクト名、期限を表示する
5. The タスク一覧ページ shall 新規タスク作成ページへの導線を提供する
6. The タスク一覧ページ shall 各タスクの詳細ページへの導線を提供する

### Requirement 8: タスクフィルタ・ソート機能
**Objective:** As a ユーザー, I want タスクをステータスや優先度でフィルタ・ソートできること, so that 目的のタスクを素早く見つけられる

#### Acceptance Criteria
1. When ユーザーがステータスフィルタを選択した時, the タスク一覧ページ shall 選択されたステータス（todo / in_progress / done / cancelled / 全て）のタスクのみを表示する
2. When ユーザーが優先度フィルタを選択した時, the タスク一覧ページ shall 選択された優先度（low / medium / high / urgent / 全て）のタスクのみを表示する
3. When ユーザーがプロジェクトフィルタを選択した時, the タスク一覧ページ shall 選択されたプロジェクトに属するタスクのみを表示する
4. When ユーザーがプロジェクト別グルーピングを選択した時, the タスク一覧ページ shall タスクをプロジェクトごとにグループ分けして表示する
5. When ユーザーがソート項目を選択した時, the タスク一覧ページ shall 指定されたカラム（優先度、期限、作成日）でソートして表示する
6. When フィルタの結果が0件の時, the タスク一覧ページ shall 該当するタスクがない旨のメッセージを表示する

### Requirement 9: 期限管理
**Objective:** As a ユーザー, I want タスクの期限を視覚的に把握できること, so that 期限切れのタスクを見逃さない

#### Acceptance Criteria
1. The タスク一覧ページ shall 各タスクの期限を表示する
2. While タスクの期限が過ぎている場合, the タスク一覧ページ shall 該当タスクの期限を視覚的にハイライト表示する
3. The タスク一覧ページ shall 期限でのソートをサポートする

### Requirement 10: タスク新規作成
**Objective:** As a ユーザー, I want 新しいタスクを登録できること, so that 作業項目を管理下に置ける

#### Acceptance Criteria
1. When ユーザーが `/tasks/new` ページにアクセスした時, the タスク作成ページ shall タスク情報の入力フォームを表示する
2. The タスク作成フォーム shall タイトル（必須）、説明、プロジェクト（セレクト）、ステータス、優先度、期限の入力フィールドを提供する
3. When ユーザーが有効なデータでフォームを送信した時, the システム shall 新しいタスクレコードを作成し、タスク一覧ページにリダイレクトする
4. If バリデーションエラーが発生した場合, the タスク作成フォーム shall エラーメッセージを該当フィールドに表示する
5. While フォーム送信処理中, the 送信ボタン shall 無効化されローディング状態を表示する

### Requirement 11: タスク詳細・編集
**Objective:** As a ユーザー, I want タスクの詳細確認と情報更新ができること, so that タスクの状態を最新に保てる

#### Acceptance Criteria
1. When ユーザーが `/tasks/[id]` ページにアクセスした時, the タスク詳細ページ shall 該当タスクの全情報を表示する
2. The タスク詳細ページ shall タスク情報の編集機能を提供する
3. When ユーザーが有効なデータでフォームを送信した時, the システム shall タスクレコードを更新し、更新後の詳細を表示する
4. The タスク詳細ページ shall タスク一覧ページへの戻る導線を提供する
5. If 指定されたIDのタスクが存在しない場合, the システム shall 404ページを表示する
6. The タスク詳細ページ shall タスクの削除機能を提供する
7. When ユーザーが削除操作を実行する前に, the システム shall 確認ダイアログを表示する

### Requirement 12: ビルド検証
**Objective:** As a 開発者, I want 実装が正しくビルドできること, so that デプロイ可能な状態が保証される

#### Acceptance Criteria
1. The 実装 shall `pnpm build` が成功すること
