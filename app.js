import {TOOLS} from './data.js';
import {CATEGORIES,ACCESS_LABELS,FEATURED_IDS,COLLECTIONS,filterTools,sortTools,belongsToCollection,readSaved,toggleSaved,escapeHTML as esc} from './engine.js';
import {icon,fillIcons} from './icons.js';

const $=selector=>document.querySelector(selector);
const state={view:'explore',query:'',category:'all',access:'all',noSignup:false,browserOnly:false,collection:null,sort:'recommended',visible:18};
const validIds=new Set(TOOLS.map(t=>t.id));
let storage;
try{storage=window.localStorage}catch{storage={getItem:()=>null,setItem:()=>{throw new Error('Unavailable')}}}
let saved=readSaved(storage,validIds),toastTimer,detailOrigin=null,activeToolId=null;
const toolMap=new Map(TOOLS.map(t=>[t.id,t]));
const categoryMap=new Map(CATEGORIES.map(c=>[c.name,c]));
const specialLogos={
 'chatgpt':{bg:'#e1eee4',ink:'#4b6d51',mark:'✳'},
 'gemini':{bg:'#edf0fa',ink:'#6381ca',svg:'<path d="M12 1c0 7-4 11-11 11 7 0 11 4 11 11 0-7 4-11 11-11C16 12 12 8 12 1Z" fill="currentColor"/>'},
 'claude':{bg:'#f5e9df',ink:'#b98056',mark:'✳'},
 'perplexity':{bg:'#e0eceb',ink:'#557575',svg:'<path d="M7 3v18m10-18v18M3 6h18v12H3zM12 3v18M3 6l9 9 9-9M3 18l9-9 9 9" fill="none" stroke="currentColor" stroke-width="1.2"/>'},
 'upscayl':{bg:'#f1e1d4',ink:'#a97650',svg:'<path d="m4 16 6-6 5 5 5-5M13 4h7v7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'},
 'deepseek':{bg:'#e8edfb',ink:'#5d80b3',mark:'D'},
 'qwen':{bg:'#ede7f8',ink:'#7b5fac',mark:'Q'},
 'canva':{bg:'#e0f3f0',ink:'#4a9d9a',mark:'C'},
 'duck-ai':{bg:'#f7e9de',ink:'#b8764d',mark:'D'},
 'ollama':{bg:'#edf0e9',ink:'#647556',mark:'O'},
 'github-copilot-free':{bg:'#e7edf6',ink:'#6a7ba0',mark:'⌘'},
 'notebooklm':{bg:'#e6edf8',ink:'#667ca2',mark:'N'}
};
const palettes=[['#edf3e5','#70885c'],['#e7edf7','#6d81a6'],['#f4e9e1','#a77e60'],['#eee8f5','#8d76a6'],['#e5efed','#638d85'],['#f4edd9','#9e8f55']];
function logo(tool){
 const code=[...tool.id].reduce((n,c)=>n+c.charCodeAt(0),0),[bg,ink]=palettes[code%palettes.length];
 const spec=specialLogos[tool.id]||{bg,ink,mark:tool.name.replace(/^(Google |Microsoft |Adobe )/,'').replace(/[^a-zA-Z0-9]/g,'').slice(0,1).toUpperCase()};
 return `<span class="tool-logo" style="--logo-bg:${spec.bg};--logo-ink:${spec.ink}" aria-hidden="true">${spec.svg?`<svg viewBox="0 0 24 24" focusable="false">${spec.svg}</svg>`:esc(spec.mark)}</span>`;
}
function card(tool,featured=false){
 const isSaved=saved.has(tool.id);
 return `<article class="tool-card${featured?' featured-card':''}" data-card-id="${tool.id}">${featured?`<div class="featured-label">${icon('sparkles')} A good place to start</div>`:''}<div class="tool-card-top">${logo(tool)}<div class="tool-title-wrap"><h3 class="tool-title"><button data-tool="${tool.id}">${esc(tool.name)}</button></h3><span class="tool-category">${esc(tool.category)}</span></div><button class="save-button${isSaved?' is-saved':''}" data-save="${tool.id}" aria-label="${isSaved?'Remove':'Save'} ${esc(tool.name)}${isSaved?' from saved tools':''}" aria-pressed="${isSaved}">${icon('bookmark')}</button></div><p class="tool-description">${esc(tool.description)}</p><div class="tool-tags">${tool.tags.slice(0,3).map(tag=>`<span class="tool-tag">${esc(tag)}</span>`).join('')}</div><div class="tool-card-footer"><span class="access-badge ${tool.access}">${ACCESS_LABELS[tool.access]}</span><button class="card-details" data-tool="${tool.id}">View tool ${icon('arrow-up-right')}</button></div></article>`;
}
function filters(){return {...state,savedOnly:state.view==='saved',savedIds:saved}}
function syncURL(){
 const params=new URLSearchParams();
 if(state.view!=='explore')params.set('view',state.view);
 if(state.query)params.set('q',state.query);
 if(state.category!=='all')params.set('category',state.category);
 if(state.access!=='all')params.set('access',state.access);
 if(state.collection)params.set('collection',state.collection);
 if(state.noSignup)params.set('signup','none');
 if(state.browserOnly)params.set('platform','browser');
 if(state.sort!=='recommended')params.set('sort',state.sort);
 if(activeToolId)params.set('tool',activeToolId);
 history.replaceState(history.state,'',`${location.pathname}${params.size?'?'+params.toString():''}${location.hash}`);
}
function renderCategories(){
 const base=TOOLS.filter(t=>state.view!=='saved'||saved.has(t.id));
 const buttons=[{name:'All tools',value:'all',icon:'grid',count:base.length},...CATEGORIES.map(c=>({...c,value:c.name,count:base.filter(t=>t.category===c.name).length}))];
 $('#categories').innerHTML=buttons.map(c=>`<button class="category-button${state.category===c.value?' active':''}" data-category="${esc(c.value)}" aria-pressed="${state.category===c.value}"><span data-icon="${c.icon}">${icon(c.icon)}</span>${esc(c.name)}<span class="category-count">${c.count}</span></button>`).join('');
}
function renderCollections(){
 $('#collection-grid').innerHTML=COLLECTIONS.map(c=>`<button class="collection-card" data-collection="${c.id}"><span data-icon="${c.icon}">${icon(c.icon)}</span><span class="collection-arrow">${icon('arrow-up-right')}</span><h3>${esc(c.name)}</h3><p>${esc(c.description)}</p><small>${TOOLS.filter(t=>belongsToCollection(t,c)).length} free tools to explore</small></button>`).join('');
}
function renderActiveFilters(){
 const chips=[];
 if(state.category!=='all')chips.push(['category',state.category]);
 if(state.collection)chips.push(['collection',COLLECTIONS.find(c=>c.id===state.collection).name]);
 if(state.noSignup)chips.push(['noSignup','No signup needed']);
 if(state.browserOnly)chips.push(['browserOnly','Works in a browser']);
 const box=$('#active-filters');box.classList.toggle('hidden',!chips.length);
 box.innerHTML=chips.map(([key,label])=>`<button class="filter-chip" data-remove-filter="${key}" aria-label="Remove ${esc(label)} filter">${esc(label)}${icon('x')}</button>`).join('');
}
function render(){
 const explore=state.view==='explore';
 $('#hero').classList.toggle('hidden',!explore);
 $('.trust-strip').classList.toggle('hidden',!explore);
 $('#starter-section').classList.toggle('hidden',!explore);
 $('#collection-section').classList.toggle('hidden',state.view!=='collections');
 $('#bottom-section').classList.toggle('hidden',state.view==='saved');
 document.querySelectorAll('.nav-link').forEach(el=>{el.classList.toggle('active',el.dataset.view===state.view);el.setAttribute('aria-pressed',String(el.dataset.view===state.view))});
 $('#saved-count').textContent=saved.size;
 $('#tool-total').textContent=TOOLS.length;
 $('#category-total').textContent=CATEGORIES.filter(c=>TOOLS.some(t=>t.category===c.name)).length;
 if($('#directory-query').value!==state.query)$('#directory-query').value=state.query;
 if($('#hero-query').value!==state.query)$('#hero-query').value=state.query;
 $('#clear-query').classList.toggle('hidden',!state.query);
 $('#no-signup').checked=state.noSignup;$('#browser-only').checked=state.browserOnly;$('#sort').value=state.sort;
 document.querySelectorAll('[data-access]').forEach(b=>{const active=b.dataset.access===state.access;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
 const currentCollection=COLLECTIONS.find(c=>c.id===state.collection);
 $('#directory-title').textContent=state.view==='saved'?'Your shelf of favorites.':currentCollection?currentCollection.name:'Find your next favorite tool.';
 $('#directory-kicker').textContent=state.view==='saved'?'SAVED FOR YOUR NEXT GREAT IDEA.':currentCollection?'YOUR STARTING POINT. YOUR NEXT POSSIBILITY.':'LESS SEARCHING. MORE MAKING.';
 $('#directory-intro').textContent=state.view==='saved'?'Your bookmarked tools, saved on this browser.':currentCollection?currentCollection.description:'Explore the collection, one good idea at a time.';
 renderCategories();renderActiveFilters();
 const matches=sortTools(filterTools(TOOLS,filters()),state.sort),shown=matches.slice(0,state.visible);
 $('#tools-grid').innerHTML=shown.map(t=>card(t)).join('');
 $('#empty-state').classList.toggle('hidden',matches.length>0);
 $('#result-count').innerHTML=`<strong>${matches.length}</strong> ${matches.length===1?'tool':'tools'}${state.view==='saved'?' on your shelf':''}${state.query?` matching “${esc(state.query)}”`:''}`;
 const filtered=state.query||state.category!=='all'||state.access!=='all'||state.noSignup||state.browserOnly||state.collection;
 $('#reset-filters').classList.toggle('hidden',!filtered);
 const noSaved=state.view==='saved'&&!saved.size;
 $('#empty-title').textContent=noSaved?'Your shelf is ready for its first tool.':'A fresh search might help.';
 $('#empty-text').textContent=noSaved?'Tap the bookmark on any tool to save it here for later.':'Try a different keyword or remove a filter to see more tools.';
 $('#empty-state .primary-button').dataset.action=noSaved?'browse':'reset';
 $('#empty-state .primary-button').innerHTML=`${noSaved?'Discover free tools':'Reset filters'} ${icon('arrow-right')}`;
 $('#load-more').classList.toggle('hidden',shown.length>=matches.length);
 $('#load-more').innerHTML=`Show ${Math.min(18,matches.length-shown.length)} more tools ${icon('plus')}`;
 $('#showing-count').textContent=matches.length?`Showing ${shown.length} of ${matches.length} free tools`:'';
 const featured=FEATURED_IDS.map(id=>toolMap.get(id)).filter(Boolean);
 $('#featured-grid').innerHTML=featured.map(t=>card(t,true)).join('');
 syncURL();
}
function scrollDirectory(){requestAnimationFrame(()=>$('#directory').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}))}
function resetFilters(){Object.assign(state,{query:'',category:'all',access:'all',noSignup:false,browserOnly:false,collection:null,sort:'recommended',visible:18})}
function setView(view,scroll=true){state.view=['explore','saved','collections'].includes(view)?view:'explore';resetFilters();render();if(scroll){if(view==='collections')$('#collection-section').scrollIntoView({behavior:'smooth'});else if(view==='explore')window.scrollTo({top:0,behavior:'smooth'});else scrollDirectory()}}
function announce(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2700)}
function saveTool(id){
 if(!validIds.has(id))return;
 const inDetail=$('#tool-dialog').open,fromFeatured=!!document.activeElement?.closest('.featured-card');
 const wasSaved=saved.has(id);saved=toggleSaved(saved,id);
 let persisted=true;try{storage.setItem('freeaiharbor-saved-v1',JSON.stringify([...saved]))}catch{persisted=false}
 render();if(inDetail){renderDetail(toolMap.get(activeToolId));$('#tool-dialog .detail-save')?.focus({preventScroll:true})}
 else{const parent=fromFeatured?$('#featured-grid'):$('#tools-grid');(parent.querySelector(`[data-save="${id}"]`)||$('#directory-query')).focus({preventScroll:true})}
 announce(persisted?(wasSaved?'Removed from your saved tools.':'Added to your shelf.'):"Saved for this visit. This browser isn’t allowing storage.");
}
function signupText(tool){return tool.signup==='none'?'No signup needed':tool.signup==='optional'?'Optional for basic use':'Account required'}
function platformText(tool){return tool.access==='open-source'?'Local installation / self-hosted':tool.platform==='browser'?'Web browser':tool.platform==='desktop'?'Desktop application':'Web / app access'}
function renderDetail(tool){
 if(!tool)return;
 const isSaved=saved.has(tool.id),date=new Intl.DateTimeFormat('en',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(tool.verifiedOn+'T12:00:00Z'));
 $('#tool-dialog-content').innerHTML=`<button class="dialog-close" data-close="tool-dialog" aria-label="Close tool details">${icon('x')}</button><div class="detail-header">${logo(tool)}<div><h2 id="tool-dialog-title">${esc(tool.name)}</h2><span class="tool-category">${esc(tool.category)}</span></div></div><p class="detail-description">${esc(tool.description)}</p><div class="tool-tags detail-tags">${tool.tags.map(tag=>`<span class="tool-tag">${esc(tag)}</span>`).join('')}</div><div class="detail-grid"><div><span class="detail-label">FREE ACCESS</span><span class="access-badge ${tool.access}">${ACCESS_LABELS[tool.access]}</span></div><div><span class="detail-label">ACCOUNT</span><span class="detail-value">${signupText(tool)}</span></div><div><span class="detail-label">WHERE IT RUNS</span><span class="detail-value">${platformText(tool)}</span></div><div><span class="detail-label">GET STARTED</span><span class="detail-value">${tool.access==='open-source'?'Follow the official installation guide':'Use the free option on the official site'}</span></div></div><div class="detail-limit"><span class="detail-label">WHAT TO KNOW</span><p>${esc(tool.limitations)}</p></div><div class="source-row"><a href="${esc(tool.sourceUrl)}" target="_blank" rel="noopener noreferrer">${icon('shield-check')} Official free-access source ${icon('arrow-up-right')}</a><span>Reviewed ${date}</span></div><div class="detail-actions"><a class="primary-button" href="${esc(tool.url)}" target="_blank" rel="noopener noreferrer">${tool.access==='open-source'?'Get the free software':'Visit official website'} ${icon('arrow-up-right')}</a><button class="secondary-button detail-save" data-save="${tool.id}" aria-pressed="${isSaved}">${icon('bookmark')} ${isSaved?'Saved to your shelf':'Save this tool'}</button><button class="detail-share" data-share="${tool.id}" aria-label="Copy link to ${esc(tool.name)}">${icon('share')}</button></div><p class="detail-disclaimer">${tool.access==='open-source'?'Free software uses your own hardware. Hosted options or paid API providers may cost extra. Model licenses vary.':'Use the tool’s free features. Some advanced features may be paid, and regional availability can vary.'}</p>`;
}
function showTool(id,push=true){
 const tool=toolMap.get(id);if(!tool)return;
 activeToolId=id;detailOrigin=document.activeElement;renderDetail(tool);
 const params=new URLSearchParams(location.search);params.set('tool',id);
 if(push)history.pushState({freeaiharborTool:true},'',`${location.pathname}?${params.toString()}`);
 else history.replaceState(history.state,'',`${location.pathname}?${params.toString()}`);
 if(!$('#tool-dialog').open)$('#tool-dialog').showModal();
}
function closeDetailURL(){
 activeToolId=null;
 const params=new URLSearchParams(location.search);
 if(params.has('tool')){params.delete('tool');history.replaceState(null,'',`${location.pathname}${params.size?'?'+params.toString():''}`)}
 if(detailOrigin?.isConnected)detailOrigin.focus();
}
async function copyLink(id){
 const url=new URL(location.href);url.search='';url.hash='';url.searchParams.set('tool',id);
 try{await navigator.clipboard.writeText(url.href);announce('Tool link copied.')}catch{
 const input=document.createElement('textarea');input.value=url.href;input.setAttribute('aria-label','Tool link');input.style.cssText='position:fixed;top:0;left:0;opacity:0';document.body.append(input);input.select();
 try{if(!document.execCommand('copy'))throw new Error('Copy blocked');announce('Tool link copied.')}catch{announce('Copy the link from your browser’s address bar.')}input.remove();
 }
}
function readURL(){
 const p=new URLSearchParams(location.search);resetFilters();
 state.view=['saved','collections'].includes(p.get('view'))?p.get('view'):'explore';
 state.query=p.get('q')||'';
 state.category=categoryMap.has(p.get('category'))?p.get('category'):'all';
 state.access=Object.hasOwn(ACCESS_LABELS,p.get('access'))?p.get('access'):'all';
 state.collection=COLLECTIONS.some(c=>c.id===p.get('collection'))?p.get('collection'):null;
 if(state.collection)state.view='collections';
 state.noSignup=p.get('signup')==='none';state.browserOnly=p.get('platform')==='browser';
 state.sort=['az','za'].includes(p.get('sort'))?p.get('sort'):'recommended';
 return p.get('tool');
}

document.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button)return;
 if(button.dataset.save){saveTool(button.dataset.save);return}
 if(button.dataset.tool){showTool(button.dataset.tool);return}
 if(button.dataset.share){copyLink(button.dataset.share);return}
 if(button.dataset.close){$('#'+button.dataset.close).close();return}
 if(button.dataset.view){setView(button.dataset.view);return}
 if(button.dataset.collection){resetFilters();state.view='collections';state.collection=button.dataset.collection;render();scrollDirectory();return}
 if(button.dataset.category){
 const heroClick=!!button.closest('#hero');if(heroClick){resetFilters();state.view='explore'}
 state.category=button.dataset.category;state.visible=18;render();if(heroClick)scrollDirectory();return;
 }
 if(button.dataset.search){resetFilters();state.view='explore';state.query=button.dataset.search;render();scrollDirectory();return}
 if(button.dataset.access){state.access=button.dataset.access;state.visible=18;render();return}
 if(button.dataset.removeFilter){const key=button.dataset.removeFilter;state[key]=key==='category'?'all':key==='collection'?null:false;state.visible=18;render();return}
 if(button.dataset.action==='browse'){setView('explore',false);scrollDirectory();return}
 if(button.dataset.action==='policy'){$('#policy-dialog').showModal();return}
 if(button.dataset.action==='reset'){resetFilters();render();return}
});
$('#hero-search').addEventListener('submit',event=>{event.preventDefault();const value=$('#hero-query').value;resetFilters();state.view='explore';state.query=value;render();scrollDirectory()});
$('#directory-query').addEventListener('input',event=>{state.query=event.target.value;state.visible=18;render()});
$('#clear-query').addEventListener('click',()=>{state.query='';state.visible=18;render();$('#directory-query').focus()});
$('#sort').addEventListener('change',event=>{state.sort=event.target.value;state.visible=18;render()});
$('#no-signup').addEventListener('change',event=>{state.noSignup=event.target.checked;state.visible=18;render()});
$('#browser-only').addEventListener('change',event=>{state.browserOnly=event.target.checked;state.visible=18;render()});
$('#load-more').addEventListener('click',()=>{const oldVisible=state.visible;state.visible+=18;render();const nextCard=$('#tools-grid').children[oldVisible];nextCard?.querySelector('[data-tool]')?.focus({preventScroll:true})});
for(const id of ['tool-dialog','policy-dialog']){const dialog=$('#'+id);dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close()}});dialog.addEventListener('close',()=>{if(id==='tool-dialog')closeDetailURL()})}
window.addEventListener('popstate',()=>{const target=readURL();activeToolId=validIds.has(target)?target:null;render();if(activeToolId)showTool(activeToolId,false);else if($('#tool-dialog').open)$('#tool-dialog').close()});
window.addEventListener('storage',event=>{if(event.key==='freeaiharbor-saved-v1'){saved=readSaved(storage,validIds);render();if($('#tool-dialog').open)renderDetail(toolMap.get(activeToolId))}});
fillIcons();renderCollections();
const initialTool=readURL();activeToolId=validIds.has(initialTool)?initialTool:null;render();if(activeToolId)showTool(activeToolId,false);
if(state.query||state.category!=='all'||state.view==='saved')scrollDirectory();
