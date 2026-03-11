---
name: dev-orchestrator
description: "GitHub Issueをもとにkiro:*スキルで要件定義・設計・タスク分解を行い、Agent Teamsで最大3名エンジニア+1名レビュワーの並列開発を実行するスキル。issueのURLまたは番号を引数に取る。"
disable-model-invocation: false
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent, Skill, TeamCreate, TeamDelete, SendMessage, TaskCreate, TaskGet, TaskList, TaskUpdate
argument-hint: <issue-number-or-url>
---

# Dev Orchestrator: Issue-Driven Spec Development with Agent Teams

GitHub Issueをもとに、kiro:*スキルによるSpec-Driven Developmentと Agent Teamsによる並列実装を組み合わせたフルサイクル開発を実行する。

## 前提条件

- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` が設定済みであること
- kiro:* スキルが利用可能であること

## ツール使い分けルール（必須）

| フェーズ | 使用すべきツール | Agentツール |
|----------|----------------|-------------|
| Step 0: Issue取得・分析 | Bash, Read等 | **使用可** |
| Step 1.1-1.2, 1.4-1.7: Spec作成（リード単独作業） | Skill, Agent等 | **使用可** |
| Step 1.3: 要件レビュー（2名体制） | **TeamCreate + SendMessage** | **使用禁止** |
| Step 1.8: タスクレビュー（2名体制） | **TeamCreate + SendMessage** | **使用禁止** |
| Step 2: 実装Phase（並列実装） | **TeamCreate + SendMessage** | **使用禁止** |
| Step 3-4: 検証・完了報告 | Skill, Bash等 | **使用可** |

**重要**: レビューステップ（1.3, 1.8）と実装Phase（Step 2）では、必ず `TeamCreate` でチームを作成し、`Agent` ツール（`team_name`パラメータなし）でメンバーをspawnし、`SendMessage` でコミュニケーションすること。Agentツールを単独で（team_nameなしで）使ってローカルサブエージェントとして実行することは禁止する。

## 実行フロー

### Step 0: Issue取得と分析

1. 引数 `$ARGUMENTS` からissue番号またはURLを取得
2. `gh issue view` でissueの内容を取得
3. issueのタイトル・本文・ラベル・コメントを分析し、機能の概要を把握

```bash
gh issue view $ARGUMENTS --json title,body,labels,comments
```

### Step 1: Specification Phase（リード担当 - 順次実行）

**この工程はリード（あなた自身）が順次実行する。ユーザーの確認は要件定義のみで取る。**

#### 1.1 Spec初期化

issueの内容をもとに spec を初期化する:

```
/kiro:spec-init "<issueタイトル>: <issueの要約>"
```

#### 1.2 要件定義

```
/kiro:spec-requirements <feature-name>
```

#### 1.3 要件レビュー（2名体制 - TeamCreate必須）

> **⚠️ このステップではAgentツール（team_nameなし）の使用を禁止する。必ずTeamCreate + Agentツール（team_name付き）+ SendMessageを使うこと。**

ユーザーに確認を依頼する**前に**、以下の2名体制でレビューを実施し、問題があれば修正する:

| レビュワー | 観点 |
|-----------|------|
| **品質チェッカー** | 要件の網羅性・明確性・矛盾がないか。issueの内容をすべてカバーしているか |
| **技術チェッカー** | 技術的実現可能性・CLAUDE.mdの規約との整合性・既存アーキテクチャとの適合性 |

**具体的な実行手順:**

**Step A: チーム作成**
```
TeamCreate(team_name="req-review", description="要件レビュー: {feature-name}")
```

**Step B: タスク作成**
```
TaskCreate(title="品質チェック: 要件の網羅性・明確性・矛盾チェック", team_name="req-review")
TaskCreate(title="技術チェック: 実現可能性・規約整合性チェック", team_name="req-review")
```

**Step C: メンバーをspawn（Agentツールにteam_nameを指定）**
```
Agent(
  name="quality-checker",
  team_name="req-review",
  subagent_type="general-purpose",
  prompt="あなたは要件の品質チェッカーです。.kiro/specs/{feature-name}/requirements.md を読み、以下の観点でレビューしてください:
  1. 要件の網羅性・明確性・矛盾がないか
  2. issueの内容をすべてカバーしているか
  レビュー結果をリードにSendMessageで報告してください。"
)

Agent(
  name="tech-checker",
  team_name="req-review",
  subagent_type="general-purpose",
  prompt="あなたは技術チェッカーです。.kiro/specs/{feature-name}/requirements.md とCLAUDE.md を読み、以下の観点でレビューしてください:
  1. 技術的実現可能性
  2. CLAUDE.mdの規約との整合性
  3. 既存アーキテクチャとの適合性
  レビュー結果をリードにSendMessageで報告してください。"
)
```

**Step D: フィードバック収集と修正**
1. 両者からのSendMessageを受信（自動配信される）
2. 指摘事項があれば requirements.md を修正
3. 修正完了後、チームをshutdownしてクリーンアップ
4. ユーザーに要件を確認してもらう
5. 必要に応じてさらに修正

#### 1.4 ギャップ分析（推奨）

既存コードベースとの差分を分析:

```
/kiro:validate-gap <feature-name>
```

#### 1.5 設計

```
/kiro:spec-design <feature-name>
```

#### 1.6 設計レビュー（必須）

設計完了後、必ずレビューを実施する:

```
/kiro:validate-design <feature-name>
```

- 指摘事項があれば design.md を修正し、再度レビューを通す
- ユーザー確認は不要（自動で次のステップに進む）

#### 1.7 タスク分解

```
/kiro:spec-tasks <feature-name>
```

#### 1.8 タスクレビュー（2名体制 - TeamCreate必須）

> **⚠️ このステップではAgentツール（team_nameなし）の使用を禁止する。必ずTeamCreate + Agentツール（team_name付き）+ SendMessageを使うこと。**

タスク生成後、設計との整合性を2名体制でチェックする:

| レビュワー | 観点 |
|-----------|------|
| **設計整合チェッカー** | タスクが design.md の設計方針・アーキテクチャに沿っているか。設計で定義されたコンポーネント・インターフェースがタスクに反映されているか |
| **タスク品質チェッカー** | タスクの粒度・依存関係・並列実行可能性が適切か。抜け漏れがないか |

**具体的な実行手順:**

**Step A: チーム作成**
```
TeamCreate(team_name="task-review", description="タスクレビュー: {feature-name}")
```

**Step B: タスク作成**
```
TaskCreate(title="設計整合チェック: design.mdとの整合性検証", team_name="task-review")
TaskCreate(title="タスク品質チェック: 粒度・依存関係・網羅性検証", team_name="task-review")
```

**Step C: メンバーをspawn（Agentツールにteam_nameを指定）**
```
Agent(
  name="design-checker",
  team_name="task-review",
  subagent_type="general-purpose",
  prompt="あなたは設計整合チェッカーです。.kiro/specs/{feature-name}/tasks.md と design.md を読み、以下の観点でレビューしてください:
  1. タスクが design.md の設計方針・アーキテクチャに沿っているか
  2. 設計で定義されたコンポーネント・インターフェースがタスクに反映されているか
  レビュー結果をリードにSendMessageで報告してください。"
)

Agent(
  name="task-quality-checker",
  team_name="task-review",
  subagent_type="general-purpose",
  prompt="あなたは品質チェッカーです。.kiro/specs/{feature-name}/tasks.md を読み、以下の観点でレビューしてください:
  1. タスクの粒度は適切か
  2. 依存関係は正しく定義されているか
  3. 並列実行可能なタスクグループが明確か
  4. 抜け漏れがないか
  レビュー結果をリードにSendMessageで報告してください。"
)
```

**Step D: フィードバック収集と修正**
1. 両者からのSendMessageを受信（自動配信される）
2. 指摘事項があれば tasks.md を修正
3. 修正完了後、チームをshutdownしてクリーンアップ
4. 並列実行可能なタスクグループを特定する
5. ユーザー確認は不要（自動で次のステップに進む）

### Step 2: チーム編成と実装 Phase（TeamCreate必須 - 並列実行）

> **⚠️ このステップではAgentツール（team_nameなし）の使用を禁止する。必ずTeamCreate + Agentツール（team_name付き）+ SendMessageを使うこと。タスク数が少なくても（1-3個でも）、実装Phaseでは必ずTeamCreateを使用する。**

**タスク分解が完了し、ユーザーの承認を得たら、Agent Teamsで並列実装を開始する。**

#### 2.1 タスク分析

`tasks.md` を読み込み、以下を分析:
- 各タスクの依存関係
- 並列実行可能なタスクグループ
- 各タスクの推定複雑度

#### 2.2 チーム構成

| タスク数 | エンジニア数 | レビュワー |
|----------|------------|-----------|
| 1-3 | 1 | 1 |
| 4-6 | 2 | 1 |
| 7+ | 3 | 1 |

#### 2.3 チーム作成（具体的なツールコール手順）

**Step A: チーム作成**
```
TeamCreate(team_name="impl-{feature-name}", description="{feature-name}の実装")
```

**Step B: タスク作成（tasks.mdの各タスクに対応）**
```
TaskCreate(title="タスク1: {タスク内容}", team_name="impl-{feature-name}")
TaskCreate(title="タスク2: {タスク内容}", team_name="impl-{feature-name}")
...
TaskCreate(title="最終レビュー", team_name="impl-{feature-name}")
```

**Step C: メンバーをspawn（Agentツールにteam_nameを必ず指定）**

エンジニアのspawn例:
```
Agent(
  name="engineer-1",
  team_name="impl-{feature-name}",
  subagent_type="general-purpose",
  prompt="あなたは「{feature-name}」機能の実装エンジニアです。

## 担当タスク
{割り当てられたタスクの詳細}

## 参照ドキュメント
- 要件: .kiro/specs/{feature-name}/requirements.md
- 設計: .kiro/specs/{feature-name}/design.md
- タスク: .kiro/specs/{feature-name}/tasks.md
- プロジェクト規約: CLAUDE.md

## 実装方法
担当タスクの実装には `/kiro:spec-impl {feature-name} [タスク番号]` を使用すること。
これによりTDD方式で設計・タスクに沿った実装が行われる。

## 作業ルール
1. 担当タスクのみ実装すること（他のエンジニアの担当ファイルは編集しない）
2. 実装には必ず `/kiro:spec-impl` を使用すること
3. タスク完了後、reviewerにSendMessageでレビューを依頼すること
4. reviewerからフィードバックがあれば修正すること
5. 実装完了後、変更内容をコミットすること（タスクリスト更新前に必ずコミット）
6. コミット後、TaskUpdateでタスクを完了にすること
7. CLAUDE.mdの禁止事項を遵守すること（fs禁止、googleapis禁止等）"
)
```

レビュワーのspawn例:
```
Agent(
  name="reviewer",
  team_name="impl-{feature-name}",
  subagent_type="general-purpose",
  prompt="あなたは「{feature-name}」機能のコードレビュワーです。

## 参照ドキュメント
- 要件: .kiro/specs/{feature-name}/requirements.md
- 設計: .kiro/specs/{feature-name}/design.md
- タスク: .kiro/specs/{feature-name}/tasks.md
- プロジェクト規約: CLAUDE.md
- ステアリング: .kiro/steering/

## レビュー観点
1. 設計ドキュメントとの整合性
2. 要件の充足
3. CLAUDE.mdの規約遵守（特にCloudflare Workers互換性）
4. コードの品質・可読性
5. エンジニア間のコード整合性（インターフェース、型定義の一貫性）

## 作業ルール
1. エンジニアからSendMessageでレビュー依頼を受けたら、該当コードをレビュー
2. 問題があればエンジニアにSendMessageで具体的なフィードバックを送る
3. 問題なければエンジニアにSendMessageで承認を送る
4. 全タスク完了後、統合的な最終レビューを実施し、リードにSendMessageで報告"
)
```

**Step D: タスク割り当て**
```
TaskUpdate(task_id=1, owner="engineer-1")
TaskUpdate(task_id=2, owner="engineer-2")
...
```

#### 2.4 実装の進行管理

1. チーム作成後、各エンジニアが並列でタスクを実行
2. レビュワーは各エンジニアからのSendMessageによるレビュー依頼を処理
3. リード（あなた）は自動配信されるメッセージで進捗を監視し、必要に応じてSendMessageで介入
4. 全タスク完了後、SendMessage(type="shutdown_request")で各メンバーをシャットダウン
5. TeamDelete でチームをクリーンアップ

### Step 3: 検証 Phase（リード担当）

チーム作業完了後:

```
/kiro:validate-impl <feature-name>
```

### Step 4: 完了報告

1. タスクリスト（tasks.md）の最終状態をコミットする
2. 実装サマリーを作成
3. 変更ファイル一覧
4. 残課題があれば記載
5. issueにコメント（ユーザー承認後）

## タスク分割の指針

### 並列化の原則

- **ファイル単位で分割**: 同じファイルを複数エンジニアが編集しないようにする
- **レイヤー単位で分割**: バックエンド / フロントエンド / データベース
- **機能単位で分割**: 独立した機能ごとに分割
- **依存関係を考慮**: 共通型定義やユーティリティは先に1人が実装

### チーム規模の判断基準

| タスク数 | エンジニア数 | レビュワー |
|----------|------------|-----------|
| 1-3 | 1 | 1 |
| 4-6 | 2 | 1 |
| 7+ | 3 | 1 |

## 注意事項

- **レビューステップ（1.3, 1.8）と実装Phase（Step 2）では、タスク数に関わらず必ずTeamCreateを使用すること。Agentツール単独（team_nameなし）でのローカルサブエージェント実行は禁止**
- ユーザーの承認が必要なのは要件定義（Step 1.3）のみ。設計・タスクは自動レビューで品質を担保する
- Specification Phaseは必ず順次実行（並列化しない）。ただしレビューステップ内の2名チェックはTeamCreateで並列実行する
- Agentツールはteam_nameなしで使用可能なのは、Step 0（調査）とStep 1のリード単独作業（1.1, 1.2, 1.4-1.7）とStep 3-4のみ
- CLAUDE.md の禁止事項（fs, googleapis, child_process）を全メンバーに徹底
