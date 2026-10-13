export function workspaceHeight(viewportHeight,headerHeight){
 const viewport=Number(viewportHeight),header=Number(headerHeight);
 return Math.max(0,Math.floor((Number.isFinite(viewport)?viewport:0)-(Number.isFinite(header)?Math.max(0,header):0)));
}
export function initWorkspaceSizing(){
 const header=document.querySelector('.site-header');let pending=false;
 function measure(){pending=false;const fallback=window.matchMedia?.('(max-width: 720px)').matches?68:80;const headerHeight=header?.getBoundingClientRect().height||header?.offsetHeight||fallback;const viewport=window.visualViewport?.height||window.innerHeight;document.documentElement.style.setProperty('--site-header-height',headerHeight+'px');document.documentElement.style.setProperty('--workspace-height',workspaceHeight(viewport,headerHeight)+'px')}
 function schedule(){if(pending)return;pending=true;window.requestAnimationFrame(measure)}
 window.addEventListener('resize',schedule,{passive:true});window.addEventListener('orientationchange',schedule,{passive:true});window.visualViewport?.addEventListener('resize',schedule,{passive:true});
 if(window.ResizeObserver&&header)new window.ResizeObserver(schedule).observe(header);
 new window.MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['class']});
 measure();return schedule;
}
