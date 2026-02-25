"""
Run this script AFTER uploading PDFs to Cloudflare R2.
Usage: python3 update_catalog_urls.py <your-r2-public-base-url>

Example:
  python3 update_catalog_urls.py https://pub-abc123.r2.dev
"""
import json, sys, os

if len(sys.argv) < 2:
    print("Usage: python3 update_catalog_urls.py <r2-base-url>")
    print("Example: python3 update_catalog_urls.py https://pub-abc123.r2.dev")
    sys.exit(1)

BASE_URL = sys.argv[1].rstrip('/')
CATALOG_PATH = os.path.join(os.path.dirname(__file__), 'web_frontend/public/catalog.json')

with open(CATALOG_PATH, 'r') as f:
    data = json.load(f)

def rewrite(url):
    if url and url.startswith('/papers/'):
        return BASE_URL + url
    return url

for paper in data:
    paper['paperUrl']     = rewrite(paper.get('paperUrl', ''))
    paper['answerKeyUrl'] = rewrite(paper.get('answerKeyUrl', ''))
    for ak in paper.get('allAnswerKeys', []):
        ak['url'] = rewrite(ak.get('url', ''))

with open(CATALOG_PATH, 'w') as f:
    json.dump(data, f, indent=2)

print(f"✅ Updated {len(data)} papers to use: {BASE_URL}")
print("   Now run: npm run build (inside web_frontend/)")
