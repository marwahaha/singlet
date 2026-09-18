import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const questions=JSON.parse(readFileSync(new URL('../src/data/questions.json',import.meta.url)));
const refs=JSON.parse(readFileSync(new URL('../src/data/references.json',import.meta.url)));
test('question permalinks and bibliography keys remain unique and connected',()=>{
 assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);
 assert.equal(new Set(refs.map(r=>r.key)).size,refs.length);
 for(const q of questions){assert.match(q.id,/^Q\d{2}$/);for(const key of q.references)assert.ok(refs.some(r=>r.key===key),`${q.id} references missing ${key}`);for(const f of ['title','summary','preciseStatement','why','firstStep'])assert.ok(q[f]?.length>15,`${q.id}.${f}`);}
});
test('formal variants have distinct labels and substantive mathematical statements',()=>{
 for(const q of questions){
  const variants=q.variants||[];
  assert.equal(new Set(variants.map(v=>v.label)).size,variants.length,`${q.id}: repeated variant label`);
  for(const v of variants){assert.ok(v.label?.trim(),`${q.id}: missing label`);assert.ok(v.statement?.length>50,`${q.id}: incomplete variant`);}
 }
});
