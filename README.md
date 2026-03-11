# Claude Code Template

Next.js + AI-DLC（Kiro-style Spec Driven Development）のプロジェクトテンプレート。

## Tech Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript** (strict mode)
- **Tailwind CSS v4**
- **pnpm**

## Getting Started

### 1. 前提ツールの確認

以下のツールがインストールされていることを確認してください:

```bash
# 必須
node --version    # Node.js
pnpm --version    # pnpm
claude --version  # Claude Code

# 推奨（GitHub Issue ベース開発に必要）
gh --version      # GitHub CLI
gh auth status    # ログイン済みか確認
```

未インストールの場合:
- **GitHub CLI**: `brew install gh` → `gh auth login`

### 2. リポジトリのクローン

```bash
git clone git@github.com:skkken/claudecode_template.git your-project
cd your-project
```

### 3. 依存関係のインストール

```bash
pnpm install
```

### 4. Serena MCP サーバーの有効化

```bash
claude mcp add serena -s project -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project $(pwd)
```

### 5. Claude Code で初回セットアップ

Claude Code を起動し、以下を実行:

```
Serenaのオンボーディングを実施して
```

これにより Serena がプロジェクト構造を解析し、メモリファイルを生成します。

続けて Steering（プロジェクトナレッジ）を初期化:

```
/kiro:steering
```

### 6. 開発サーバーの起動

```bash
pnpm dev
```

http://localhost:3000 で確認できます。

## AI-DLC Workflow

Kiro-style Spec Driven Development により、仕様策定から実装までをAIと協働で進めます。

### Phase 0: Steering（プロジェクトナレッジ）

```
/kiro:steering
```

### Phase 1: Specification（仕様策定）

```
/kiro:spec-init "機能の説明"
/kiro:spec-requirements {feature}
/kiro:spec-design {feature}
/kiro:spec-tasks {feature}
```

### Phase 2: Implementation（実装）

```
/kiro:spec-impl {feature}
```

### GitHub Issue ベースの開発

```
/dev-orchestrator {issue-url}
```

詳細は [CLAUDE.md](./CLAUDE.md) を参照してください。

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | 開発サーバー起動 |
| `pnpm build` | プロダクションビルド |
| `pnpm start` | プロダクションサーバー起動 |
| `pnpm lint` | ESLint 実行 |

## Project Structure

```
app/                  # Next.js App Router (pages, layouts)
public/               # Static assets
.claude/              # Claude Code settings & skills
.kiro/steering/       # Project knowledge (product, tech, structure)
.kiro/specs/          # Feature specifications
.kiro/settings/       # Templates & rules for kiro workflow
```
