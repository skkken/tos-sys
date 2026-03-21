# Requirements Document

## Introduction
本仕様は、tos-sys（個人利用の会社管理システム）における共通レイアウトとナビゲーション機能を定義する。認証付きレイアウト、9項目のサイドバーナビゲーション、ログインページを構築し、全ページの基盤となるUI構造を提供する。shadcn/ui の Sidebar コンポーネントを使用し、レスポンシブ対応を含む。

## Requirements

### Requirement 1: 認証フロー
**Objective:** As a ユーザー, I want メールアドレスとパスワードでログインしたい, so that 自分だけがシステムにアクセスできる

#### Acceptance Criteria
1. When ユーザーが正しいメールアドレスとパスワードを入力してログインボタンを押した時, the ログインページ shall Supabase Authで認証を行い、成功時にダッシュボードページへリダイレクトする
2. If 認証情報が不正な場合, the ログインページ shall エラーメッセージを表示し、ユーザーが再入力できる状態を維持する
3. When 認証済みユーザーがログインページにアクセスした時, the ログインページ shall ダッシュボードページへリダイレクトする

### Requirement 2: 認証ガード
**Objective:** As a システム管理者, I want 未認証ユーザーのアクセスを制限したい, so that セキュリティが保たれる

#### Acceptance Criteria
1. When 未認証ユーザーが `(app)` 配下のページにアクセスした時, the 認証ミドルウェア shall `/login` ページへリダイレクトする
2. While ユーザーが認証済みの状態である間, the 認証レイアウト shall `(app)` 配下の全ページへのアクセスを許可する

### Requirement 3: サイドバーナビゲーション
**Objective:** As a ユーザー, I want サイドバーから各機能ページに素早くアクセスしたい, so that 業務を効率的に行える

#### Acceptance Criteria
1. The サイドバー shall 以下の9項目をナビゲーションリンクとして表示する: ダッシュボード、タスク、請求書、見積もり、収支、経費、キャッシュフロー、顧客、契約
2. When ユーザーがナビゲーション項目をクリックした時, the サイドバー shall 対応するページへ遷移する
3. While ユーザーが特定のページを表示している間, the サイドバー shall 現在のページに対応するナビゲーション項目をアクティブ状態でハイライト表示する

### Requirement 4: レスポンシブ対応
**Objective:** As a ユーザー, I want モバイルデバイスでも快適に操作したい, so that 場所を選ばず業務管理ができる

#### Acceptance Criteria
1. While デスクトップ画面幅で表示されている間, the レイアウト shall サイドバーを常時表示する
2. While モバイル画面幅で表示されている間, the レイアウト shall サイドバーを非表示にし、ハンバーガーメニューボタンを表示する
3. When モバイル画面幅でハンバーガーメニューボタンが押された時, the レイアウト shall サイドバーをオーバーレイとして表示する

### Requirement 5: 認証付きレイアウト
**Objective:** As a ユーザー, I want 全ページで統一されたレイアウトを使いたい, so that 一貫した操作体験が得られる

#### Acceptance Criteria
1. The `(app)` レイアウト shall shadcn/ui の Sidebar コンポーネントを使用してサイドバーとメインコンテンツ領域を構成する
2. The `(app)` レイアウト shall 全子ページに対してサイドバー付きの共通レイアウトを適用する

### Requirement 6: ルート構成とプレースホルダーページ
**Objective:** As a 開発者, I want 各機能のプレースホルダーページを用意したい, so that ルーティング構造が確立され、今後の機能実装の基盤となる

#### Acceptance Criteria
1. The アプリケーション shall 以下のルートに対応するページを持つ: `/dashboard`, `/tasks`, `/invoices`, `/estimates`, `/finances`, `/expenses`, `/cashflow`, `/customers`, `/contracts`
2. When ユーザーがルートパス `/` にアクセスした時, the アプリケーション shall `/dashboard` へリダイレクトする
3. The 各プレースホルダーページ shall ページ名を表示する最小限のコンテンツを持つ

### Requirement 7: ログインページUI
**Objective:** As a ユーザー, I want シンプルで分かりやすいログイン画面を使いたい, so that スムーズにシステムにアクセスできる

#### Acceptance Criteria
1. The ログインページ shall メールアドレス入力フィールドとパスワード入力フィールドとログインボタンを表示する
2. The ログインページ shall `(auth)` ルートグループに配置され、サイドバーレイアウトを適用しない
3. While ログイン処理中の間, the ログインページ shall ローディング状態を表示し、ログインボタンの二重押下を防止する
