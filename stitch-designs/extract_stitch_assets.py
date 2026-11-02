import json
import base64
import os
import re
import urllib.request

DEST_DIR = r"c:\laragon\www\library\stitch-designs"
ASSETS_DIR = os.path.join(DEST_DIR, "assets")
os.makedirs(ASSETS_DIR, exist_ok=True)

STEPS_BASE = r"C:\Users\latitude 7420\.gemini\antigravity-ide\brain\290e2bf8-f5b7-4b4a-8de8-4bace137e6ef\.system_generated\steps"

screens_html = {
    "student-login.html": os.path.join(STEPS_BASE, "29", "output.txt"),
    "student-dashboard.html": os.path.join(STEPS_BASE, "33", "output.txt"),
    "explore-books-catalog.html": os.path.join(STEPS_BASE, "39", "output.txt"),
    "my-borrowings.html": os.path.join(STEPS_BASE, "45", "output.txt"),
}

screens_png = {
    "student-dashboard.png": os.path.join(STEPS_BASE, "59", "output.txt"),
    "my-borrowings.png": os.path.join(STEPS_BASE, "69", "output.txt"),
    "student-login.png": os.path.join(STEPS_BASE, "71", "output.txt"),
    "explore-books-catalog.png": os.path.join(STEPS_BASE, "73", "output.txt"),
}

print("1. Extracting HTML files...")
for filename, src_path in screens_html.items():
    dest_path = os.path.join(DEST_DIR, filename)
    with open(src_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        html_content = data.get("html", "")
        with open(dest_path, "w", encoding="utf-8") as out_f:
            out_f.write(html_content)
    print(f"Saved {filename} ({len(html_content)} chars)")

print("2. Extracting Screen PNG screenshots...")
for filename, src_path in screens_png.items():
    dest_path = os.path.join(DEST_DIR, filename)
    with open(src_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        img_b64 = data.get("image", "")
        if img_b64:
            img_bytes = base64.b64decode(img_b64)
            with open(dest_path, "wb") as out_f:
                out_f.write(img_bytes)
            print(f"Saved {filename} ({len(img_bytes)} bytes)")
        else:
            print(f"Warning: No image found in {src_path}")

print("3. Scanning and downloading all hosted image URLs found in the designs...")
downloaded_urls = {}
url_pattern = re.compile(r'https?://lh3\.googleusercontent\.com/[^\s"\'\)]+')

for filename in screens_html.keys():
    filepath = os.path.join(DEST_DIR, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    matches = url_pattern.findall(content)
    for url in set(matches):
        if url in downloaded_urls:
            continue
        # Generate safe filename
        asset_id = re.sub(r'[^a-zA-Z0-9]', '_', url[-30:])
        asset_name = f"asset_{asset_id}.png"
        asset_path = os.path.join(ASSETS_DIR, asset_name)
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as resp, open(asset_path, 'wb') as out_f:
                out_f.write(resp.read())
            downloaded_urls[url] = asset_name
            print(f"Downloaded asset: {asset_name} from {url[:50]}...")
        except Exception as e:
            print(f"Failed to download {url[:50]}: {e}")

print(f"Completed! Downloaded {len(downloaded_urls)} hosted assets.")