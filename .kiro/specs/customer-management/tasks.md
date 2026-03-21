# Implementation Plan

- [x] 1. データベーススキーマとバリデーション基盤の構築
- [x] 1.1 customersテーブルのマイグレーションを作成し、RLSポリシーとインデックスを設定する
  - customersテーブルを全カラム（id, name, name_kana, company_name, email, phone, postal_code, address, contact_person, notes, status, created_at, updated_at, user_id）で作成する
  - statusカラムにCHECK制約（'active' / 'inactive'）を設定する
  - user_idカラムにauth.usersへの外部キー制約を設定する
  - user_id、status、nameにインデックスを作成する
  - RLSを有効にし、SELECT / INSERT / UPDATE / DELETEそれぞれにuser_idベースのポリシーを設定する
  - updated_at自動更新トリガーを作成する
  - Supabase CLIでマイグレーションを実行し、テーブルが正しく作成されることを確認する
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 1.2 顧客データのZodバリデーションスキーマと型定義を作成する
  - 顧客の作成・更新で共通のバリデーションスキーマを定義する
  - nameを必須フィールドとして検証する
  - emailはオプションだが入力時はメールアドレス形式を検証する
  - statusを'active'または'inactive'に制限する
  - Customer型インターフェースを定義する
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 2. Server ActionsによるCRUDロジックの実装
- [x] 2.1 顧客一覧取得のServer Actionを実装し、検索・フィルタ・ソートに対応する
  - createAuthServerClientを使用してユーザーセッション付きでSupabaseにアクセスする
  - 検索キーワードによる名前・会社名の部分一致検索（ilike）を実装する
  - ステータスフィルタ（active / inactive / all）を実装する
  - ソート機能（名前、会社名、作成日 × 昇順・降順）を実装する
  - デフォルトではアクティブな顧客のみを返す
  - _Requirements: 9.1, 9.3, 4.1, 4.2, 4.3, 8.3_

- [x] 2.2 (P) 顧客作成のServer Actionを実装する
  - Zodバリデーションを実行し、エラー時はフィールド別のエラー情報をActionState形式で返す
  - バリデーション成功時にcustomersテーブルにレコードを挿入する
  - user_idはRLSにより自動的に制約される
  - 成功時にrevalidatePathで一覧ページのキャッシュを無効化する
  - _Requirements: 9.1, 9.2, 9.4_

- [x] 2.3 (P) 顧客更新のServer Actionを実装する
  - idをbindでバインドするパターンでuseActionStateと互換にする
  - Zodバリデーションを実行し、エラー時はActionState形式で返す
  - updated_atはDBトリガーで自動更新される
  - 成功時にrevalidatePathで関連ページのキャッシュを無効化する
  - _Requirements: 9.1, 9.2, 9.4, 7.4_

- [x] 2.4 (P) 顧客削除（論理削除）のServer Actionを実装する
  - statusを'inactive'に変更する（物理削除は行わない）
  - 成功時にrevalidatePathで一覧ページのキャッシュを無効化する
  - _Requirements: 9.1, 8.1_

- [x] 2.5 (P) 顧客単一取得の関数を実装する
  - 指定されたIDの顧客データを取得する
  - 該当データが存在しない場合はnullを返す
  - _Requirements: 6.1, 6.5_

- [x] 3. shadcn/uiコンポーネントの追加インストール
- [x] 3.1 (P) 顧客管理に必要なshadcn/uiコンポーネントをインストールする
  - table、dialog、badge、card、textareaをインストールする
  - インストール後にビルドが通ることを確認する
  - _Requirements: 9.5_

- [x] 4. 顧客一覧ページの構築
- [x] 4.1 顧客一覧のテーブルコンポーネントを作成する
  - 各顧客の名前、会社名、メールアドレス、電話番号、ステータスをテーブル形式で表示する
  - ステータスをBadgeコンポーネントで視覚的に表示する
  - 各行に詳細ページへのリンクを設定する
  - データが0件の場合は「該当する顧客がありません」のメッセージを表示する
  - _Requirements: 3.2, 3.4, 4.4_

- [x] 4.2 (P) 検索・フィルタ・ソートのUIコンポーネントを作成する
  - テキスト入力による検索バーを実装する
  - ステータスフィルタ（全て / アクティブ / 非アクティブ）のSelectコンポーネントを実装する
  - ソート項目（名前 / 会社名 / 作成日）と順序（昇順 / 降順）の選択UIを実装する
  - URL searchParamsを更新してServer Componentの再レンダリングをトリガーする
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 4.3 顧客一覧ページを組み立て、検索・テーブル・新規作成ボタンを統合する
  - Server Componentとしてsearchパラメータを受け取り、getCustomersでデータを取得する
  - 検索バー、フィルタ、テーブルコンポーネントを配置する
  - 新規作成ページ（/customers/new）へのリンクボタンを配置する
  - 既存のプレースホルダーページを置き換える
  - _Requirements: 3.1, 3.3_

- [ ] 5. 顧客フォーム（作成・編集兼用）の構築
- [ ] 5.1 顧客情報入力フォームコンポーネントを作成する
  - 名前（必須）、名前カナ、会社名、メールアドレス、電話番号、郵便番号、住所、担当者名、備考の入力フィールドを配置する
  - useActionStateでServer Actionの実行と状態管理を行う
  - バリデーションエラー時はフィールド単位でエラーメッセージを表示する
  - 送信中はボタンを無効化しローディング状態を表示する
  - 編集時は既存データをプリフィルする（customerプロップが渡された場合）
  - _Requirements: 5.2, 5.3, 5.4, 5.5, 7.1, 7.2, 7.3_

- [ ] 5.2 新規作成ページを作成し、フォームコンポーネントをcreateCustomerアクションと接続する
  - /customers/new にページを配置する
  - フォームコンポーネントにcreateCustomer Server Actionを渡す
  - _Requirements: 5.1_

- [ ] 5.3 編集ページを作成し、既存データをプリフィルしたフォームをupdateCustomerアクションと接続する
  - /customers/[id]/edit にページを配置する
  - Server ComponentでgetCustomerを呼び出し、データをフォームに渡す
  - updateCustomer.bind(null, id) でアクションをバインドして渡す
  - 該当顧客が存在しない場合は404を表示する
  - _Requirements: 7.1_

- [x] 6. 顧客詳細ページと削除機能の構築
- [x] 6.1 顧客詳細表示コンポーネントを作成する
  - 全フィールド（名前、名前カナ、会社名、メールアドレス、電話番号、郵便番号、住所、担当者名、備考、ステータス、作成日、更新日）をCardレイアウトで表示する
  - 編集ページへのリンクボタンを配置する
  - 一覧ページへの戻るリンクを配置する
  - 関連データ（請求書・見積もり・契約等）の表示エリアをプレースホルダーとして配置する
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 6.2 (P) 削除確認ダイアログコンポーネントを作成する
  - Dialogコンポーネントで確認メッセージと顧客名を表示する
  - 確認ボタン押下でdeleteCustomer Server Actionを実行する
  - 削除後に一覧ページにリダイレクトする
  - _Requirements: 8.1, 8.2_

- [x] 6.3 顧客詳細ページを組み立て、詳細表示と削除ダイアログを統合する
  - /customers/[id] にServer Componentとしてページを配置する
  - getCustomerでデータを取得し、詳細コンポーネントと削除ダイアログに渡す
  - 該当顧客が存在しない場合は404を表示する
  - _Requirements: 6.5_

- [ ] 7. 統合確認とビルド検証
- [ ] 7.1 全ページの動作確認と`pnpm build`の成功を検証する
  - 一覧ページの検索・フィルタ・ソートが正しく動作することを確認する
  - 新規作成→一覧→詳細→編集→詳細の画面遷移フローを確認する
  - 論理削除の動作と一覧からの除外を確認する
  - バリデーションエラーの表示を確認する
  - `pnpm build` が成功することを確認する
  - _Requirements: 9.5_
