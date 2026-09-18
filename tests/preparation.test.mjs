import test from 'node:test';
import assert from 'node:assert/strict';
import {mixedInput,pairInstrument,stateSummary,symmetricEigenvalues,negativity,tripletSweep} from '../src/lib/preparation.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} ≠ ${b}`);
const vectorClose=(a,b)=>a.forEach((x,i)=>close(x,b[i]));
test('mixed pair outcomes have the right rank, spectrum, spin weights, and entanglement',()=>{
 const rho=mixedInput(),s=pairInstrument(rho,0,1),t=pairInstrument(rho,0,1,'triplet');
 close(s.probability,.25);close(t.probability,.75);
 const ss=stateSummary(s.rho),ts=stateSummary(t.rho);
 vectorClose(ss.weights,[.25,.75,0]);vectorClose(ts.weights,[1/12,.5,5/12]);
 close(ss.entropy,2);close(ts.entropy,Math.log2(12));close(ss.negativity,.5);close(ts.negativity,0);
 close(negativity(s.rho,[0,1]),0);close(ss.purity,.25);close(ts.purity,1/12);
 for(let i=0;i<16;i++)for(let j=0;j<16;j++)close(.25*s.rho[i][j]+.75*t.rho[i][j],rho[i][j]);
 close(pairInstrument(s.rho,0,1).probability,1);close(pairInstrument(t.rho,0,1,'triplet').probability,1);
});
test('overlapping triplet creates multipartite entanglement without entangled reduced pairs',()=>{
 let rho=mixedInput(),probability=1;
 for(const [a,b,o] of tripletSweep){const r=pairInstrument(rho,a,b,o);close(r.probability,.75);rho=r.rho;probability*=r.probability;}
 const s=stateSummary(rho);close(probability,27/64);vectorClose(s.weights,[1/27,2/9,20/27]);
 close(s.purity,31/243);close(s.entropy,Math.log2(27)-46/27);close(s.negativity,1/54);
 close(negativity(rho,[0,1]),0);vectorClose(s.pairProbabilities,[1/12,1/12,2/9,0,1/12,1/12]);
 vectorClose(symmetricEigenvalues(rho),[...Array(7).fill(0),1/27,...Array(3).fill(2/27),...Array(5).fill(4/27)]);
});
test('all-triplet sweeps match analytic success probabilities and spin-sector convergence',()=>{
 let rho=mixedInput(),p=1;
 for(let r=1;r<=5;r++){
  for(const [a,b,o] of tripletSweep){const result=pairInstrument(rho,a,b,o);rho=result.rho;p*=result.probability;}
  const z=5+6/4**r+4/16**r,s=stateSummary(rho);
  close(p,z/16);vectorClose(s.weights,[4/16**r/z,6/4**r/z,5/z]);
  close(s.purity,(5+12/16**r+16/256**r)/z**2);assert.ok(s.weights[0]>0);
 }
});
test('disjoint singlet preparation accounts for its cost and the chosen bipartition',()=>{
 const first=pairInstrument(mixedInput(),0,1),second=pairInstrument(first.rho,2,3);
 close(first.probability*second.probability,1/16);
 const s=stateSummary(second.rho);vectorClose(s.weights,[1,0,0]);close(s.purity,1);close(s.entropy,0);close(s.negativity,.5);close(negativity(second.rho,[0,1]),0);
 const branch=pairInstrument(second.rho,0,2);close(branch.probability,.25);close(negativity(branch.rho,[0,1]),1.5);
});

test('three-qubit assembly preserves spin half while recoupling entanglement',()=>{
 const start=pairInstrument(mixedInput(3),0,1);close(start.probability,1/4);
 const initial=stateSummary(start.rho);vectorClose(initial.weights,[1,0]);close(initial.purity,1/2);close(initial.entropy,1);
 const s=pairInstrument(start.rho,1,2),t=pairInstrument(start.rho,1,2,'triplet');
 close(s.probability,1/4);close(t.probability,3/4);
 vectorClose(stateSummary(s.rho).pairProbabilities,[1/4,1/4,1]);
 vectorClose(stateSummary(t.rho).pairProbabilities,[3/4,3/4,0]);
 for(const branch of [s,t]){const summary=stateSummary(branch.rho);vectorClose(summary.weights,[1,0]);close(summary.purity,1/2);close(summary.entropy,1);}
 close(negativity(t.rho,[0]),1/3);
 const mixed=mixedInput(3);vectorClose(stateSummary(mixed).weights,[1/2,1/2]);
 for(let i=0;i<8;i++)for(let j=0;j<8;j++)close(.25*s.rho[i][j]+.75*t.rho[i][j],(start.rho[i][j]+start.rho[(i&4)|((i&1)<<1)|((i&2)>>1)][(j&4)|((j&1)<<1)|((j&2)>>1)])/2);
});
test('singlet-triplet and triplet-triplet resources have distinct cross-measurement branches',()=>{
 const firstS=pairInstrument(mixedInput(),0,1).rho,st=pairInstrument(firstS,2,3,'triplet');close(st.probability,.75);
 vectorClose(stateSummary(st.rho).weights,[0,1,0]);close(stateSummary(st.rho).purity,1/3);
 const moved=pairInstrument(st.rho,1,2);close(moved.probability,.25);close(pairInstrument(moved.rho,0,3).probability,0);
 let tt=pairInstrument(pairInstrument(mixedInput(),0,1,'triplet').rho,2,3,'triplet').rho;
 vectorClose(stateSummary(tt).weights,[1/9,1/3,5/9]);close(stateSummary(tt).purity,1/9);close(negativity(tt,[1]),0);
 const branch=pairInstrument(tt,1,2);close(branch.probability,.25);close(stateSummary(branch.rho).purity,7/27);vectorClose(stateSummary(branch.rho).weights,[1/3,2/3,0]);close(pairInstrument(branch.rho,0,3).probability,1/3);
});
