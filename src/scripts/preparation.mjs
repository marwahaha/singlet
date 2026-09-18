import {mixedInput,pairInstrument,preparationExamples,allPairs} from '../lib/preparation.mjs';
const percent=p=>p>0&&p<.00001?`${(100*p).toExponential(1)}%`:`${(100*p).toFixed(2).replace(/\.?0+$/,'')}%`;
const label=p=>`${p[0]+1}–${p[1]+1}`;
const resources={
 singlets:{n:4,name:'two independent singlets',groups:['singlet','singlet'],note:'Measure 2–3, one qubit from each singlet. Either outcome changes how the two original pairs are coupled.'},
 singletMixed:{n:3,name:'a singlet and a mixed qubit',groups:['singlet','mixed qubit'],note:'Measure 2–3 to couple the singlet to the mixed qubit. The singlet outcome moves the singlet to a new pair; the triplet outcome distributes correlations over three qubits.'},
 twoTriplets:{n:4,name:'two independent mixed triplets',groups:['mixed triplet','mixed triplet'],note:'The two input blocks are separable. A measurement on 2–3 can extract a singlet or create correlations that no individual pair reveals.'},
 singletTriplet:{n:4,name:'a singlet and a mixed triplet',groups:['singlet','mixed triplet'],note:'The combined state has total spin 1. Measure 2–3 to couple the original blocks.'},
 mixed:{n:4,name:'four independent mixed qubits',groups:[],note:'Any pair gives a singlet with probability ¼ or a mixed triplet with probability ¾. Keep a result, then measure a pair that overlaps it.'}
};
const branchNotes={
 'singlets:singlet':'Two new singlets, on 2–3 and 1–4: entanglement swapping.',
 'singlets:triplet':'Pairs 2–3 and 1–4 are both triplets, entangled with each other into a pure total-spin-zero state.',
 'singletTriplet:singlet':'A singlet on 2–3 and an independent mixed triplet on 1–4. Total spin remains 1.',
 'singletTriplet:triplet':'A mixed state in total spin 1. Pair 2–3 is triplet; the original blocks no longer remain independent.',
 'twoTriplets:singlet':'A singlet on 2–3. Pair 1–4 is an independent mixture with singlet weight ⅓ and triplet weight ⅔.',
 'twoTriplets:triplet':'Entanglement across 2 | 1,3,4, although every reduced pair is separable. The original pairs are no longer certainly triplet.',
 'singletMixed:singlet':'A singlet on 2–3 and a mixed qubit on 1. The singlet has moved to a new pair.',
 'singletMixed:triplet':'Total spin stays ½. Pairs 1–2 and 1–3 each have singlet probability ¾; pair 2–3 is certainly triplet.'
};
export function initPreparationLabs(){document.querySelectorAll('[data-preparation-lab]').forEach(root=>{
 let rho,history,n,recipe;
 const pair=root.querySelector('#prep-pair'),input=root.querySelector('[data-prep-input]');
 const current=()=>history.at(-1);
 function reset(){recipe=input.value;n=resources[recipe].n;rho=mixedInput(n);
  for(const [a,b,o] of preparationExamples[recipe]||[])rho=pairInstrument(rho,a,b,o).rho;
  history=[{rho,status:`Available now · ${resources[recipe].name}`,note:resources[recipe].note}];
  pair.innerHTML=allPairs(n).map(p=>`<option value="${p.join(',')}">${label(p)}</option>`).join('');pair.value='1,2';render();
 }
 function describe(selected,outcome,branch){
  if(!branch.rho)return 'This outcome has zero probability in the current state.';
  if(history.length===1&&selected.join(',')==='1,2'&&branchNotes[recipe+':'+outcome])return branchNotes[recipe+':'+outcome];
  if(history.length===1&&recipe==='mixed')return outcome==='singlet'?`A pure singlet on ${label(selected)}; the other two qubits remain independently mixed.`:`A mixed triplet on ${label(selected)}; the other two qubits remain independently mixed.`;
  const others=allPairs(n).filter(p=>p.join(',')!==selected.join(','));
  return `Pair ${label(selected)} is ${outcome}. Other singlet probabilities: ${others.map(p=>`${label(p)}: ${percent(pairInstrument(branch.rho,...p).probability)}`).join('; ')}.`;
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
  const points=n===3?[[90,60],[430,60],[260,295]]:[[90,60],[430,60],[90,295],[430,295]];
  const centers=n===3?[[260,60],[175,177],[345,177]]:[[260,60],[90,177],[205,222],[315,222],[430,177],[260,295]];
  const groups=history.length===1?resources[recipe].groups.map((name,i)=>{
   const y=i===0?60:295,isSingle=n===3&&i===1;
   return `<rect class="resource-block" x="${isSingle?216:46}" y="${y-42}" width="${isSingle?88:428}" height="84" rx="42"/><text class="resource-block-label" x="260" y="${i===0?13:350}" text-anchor="middle">${name}</text>`;
  }).join(''):'';
  root.querySelector('[data-prep-network]').innerHTML=groups+pairs.map(([a,b],i)=>{
   const [x,y]=points[a],[xx,yy]=points[b],[cx,cy]=centers[i],value=`${a},${b}`,active=pair.value===value;
   const d=n===4&&a===0&&b===3?`M ${x} ${y} Q 145 300 ${xx} ${yy}`:n===4&&a===1&&b===2?`M ${x} ${y} Q 375 300 ${xx} ${yy}`:`M ${x} ${y} L ${xx} ${yy}`;
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
