// Three or four labeled qubits, with real density matrices and ideal Lüders instruments.
// Real arithmetic is sufficient: the mixed input and every STP projector are real.
export function allPairs(n){return Array.from({length:n},(_,a)=>Array.from({length:n-a-1},(_,k)=>[a,a+k+1])).flat();}
export function mixedInput(n=4){if(n!==3&&n!==4)throw new RangeError('Expected three or four qubits');const d=2**n;return Array.from({length:d},(_,i)=>Array.from({length:d},(_,j)=>i===j?1/d:0));}
const zeros=d=>Array.from({length:d},()=>Array(d).fill(0));
export function swapIndex(i,a,b,n=4){const x=n-1-a,y=n-1-b;return ((i>>x)&1)===((i>>y)&1)?i:i^(1<<x)^(1<<y);}
export function pairInstrument(rho,a,b,outcome='singlet'){
 const n=Math.log2(rho.length);if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a>=n||b>=n||a===b)throw new RangeError('Invalid pair');
 if(outcome!=='singlet'&&outcome!=='triplet')throw new RangeError('Invalid outcome');
 const sign=outcome==='singlet'?-1:1,perm=Array.from({length:rho.length},(_,i)=>swapIndex(i,a,b,n));
 const raw=rho.map((row,i)=>row.map((x,j)=>(x+sign*rho[perm[i]][j]+sign*rho[i][perm[j]]+rho[perm[i]][perm[j]])/4));
 const probability=raw.reduce((s,row,i)=>s+row[i],0);
 return {probability:Math.max(0,Math.min(1,probability)),rho:probability>1e-13?raw.map(row=>row.map(x=>x/probability)):null};
}
export function symmetricEigenvalues(matrix){
 // Jacobi rotations on a small real symmetric matrix; includes negative PT values.
 const a=matrix.map(row=>row.slice()),n=a.length;
 for(let iteration=0;iteration<100*n*n;iteration++){
  let p=0,q=1,largest=0;
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(Math.abs(a[i][j])>largest){largest=Math.abs(a[i][j]);p=i;q=j;}
  if(largest<1e-13)break;
  const angle=.5*Math.atan2(2*a[p][q],a[q][q]-a[p][p]),c=Math.cos(angle),s=Math.sin(angle),pp=a[p][p],qq=a[q][q],pq=a[p][q];
  for(let k=0;k<n;k++)if(k!==p&&k!==q){const kp=a[k][p],kq=a[k][q];a[k][p]=a[p][k]=c*kp-s*kq;a[k][q]=a[q][k]=s*kp+c*kq;}
  a[p][p]=c*c*pp-2*s*c*pq+s*s*qq;a[q][q]=s*s*pp+2*s*c*pq+c*c*qq;a[p][q]=a[q][p]=0;
 }
 return a.map((row,i)=>row[i]).sort((a,b)=>a-b);
}
export function partialTranspose(rho,subsystem=[1]){
 const n=Math.log2(rho.length),mask=subsystem.reduce((m,i)=>m|(1<<(n-1-i)),0),complement=(rho.length-1)^mask;
 return rho.map((row,i)=>row.map((_,j)=>rho[(i&complement)|(j&mask)][(j&complement)|(i&mask)]));
}
export function negativity(rho,subsystem=[1]){return symmetricEigenvalues(partialTranspose(rho,subsystem)).reduce((s,e)=>s+Math.max(0,-e),0);}
function multiply(a,b){return a.map(row=>b[0].map((_,j)=>row.reduce((s,x,k)=>s+x*b[k][j],0)));}
// J² = sum SWAP_ij + n(4-n)I/4; spectral projectors are low-degree polynomials.
const spinProjectors=new Map();
export function spinLabels(n){return n===3?[.5,1.5]:[0,1,2];}
function projectorsFor(n){
 if(spinProjectors.has(n))return spinProjectors.get(n);
 const d=2**n,jSquared=zeros(d);
 for(let i=0;i<d;i++){jSquared[i][i]+=n*(4-n)/4;for(const [a,b] of allPairs(n))jSquared[i][swapIndex(i,a,b,n)]+=1;}
 const labels=spinLabels(n),eigenvalues=labels.map(j=>j*(j+1));
 const result=eigenvalues.map(e=>{
  let p=Array.from({length:d},(_,i)=>Array.from({length:d},(_,j)=>i===j?1:0));
  for(const f of eigenvalues)if(f!==e)p=multiply(p,jSquared.map((row,i)=>row.map((x,j)=>(x-(i===j?f:0))/(e-f))));
  return p;
 });spinProjectors.set(n,result);return result;
}
export function spinWeights(rho){return projectorsFor(Math.log2(rho.length)).map(p=>Math.max(0,rho.reduce((s,row,i)=>s+row.reduce((t,x,k)=>t+x*p[k][i],0),0)));}
export function stateSummary(rho,subsystem=[1]){
 const spectrum=symmetricEigenvalues(rho);
 return {weights:spinWeights(rho),purity:rho.reduce((s,row)=>s+row.reduce((t,x)=>t+x*x,0),0),entropy:spectrum.reduce((s,p)=>p>1e-13?s-p*Math.log2(p):s,0),negativity:negativity(rho,subsystem),pairProbabilities:allPairs(Math.log2(rho.length)).map(([a,b])=>pairInstrument(rho,a,b).probability)};
}
export const preparationExamples={singlets:[[0,1,'singlet'],[2,3,'singlet']],singletTriplet:[[0,1,'singlet'],[2,3,'triplet']],twoTriplets:[[0,1,'triplet'],[2,3,'triplet']],singletMixed:[[0,1,'singlet']],triplets:[[0,1,'triplet'],[2,3,'triplet'],[1,2,'triplet']]};
export const tripletSweep=preparationExamples.triplets;
