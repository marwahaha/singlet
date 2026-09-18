"""Check generated local links, anchors, assets, and base-path portability."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import os
root=Path('dist'); base=os.getenv('BASE_PATH','/').rstrip('/')
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__(); self.links=[]; self.ids=set(); self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.add(a['id'])
  for key in ('href','src'):
   if key in a and a[key]:self.links.append(a[key])
pages={p:Page(p.read_text()) for p in root.rglob('*.html')}; errors=[]; count=0
for p,page in pages.items():
 for link in page.links:
  u=urlsplit(link)
  if u.scheme or u.netloc:continue
  path=unquote(u.path)
  if path.startswith('/'):
   if base and not(path==base or path.startswith(base+'/')):errors.append(f'{p}: wrong base {link}');continue
   target=root/path[len(base):].lstrip('/')
  elif path:target=p.parent/path
  else:target=p
  if target.is_dir():target=target/'index.html'
  if not target.exists():errors.append(f'{p}: missing {link}')
  elif u.fragment and target in pages and unquote(u.fragment) not in pages[target].ids:errors.append(f'{p}: missing anchor {link}')
  count+=1
if errors:raise SystemExit('\n'.join(errors))
print(f'Validated {count} local links/assets/anchors across {len(pages)} HTML pages (base={base or "/"}).')
