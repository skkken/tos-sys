# Project Structure

## Organization Philosophy

Next.js App Routerの規約に従ったファイルベースルーティング。現時点ではシンプルな単一ページ構成。

## Directory Patterns

### App Directory
**Location**: `app/`
**Purpose**: ルーティング、レイアウト、ページコンポーネント
**Convention**: `page.tsx`（ページ）、`layout.tsx`（レイアウト）、`globals.css`（グローバルスタイル）

### Public Assets
**Location**: `public/`
**Purpose**: 静的ファイル（SVG、画像など）

### Spec-Driven Development
**Location**: `.kiro/specs/`（仕様）、`.kiro/steering/`（プロジェクトナレッジ）
**Purpose**: AI-DLCワークフローの仕様・ナレッジ管理

## Naming Conventions

- **Files**: kebab-case（Next.js規約に従う）
- **Components**: PascalCase（React標準）
- **Functions**: camelCase

## Import Organization

```typescript
// External packages
import type { Metadata } from "next";
import Image from "next/image";

// Internal (absolute with alias)
import { Something } from "@/path";

// Relative (same directory)
import "./globals.css";
```

**Path Aliases**:
- `@/*`: プロジェクトルート（`./`にマッピング）

## Code Organization Principles

- サーバーコンポーネントがデフォルト。`"use client"` は必要な場合のみ
- レイアウトとページの責務分離（layout.tsx = 共通構造、page.tsx = ページ固有コンテンツ）

---
_Document patterns, not file trees. New files following patterns shouldn't require updates_
