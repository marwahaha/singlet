import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {splitMathText,renderMathText,mathTextToPlainText} from '../src/lib/math-text.mjs';

test('authored math retains prose, renders accessible inline and display notation, and escapes HTML',()=>{
 const html=renderMathText('For $J=0$, require $$\\Pi_{S,j}\\lvert\\psi\\rangle=0.$$ A < B & C.');
 assert.match(html,/katex-display/);
 assert.match(html,/<math[^>]*xmlns="http:\/\/www.w3.org\/1998\/Math\/MathML"/);
 assert.match(html,/A &lt; B &amp; C\./);
 assert.equal(renderMathText('<img src=x onerror=alert(1)>'),'&lt;img src=x onerror=alert(1)&gt;');
 assert.throws(()=>renderMathText('Incomplete $J=0'),/Unclosed/);
 assert.throws(()=>renderMathText('$\\undefinedcommand$'));
 assert.equal(mathTextToPlainText('Is $\\mathsf{StoqMA}\\subseteq\\mathsf{QCMA}$?'),'Is StoqMA⊆QCMA?');
});

test('all mathematical question fields compile without invalid LaTeX or control characters',()=>{
 const questions=JSON.parse(fs.readFileSync(new URL('../src/data/questions.json',import.meta.url),'utf8'));
 for(const q of questions){
  const fields=['title','summary','preciseStatement','scopeNote','why','knownResult','firstStep'].map(key=>[key,q[key]]);
  q.variants?.forEach((v,i)=>fields.push([`variant ${i} label`,v.label],[`variant ${i} statement`,v.statement]));
  for(const [key,text] of fields){
   if(!text)continue;
   assert.doesNotMatch(text,/[\x00-\x08\x0b-\x1f]/,`${q.id} ${key}: control character`);
   assert.doesNotThrow(()=>renderMathText(text),`${q.id} ${key}`);
   for(const part of splitMathText(text))if(part.tex!==undefined)assert.ok(part.tex.length>0);
  }
 }
});
