export function couplingPaths(n=8, target=0) {
  const out=[];
  function walk(path){if(path.length===n+1){if(path.at(-1)===target)out.push(path);return;}
    const j=path.at(-1);for(const next of [j+1,j-1])if(next>=0&&Math.abs(next-target)<=n-path.length)walk([...path,next]);}
  walk([0]);return out;
}
export function pathCurve(path,width=560,height=360,pad=40){
 const n=path.length-1,max=Math.max(n/2,2),pts=path.map((j,i)=>[pad+i*(width-2*pad)/n,height-pad-j*(height-2*pad)/max]);
 return pts.map(([x,y],i)=>i===0?`M${x},${y}`:`C${(pts[i-1][0]+x)/2},${pts[i-1][1]} ${(pts[i-1][0]+x)/2},${y} ${x},${y}`).join(' ');
}
