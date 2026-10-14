import {LAB_TOOLS,LAB_CATEGORIES,MODELS,TRANSLATIONS,REVERSE_TRANSLATIONS,FEATURED_LAB,findTools,modelInfo,escapeHTML as esc,toSRT,encodeWAV} from './lab-tools.js';
import {applyPhotoEnhancement,generateLogos,generatePrompts} from './tool-generators.js';
import {labelsFrom,passages,sentencesFrom} from './semantic-tools.js';
import {icon,fillIcons} from './icons.js';
import {createChatUI} from './chat-ui.js';
import {createModuleUI} from './module-ui.js';
import {toolSymbol,toolVisual,identityStyle} from './tool-identity.js';
import {providerFor,accessLabel} from './cloud-tools.js';
import {createCloudUI} from './cloud-ui.js';
import {initWorkspaceSizing} from './workspace-fit.js';
import {readStoredValue} from './browser-storage.js';
const $=s=>document.querySelector(s);
const byId=new Map(LAB_TOOLS.map(t=>[t.id,t]));
let saved=new Set();try{saved=new Set(JSON.parse(readStoredValue(localStorage,'freeaiharbor-lab-saved-v1','openshelf-lab-saved-v1')||'[]').filter(id=>byId.has(id)))}catch{}
const state={view:'all',query:'',category:'All tools',access:'all',sort:'suggested'};
let active=null,worker=null,ocrWorker=null,running=false,job=0,result=null,lastText='',inputFile=null,inputPreviewURL=null,resultURL=null,toastTimer,chatHistory=[],preparedImage=null;
const inputDrafts=new Map();
let chatUI=null,moduleUI=null,cloudUI=null;
function card(t,featured=false){const m=modelInfo(t),p=t.provider?providerFor(t):null;return `<article class="tool-card lab-card identity-card${t.provider?' cloud-card':''}${featured?' featured-card':''}" data-card="${t.id}" style="${identityStyle(t)}">${toolVisual(t)}<div class="identity-card-body">${featured?`<div class="featured-label">${icon('sparkles')} A good place to start</div>`:''}<div class="tool-card-top"><div class="tool-title-wrap"><h3 class="tool-title"><button data-open="${t.id}">${esc(t.name)}</button></h3><span class="tool-category">${esc(t.category)}</span></div><button class="save-button${saved.has(t.id)?' is-saved':''}" data-save="${t.id}" aria-pressed="${saved.has(t.id)}" aria-label="${saved.has(t.id)?'Unsave':'Save'} ${esc(t.name)}">${icon('bookmark')}</button></div><p class="tool-description">${esc(t.description)}</p><p class="download-size">${icon(p?'shield-check':'monitor')} ${p?esc(p.allowance)+' · '+esc(p.cadence):'First download: ~'+esc(m.size)}</p>${p?`<p class="provider-caption">${esc(p.name)} · Your API key needed</p>`:''}<div class="tool-card-footer"><span class="access-badge ${p?t.access:'free'}">${esc(accessLabel(t))}</span><button class="card-details" data-open="${t.id}">Use tool ${icon('arrow-right')}</button></div></div></article>`}
function render(){
 $('#saved-count').textContent=saved.size;$('#tool-total').textContent=LAB_TOOLS.length;$('#category-total').textContent=LAB_CATEGORIES.length-1;
 cloudUI?.saved();if(active&&$('#discovery').classList.contains('hidden')){$('#workspace-save').setAttribute('aria-pressed',String(saved.has(active.id)));$('#workspace-save').innerHTML=`${icon('bookmark')} ${saved.has(active.id)?'Saved':'Save tool'}`;return}
 $('#directory-title').textContent=state.view==='saved'?'Your personal AI toolkit.':'Your next tool is right here.';
 $('#directory-intro').textContent=state.view==='saved'?'Your saved tools, ready to use right here.':'Choose a tool and use it inside your Free AI Harbor workspace.';
 document.querySelectorAll('.nav-link[data-view]').forEach(b=>{const selected=b.dataset.view===state.view;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected))});
 const base=state.view==='saved'?LAB_TOOLS.filter(t=>saved.has(t.id)):LAB_TOOLS;
 $('#categories').innerHTML=LAB_CATEGORIES.map(c=>`<button class="category-button${state.category===c.name?' active':''}" data-category="${esc(c.name)}" aria-pressed="${state.category===c.name}"${c.name==='All tools'?'':` style="${identityStyle({category:c.name})}"`}><span class="category-identity">${icon(c.icon)}</span>${esc(c.name)}<span class="category-count">${c.name==='All tools'?base.length:base.filter(t=>t.category===c.name).length}</span></button>`).join('');
 $('#access-filters').innerHTML=[['all','All access'],['local-free','On-device free'],['free-api','Free API'],['free-credits','Free credits']].map(([value,label])=>`<button type="button" data-access="${value}" aria-pressed="${state.access===value}">${label}<span>${base.filter(t=>value==='all'||(value==='local-free'?!t.provider:t.access===value)).length}</span></button>`).join('');
 const found=findTools({...state,savedOnly:state.view==='saved',saved});if(state.sort==='az')found.sort((a,b)=>a.name.localeCompare(b.name));
 $('#tools-grid').innerHTML=found.map(t=>card(t)).join('');$('#featured-grid').innerHTML=FEATURED_LAB.map(id=>card(byId.get(id),true)).join('');
 $('#result-count').textContent=`${found.length} ${found.length===1?'tool':'tools'}${state.query?' matching “'+state.query+'”':''}`;
 $('#directory-query').value=state.query;$('#hero-query').value=state.query;$('#clear-query').classList.toggle('hidden',!state.query);$('#sort').value=state.sort;
 $('#reset-filters').classList.toggle('hidden',!state.query&&state.category==='All tools'&&state.access==='all'&&state.view==='all');
 $('#empty-state').classList.toggle('hidden',found.length>0);$('#empty-title').textContent=state.view==='saved'&&!saved.size?'Your toolkit is ready for its first tool.':'Try another search.';$('#empty-text').textContent=state.view==='saved'&&!saved.size?'Tap a tool’s bookmark to keep it here.':'A different keyword or category might help.';
 $('#starter-section').classList.toggle('hidden',state.view==='saved');
 if(active){$('#workspace-save').setAttribute('aria-pressed',String(saved.has(active.id)));$('#workspace-save').innerHTML=`${icon('bookmark')} ${saved.has(active.id)?'Saved':'Save tool'}`}
}
function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3000)}
function toggleSaved(id){if(!byId.has(id))return;if(saved.has(id))saved.delete(id);else saved.add(id);try{localStorage.setItem('freeaiharbor-lab-saved-v1',JSON.stringify([...saved]));toast(saved.has(id)?'Saved to your toolkit.':'Removed from your toolkit.')}catch{toast('Saved for this visit. Browser storage is unavailable.')}render()}
function reduced(){return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches}
function scrollTo(el){el.scrollIntoView({behavior:reduced()?'instant':'smooth',block:'start'})}
function updateURL(id,push=true){const u=new URL(location.href);u.search='';u.hash='';if(id)u.searchParams.set('tool',id);else if(state.view==='saved')u.searchParams.set('view','saved');history[push?'pushState':'replaceState']({tool:id||null},'',u.pathname+u.search)}
function clearURLs(){if(inputPreviewURL){URL.revokeObjectURL(inputPreviewURL);inputPreviewURL=null}if(resultURL){URL.revokeObjectURL(resultURL);resultURL=null}}
function resetOutput(){result=null;lastText='';$('#output-content').innerHTML=`<div class="output-placeholder">${icon('sparkles')}<h3>A little possibility awaits.</h3><p>Add your input and run the tool. Your result will appear here.</p></div>`;$('#output-actions').classList.add('hidden');$('#copy-output').disabled=false;$('#download-output').disabled=false;moduleUI?.empty()}
function warning(message){$('#input-warning').textContent=message;$('#input-warning').classList.toggle('hidden',!message)}
function showControls(t){
 let html='';
 if(['text','qa'].includes(t.kind)){
  if(t.kind==='qa')html+=`<label class="field-label" for="question-input">Your question</label><input class="tool-input" id="question-input" type="text" maxlength="250" placeholder="What do you want to find in the passage?" required>`;
  if(t.shape==='search')html+=`<label class="field-label" for="question-input">Your search query</label><input class="tool-input" id="question-input" type="text" maxlength="250" placeholder="What do you want to find?" required>`;
  html+=`<label class="field-label" for="text-input">${t.kind==='qa'?'Your source passage':t.shape==='pair'?'First passage':t.shape==='search'||t.shape==='duplicates'?'Your passages · one per line':t.id==='ai-chat'?'Your message':'Your text or brief'}</label><textarea id="text-input" class="tool-textarea" maxlength="${t.limit}" placeholder="${esc(t.placeholder)}" required></textarea><p id="character-count" class="character-count">0 / ${t.limit.toLocaleString()} characters</p>`;
  if(t.shape==='pair')html+=`<label class="field-label" for="secondary-input">Second passage</label><textarea id="secondary-input" class="tool-textarea secondary-textarea" maxlength="${t.secondaryLimit}" placeholder="${esc(t.secondaryPlaceholder)}" required></textarea>`;
  if(t.model==='chat'&&t.id!=='ai-chat'&&t.mode!=='flashcards')html+='<div class="options-row"><label for="tone-select">Tone<select id="tone-select"><option>Natural</option><option>Professional</option><option>Friendly</option><option>Concise</option></select></label></div>';
  if(t.model==='translation')html+=`<div class="options-row"><label for="target-language">${t.reverse?'From (to English)':'English to'}<select id="target-language">${Object.entries(t.reverse?REVERSE_TRANSLATIONS:TRANSLATIONS).map(([id,x])=>`<option value="${id}">${x.name}</option>`).join('')}</select></label></div>`;
 }else{
  const image=t.kind==='image';html+=`<label class="file-upload" id="drop-zone"><span data-icon="${image?'image':'audio'}">${icon(image?'image':'audio')}</span><strong>${image?'Choose an image':'Choose an audio recording'}</strong><small>${image?'JPG, PNG, WebP, or BMP · up to 15 MB':`WAV, MP3, M4A, OGG · up to ${t.maxDuration===10?'10 seconds':'2 minutes'}`}</small><input id="file-input" type="file" accept="${image?'image/jpeg,image/png,image/webp,image/bmp':'audio/*'}" required></label><div id="input-preview" class="input-preview hidden"></div><p id="file-caption" class="file-caption"></p>`;
  if(t.model==='speech')html+=`<div class="options-row"><label for="audio-language">${t.speechTask==='translate'?'Spoken language':'Language'}<select id="audio-language">${t.after==='summary'?'<option value="english">English</option>':'<option value="auto">Auto detect</option><option value="english">English</option><option value="urdu">Urdu</option><option value="french">French</option><option value="spanish">Spanish</option><option value="german">German</option><option value="arabic">Arabic</option>'}</select></label></div>`;
  if(t.model==='ocr')html+=`<div class="options-row"><label for="ocr-language">Text language<select id="ocr-language"><option value="eng">English</option>${t.after==='summary'?'':'<option value="urd">Urdu</option><option value="ara">Arabic</option><option value="fra">French</option><option value="spa">Spanish</option>'}</select></label></div>`;
 }
 if(t.shape==='labels')html+=`<label class="field-label extra-field" for="labels-input">Your labels · separated by commas</label><textarea class="tool-textarea labels-textarea" id="labels-input" maxlength="650" placeholder="${esc(t.labelsExample)}" required aria-describedby="labels-hint"></textarea><p id="labels-hint" class="result-note">Choose 2–8 short ${t.kind==='image'?'image descriptions':'topic labels'} to compare.</p>`;
 if(t.note&&(['image','audio'].includes(t.kind)||t.model==='voice'))html+=`<p class="tool-input-hint">${esc(t.note)}</p>`;
 $('#input-controls').innerHTML=html;$('#use-example').classList.toggle('hidden',!['text','qa'].includes(t.kind));
 if($('#text-input')){$('#text-input').value=inputDrafts.get(t.id)||'';$('#text-input').addEventListener('input',()=>{$('#character-count').textContent=`${$('#text-input').value.length} / ${t.limit.toLocaleString()} characters`;inputDrafts.set(t.id,$('#text-input').value)});$('#text-input').dispatchEvent(new Event('input'))}
 if($('#file-input')){
  $('#file-input').addEventListener('change',()=>selectFile($('#file-input').files[0]));
  const drop=$('#drop-zone');drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('dragging')});drop.addEventListener('dragleave',()=>drop.classList.remove('dragging'));drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('dragging');const f=e.dataTransfer.files[0];if(f){selectFile(f);try{const dt=new DataTransfer();dt.items.add(f);$('#file-input').files=dt.files}catch{}}});
 }
}
function openTool(id,push=true){
 const t=byId.get(id);if(!t)return;const preferredChat=id==='ai-chat'?new URLSearchParams(location.search).get('chat'):null;if(running)cancel();moduleUI?.hide();chatUI?.hide();cloudUI?.hide();if(id==='ai-chat'){worker?.terminate();worker=null}clearURLs();inputFile=null;preparedImage=null;chatHistory=[];active=t;
 $('#discovery').classList.add('hidden');$('#workspace').classList.remove('hidden');
 $('#workspace-title').textContent=t.name;$('#workspace-title').title=t.name;$('#workspace-category').textContent=t.category;$('#workspace-description').textContent=t.description;$('#workspace-icon').innerHTML=toolSymbol(t);$('#workspace-icon').style.cssText=identityStyle(t);$('#workspace-icon').classList.add('tool-identity-badge');$('#chat-layout').style.cssText=identityStyle(t);
 if(t.provider){cloudUI.show(t);render();updateURL(id,push);document.title=t.name+' — Free AI Harbor';window.scrollTo({top:0,behavior:'instant'});return}
 showControls(t);if(id!=='ai-chat')moduleUI.open(t);resetOutput();warning('');const m=modelInfo(t);$('#model-label').textContent=`${m.label} · free local AI`;$('#model-download').textContent=`First run downloads approximately ${m.size} of model files, plus the runtime. Later runs may use cached files.`;
 $('#tool-specific-note').textContent=t.note||(t.model==='chat'?'Uses a small language model. English works best; answers may be simple or incomplete. No live web search.':t.model==='summary'?'Best on short English passages. Very long inputs may be shortened to fit the model’s context.':'Use short English text for the most reliable results.');
 $('#related-tools').innerHTML=LAB_TOOLS.filter(x=>x.category===t.category&&x.id!==t.id).slice(0,4).map(x=>`<button class="related-button" data-open="${x.id}">${icon(x.icon)}${esc(x.name)} ${icon('arrow-right')}</button>`).join('');
 render();updateURL(id,push);if(id==='ai-chat'){chatUI.show(preferredChat);window.scrollTo({top:0,behavior:'instant'})}else scrollTo($('#workspace'));document.title=t.name+' — Free AI Harbor';
}
function back(push=true){if(running)cancel();moduleUI?.hide();chatUI?.hide();cloudUI?.hide();clearURLs();active=null;inputFile=null;preparedImage=null;$('#workspace').classList.add('hidden');$('#discovery').classList.remove('hidden');render();updateURL(null,push);document.title='150+ Free AI Tools. All in One Place. — Free AI Harbor';scrollTo($('#directory'))}
function setView(view){state.view=view;state.category='All tools';state.access='all';state.query='';if(active)back(false);render();updateURL(null);scrollTo($('#directory'))}
function selectFile(file){
 if(running)return;warning('');inputFile=null;preparedImage=null;clearURLs();$('#input-preview').innerHTML='';$('#input-preview').classList.add('hidden');$('#file-caption').textContent='';$('#file-input').required=true;moduleUI?.clearFile();resetOutput();if(!file)return;
 const image=active.kind==='image';if(image&&!/^image\/(jpeg|png|webp|bmp)$/.test(file.type)){warning('Please choose a JPG, PNG, WebP, or BMP image.');$('#file-input').value='';return}
 if(image&&file.size>15*1024*1024||!image&&file.size>40*1024*1024){warning(image?'Please choose an image under 15 MB.':'Please choose an audio file under 40 MB.');$('#file-input').value='';return}
 inputFile=file;$('#file-input').required=false;if(inputPreviewURL)URL.revokeObjectURL(inputPreviewURL);inputPreviewURL=URL.createObjectURL(file);
 $('#input-preview').classList.remove('hidden');$('#input-preview').innerHTML=image?`<img alt="Your selected image" src="${inputPreviewURL}">`:`<audio controls src="${inputPreviewURL}"></audio>`;$('#file-caption').textContent=`${file.name} · ${(file.size/1024/1024).toFixed(2)} MB · processed on your device`;
 $('#file-caption').title=$('#file-caption').textContent;resetOutput();moduleUI.fileSelected(file,inputPreviewURL);
}
function setRunning(value){running=value;$('#run-tool').disabled=value;$('#run-tool').setAttribute('aria-busy',String(value));$('#run-tool').innerHTML=value?'Processing…':`Run AI ${icon('arrow-right')}`;$('#stop-tool').classList.toggle('hidden',!value);$('#run-progress').classList.toggle('hidden',!value);$('#use-example').disabled=value;$('#clear-tool').disabled=value;moduleUI?.setBusy(value)}
function progress(message,percent){$('#progress-message').textContent=message;if(percent===undefined){$('#progress-bar').removeAttribute('value');$('#progress-percent').textContent=''}else{$('#progress-bar').value=percent;$('#progress-percent').textContent=percent+'%'}}
function cancel(){job++;worker?.terminate();worker=null;ocrWorker?.terminate().catch(()=>{});ocrWorker=null;setRunning(false);toast('Processing stopped.');if(result)showResult(result,job).catch(()=>{});else resetOutput()}
function aiWorker(){
 if(!worker){worker=new Worker('/ai-worker.js',{type:'module'});worker.onmessage=async e=>{
  const data=e.data;if(data.id!==job||!active)return;
  if(data.type==='status')progress(data.message);
  if(data.type==='progress')progress(data.message,data.progress);
  if(data.type==='partial'){$('#output-content').innerHTML=`<p class="result-text">${esc(data.text)}</p>`}
  if(data.type==='error')failure(data.message);
  if(data.type==='result'){try{await showResult(data.result,data.id);if(data.id===job)setRunning(false)}catch(error){if(data.id===job)failure(error.message)}}
 };worker.onerror=()=>failure('The browser AI runtime could not start. Try a current desktop browser, then run the tool again.')}
 return worker;
}
function failure(detail){setRunning(false);moduleUI?.fail();worker?.terminate();worker=null;const lower=String(detail).toLowerCase();let message=detail;if(/fetch|network|download|404|load model|unauthorized/.test(lower))message='The model download could not finish. Check your internet connection and available browser storage, then try again.';else if(/memory|allocation|out of bounds/.test(lower))message='This device ran out of available memory. Close other tabs and try again on a desktop browser.';$('#output-content').innerHTML=`<div class="result-error"><h3>This run couldn’t finish.</h3><p>${esc(message)}</p></div>`;$('#output-actions').classList.add('hidden');warning(message);result=null}
async function imageBlob(){const bitmap=await createImageBitmap(inputFile);const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();preparedImage=canvas;const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('The selected image could not be decoded.');if(scale<1)$('#file-caption').textContent+=' · resized to 1600px for browser processing';return blob}
async function audioSamples(maxDuration=120){
 const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)throw new Error('This browser does not support audio decoding.');const ctx=new AudioCtx();let decoded;try{decoded=await ctx.decodeAudioData(await inputFile.arrayBuffer())}finally{await ctx.close()}
 if(decoded.duration>maxDuration)throw new Error(`Please use a recording up to ${maxDuration===10?'10 seconds':'2 minutes'} long. Trim a longer recording before using this tool.`);
 const offline=new OfflineAudioContext(1,Math.ceil(decoded.duration*16000),16000),source=offline.createBufferSource();source.buffer=decoded;source.connect(offline.destination);source.start();const rendered=await offline.startRendering();return {audio:rendered.getChannelData(0),duration:decoded.duration};
}
async function runOCR(currentJob){
 if(!window.Tesseract)throw new Error('The OCR library did not load. Refresh this page and try again.');if(ocrWorker)await ocrWorker.terminate();
 const t=active,file=inputFile;
 const localWorker=await window.Tesseract.createWorker($('#ocr-language').value,1,{workerPath:'/vendor/tesseract/worker.min.js',corePath:'https://cdn.jsdelivr.net/npm/tesseract.js-core@6.0.0',logger:p=>{if(job===currentJob)progress(p.status,Number.isFinite(p.progress)?Math.round(p.progress*100):undefined)}});
 if(job!==currentJob){await localWorker.terminate();return}ocrWorker=localWorker;
 let out;try{out=await localWorker.recognize(file)}finally{await localWorker.terminate().catch(()=>{});if(ocrWorker===localWorker)ocrWorker=null}
 if(job!==currentJob)return;
 if(t.after==='summary'){progress('Summarizing the extracted text…');aiWorker().postMessage({id:currentJob,toolId:t.id,input:{text:out.data.text}})}
 else{await showResult({kind:'text',text:out.data.text});setRunning(false)}
}
function downloadSVG(svgString,filename='logo.svg'){const blob=new Blob([svgString],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function downloadLogoPNG(svgString,filename='logo.png'){const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=340;const ctx=canvas.getContext('2d'),img=new Image(),svgBlob=new Blob([svgString],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(svgBlob);img.onload=()=>{ctx.drawImage(img,0,0,1000,340);URL.revokeObjectURL(url);canvas.toBlob(blob=>{if(!blob)return;const pngUrl=URL.createObjectURL(blob),a=document.createElement('a');a.href=pngUrl;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(pngUrl),1000)},'image/png')};img.src=url}
function renderLogoGallery(out){
 const logos=out.logos||[];
 return `<div class="logo-gallery"><div class="logo-gallery-header"><div class="logo-gallery-title"><h3>${esc(out.brand)} — Vector Logo Concepts</h3><p>${esc(out.industry)} · ${esc(out.palette)}</p></div><button type="button" class="logo-theme-all" id="toggle-all-logo-themes">${icon('sparkles')} Toggle Dark / Light Surface</button></div><div class="logo-grid">${logos.map((l,i)=>`<article class="logo-card" data-logo-index="${i}"><div class="logo-card-head"><div class="logo-concept-info"><strong>${esc(l.name)}</strong><span>${esc(l.desc)}</span></div><button type="button" class="logo-card-theme-toggle" data-logo-action="toggle-theme" data-logo-idx="${i}">Switch Mode</button></div><div class="logo-svg-display" id="logo-preview-${i}" data-theme="dark">${l.svgDark}</div><div class="logo-card-footer"><div class="logo-swatches" title="Brand Colors">${l.palette.map(hex=>`<span class="logo-swatch" style="background:${hex};" title="${hex}"></span>`).join('')}</div><div class="logo-actions"><button type="button" class="logo-btn logo-btn-copy" data-logo-action="copy-svg" data-logo-idx="${i}">${icon('copy')} Copy SVG</button><button type="button" class="logo-btn logo-btn-png" data-logo-action="download-png" data-logo-idx="${i}">${icon('download')} PNG</button><button type="button" class="logo-btn logo-btn-svg" data-logo-action="download-svg" data-logo-idx="${i}">${icon('download')} SVG (Vector)</button></div></div></article>`).join('')}</div><div class="logo-disclaimer"><strong>💡 Designer Tip:</strong> SVGs are infinite-resolution vector graphics ready for websites, embroidery, signage, and print. Use PNG for immediate social media and chat sharing.</div></div>`;
}
function renderPromptCards(out){
 return `<div class="prompt-gallery"><div class="prompt-card"><div class="prompt-card-header"><div class="prompt-badge-group"><span class="prompt-badge">Production Master Prompt</span><span class="prompt-badge secondary">${esc(out.target)}</span></div><button type="button" class="prompt-copy-btn" data-copy-prompt="master">${icon('copy')} Copy Prompt</button></div><div class="prompt-body" id="prompt-text-master">${esc(out.master)}</div></div><div class="prompt-card"><div class="prompt-card-header"><div class="prompt-badge-group"><span class="prompt-badge">Optimized Parameters & Settings</span></div><button type="button" class="prompt-copy-btn" data-copy-prompt="params">${icon('copy')} Copy Settings</button></div><div class="prompt-body code-font" id="prompt-text-params">${esc(out.params)}</div></div><div class="prompt-card"><div class="prompt-card-header"><div class="prompt-badge-group"><span class="prompt-badge">Negative Prompt (Exclusions)</span></div><button type="button" class="prompt-copy-btn" data-copy-prompt="negative">${icon('copy')} Copy Exclusions</button></div><div class="prompt-body code-font" id="prompt-text-negative">${esc(out.negative)}</div></div><div class="prompt-card"><div class="prompt-card-header"><div class="prompt-badge-group"><span class="prompt-badge">Natural Language Variation (FLUX / DALL-E)</span></div><button type="button" class="prompt-copy-btn" data-copy-prompt="alternative">${icon('copy')} Copy Variation</button></div><div class="prompt-body" id="prompt-text-alternative">${esc(out.alternative)}</div></div></div>`;
}
async function runPhotoEditor(currentJob){
 progress('Enhancing photo on your device…');
 const preset=$('#module-extra-preset')?.value||'Auto Enhance';
 const lighting=$('#module-extra-lighting')?.value||'Balanced Normal';
 const effect=$('#module-extra-effect')?.value||'None';
 const intensity=$('#module-extra-intensity')?.value||'100% Full Effect';
 const bitmap=await createImageBitmap(inputFile);
 const canvas=document.createElement('canvas');
 const maxDim=2400;
 const scale=Math.min(1,maxDim/Math.max(bitmap.width,bitmap.height));
 canvas.width=Math.round(bitmap.width*scale);
 canvas.height=Math.round(bitmap.height*scale);
 const ctx=canvas.getContext('2d');
 ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
 bitmap.close();
 const enhanced=applyPhotoEnhancement(canvas,{preset,lighting,effect,intensity});
 preparedImage=enhanced;
 const blob=await new Promise(r=>enhanced.toBlob(r,'image/png'));
 if(job!==currentJob)return;
 const buffer=await blob.arrayBuffer();
 if(job!==currentJob)return;
 await showResult({kind:'image',buffer,mime:'image/png',preset,lighting,effect},currentJob);
 setRunning(false);
}
async function runLogoDesigner(currentJob){
 progress('Designing vector brand concepts…');
 const brand=$('#module-extra-brand')?.value.trim()||$('#text-input')?.value.trim()||'Brand';
 const tagline=$('#module-extra-tagline')?.value.trim()||'';
 const industry=$('#module-extra-industry')?.value||'Technology & AI';
 const style=$('#module-extra-style')?.value||'Modern Geometric Mark';
 const palette=$('#module-extra-palette')?.value||'Emerald & Electric Mint';
 const logos=generateLogos({brand,tagline,industry,style,palette});
 const textExport=logos.map((l,i)=>`--- CONCEPT ${i+1}: ${l.name.toUpperCase()} ---\n${l.desc}\nBrand: ${brand}\nTagline: ${tagline||'None'}\nIndustry: ${industry}\nColors: ${l.palette.join(', ')}\n\nSVG CODE:\n${l.svgLight}`).join('\n\n');
 await showResult({kind:'logos',text:textExport,logos,brand,tagline,industry,palette},currentJob);
 setRunning(false);
}
async function runPromptGenerator(currentJob){
 progress('Generating master prompts…');
 const subject=$('#text-input')?.value.trim()||'A serene mountain cabin by a quiet lake at dawn';
 const target=$('#module-extra-target')?.value||'Midjourney v6';
 const style=$('#module-extra-style')?.value||'Cinematic 35mm Photorealism';
 const lighting=$('#module-extra-lighting')?.value||'Volumetric Golden Hour';
 const shot=$('#module-extra-shot')?.value||'85mm Portrait (f/1.4 Soft Bokeh)';
 const aspect=$('#module-extra-aspect')?.value||'16:9 (Landscape Cinematic)';
 const out=generatePrompts({subject,target,style,lighting,shot,aspect});
 const fullText=`### MASTER PROMPT (${target})\n${out.master}\n\n### PARAMETERS & DIRECTIVES\n${out.params}\n\n### NEGATIVE PROMPT / EXCLUSIONS\n${out.negative}\n\n### ALTERNATIVE VARIATION\n${out.alternative}`;
 await showResult({kind:'prompts',text:fullText,master:out.master,params:out.params,negative:out.negative,alternative:out.alternative,target,style,subject},currentJob);
 setRunning(false);
}
async function run(event){
 event.preventDefault();if(running||!active)return;warning('');const t=active;
 if(t.id==='photo-editor'){if(!inputFile){warning('Choose an image first.');return}job++;const currentJob=job;setRunning(true);$('#output-actions').classList.add('hidden');await runPhotoEditor(currentJob);return}
 if(t.id==='logo-designer'){const brand=$('#module-extra-brand')?.value.trim()||$('#text-input')?.value.trim();if(!brand){warning('Enter your brand name.');return}job++;const currentJob=job;setRunning(true);$('#output-actions').classList.add('hidden');await runLogoDesigner(currentJob);return}
 if(t.id==='prompt-generator'){const subject=$('#text-input')?.value.trim();if(!subject){warning('Please describe your subject or prompt concept.');return}job++;const currentJob=job;setRunning(true);$('#output-actions').classList.add('hidden');await runPromptGenerator(currentJob);return}
 const text=$('#text-input')?.value.trim();if(['text','qa'].includes(t.kind)&&!text){warning('Add some text before running this tool.');return}if(t.kind==='qa'&&!$('#question-input').value.trim()){warning('Add your question.');return}if(['image','audio'].includes(t.kind)&&!inputFile){warning('Choose a file first.');return}
 try{if(t.shape==='labels')labelsFrom($('#labels-input').value);if(t.shape==='pair'&&!$('#secondary-input').value.trim())throw new Error('Enter the second passage.');if(t.shape==='search'&&!$('#question-input').value.trim())throw new Error('Enter your search query.');if(['search','duplicates'].includes(t.shape))passages(text);if(t.shape==='sentences')sentencesFrom(text);if(t.model==='mask'&&(text.match(/\[MASK\]/g)||[]).length!==1)throw new Error('Use exactly one [MASK] placeholder.')}catch(error){warning(error.message);return}
 job++;const currentJob=job;setRunning(true);$('#output-actions').classList.add('hidden');progress('Preparing your input…');
 const programmingLanguage=$('#module-code-language')?.value;
 const context=[programmingLanguage?'Language: '+programmingLanguage:'',moduleUI?.promptContext()||''].filter(Boolean).join('\n');
 const input={text:context?`${context}\n\n${text}`:text,tone:$('#tone-select')?.value||'Natural',history:chatHistory,question:$('#question-input')?.value,target:$('#target-language')?.value,language:$('#audio-language')?.value,secondary:$('#secondary-input')?.value,labels:$('#labels-input')?.value};
 try{
  if(t.model==='ocr'){await runOCR(currentJob);return}
  const transfers=[];if(t.kind==='image')input.image=await imageBlob();if(t.kind==='audio'){Object.assign(input,await audioSamples(t.maxDuration||120));transfers.push(input.audio.buffer)}
  if(job!==currentJob)return;aiWorker().postMessage({id:currentJob,toolId:t.id,input},transfers);
 }catch(error){if(job===currentJob)failure(error.message)}
}
async function showResult(out,expectedJob=job){
 const renderedTool=active;
 result=out;lastText=out.text||'';if(resultURL){URL.revokeObjectURL(resultURL);resultURL=null}
 let html='';
 if(out.kind==='text'||out.kind==='transcription'||out.kind==='answer'||out.kind==='document'){
  if(!out.text?.trim()){html='<p class="result-note">The model did not return readable text. Try a clearer or shorter input.</p>'}
  else html=`<p class="result-text">${esc(out.text)}</p>`;
  if(active.id==='ai-chat'&&out.text?.trim()){chatHistory.push({role:'user',content:$('#text-input').value},{role:'assistant',content:out.text});chatHistory=chatHistory.slice(-6);html=chatHistory.map(x=>`<div class="chat-turn ${x.role}"><strong>${x.role==='user'?'YOU':'FREE AI HARBOR'}</strong><p>${esc(x.content)}</p></div>`).join('')}
  if(out.kind==='answer')html+=`<div class="qa-confidence">Model score: ${(out.score*100).toFixed(1)}%. This estimates the model’s confidence, not factual certainty.${out.score<.1?' The score is low; the passage may not contain a reliable answer.':''}</div>`;
  if(out.kind==='document'){html=`<h3 class="result-section-title">${out.brief?'Brief source':'Summary'}</h3>${html}<details class="source-result"><summary>${esc(out.sourceTitle)} · review the source</summary><p class="result-text">${esc(out.sourceText)}</p></details>`;if(out.brief)html+='<p class="result-note">This source is already very short, so its text is shown in full.</p>';if(out.shortened)html+='<p class="result-note">Only the first 5,000 characters were supplied to the summary model.</p>';lastText=`${out.brief?'BRIEF SOURCE':'SUMMARY'}\n${out.text}\n\n${out.sourceTitle.toUpperCase()}\n${out.sourceText}`}
  if(out.kind==='transcription'&&active.id==='subtitle-generator'){lastText=toSRT(out.chunks,out.duration);html=`<p class="result-text">${esc(lastText||out.text)}</p>`;if(!lastText)html+='<p class="result-note">The model returned no timed segments. Try clearer speech to generate subtitles.</p>'}
 }else if(out.kind==='flashcards'){
  html='<p class="result-note">Tap each question to reveal the answer from your notes.</p>'+out.cards.map((c,i)=>`<details class="study-flashcard"><summary><span class="rank-position">${i+1}</span>${esc(c.question||'Review this source fact')}</summary><p>${esc(c.answer)}</p></details>`).join('');lastText=out.cards.map((c,i)=>`${i+1}. Question: ${c.question}\nAnswer: ${c.answer}`).join('\n\n');
 }else if(out.kind==='similarity'){
  html=`<div class="similarity-result"><span class="section-kicker">MEANING SIMILARITY</span><strong>${out.score.toFixed(3)}</strong><p>Cosine score · −1 to 1</p></div><p class="result-note">Higher values usually indicate closer meaning. This is not a probability, fact check, or plagiarism verdict.</p>`;lastText=`Cosine similarity: ${out.score.toFixed(3)}`;
 }else if(out.kind==='ranked'){
  html=`<h3 class="result-section-title">${esc(out.title)}</h3>`+out.items.map((x,i)=>`<div class="ranked-result"><div><span class="rank-position">${i+1}</span><span class="cosine-score">Cosine ${x.score.toFixed(3)}</span></div><p>${esc(x.text)}</p></div>`).join('');lastText=out.items.map((x,i)=>`${i+1}. ${x.text}\nCosine: ${x.score.toFixed(3)}`).join('\n\n');
 }else if(out.kind==='pairs'){
  html='<h3 class="result-section-title">Closest pairs</h3>'+out.items.map(x=>`<div class="ranked-result"><span class="cosine-score">Cosine ${x.score.toFixed(3)}</span><p>${esc(x.first)}</p><p class="paired-text">${esc(x.second)}</p></div>`).join('');lastText=out.items.map(x=>`Cosine: ${x.score.toFixed(3)}\n${x.first}\n${x.second}`).join('\n\n');
 }else if(out.kind==='mask'){
  html=out.items.map(x=>`<div class="ranked-result"><div><strong>${esc(x.word)}</strong><span class="cosine-score">${(x.score*100).toFixed(1)}% model score</span></div><p>${esc(x.text)}</p></div>`).join('');lastText=out.items.map(x=>`${x.word}: ${(x.score*100).toFixed(1)}%\n${x.text}`).join('\n\n');
 }else if(out.kind==='scores'){
  html=out.items.map(x=>`<div class="score-row"><div class="score-label"><span>${esc(x.label)}</span><span>${(x.score*100).toFixed(1)}%</span></div><div class="score-bar"><span style="width:${Math.max(0,Math.min(100,x.score*100))}%"></span></div></div>`).join('');lastText=out.items.map(x=>`${x.label}: ${(x.score*100).toFixed(1)}%`).join('\n');
 }else if(out.kind==='entities'){
  const names={PER:'Person',ORG:'Organization',LOC:'Location',MISC:'Other'};
  html=out.items.length?`<div class="entity-list">${out.items.map(x=>`<span class="entity-item"><small>${esc(names[x.entity_group]||x.entity_group||x.entity)}</small>${esc(x.word)}</span>`).join('')}</div>`:'<p class="result-note">No named entities were found in this passage.</p>';lastText=out.items.map(x=>`${x.entity_group||x.entity}: ${x.word}`).join('\n');
 }else if(out.kind==='image'){
  const blob=new Blob([out.buffer],{type:out.mime});resultURL=URL.createObjectURL(blob);html=`<div class="result-image-wrap"><img src="${resultURL}" alt="AI-generated ${active.id==='depth-map'?'relative depth map':'portrait cutout'}"></div>`;
 }else if(out.kind==='audio'){
  result.buffer=encodeWAV(out.audio,out.rate);const blob=new Blob([result.buffer],{type:'audio/wav'});resultURL=URL.createObjectURL(blob);html=`<p class="result-note">Your English voice recording is ready.</p><audio class="result-audio" controls src="${resultURL}"></audio>`;
 }else if(out.kind==='detection'){
  const canvas=document.createElement('canvas');canvas.width=preparedImage.width;canvas.height=preparedImage.height;const ctx=canvas.getContext('2d');ctx.drawImage(preparedImage,0,0);ctx.lineWidth=Math.max(2,canvas.width/250);ctx.font=`${Math.max(12,Math.round(canvas.width/50))}px sans-serif`;
  for(const item of out.items){const b=item.box,x=b.xmin*canvas.width,y=b.ymin*canvas.height,w=(b.xmax-b.xmin)*canvas.width,h=(b.ymax-b.ymin)*canvas.height;ctx.strokeStyle='#63c472';ctx.strokeRect(x,y,w,h);const label=item.label+' '+Math.round(item.score*100)+'%',font=Math.max(12,Math.round(canvas.width/50));ctx.fillStyle='#205b43';ctx.fillRect(x,Math.max(0,y-font-8),ctx.measureText(label).width+10,font+8);ctx.fillStyle='#fff';ctx.fillText(label,x+5,Math.max(font+2,y-5))}
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(expectedJob!==job||active!==renderedTool)return;out.buffer=await blob.arrayBuffer();if(expectedJob!==job||active!==renderedTool)return;out.mime='image/png';resultURL=URL.createObjectURL(blob);html=`<div class="result-image-wrap"><img src="${resultURL}" alt="Detected objects with bounding boxes"></div><p class="result-note">${out.items.length} common ${out.items.length===1?'object':'objects'} detected.</p>`;lastText=out.items.map(x=>`${x.label}: ${Math.round(x.score*100)}%`).join('\n');
 }else if(out.kind==='logos'){
  html=renderLogoGallery(out);
 }else if(out.kind==='prompts'){
  html=renderPromptCards(out);
 }
 $('#output-content').innerHTML=html;$('#output-actions').classList.remove('hidden');$('#copy-output').classList.toggle('hidden',!lastText);$('#download-output').textContent=out.kind==='image'||out.kind==='detection'?'Download PNG':out.kind==='audio'?'Download WAV':out.kind==='logos'?'Download SVG':active.id==='subtitle-generator'?'Download SRT':'Download text';
 $('#download-output').disabled=active.id==='subtitle-generator'&&!lastText;
 moduleUI?.result(out,{text:lastText,source:inputPreviewURL,processed:resultURL});
}
function download(){if(!result)return;let blob,name=active.id+'.txt';if(result.kind==='image'||result.kind==='detection'){blob=new Blob([result.buffer],{type:'image/png'});name=active.id+'.png'}else if(result.kind==='audio'){blob=new Blob([result.buffer],{type:'audio/wav'});name='freeaiharbor-voice.wav'}else if(result.kind==='logos'&&result.logos?.length){const safeBrand=(result.brand||'logo').toLowerCase().replace(/[^a-z0-9]+/g,'-');downloadSVG(result.logos[0].svgLight,`${safeBrand}-concept-1.svg`);return}else{blob=new Blob([lastText],{type:'text/plain;charset=utf-8'});if(active.id==='subtitle-generator')name='freeaiharbor-subtitles.srt'}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
async function copyText(value,message){try{await navigator.clipboard.writeText(value);toast(message)}catch{toast('Copy is unavailable in this browser. You can select the result and copy it manually.')}}
const examples={
 'photo-editor':'Enhance photo with vibrant dynamic range and balanced contrast', 'logo-designer':'NovaSphere', 'prompt-generator':'A futuristic cyberpunk noodle bar in Neo Tokyo at rainy midnight, holographic lanterns reflecting on wet asphalt, 35mm photograph',
 'ai-chat':'Suggest three simple ways to organize a home office.', 'writing-assistant':'Write a short welcome paragraph for a website that helps people learn photography.',paraphraser:'Our team is working hard to make the new product easier to use. We welcome your feedback.',
 'email-writer':'Write a friendly email to a client asking for feedback on the first draft of their video.', 'social-captions':'A small leather accessories brand is sharing a close-up of hand stitching. Invite people to follow for the launch.', 'product-copy':'A slim card holder, made of leather, with four card slots. Designed to fit comfortably in a pocket.', 'video-script':'A 20-second video explaining how to plan a productive morning. End with a simple call to action.', brainstorm:'Five low-budget content ideas for a new online stationery store.', 'code-helper':'Explain what Array.map does in JavaScript and show a short example.', 'task-planner':'Create a simple plan to finish a one-minute product video in two days.', summarizer:'A new community library opened on Monday in the town center. The library offers books, a quiet study room, and free computer access. It will run reading clubs for children every Saturday and workshops for adults once a month. Residents can register for a free membership by bringing proof of address. The project was funded by local donations and a council grant.',translator:'Good morning! I hope you have a wonderful day.',sentiment:'The new studio is excellent. I love the quality of the work and the friendly service.', 'ask-text':'The Free AI Harbor workshop takes place on Friday at 3 PM in the community center. Participants should bring a notebook. The session is free and lasts one hour.', 'entity-finder':'Marie Curie worked in Paris. Microsoft has its headquarters in Redmond, Washington.', 'text-to-speech':'Welcome to Free AI Harbor. Your next idea starts right here.'
};
function clearTool(){if(running)return;if($('#text-input')){$('#text-input').value='';$('#text-input').dispatchEvent(new Event('input'))}for(const id of ['question-input','secondary-input','labels-input','file-input'])if($('#'+id))$('#'+id).value='';document.querySelectorAll('.module-extra-fields input,.module-extra-fields select').forEach(el=>el.value='');inputFile=null;preparedImage=null;clearURLs();if($('#file-input'))$('#file-input').required=true;if($('#input-preview')){$('#input-preview').innerHTML='';$('#input-preview').classList.add('hidden');$('#file-caption').textContent=''}chatHistory=[];moduleUI?.clearFile();resetOutput();warning('')}
function showCredits(){const unique=[...Object.values(MODELS).filter(x=>x.id!=='tesseract.js'),...[...Object.values(TRANSLATIONS),...Object.values(REVERSE_TRANSLATIONS)].map(x=>({id:x.model,license:x.license}))];$('#model-credits-list').innerHTML=unique.map(m=>`<div class="model-credit"><a href="https://huggingface.co/${m.id}" target="_blank" rel="noopener noreferrer">${esc(m.id)}</a><span>${esc(m.license)} · public downloadable model</span></div>`).join('')}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.open){openTool(b.dataset.open);return}if(b.dataset.save){toggleSaved(b.dataset.save);return}if(b.dataset.view){setView(b.dataset.view);return}if(b.dataset.category){state.category=b.dataset.category;render();return}if(b.dataset.access){state.access=b.dataset.access;render();return}if(b.dataset.search){state.query=b.dataset.search;render();scrollTo($('#directory'));return}if(b.dataset.close){$('#'+b.dataset.close).close();return}if(b.dataset.action==='about'){$('#about-dialog').showModal();return}if(b.dataset.action==='back'){back();return}if(b.dataset.action==='browse'){scrollTo($('#directory'));return}if(b.dataset.action==='reset'){state.query='';state.category='All tools';state.access='all';state.view='all';render();return}});
$('#output-content').addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 const copyPromptKey=b.dataset.copyPrompt;
 if(copyPromptKey&&result&&result.kind==='prompts'){
  const text=copyPromptKey==='master'?result.master:copyPromptKey==='params'?result.params:copyPromptKey==='negative'?result.negative:copyPromptKey==='alternative'?result.alternative:'';
  if(text){copyText(text,'Prompt copied to clipboard!');const orig=b.innerHTML;b.textContent='✓ Copied!';setTimeout(()=>{b.innerHTML=orig},1500)}
  return;
 }
 if(b.id==='toggle-all-logo-themes'){
  if(!result||!result.logos)return;
  const cards=document.querySelectorAll('.logo-svg-display');
  const firstIsDark=cards[0]?.dataset.theme==='dark';
  const newTheme=firstIsDark?'light':'dark';
  cards.forEach((card,idx)=>{card.dataset.theme=newTheme;card.innerHTML=newTheme==='light'?result.logos[idx].svgLight:result.logos[idx].svgDark});
  toast(`Switched all previews to ${newTheme} surface.`);
  return;
 }
 const logoAction=b.dataset.logoAction;
 const idx=parseInt(b.dataset.logoIdx,10);
 if(logoAction&&!isNaN(idx)&&result&&result.logos&&result.logos[idx]){
  const item=result.logos[idx];
  const previewEl=$(`#logo-preview-${idx}`);
  const currentTheme=previewEl?.dataset.theme||'dark';
  const safeBrand=(result.brand||'brand').toLowerCase().replace(/[^a-z0-9]+/g,'-');
  if(logoAction==='toggle-theme'){
   const nextTheme=currentTheme==='dark'?'light':'dark';
   if(previewEl){previewEl.dataset.theme=nextTheme;previewEl.innerHTML=nextTheme==='light'?item.svgLight:item.svgDark}
   toast(`Switched concept ${idx+1} to ${nextTheme} surface.`);
  }else if(logoAction==='copy-svg'){
   copyText(previewEl?.dataset.theme==='dark'?item.svgDark:item.svgLight,`Concept ${idx+1} SVG copied to clipboard.`);
  }else if(logoAction==='download-svg'){
   downloadSVG(previewEl?.dataset.theme==='dark'?item.svgDark:item.svgLight,`${safeBrand}-concept-${idx+1}.svg`);
   toast(`Downloading ${safeBrand}-concept-${idx+1}.svg`);
  }else if(logoAction==='download-png'){
   downloadLogoPNG(previewEl?.dataset.theme==='dark'?item.svgDark:item.svgLight,`${safeBrand}-concept-${idx+1}.png`);
   toast(`Rendering and downloading PNG for concept ${idx+1}…`);
  }
  return;
 }
});
$('#hero-search').addEventListener('submit',e=>{e.preventDefault();state.query=$('#hero-query').value;render();scrollTo($('#directory'))});$('#directory-query').addEventListener('input',e=>{state.query=e.target.value;render()});$('#clear-query').addEventListener('click',()=>{state.query='';render();$('#directory-query').focus()});$('#sort').addEventListener('change',e=>{state.sort=e.target.value;render()});
$('#tool-form').addEventListener('submit',run);$('#stop-tool').addEventListener('click',cancel);$('#clear-tool').addEventListener('click',clearTool);$('#workspace-save').addEventListener('click',()=>active&&toggleSaved(active.id));$('#copy-output').addEventListener('click',()=>copyText(lastText,'Result copied.'));$('#download-output').addEventListener('click',download);$('#share-tool').addEventListener('click',()=>copyText(location.href,'Tool link copied.'));
$('#use-example').addEventListener('click',()=>{
 if(!active)return;
 if(active.id==='logo-designer'){
  const brandInput=$('#module-extra-brand')||$('#text-input');
  if(brandInput){brandInput.value='NovaSphere';brandInput.dispatchEvent(new Event('input'))}
  const tagInput=$('#module-extra-tagline');
  if(tagInput){tagInput.value='Autonomous Intelligence';tagInput.dispatchEvent(new Event('input'))}
  return;
 }
 if(active.id==='prompt-generator'){
  if($('#text-input')){$('#text-input').value='A futuristic cyberpunk tea house floating above misty mountains at dusk, neon lanterns, ultra-detailed volumetric lighting';$('#text-input').dispatchEvent(new Event('input'))}
  return;
 }
 if(!$('#text-input'))return;
 $('#text-input').value=active.example||examples[active.id]||'';
 $('#text-input').dispatchEvent(new Event('input'));
 if($('#secondary-input'))$('#secondary-input').value=active.secondaryExample||'';
 if($('#labels-input'))$('#labels-input').value=active.labelsExample||'';
 if(active.kind==='qa')$('#question-input').value='When does the workshop start?';
 if(active.shape==='search')$('#question-input').value=active.queryExample||''
});
$('#about-dialog').addEventListener('click',e=>{if(e.target===$('#about-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}});
window.addEventListener('popstate',()=>{const p=new URLSearchParams(location.search),id=p.get('tool');if(byId.has(id))openTool(id,false);else{state.view=p.get('view')==='saved'?'saved':'all';back(false)}});
window.addEventListener('storage',e=>{if(e.key==='freeaiharbor-lab-saved-v1'){try{saved=new Set(JSON.parse(e.newValue||'[]').filter(id=>byId.has(id)));render()}catch{}}});
fillIcons();showCredits();initWorkspaceSizing();cloudUI=createCloudUI({onOpen:id=>openTool(id),onNotify:toast,isSaved:id=>saved.has(id)});chatUI=createChatUI({onExit:()=>back(),notify:toast});moduleUI=createModuleUI({tools:LAB_TOOLS,onEdit:text=>{lastText=text},onUseOutput:text=>{if($('#text-input')){$('#text-input').value=text.slice(0,active.limit);$('#text-input').dispatchEvent(new Event('input'));$('#text-input').focus()}},onSwap:(id,language,text)=>{openTool(id);$('#target-language').value=language;$('#target-language').dispatchEvent(new Event('change'));$('#text-input').value=text;$('#text-input').dispatchEvent(new Event('input'));$('#text-input').focus()},onNotify:toast,onRun:()=>run(new Event('submit',{cancelable:true})),onExportValidity:valid=>{$('#download-output').disabled=!valid;$('#copy-output').disabled=!valid;$('#dock-action-note').textContent=valid?'Your edited captions are ready to copy or download.':'Fix the caption text and timings before exporting.'}});const params=new URLSearchParams(location.search);state.view=params.get('view')==='saved'?'saved':'all';render();if(byId.has(params.get('tool')))openTool(params.get('tool'),false);
