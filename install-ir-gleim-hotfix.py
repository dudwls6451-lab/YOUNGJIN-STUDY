"""Run from the repository root; inserts one additive script tag, preserving all existing code."""
from pathlib import Path
root=Path(__file__).resolve().parent
index=root/'index.html'
if not index.exists():raise SystemExit('Place these files in the website repository root first (index.html was not found).')
text=index.read_text(encoding='utf-8-sig')
tag='<script src="./assets/ir-gleim-addon-v11-60-62.js?v=11.60.62"></script>'
if 'ir-gleim-addon-v11-60-62.js' in text:print('IR Gleim is already installed.')
elif '</body>' not in text:raise SystemExit('Closing body tag was not found; no changes made.')
else:
 backup=root/'index-before-ir-gleim-hotfix.html'
 if not backup.exists():backup.write_bytes(index.read_bytes())
 index.write_text(text.replace('</body>',f'  {tag}\n</body>',1),encoding='utf-8')
 print('Installed IR Gleim script tag. Existing index backed up as index-before-ir-gleim-hotfix.html.')
