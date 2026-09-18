import test from 'node:test';
import assert from 'node:assert/strict';
import {pairs,singletProduct,tripletProduct,symmetricDickeState,swap,project,singletProbabilities,lowSpinState,sectors,phase} from '../src/lib/quantum.mjs';
import {spinWeights} from '../src/lib/preparation.mjs';
import {couplingPaths} from '../src/lib/paths.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} ≠ ${b}`);
test('SWAP is an involution and the projectors are complete and orthogonal',()=>{
 const v=lowSpinState(1.2,.7); assert.deepEqual(swap(swap(v,0,2),0,2),v);
 const s=project(v,0,2),t=project(v,0,2,'triplet'); close(s.probability+t.probability,1);
 close(project(s.state,0,2).probability,1);close(project(t.state,0,2).probability,0);
 for(let i=0;i<16;i++)for(let k=0;k<2;k++)close(Math.sqrt(s.probability)*s.state[i][k]+Math.sqrt(t.probability)*t.state[i][k],v[i][k]);
});
test('two-qubit SWAP comparison matches overlap and retains signed branch amplitudes',()=>{
 for(const angle of [0,1,30,90,143,180]){
  const c=Math.cos(angle*Math.PI/360),s=Math.sin(angle*Math.PI/360),input=[[c,0],[s,0],[0,0],[0,0]];
  const symmetric=project(input,0,1,'triplet'),antisymmetric=project(input,0,1,'singlet');
  close(symmetric.probability,(1+c*c)/2);close(antisymmetric.probability,(1-c*c)/2);
  const norm=Math.sqrt(symmetric.probability);
  symmetric.state.forEach(([a],i)=>close(a,[c,s/2,s/2,0][i]/norm));
  close(project(symmetric.state,0,1,'triplet').probability,1);
  if(angle===0){assert.equal(antisymmetric.state,null);continue;}
  antisymmetric.state.forEach(([a],i)=>close(a,[0,1/Math.sqrt(2),-1/Math.sqrt(2),0][i]));
  close(project(antisymmetric.state,0,1,'singlet').probability,1);
  close(project(antisymmetric.state,0,1,'triplet').probability,0);
 }
});
test('four-spin conditional probabilities match analytic recoupling',()=>{
 const a=singletProduct();singletProbabilities(a).forEach((x,i)=>close(x,[1,.25,.25,.25,.25,1][i]));
 const s=project(a,0,2),t=project(a,0,2,'triplet');close(s.probability,.25);close(t.probability,.75);
 singletProbabilities(s.state).forEach((x,i)=>close(x,[.25,1,.25,.25,1,.25][i]));
 singletProbabilities(t.state).forEach((x,i)=>close(x,[.75,0,.75,.75,0,.75][i]));
 close(.25*project(s.state,0,1).probability+.75*project(t.state,0,1).probability,5/8);
});
test('low-spin coherent states are normalized and have fixed total singlet weight',()=>{
 for(const theta of [0,.3,1.2,Math.PI])for(const phi of [0,1,Math.PI]){
  const v=lowSpinState(theta,phi);close(v.reduce((s,z)=>s+z[0]**2+z[1]**2,0),1);
  close(singletProbabilities(v).reduce((a,b)=>a+b,0),3);
 }
});
test('Schur decomposition accounts for the full Hilbert space',()=>{
 for(let n=2;n<=12;n++) assert.equal(sectors(n).reduce((s,x)=>s+x.dimension,0),2**n);
 assert.deepEqual(sectors(8).map(s=>s.multiplicity),[14,28,20,7,1]);
});
test('phase boundaries remain exact and distinct from adjacent open intervals',()=>{
 assert.equal(phase(-.001).label,'In BQP');assert.equal(phase(0).label,'EPR ∈ BQP');assert.equal(phase(.001).label,'StoqMA-complete');
 assert.equal(phase(1).label,'NP-complete');assert.equal(phase(1.001).label,'QMA-complete');
});
test('coupling paths count multiplicities in each spin sector',()=>{
 for(let n=2;n<=8;n++)for(const s of sectors(n))assert.equal(couplingPaths(n,2*s.j).length,s.multiplicity);
});
test('imaginary singlet-sector coherence is invisible to these real projectors',()=>{
 singletProbabilities(lowSpinState(Math.PI/2,Math.PI/2)).forEach(p=>close(p,.5));
});
test('two triplet pairs differ from a fully symmetric state',()=>{
 const v=tripletProduct();singletProbabilities(v).forEach((p,i)=>close(p,[0,.25,.25,.25,.25,0][i]));
 const rho=v.map(a=>v.map(b=>a[0]*b[0]));spinWeights(rho).forEach((p,i)=>close(p,[1/3,0,2/3][i]));
 const branch=project(v,0,2);close(branch.probability,.25);close(singletProbabilities(branch.state).reduce((a,b)=>a+b,0),3);
 const dicke=symmetricDickeState();let state=dicke;
 for(const [a,b] of [...pairs,...pairs].reverse()){
  close(project(state,a,b).probability,0);const t=project(state,a,b,'triplet');close(t.probability,1);state=t.state;
  state.forEach((z,i)=>z.forEach((c,k)=>close(c,dicke[i][k])));
 }
});
