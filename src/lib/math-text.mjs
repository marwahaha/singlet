import katex from 'katex';

// Authored prose stays escaped; only explicitly delimited TeX is typeset.
export function splitMathText(text) {
 const parts=[];
 let offset=0;
 while(offset<text.length){
  const start=text.indexOf('$',offset);
  if(start<0){parts.push({text:text.slice(offset)});break;}
  if(start>offset)parts.push({text:text.slice(offset,start)});
  const display=text[start+1]==='$',delimiter=display?'$$':'$';
  const end=text.indexOf(delimiter,start+delimiter.length);
  if(end<0)throw new Error(`Unclosed LaTeX delimiter near: ${text.slice(start,start+70)}`);
  const tex=text.slice(start+delimiter.length,end).trim();
  if(!tex||tex.includes('$'))throw new Error('Empty or nested LaTeX delimiters.');
  parts.push({tex,display});
  offset=end+delimiter.length;
 }
 return parts;
}

const escapeHtml=text=>text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const options={throwOnError:true,strict:'error',trust:false};
const rendered=new Map();
export function renderMathText(text){
 if(!rendered.has(text))rendered.set(text,splitMathText(text).map(part=>part.tex===undefined?
  escapeHtml(part.text):katex.renderToString(part.tex,{...options,displayMode:part.display,output:'htmlAndMathml'})
 ).join(''));
 return rendered.get(text);
}

const decodeEntities=text=>text.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,(_,entity)=>{
 if(entity.startsWith('#'))return String.fromCodePoint(entity[1].toLowerCase()==='x'?parseInt(entity.slice(2),16):Number(entity.slice(1)));
 return {amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '}[entity.toLowerCase()];
});
export function mathTextToPlainText(text){
 return splitMathText(text).map(part=>part.tex===undefined?part.text:
  decodeEntities(katex.renderToString(part.tex,{...options,output:'mathml'})
   .replace(/<annotation\b[^>]*>[\s\S]*?<\/annotation>/g,'')
   .replace(/<[^>]+>/g,''))
 ).join('');
}
