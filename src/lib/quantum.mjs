// Exact small-system calculations. Complex vectors use [real, imaginary] pairs.
export const pairs = [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];
export function singletProduct() {
  const v = Array.from({length:16},()=>[0,0]);
  for(const [i,x] of [[5,.5],[6,-.5],[9,-.5],[10,.5]]) v[i]=[x,0];
  return v;
}
export function tripletProduct() {
  const v=Array.from({length:16},()=>[0,0]);
  for(const i of [5,6,9,10])v[i]=[.5,0];
  return v;
}
export function symmetricDickeState() {
  const v=Array.from({length:16},()=>[0,0]);
  for(const i of [3,5,6,9,10,12])v[i]=[1/Math.sqrt(6),0];
  return v;
}
export function swap(v,a,b) {
  const n=Math.log2(v.length), mask=(1<<(n-1-a))|(1<<(n-1-b));
  return v.map((_,i)=>v[((i>>(n-1-a))&1)!==((i>>(n-1-b))&1)?i^mask:i].slice());
}
export function project(v,a,b,outcome='singlet') {
  const s=swap(v,a,b), sign=outcome==='singlet'?-1:1;
  const raw=v.map((z,i)=>z.map((x,k)=>(x+sign*s[i][k])/2));
  const probability=raw.reduce((p,z)=>p+z[0]**2+z[1]**2,0);
  return {probability:Math.max(0,Math.min(1,probability)),state:probability>1e-14?raw.map(z=>z.map(x=>x/Math.sqrt(probability))):null};
}
export function singletProbabilities(v) {return pairs.map(([a,b])=>project(v,a,b).probability);}
export function lowSpinState(theta,phi) {
  const a=singletProduct(), b=swap(a,1,2), c=Math.cos(theta/2),s=Math.sin(theta/2);
  return a.map((z,i)=>{const e=(2*b[i][0]-z[0])/Math.sqrt(3);return [c*z[0]+s*Math.cos(phi)*e,s*Math.sin(phi)*e];});
}
export function choose(n,k) {if(k<0||k>n)return 0;let x=1;for(let i=1;i<=k;i++)x=x*(n-i+1)/i;return Math.round(x);}
export function sectors(n) {
  const result=[];
  for(let j2=n%2;j2<=n;j2+=2){const k=(n-j2)/2,multiplicity=choose(n,k)-choose(n,k-1);result.push({j:j2/2,spinDimension:j2+1,multiplicity,dimension:(j2+1)*multiplicity,rows:[(n+j2)/2,k]});}
  return result;
}
export function phase(s) {
  if(s<0)return {label:'In BQP',detail:'This region reduces to EPR. The quantum upper bound is established; classical tractability remains open.',status:'Reduction to EPR',color:'#7f9690'};
  if(s===0)return {label:'EPR ∈ BQP',detail:'Lee–Yang theory gives an efficient quantum ground-energy algorithm. Membership in BPP remains conjectural.',status:'Established quantum upper bound',color:'#778c45'};
  if(s<1)return {label:'StoqMA-complete',detail:'An arbitrarily small positive s enters a different complexity regime.',status:'Proved classification',color:'#315aa8'};
  if(s===1)return {label:'NP-complete',detail:'At this exact point the interaction is classical after a change of basis.',status:'Proved classification',color:'#9a641e'};
  return {label:'QMA-complete',detail:'Past the crossing, the singlet is the unique local ground state.',status:'Proved classification',color:'#b74d2a'};
}
