---
name: playwright
description: Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs. Use when the user asks to test, debug, screenshot, or interact with a web application.
allowed-tools: Bash, Read, Write, Glob, Grep, Edit
argument-hint: <url-or-task-description>
---

# Web Application Testing with Playwright

To test local web applications, write native Python Playwright scripts.

**Helper Scripts Available**:
- `${CLAUDE_SKILL_DIR}/scripts/with_server.py` - Manages server lifecycle (supports multiple servers)

**Always run scripts with `--help` first** to see usage. DO NOT read the source until you try running the script first and find that a customized solution is absolutely necessary.

## Decision Tree: Choosing Your Approach

```
User task -> Is it static HTML?
    +- Yes -> Read HTML file directly to identify selectors
    |         +- Success -> Write Playwright script using selectors
    |         +- Fails/Incomplete -> Treat as dynamic (below)
    |
    +- No (dynamic webapp) -> Is the server already running?
        +- No -> Run: python ${CLAUDE_SKILL_DIR}/scripts/with_server.py --help
        |        Then use the helper + write simplified Playwright script
        |
        +- Yes -> Reconnaissance-then-action:
            1. Navigate and wait for networkidle
            2. Take screenshot or inspect DOM
            3. Identify selectors from rendered state
            4. Execute actions with discovered selectors
```

## Example: Using with_server.py

**Single server:**
```bash
python ${CLAUDE_SKILL_DIR}/scripts/with_server.py --server "npm run dev" --port 5173 -- python /tmp/automation.py
```

**Multiple servers (e.g., backend + frontend):**
```bash
python ${CLAUDE_SKILL_DIR}/scripts/with_server.py \
  --server "cd backend && python server.py" --port 3000 \
  --server "cd frontend && npm run dev" --port 5173 \
  -- python /tmp/automation.py
```

## Writing Playwright Scripts

Write scripts to `/tmp/` and include only Playwright logic (servers are managed by with_server.py):

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)  # Always headless
    page = browser.new_page()
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')  # CRITICAL: Wait for JS
    # ... your automation logic
    browser.close()
```

## Reconnaissance-Then-Action Pattern

1. **Inspect rendered DOM**:
   ```python
   page.screenshot(path='/tmp/inspect.png', full_page=True)
   content = page.content()
   page.locator('button').all()
   ```

2. **Identify selectors** from inspection results

3. **Execute actions** using discovered selectors

## Common Pitfall

- **Don't** inspect the DOM before waiting for `networkidle` on dynamic apps
- **Do** wait for `page.wait_for_load_state('networkidle')` before inspection

## Best Practices

- Use `sync_playwright()` for synchronous scripts
- Always close the browser when done
- Use descriptive selectors: `text=`, `role=`, CSS selectors, or IDs
- Add appropriate waits: `page.wait_for_selector()` or `page.wait_for_timeout()`
- Save screenshots to `/tmp/` for inspection
- Always launch chromium in `headless=True` mode

## Setup

If Playwright is not installed, run:
```bash
pip install playwright && playwright install chromium
```

For detailed examples, see [examples.md](examples.md).
