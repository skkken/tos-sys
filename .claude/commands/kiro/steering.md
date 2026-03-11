---
description: Manage .kiro/steering/ as persistent project knowledge
allowed-tools: Bash, Read, Write, Edit, MultiEdit, Glob, Grep, LS, mcp__serena__write_memory, mcp__serena__edit_memory, mcp__serena__list_memories, mcp__serena__read_memory
---

# Kiro Steering Management

<background_information>
**Role**: Maintain `.kiro/steering/` as persistent project memory.

**Mission**:
- Bootstrap: Generate core steering from codebase (first-time)
- Sync: Keep steering and codebase aligned (maintenance)
- Preserve: User customizations are sacred, updates are additive

**Success Criteria**:
- Steering captures patterns and principles, not exhaustive lists
- Code drift detected and reported
- All `.kiro/steering/*.md` treated equally (core + custom)
</background_information>

<instructions>
## Scenario Detection

Check `.kiro/steering/` status:

**Bootstrap Mode**: Empty OR missing core files (product.md, tech.md, structure.md)  
**Sync Mode**: All core files exist

---

## Bootstrap Flow

1. Load templates from `.kiro/settings/templates/steering/`
2. Analyze codebase (JIT):
   - `glob_file_search` for source files
   - `read_file` for README, package.json, etc.
   - `grep` for patterns
3. Extract patterns (not lists):
   - Product: Purpose, value, core capabilities
   - Tech: Frameworks, decisions, conventions
   - Structure: Organization, naming, imports
4. Generate steering files (follow templates)
5. Load principles from `.kiro/settings/rules/steering-principles.md`
6. Present summary for review

**Focus**: Patterns that guide decisions, not catalogs of files/dependencies.

---

## Sync Flow

1. Load all existing steering (`.kiro/steering/*.md`)
2. Analyze codebase for changes (JIT)
3. Detect drift:
   - **Steering → Code**: Missing elements → Warning
   - **Code → Steering**: New patterns → Update candidate
   - **Custom files**: Check relevance
4. Propose updates (additive, preserve user content)
5. Report: Updates, warnings, recommendations

**Update Philosophy**: Add, don't replace. Preserve user sections.

---

## Serena Memory Sync

After steering files are created or updated, sync the corresponding Serena memory files using `mcp__serena__write_memory` / `mcp__serena__edit_memory`.

### Mapping (Steering → Serena Memory)
| Steering file | Serena memory | Content focus |
|---|---|---|
| `product.md` | `project_overview` | Purpose, tech stack, structure summary |
| `tech.md` | `suggested_commands` + `style_and_conventions` | Commands, standards, conventions |
| `structure.md` | `style_and_conventions` (append) | Naming, imports, organization patterns |
| (all) | `task_completion_checklist` | Lint/build/test commands from tech.md |

### Sync Rules
1. Read existing Serena memories first (`mcp__serena__list_memories` → `mcp__serena__read_memory`) to preserve user additions
2. Update only sections that correspond to changed steering content
3. Use `mcp__serena__edit_memory` for partial updates, `mcp__serena__write_memory` for full rewrites
4. Preserve any Serena memory content that doesn't originate from steering (user-added notes, etc.)

### Bootstrap: Create all 4 Serena memories from steering content
### Sync: Update only the memories affected by steering changes

---

## Granularity Principle

From `.kiro/settings/rules/steering-principles.md`:

> "If new code follows existing patterns, steering shouldn't need updating."

Document patterns and principles, not exhaustive lists.

**Bad**: List every file in directory tree  
**Good**: Describe organization pattern with examples

</instructions>

## Tool guidance

- `glob_file_search`: Find source/config files
- `read_file`: Read steering, docs, configs
- `grep`: Search patterns
- `list_dir`: Analyze structure

**JIT Strategy**: Fetch when needed, not upfront.

## Output description

Chat summary only (files updated directly).

### Bootstrap:
```
✅ Steering Created

## Generated:
- product.md: [Brief description]
- tech.md: [Key stack]
- structure.md: [Organization]

## Serena Memory Synced:
- project_overview, suggested_commands, style_and_conventions, task_completion_checklist

Review and approve as Source of Truth.
```

### Sync:
```
✅ Steering Updated

## Changes:
- tech.md: React 18 → 19
- structure.md: Added API pattern

## Serena Memory Synced:
- [Updated memory names]

## Code Drift:
- Components not following import conventions

## Recommendations:
- Consider api-standards.md
```

## Examples

### Bootstrap
**Input**: Empty steering, React TypeScript project  
**Output**: 3 files with patterns - "Feature-first", "TypeScript strict", "React 19"

### Sync
**Input**: Existing steering, new `/api` directory  
**Output**: Updated structure.md, flagged non-compliant files, suggested api-standards.md

## Safety & Fallback

- **Security**: Never include keys, passwords, secrets (see principles)
- **Uncertainty**: Report both states, ask user
- **Preservation**: Add rather than replace when in doubt

## Notes

- All `.kiro/steering/*.md` loaded as project memory
- Templates and principles are external for customization
- Focus on patterns, not catalogs
- "Golden Rule": New code following patterns shouldn't require steering updates
- Avoid documenting agent-specific tooling directories (e.g. `.cursor/`, `.gemini/`, `.claude/`)
- `.kiro/settings/` content should NOT be documented in steering files (settings are metadata, not project knowledge)
- Light references to `.kiro/specs/` and `.kiro/steering/` are acceptable; avoid other `.kiro/` directories
