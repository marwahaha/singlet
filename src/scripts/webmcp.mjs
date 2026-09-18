// Progressive enhancement: ordinary browsers use the same visible controls.
export function registerPageTool(tool) {
  const context=document.modelContext;
  if(!context?.registerTool)return;
  const lifecycle=new AbortController();
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
  try {Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}
  catch { /* The site remains fully usable without this proposed browser API. */ }
}
