import {pairs,singletProduct,tripletProduct,symmetricDickeState,project,singletProbabilities,lowSpinState,sectors,phase} from '../lib/quantum.mjs';
const percent=p=>`${Math.round(p*1000)/10}%`;
const pairLabel=i=>pairs[i].map(x=>x+1).join('–');
const spinInputs={
 singlets:{make:singletProduct,label:'two singlets on 1–2 and 3–4',description:'Singlets on 1–2 and 3–4. Select a pair on the diagram or below.',note:'Two singlets have total spin zero. Measurements can rearrange their correlations within that sector.'},
 triplets:{make:tripletProduct,label:'two triplet pairs on 1–2 and 3–4',description:'Each original pair is the pure triplet (|01⟩ + |10⟩)/√2. Across the pairs, singlet outcomes are possible.',note:'Two triplet pairs need not be fully symmetric. A cross-pair measurement can reveal a singlet.'},
 symmetric:{make:symmetricDickeState,label:'the fully symmetric Dicke state',description:'An equal superposition of all six four-bit strings with two ones. Every pair is triplet.',note:'This state is entangled, but every internal STP measurement returns triplet and leaves it unchanged.'}
};
export function initSpinLabs(){
 document.querySelectorAll('[data-spin-lab]').forEach(root=>{
  let state=singletProduct(),history=[],display='singlet';
  const select=root.querySelector('#spin-pair'),input=root.querySelector('[data-spin-input]');
  const edges=Array.from(root.querySelectorAll('[data-spin-edge]'));
  function render(){
   const probs=singletProbabilities(state),index=Number(select.value),p=probs[index],sum=probs.reduce((a,b)=>a+b,0);
   // These three inputs and their STP descendants have support only in J = 0 and J = 2.
   // The sum of the six singlet probabilities is therefore 3 times the J = 0 weight.
   const j0=Math.max(0,Math.min(1,sum/3));
   root.querySelector('[data-spin-sector]').textContent=j0>1-1e-10?'J = 0':j0<1e-10?'J = 2':'J = 0, 2';
   root.querySelector('[data-spin-state-note]').textContent=input.value==='triplets'?spinInputs.triplets.note+' Current weights: J = 0, '+percent(j0)+'; J = 2, '+percent(1-j0)+'.':spinInputs[input.value].note;
   for(const [i,edge] of edges.entries()){
    const weight=display==='singlet'?probs[i]:1-probs[i];
    edge.dataset.selected=String(i===index);edge.querySelector('[role="button"]').setAttribute('aria-pressed',String(i===index));
    edge.querySelector('.spin-edge-line').setAttribute('stroke-width',String(1+weight*9));
    edge.querySelector('.spin-edge-line').setAttribute('opacity',String(.25+weight*.75));
    edge.querySelector('title').textContent='Pair '+pairLabel(i)+': singlet '+percent(probs[i])+', triplet '+percent(1-probs[i]);
   }
   root.querySelectorAll('[data-spin-display]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.spinDisplay===display)));
   root.querySelector('[data-spin-legend]').textContent=(display==='singlet'?'Singlet':'Triplet')+' probability · 0 → 1';
   root.querySelector('[data-spin-selection]').textContent='Selected pair '+pairLabel(index);
   root.querySelector('[data-singlet-prob]').textContent=percent(p);root.querySelector('[data-triplet-prob]').textContent=percent(1-p);
   root.querySelector('[data-branch="singlet"]').disabled=p<1e-12;root.querySelector('[data-branch="triplet"]').disabled=1-p<1e-12;
   root.querySelector('[data-history]').innerHTML='<li>Prepared '+spinInputs[input.value].label+'</li>'+history.map(h=>'<li>'+h+'</li>').join('');
   root.querySelector('[data-probability-table]').innerHTML=probs.map((p,i)=>'<div><span>Pair '+pairLabel(i)+'</span><strong>'+percent(p)+'</strong></div>').join('');
  }
  function measure(outcome,sampled=false){
   const index=Number(select.value),[a,b]=pairs[index],result=project(state,a,b,outcome);if(!result.state)return;
   state=result.state;history.push(pairLabel(index)+' → '+outcome+' · '+percent(result.probability)+(sampled?' · sampled':' · conditioned'));
   render();
   root.querySelector('[data-spin-status]').textContent=(sampled?'Sampled':'Conditioned on')+' '+outcome+' on '+pairLabel(index)+'. Probability '+percent(result.probability)+'. '+(input.value==='symmetric'?'The fully symmetric state is unchanged.':input.value==='singlets'?'Total spin remains zero.':'Conditioning can change the weights of J = 0 and J = 2.');
  }
  function reset(){
   state=spinInputs[input.value].make();history=[];select.value='1';
   root.querySelector('[data-spin-input-description]').textContent=spinInputs[input.value].description;
   root.querySelector('[data-spin-status]').textContent='Prepared '+spinInputs[input.value].label+'. No measurements recorded.';
   render();
  }
  for(const edge of edges){
   const choose=()=>{select.value=edge.dataset.spinEdge;render();};
   edge.addEventListener('click',choose);
   edge.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();}});
  }
  select.addEventListener('change',render);input.addEventListener('change',reset);
  root.querySelectorAll('[data-spin-display]').forEach(b=>b.addEventListener('click',()=>{display=b.dataset.spinDisplay;render();}));
  root.querySelectorAll('[data-branch]').forEach(b=>b.addEventListener('click',()=>measure(b.dataset.branch)));
  root.querySelector('[data-sample]').addEventListener('click',()=>{const [a,b]=pairs[Number(select.value)];measure(Math.random()<project(state,a,b).probability?'singlet':'triplet',true);});
  root.querySelector('[data-reset]').addEventListener('click',reset);render();
 });
}
export function initSchurLabs(){document.querySelectorAll('[data-schur-lab]').forEach(root=>{
 const input=root.querySelector('input');function render(){const n=Number(input.value),data=sectors(n);root.querySelector('[data-schur-n]').textContent=String(n);
 root.querySelector('[data-sectors]').innerHTML=data.map(s=>`<div class="sector"><div class="sector-label"><span>J = ${Number.isInteger(s.j)?s.j:(2*s.j)+'/2'}</span><span>${s.dimension} dim.</span></div><div class="sector-art"><div class="dimension-grid" style="grid-template-columns:repeat(${s.spinDimension},1fr);--rows:${s.multiplicity}">${Array.from({length:s.dimension},()=>'<i></i>').join('')}</div></div><div class="sector-count">${s.spinDimension} <span>×</span> ${s.multiplicity}</div><div class="young-shape" aria-label="Young shape ${s.rows.join(', ')}">${s.rows.map(row=>`<div>${'<i></i>'.repeat(row)}</div>`).join('')}</div><div class="sector-weight">${s.dimension}/${2**n} <span>of mixed input</span></div></div>`).join('');
 root.querySelector('[data-schur-equation]').textContent=`${data.map(s=>s.dimension).join(' + ')} = ${2**n}`;
 }input.addEventListener('input',render);render();
});}
export function initCoherenceLabs(){document.querySelectorAll('[data-coherence-lab]').forEach(root=>{
 const input=root.querySelector('input'),toggle=root.querySelector('[data-incoherent]');let mixed=false;
 function render(){const angle=Number(input.value),p=mixed?Array(6).fill(.5):singletProbabilities(lowSpinState(Math.PI/2,angle*Math.PI/180));
 root.querySelector('[data-coherence-explanation]').textContent=mixed?'Discarding the phase gives 50% singlet probability on every pair. This mixture has the same total spin and the same component weights as each pure state above.':`For this state, pair 1–3 gives singlet with probability ${percent(p[1])}, while pair 1–4 gives ${percent(p[2])}. Pairs 1–2 and 3–4 remain at 50%. Total spin is always zero.`;
 root.querySelectorAll('[data-phase-preset]').forEach(b=>b.setAttribute('aria-pressed',String(!mixed&&Number(b.dataset.phasePreset)===angle)));
 root.querySelector('[data-phase-output]').textContent=`${angle}°`;root.querySelector('[data-coherence-bars]').innerHTML=p.map((p,i)=>`<div class="prob-bar"><span>${pairLabel(i)}</span><div><i style="width:${p*100}%"></i></div><strong>${percent(p)}</strong></div>`).join('');
 root.querySelector('.coherence-status').textContent=mixed?'Incoherent mixture · phase information discarded':angle%180===90?'Imaginary coherence · these tests match the mixture':'Coherent superposition · equal amplitudes';toggle.setAttribute('aria-pressed',String(mixed));toggle.textContent=mixed?'Return to the coherent superposition':'Compare with an incoherent mixture';input.disabled=mixed;
 }root.querySelectorAll('[data-phase-preset]').forEach(b=>b.addEventListener('click',()=>{mixed=false;input.value=b.dataset.phasePreset;render();}));input.addEventListener('input',render);toggle.addEventListener('click',()=>{mixed=!mixed;render();});render();
});}
export function initPhaseLabs(){document.querySelectorAll('[data-phase-lab]').forEach(root=>{
 const input=root.querySelector('input');function render(){const s=Number(input.value),result=phase(s),y=50+s*90,level=root.querySelector('[data-singlet-level]');level.querySelector('line').setAttribute('y1',String(y));level.querySelector('line').setAttribute('y2',String(y));level.querySelector('text').setAttribute('y',String(y+25));
 root.querySelector('[data-s-output]').textContent=s.toFixed(2);const label=root.querySelector('[data-phase-class]');label.textContent=result.label;label.style.color=result.color;root.querySelector('[data-phase-status]').textContent=result.status;root.querySelector('[data-phase-description]').textContent=result.detail;root.querySelectorAll('[data-s]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.s)===s)));
 root.querySelector('[data-phase-note]').textContent=`s = ${s.toFixed(2)}: ${result.label}. Local energies are exactly computed; complexity labels are theorem annotations.`;
 }input.addEventListener('input',render);root.querySelectorAll('[data-s]').forEach(b=>b.addEventListener('click',()=>{input.value=b.dataset.s;render();}));render();
});}
