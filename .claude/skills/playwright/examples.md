# Playwright Examples

## Element Discovery

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')

    buttons = page.locator('button').all()
    print(f"Found {len(buttons)} buttons:")
    for i, button in enumerate(buttons):
        text = button.inner_text() if button.is_visible() else "[hidden]"
        print(f"  [{i}] {text}")

    links = page.locator('a[href]').all()
    print(f"Found {len(links)} links:")
    for link in links[:5]:
        text = link.inner_text().strip()
        href = link.get_attribute('href')
        print(f"  - {text} -> {href}")

    inputs = page.locator('input, textarea, select').all()
    print(f"Found {len(inputs)} input fields:")
    for input_elem in inputs:
        name = input_elem.get_attribute('name') or input_elem.get_attribute('id') or "[unnamed]"
        input_type = input_elem.get_attribute('type') or 'text'
        print(f"  - {name} ({input_type})")

    page.screenshot(path='/tmp/page_discovery.png', full_page=True)
    browser.close()
```

## Console Log Capture

```python
from playwright.sync_api import sync_playwright

console_logs = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    def handle_console_message(msg):
        console_logs.append(f"[{msg.type}] {msg.text}")
        print(f"Console: [{msg.type}] {msg.text}")

    page.on("console", handle_console_message)
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')
    # ... interact with page ...
    browser.close()

print(f"Captured {len(console_logs)} console messages")
```

## Static HTML File

```python
from playwright.sync_api import sync_playwright
import os

html_file_path = os.path.abspath('path/to/your/file.html')
file_url = f'file://{html_file_path}'

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})
    page.goto(file_url)
    page.screenshot(path='/tmp/static_page.png', full_page=True)
    browser.close()
```

## Form Interaction

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})
    page.goto('http://localhost:3000')
    page.wait_for_load_state('networkidle')

    # Fill form fields
    page.fill('#name', 'John Doe')
    page.fill('#email', 'john@example.com')
    page.select_option('select#role', 'admin')
    page.check('#agree-terms')

    # Submit
    page.click('button[type="submit"]')
    page.wait_for_timeout(1000)

    # Verify result
    page.screenshot(path='/tmp/after_submit.png', full_page=True)
    browser.close()
```
