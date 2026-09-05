import os
import glob
import sys
import re

if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from playwright.sync_api import sync_playwright

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
DEMO_PAPERS_DIR = os.path.join(ROOT_DIR, "demo_papers")

def main():
    svg_files = glob.glob(os.path.join(DEMO_PAPERS_DIR, "*.svg"))
    print(f"Found {len(svg_files)} SVGs in {DEMO_PAPERS_DIR}.")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 800, "height": 1150})

        for svg_path in svg_files:
            file_stem = os.path.splitext(os.path.basename(svg_path))[0]
            jpg_dst = os.path.join(DEMO_PAPERS_DIR, f"{file_stem}.jpg")

            with open(svg_path, "r", encoding="utf-8") as f:
                svg_content = f.read()

            # Remove external web fonts to prevent network timeouts
            svg_content_clean = re.sub(r'<link[^>]*>', '', svg_content)
            svg_content_clean = re.sub(r'@import url\([^)]+\);', '', svg_content_clean)

            html_wrapper = f"""<!DOCTYPE html>
            <html>
            <head>
            <meta charset="utf-8">
            <style>
            * {{ font-family: 'Mukta', 'Segoe UI', 'Arial Unicode MS', sans-serif !important; }}
            body {{ margin: 0; padding: 0; background: #ffffff; display: flex; justify-content: center; }}
            svg {{ width: 800px; height: 1150px; display: block; }}
            </style>
            </head>
            <body>{svg_content_clean}</body>
            </html>
            """
            page.set_content(html_wrapper, wait_until="commit")
            page.wait_for_timeout(20)

            # Screenshot to JPG
            page.screenshot(path=jpg_dst, type="jpeg", quality=95, timeout=5000)
            print(f"[OK] Generated: {os.path.basename(jpg_dst)}")

        browser.close()

    print("[SUCCESS] All 30 demo papers generated as high-resolution JPG files in demo_papers/!")

if __name__ == "__main__":
    main()
