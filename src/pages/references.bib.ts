import refs from '../data/references.json';
export const GET=()=>new Response(refs.map(r=>`@misc{${r.key},\n  title = {${r.title}},\n  author = {${r.authors.replaceAll(';',' and')}},\n  year = {${r.year}},\n  url = {${r.url}}\n}`).join('\n\n')+'\n',{headers:{'Content-Type':'text/plain; charset=utf-8'}});
