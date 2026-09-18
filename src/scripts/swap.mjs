import {project} from '../lib/quantum.mjs';

const percent=p=>`${+(100*p).toFixed(1)}%`;
export function initSwapLabs(){document.querySelectorAll('[data-swap-lab]').forEach(root=>{
 const angle=root.querySelector('#swap-angle');
 let state,sector=null;
 const text=(selector,value)=>{root.querySelector(selector).textContent=value;};
 function render(){
  const ps=project(state,0,1,'singlet').probability;
  text('[data-swap-p0]',percent(1-ps));text('[data-swap-p1]',percent(ps));
  root.querySelector('[data-swap-branch="singlet"]').disabled=ps<1e-13;
  root.querySelector('[data-swap-branch="triplet"]').disabled=1-ps<1e-13;
  text('[data-swap-bit]',sector?(sector==='singlet'?'1':'0'):'?');
  text('[data-swap-projector]',sector?(sector==='singlet'?'Pₛ':'Pₜ'):'Ψ');
  text('[data-swap-measure]',sector?'Measure retained pair':'Measure ancilla');
  state.forEach(([a],i)=>{
   const v=Math.abs(a)<1e-12?0:a,bar=root.querySelector(`[data-swap-bar="${i}"]`);
   bar.style.height=`${Math.abs(v)*48}%`;bar.style.top=v>=0?`${50-Math.abs(v)*48}%`:'50%';
   bar.dataset.sign=v<0?'negative':'positive';
   text(`[data-swap-value="${i}"]`,`${v<0?'−':v>0?'+':''}${Math.abs(v).toFixed(3)}`);
  });
  root.querySelector('[data-swap-amplitudes]').setAttribute('aria-label','Data state amplitudes: '+state.map(([a],i)=>`${['00','01','10','11'][i]}: ${a.toFixed(3)}`).join('; '));
 }
 function prepare(){
  const theta=Number(angle.value)*Math.PI/180,c=Math.cos(theta/2),s=Math.sin(theta/2);
  state=[[c,0],[s,0],[0,0],[0,0]];sector=null;
  text('[data-swap-angle]',`θ = ${angle.value}°`);
  text('[data-swap-label]',`Input state · squared overlap ${(c*c).toFixed(3)}`);
  text('[data-swap-result]','Measure the ancilla, or inspect a conditional branch. Both data qubits are kept.');render();
 }
 function measure(outcome,inspected=false){
  const wasDefinite=sector!==null,result=project(state,0,1,outcome);
  if(!result.state)return;
  state=result.state;sector=outcome;
  const symmetric=outcome==='triplet';
  text('[data-swap-label]',`${inspected?'Conditional state':'Retained state'} · ${symmetric?'symmetric / triplet':'antisymmetric / singlet'}`);
  text('[data-swap-result]',wasDefinite?
   `Ancilla ${symmetric?'0':'1'} again, with certainty. The retained pair has definite exchange parity. Prepare fresh inputs to sample their original probabilities.`:
   `${inspected?'Inspecting':'Sampled'} ancilla ${symmetric?'0':'1'} (probability ${percent(result.probability)}). ${symmetric?'The |01⟩ and |10⟩ amplitudes agree: swapping the qubits leaves this state unchanged.':'The |01⟩ and |10⟩ amplitudes have opposite signs: swapping the qubits changes the sign of the state.'}`);
  render();
 }
 function sample(){measure(Math.random()<project(state,0,1,'singlet').probability?'singlet':'triplet');}
 angle.addEventListener('input',prepare);
 root.querySelectorAll('[data-swap-branch]').forEach(b=>b.addEventListener('click',()=>measure(b.dataset.swapBranch,true)));
 root.querySelector('[data-swap-measure]').addEventListener('click',sample);
 const gate=root.querySelector('[data-swap-gate]');gate.addEventListener('click',sample);
 gate.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();sample();}});
 root.querySelector('[data-swap-reset]').addEventListener('click',prepare);
 prepare();
});}
