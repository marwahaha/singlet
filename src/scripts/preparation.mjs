import {resourceInput,pairInstrument,allPairs} from '../lib/preparation.mjs';
import {preparationResources,resourceBlockLabels} from '../data/preparation-resources.mjs';
const percent=p=>p>0&&p<.00001?`${(100*p).toExponential(1)}%`:`${(100*p).toFixed(2).replace(/\.?0+$/,'')}%`;
const label=p=>`${p[0]+1}–${p[1]+1}`;
const resources=Object.fromEntries(preparationResources.map(resource=>[resource.key,resource]));
const branchNotes={
 'singlets:singlet':'Two new singlets, on 2–3 and 1–4: entanglement swapping.',
 'singlets:triplet':'Pairs 2–3 and 1–4 are both triplets, entangled with each other into a pure total-spin-zero state.',
 'singletTriplet:singlet':'A singlet on 2–3 and an independent mixed triplet on 1–4. Total spin remains 1.',
 'singletTriplet:triplet':'A mixed state in total spin 1. Pair 2–3 is triplet; the original blocks no longer remain independent.',
 'twoTriplets:singlet':'A singlet on 2–3. Pair 1–4 is an independent mixture with singlet weight ⅓ and triplet weight ⅔.',
 'twoTriplets:triplet':'Entanglement across 2 | 1,3,4, although every reduced pair is separable. The original pairs are no longer certainly triplet.',
 'singletMixed:singlet':'A singlet on 2–3 and a mixed qubit on 1. The singlet has moved to a new pair.',
 'singletMixed:triplet':'Total spin stays ½. Pairs 1–2 and 1–3 each have singlet probability ¾; pair 2–3 is certainly triplet.',
 'tripletMixed:singlet':'A singlet on 2–3 and a mixed qubit on 1. The original triplet pair has been broken up.',
 'tripletMixed:triplet':'Pair 2–3 is triplet. Pairs 1–2 and 1–3 each have singlet probability 1/12; the three qubits are not fully symmetric.',
 'symmetricMixed:singlet':'A singlet on 3–4 and an independent mixed triplet on 1–2. The remaining two qubits of the triple stay symmetric.',
 'symmetricMixed:triplet':'Pairs 1–2 and 3–4 are triplet. Each pair between them has singlet probability 1/12; the four qubits are not fully symmetric.',
 'symmetricSinglet:singlet':'A singlet on 3–4 and an independent symmetric triple on 1–2–5. The symmetric block now includes qubit 5.',
 'symmetricSinglet:triplet':'Total spin remains 3/2. Pairs 3–5 and 4–5 each have singlet probability ¾; pair 1–2 remains triplet.',
 'symmetricTriplet:singlet':'A singlet on 3–4. The remaining qubits 1–2–5 have spin-½ weight 4/9 and spin-3/2 weight 5/9; they are not fully symmetric.',
 'symmetricTriplet:triplet':'Pairs 1–2 and 3–4 are triplet. The old pair 4–5 now has singlet probability 1/12; the original blocks no longer remain independent.'
};
export function initPreparationLabs(){document.querySelectorAll('[data-preparation-lab]').forEach(root=>{
 let rho,history,n,recipe;
 const pair=root.querySelector('#prep-pair'),input=root.querySelector('[data-prep-input]');
 const current=()=>history.at(-1);
 function reset(){recipe=input.value;rho=resourceInput(resources[recipe].blocks);n=Math.log2(rho.length);
  history=[{rho,status:`Available now · ${resources[recipe].name}`,note:resources[recipe].note}];
  pair.innerHTML=allPairs(n).map(p=>`<option value="${p.join(',')}">${label(p)}</option>`).join('');pair.value=resources[recipe].pair.join(',');render();
 }
 function describe(selected,outcome,branch){
  if(!branch.rho)return 'This outcome has zero probability in the current state.';
  if(history.length===1&&selected.join(',')===resources[recipe].pair.join(',')&&branchNotes[recipe+':'+outcome])return branchNotes[recipe+':'+outcome];
  if(history.length===1&&recipe==='mixed')return outcome==='singlet'?`A pure singlet on ${label(selected)}; the other two qubits remain independently mixed.`:`A mixed triplet on ${label(selected)}; the other two qubits remain independently mixed.`;
  if(branch.probability>1-1e-12)return `Pair ${label(selected)} is certainly ${outcome}. This measurement leaves the state unchanged.`;
  const changes=allPairs(n).filter(p=>p.join(',')!==selected.join(',')).map(p=>({p,before:pairInstrument(rho,...p).probability,after:pairInstrument(branch.rho,...p).probability})).filter(x=>Math.abs(x.after-x.before)>1e-9).sort((a,b)=>Math.abs(b.after-b.before)-Math.abs(a.after-a.before)).slice(0,2);
  return `Pair ${label(selected)} is ${outcome}. `+(changes.length?`Largest changes in singlet probability: ${changes.map(x=>`${label(x.p)}: ${percent(x.before)} → ${percent(x.after)}`).join('; ')}.`:'Other pair probabilities are unchanged.');
 }
 function measure(outcome,sampled=false){const selected=pair.value.split(',').map(Number),result=pairInstrument(rho,...selected,outcome);if(!result.rho)return;
  const note=describe(selected,outcome,result);rho=result.rho;
  history.push({rho,pair:pair.value,status:`${sampled?'Measured':'Retained'} ${outcome} on ${label(selected)} · branch probability ${percent(result.probability)}`,note});render();
 }
 function render(){const selected=pair.value.split(',').map(Number),pairs=allPairs(n),probabilities=pairs.map(p=>pairInstrument(rho,...p).probability);
  root.querySelector('[data-prep-system]').textContent=`${n} qubits · ${history.length-1} measurement${history.length===2?'':'s'}`;
  root.querySelectorAll('[data-prep-formula]').forEach(el=>el.hidden=el.dataset.prepFormula!==recipe);
  for(const outcome of ['singlet','triplet']){
   const result=pairInstrument(rho,...selected,outcome),button=root.querySelector(`[data-prep-outcome="${outcome}"]`);
   root.querySelector(outcome==='singlet'?'[data-prep-ps]':'[data-prep-pt]').textContent=percent(result.probability);
   button.disabled=!result.rho;root.querySelector(`[data-prep-branch="${outcome}"]`).textContent=describe(selected,outcome,result);
  }
  root.querySelector('[data-prep-status]').textContent=current().status;
  root.querySelector('[data-prep-interpretation]').textContent=current().note;
  root.querySelector('[data-prep-undo]').disabled=history.length===1;
  const triple=resources[recipe].blocks[0]==='symmetricTriple';
  root.querySelector('.prep-canvas svg').setAttribute('viewBox',triple?'0 0 520 420':'0 0 520 370');
  const points=triple?(n===5?[[70,70],[260,70],[450,70],[130,330],[390,330]]:[[70,70],[260,70],[450,70],[260,330]]):n===3?[[90,60],[430,60],[260,295]]:[[90,60],[430,60],[90,295],[430,295]];
  const centers=triple?(n===5?[[165,70],[260,140],[45,235],[182,161],[355,70],[162.5,265],[357.5,265],[338,161],[475,235],[260,330]]:[[165,70],[260,140],[165,200],[355,70],[260,245],[355,200]]):n===3?[[260,60],[175,177],[345,177]]:[[260,60],[90,177],[205,222],[315,222],[430,177],[260,295]];
  const groups=history.length===1&&recipe!=='mixed'?resources[recipe].blocks.map((block,i)=>{
   const name=resourceBlockLabels[block];
   if(triple){
    const x=i===0?26:n===5?86:216,y=i===0?28:288,width=i===0?468:n===5?348:88,height=i===0?148:84;
    return `<rect class="resource-block" x="${x}" y="${y}" width="${width}" height="${height}" rx="38"/><text class="resource-block-label" x="260" y="${i===0?17:408}" text-anchor="middle">${name}</text>`;
   }
   const y=i===0?60:295,isSingle=n===3&&i===1;
   return `<rect class="resource-block" x="${isSingle?216:46}" y="${y-42}" width="${isSingle?88:428}" height="84" rx="42"/><text class="resource-block-label" x="260" y="${i===0?13:350}" text-anchor="middle">${name}</text>`;
  }).join(''):'';
  root.querySelector('[data-prep-network]').innerHTML=groups+pairs.map(([a,b],i)=>{
   const [x,y]=points[a],[xx,yy]=points[b],[cx,cy]=centers[i],value=`${a},${b}`,active=pair.value===value;
   let d=`M ${x} ${y} L ${xx} ${yy}`;
   if(triple&&a===0&&b===2)d=`M ${x} ${y} Q 260 210 ${xx} ${yy}`;
   else if(triple&&n===5&&a===0&&b===3)d=`M ${x} ${y} Q -10 270 ${xx} ${yy}`;
   else if(triple&&n===5&&a===2&&b===4)d=`M ${x} ${y} Q 530 270 ${xx} ${yy}`;
   else if(!triple&&n===4&&a===0&&b===3)d=`M ${x} ${y} Q 145 300 ${xx} ${yy}`;
   else if(!triple&&n===4&&a===1&&b===2)d=`M ${x} ${y} Q 375 300 ${xx} ${yy}`;
   return `<g class="prep-edge" data-prep-select="${value}" data-selected="${active}"><path d="${d}" class="prep-edge-hit"/><path d="${d}" class="prep-edge-outline"/><path d="${d}" class="prep-edge-line" stroke-width="${2+10*probabilities[i]}" opacity="${.22+.78*probabilities[i]}"/><g role="button" tabindex="0" aria-pressed="${active}" aria-label="Select pair ${label([a,b])}; singlet probability ${percent(probabilities[i])}"><rect x="${cx-35}" y="${cy-30}" width="70" height="60" fill="transparent"/><rect class="prep-edge-label" x="${cx-30}" y="${cy-20}" width="60" height="40" rx="20"/><text x="${cx}" y="${cy+7}" text-anchor="middle">${label([a,b])}</text></g></g>`;
  }).join('')+points.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="24" fill="#e5edbc"/><text x="${x}" y="${y+8}" text-anchor="middle" fill="#182b25" font-size="26">${i+1}</text>`).join('');
 }
 pair.addEventListener('change',render);
 function selectPair(target){pair.value=target.dataset.prepSelect;render();root.querySelector(`[data-prep-select="${pair.value}"] [role="button"]`)?.focus({preventScroll:true});}
 root.addEventListener('click',e=>{const target=e.target.closest('[data-prep-select]');if(target)selectPair(target);});
 root.addEventListener('keydown',e=>{const target=e.target.closest('g[data-prep-select]');if(target&&(e.key==='Enter'||e.key===' ')){e.preventDefault();selectPair(target);}});
 root.querySelectorAll('[data-prep-outcome]').forEach(b=>b.addEventListener('click',()=>measure(b.dataset.prepOutcome)));
 root.querySelector('[data-prep-sample]').addEventListener('click',()=>measure(Math.random()<pairInstrument(rho,...pair.value.split(',').map(Number)).probability?'singlet':'triplet',true));
 root.querySelector('[data-prep-undo]').addEventListener('click',()=>{if(history.length===1)return;const last=history.pop();rho=current().rho;pair.value=last.pair;render();});
 input.addEventListener('change',reset);root.querySelector('[data-prep-reset]').addEventListener('click',reset);reset();
});}
