import {workspaceProfile,wordCount,mediaTime,waveformPeaks,planItems,planTranscript} from './module-profiles.js';
import {escapeHTML as esc,LAB_CATEGORIES,toSRT} from './lab-tools.js';
import {icon} from './icons.js';
import {toolBadge,identityStyle} from './tool-identity.js';
const $=s=>document.querySelector(s);
const inline=text=>esc(text).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/`([^`]+)`/g,'<code>$1</code>');
function documentHTML(text){
 const blocks=text.split(/(```[\s\S]*?```)/g);
 return blocks.map(block=>{
  if(block.startsWith('```'))return `<pre><code>${esc(block.replace(/^```[^\n]*\n?/,'').replace(/```$/,''))}</code></pre>`;
  return block.split(/\n\s*\n/).filter(x=>x.trim()).map(x=>{
   if(/^#{1,3}\s/.test(x))return `<h3>${inline(x.replace(/^#{1,3}\s+/,''))}</h3>`;
   const lines=x.split('\n');if(lines.every(l=>/^\s*(?:[-*•]|\d+[.)])\s+/.test(l)))return '<ul>'+lines.map(l=>`<li>${inline(l.replace(/^\s*(?:[-*•]|\d+[.)])\s+/,''))}</li>`).join('')+'</ul>';
   return `<p>${inline(x).replace(/\n/g,'<br>')}</p>`;
  }).join('');
 }).join('');
}
function tabs(items,selected,group){return `<div class="module-tabs" role="tablist" aria-label="${esc(group)}">${items.map(([id,label])=>`<button type="button" role="tab" aria-selected="${id===selected}" data-module="${id}">${esc(label)}</button>`).join('')}</div>`}
export function createModuleUI({tools,onEdit,onSwap,onUseOutput,onNotify,onRun,onExportValidity}){
 let tool=null,profile=null,category='',sourceURL='',processedURL='',sourceFile=null,viewNumber=0,currentText='',currentResult=null,busy=false;
 let player=null,duration=0,mediaVersion=0,imageView='original',zoom=1,split=50,deck=[],deckIndex=0,revealed=false,learned=new Set(),tasks=[],board=false,subtitleValid=true;
 const root=$('#module-layout');
 const mobile=()=>window.matchMedia?.('(max-width: 900px)').matches;
 function sidebar(open){
  if(mobile()){root.classList.toggle('sidebar-open',open);root.classList.remove('sidebar-collapsed');$('#module-main').inert=open;$('#module-sidebar').setAttribute('aria-hidden',String(!open))}
  else{root.classList.toggle('sidebar-collapsed',!open);root.classList.remove('sidebar-open');$('#module-main').inert=false;$('#module-sidebar').setAttribute('aria-hidden',String(!open))}
  $('#module-sidebar-toggle').setAttribute('aria-expanded',String(open));
 }
 function nav(){
  const q=$('#module-tool-search').value.toLowerCase().trim();
  const found=tools.filter(t=>t.category===category&&(!q||[t.name,t.description,...t.tags].join(' ').toLowerCase().includes(q)));
  $('#module-tool-nav').innerHTML=found.length?found.map(t=>`<button type="button" data-open="${t.id}" class="module-nav-item${t.id===tool?.id?' selected':''}"${t.id===tool?.id?' aria-current="page"':''}>${toolBadge(t,'module-tool-icon')}<span>${esc(t.name)}</span>${t.id===tool?.id?'<span class="tiny-dot"></span>':''}</button>`).join(''):'<p class="module-nav-empty">No tools match. Try another search or category.</p>';
 }
 function activity(text){$('#module-activity').innerHTML=`<span class="tiny-dot"></span>${esc(text)}`}
 function updateEditor(){
  const input=$('#text-input');if(!input)return;
  const count=wordCount(input.value);const stats=$('#module-input-stats');if(stats)stats.textContent=`${count} ${count===1?'word':'words'}`;
  const gutter=$('#module-source-gutter');if(gutter){gutter.textContent=Array.from({length:Math.max(1,input.value.split('\n').length)},(_,i)=>i+1).join('\n');gutter.scrollTop=input.scrollTop}
 }
 function setupInputs(){
  const input=$('#text-input');$('#module-paste').classList.toggle('hidden',!input);
  if(input&&profile.family!=='compare')root.querySelector('label[for="text-input"]').textContent=tool.shape==='search'||tool.shape==='duplicates'?'Your passages · one per line':profile.input;
  if(profile.fields){
   const fields=document.createElement('div');fields.className='module-extra-fields';fields.innerHTML=profile.fields.map(f=>`<label for="module-extra-${f.id}">${esc(f.label)}${f.choices?`<select id="module-extra-${f.id}"><option value="">Choose…</option>${f.choices.map(x=>`<option>${esc(x)}</option>`).join('')}</select>`:`<input id="module-extra-${f.id}" type="text" maxlength="${f.max}" placeholder="${esc(f.placeholder)}">`}</label>`).join('');$('#input-controls').prepend(fields);
   fields.addEventListener('input',()=>{if(!currentResult)return;if(profile.style==='seo')seoPreview(currentResult.text);if(profile.style==='email'){const recipient=$('#module-envelope-recipient'),subject=$('#module-envelope-subject');if(recipient)recipient.textContent=$('#module-extra-recipient').value||'Your recipient';if(subject)subject.textContent=$('#module-extra-subject').value||'Your email draft'}});
  }
  if(input){
   const stats=document.createElement('span');stats.id='module-input-stats';stats.className='module-input-stats';$('#character-count').prepend(stats);
   input.addEventListener('input',updateEditor);input.addEventListener('scroll',updateEditor);updateEditor();
  }
  if(profile.family==='compare'){
   const parent=$('#input-controls'),second=$('#secondary-input'),left=document.createElement('section'),right=document.createElement('section'),grid=document.createElement('div');grid.className='compare-input-grid';
   left.append(parent.querySelector('label[for="text-input"]'),input,$('#character-count'));right.append(parent.querySelector('label[for="secondary-input"]'),second);grid.append(left,right);parent.prepend(grid);
  }
  if(profile.family==='code'){
   const shell=document.createElement('div');shell.className='code-source-shell';input.before(shell);shell.innerHTML='<div id="module-source-gutter" class="code-gutter" aria-hidden="true">1</div>';shell.append(input);
   const row=document.createElement('div');row.className='code-file-bar';row.innerHTML=`<span>${icon('code')} request.txt</span><label>Language<select id="module-code-language"><option value="">Auto</option><option>JavaScript</option><option>Python</option><option>SQL</option><option>HTML</option><option>CSS</option><option>TypeScript</option></select></label>`;shell.before(row);updateEditor();
   if(tool.id==='sql-helper')$('#module-code-language').value='SQL';
  }
  const options=$('#module-options');options.innerHTML='';options.classList.add('hidden');
  if(profile.family==='translate'){
   const select=$('#target-language'),list=select.closest('.options-row');list.remove();
   options.innerHTML='<div class="translation-languagebar"><div id="translation-source"></div><button type="button" data-module="swap-languages" aria-label="Swap source and translation languages">⇄</button><div id="translation-target"></div></div>';
   const fixed=document.createElement('span');fixed.textContent='English';const label=document.createElement('label');label.append(select);label.setAttribute('aria-label',tool.reverse?'Source language':'Translation language');
   $('#translation-source').append(tool.reverse?label:fixed);$('#translation-target').append(tool.reverse?fixed:label);options.classList.remove('hidden');
   select.addEventListener('change',()=>{$('#output-title').textContent=tool.reverse?'English translation':select.selectedOptions[0].textContent+' translation'});select.dispatchEvent(new Event('change'));
  }else if(profile.family==='rewrite'&&$('#tone-select')){
   const select=$('#tone-select');select.closest('.options-row').classList.add('hidden');options.innerHTML=`<span class="module-options-label">Tone</span><div class="module-tabs tone-tabs" role="tablist" aria-label="Writing tone">${[['Natural','Standard'],['Professional','Professional'],['Friendly','Friendly'],['Concise','Concise']].map(([value,label])=>`<button type="button" role="tab" aria-selected="${value===select.value}" data-module="tone" data-tone="${value}">${label}</button>`).join('')}</div>`;options.classList.remove('hidden');
  }
 }
 function empty(){
  if(!tool)return;currentText='';currentResult=null;processedURL='';deck=[];tasks=[];learned.clear();$('#module-result-tools').innerHTML='';$('#module-output-stats').textContent='';
  $('#output-content').innerHTML=`<div class="module-empty">${toolBadge(tool,'empty-tool-icon')}<h3>${esc(profile.empty||'Your workspace is ready.')}</h3><p>${esc(profile.hint||'Add your input and run the tool.')}</p></div>`;activity('Ready');$('#dock-action-note').textContent=sourceFile?(tool.kind==='image'?'Image':'Audio')+' selected · '+profile.action+' when you’re ready.':'Add your input above, then '+(profile.action||'run the tool').toLowerCase()+'.';
  if(profile.family==='image'&&sourceURL)imageStage();
 }
 function open(t){
  hide();tool=t;profile=workspaceProfile(t);category=t.category;viewNumber++;sourceURL='';processedURL='';sourceFile=null;
  root.classList.remove('hidden','has-source-file');root.querySelector('.module-body').scrollTop=0;root.dataset.family=profile.family;root.style.cssText=identityStyle(t);document.body.classList.add('tool-view');
  $('#module-type').textContent=profile.label;$('#input-title').textContent=profile.input;$('#output-title').textContent=profile.output;$('#run-tool').innerHTML=`${esc(profile.action)} ${icon('arrow-right')}`;
  $('#module-category-select').innerHTML=LAB_CATEGORIES.filter(c=>c.name!=='All tools').map(c=>`<option${c.name===category?' selected':''}>${esc(c.name)}</option>`).join('');$('#module-tool-search').value='';nav();sidebar(!mobile());setupInputs();empty();
  $('#module-media').innerHTML='';$('#module-media').classList.add('hidden');
 }
 function hide(){
  viewNumber++;mediaVersion++;busy=false;root.classList.remove('has-source-file');player?.pause();player=null;duration=0;tool=null;profile=null;root.classList.add('hidden');document.body.classList.remove('tool-view');$('#module-main').inert=false;root.classList.remove('sidebar-open','sidebar-collapsed');
 }
 function setBusy(value){
  if(!tool)return;busy=value;$('#dock-action-note').textContent=value?'Processing your input. Use Stop to cancel.':currentResult?'Your result is ready. Copy or download it from this bar.':'Ready to '+profile.action.toLowerCase()+'.';root.classList.toggle('is-running',value);activity(value?'Processing on your device…':currentResult?'Result ready':'Ready');
  $('#run-tool').innerHTML=value?'Processing…':`${esc(profile.action)} ${icon('arrow-right')}`;
  $('#tool-form').querySelectorAll('input,textarea,select').forEach(el=>el.disabled=value);$('#module-options').querySelectorAll('button,select').forEach(el=>el.disabled=value);
  $('#module-result-tools').querySelectorAll('button,select').forEach(el=>el.disabled=value);
 }
 function fail(){if(tool){activity('Run interrupted');$('#dock-action-note').textContent='This run could not finish. Check the message above before trying again.'}}
 function outputStats(text){$('#module-output-stats').textContent=`${wordCount(text)} words`}
 function setText(text){currentText=text;onEdit(text);outputStats(text)}
 function textResult(text,source=''){
  currentText=text;
  $('#module-result-tools').innerHTML=tabs([['preview','Preview'],['edit-output','Edit']],'preview','Result view')+(profile.family==='rewrite'?'<button type="button" class="text-link" data-module="use-result">Use as input</button>':'');
  const codeView=profile.family==='code';
  $('#output-content').innerHTML=`<div id="module-document-view" class="${codeView?'code-answer':'document-preview'}">${documentHTML(text)}</div><textarea id="module-result-editor" class="result-editor hidden${codeView?' code-result-editor':''}" aria-label="Edit ${esc(profile.output.toLowerCase())}" spellcheck="${!codeView}">${esc(text)}</textarea>${source?`<details class="source-result"><summary>${esc(currentResult.sourceTitle||'Source text')} · review the source</summary><p class="result-text">${esc(source)}</p></details>`:''}${currentResult.brief?'<p class="result-note">The source is already short, so it is shown in full.</p>':''}`;
  if(currentResult.kind==='answer')$('#output-content').insertAdjacentHTML('beforeend',`<p class="result-note">Model score: ${(currentResult.score*100).toFixed(1)}%. This is not factual certainty.</p>`);
  $('#module-result-editor').addEventListener('input',e=>{const text=e.target.value;currentResult.text=text;setText(currentResult.kind==='document'?`${currentResult.brief?'BRIEF SOURCE':'SUMMARY'}\n${text}\n\n${currentResult.sourceTitle.toUpperCase()}\n${currentResult.sourceText}`:text);$('#module-document-view').innerHTML=documentHTML(text);if(profile.style==='seo')seoPreview(text)});outputStats(text);
  if(profile.style==='email'){
   const recipient=$('#module-extra-recipient').value,subject=$('#module-extra-subject').value;
   $('#module-document-view').insertAdjacentHTML('beforebegin',`<div class="email-draft-heading"><div><span>To</span><b id="module-envelope-recipient">${esc(recipient||'Your recipient')}</b></div><div><span>Subject</span><b id="module-envelope-subject">${esc(subject||'Your email draft')}</b></div></div>`);
  }
  if(profile.style==='seo')seoPreview(text);
 }
 function seoPreview(text){
  let preview=$('#module-seo-preview');if(!preview){preview=document.createElement('div');preview.id='module-seo-preview';preview.className='module-seo-preview';$('#output-content').append(preview)}
  const first=text.split('\n').find(x=>x.trim())?.trim().replace(/^\d+[.)]\s*/,'')||'',isTitle=tool.id==='seo-title';
  const title=isTitle?first:$('#module-extra-page-title').value||'Your page title',url=$('#module-extra-page-url').value||'yourwebsite.com/page',description=isTitle?'Your page description appears beneath the title.':first;
  preview.innerHTML=`<span class="section-kicker">SEARCH APPEARANCE PREVIEW</span><span class="seo-preview-url">${esc(url)}</span><h3>${esc(title)}</h3><p>${esc(description)}</p><span class="seo-preview-count${first.length>(isTitle?60:155)?' over-limit':''}">${first.length} / ${isTitle?60:155} characters · first option</span>`;
 }
 function imageStage(){
  $('#module-result-tools').innerHTML=`${tabs(processedURL?[['image-original','Original'],['image-result','Result'],['image-compare','Compare']]:[['image-original','Original']],processedURL?'image-'+imageView:'image-original','Canvas view')}<div class="canvas-zoom"><button type="button" data-module="zoom-out" aria-label="Zoom out">−</button><button type="button" data-module="zoom-fit" aria-label="Reset image zoom">${Math.round(zoom*100)}%</button><button type="button" data-module="zoom-in" aria-label="Zoom in">+</button></div>`;
  const compare=imageView==='compare'&&processedURL;
  $('#output-content').innerHTML=`<div class="image-stage${compare?' comparison-stage':''}"><div id="module-image-viewport" class="image-viewport${imageView==='result'?' result-surface':''}" style="--image-zoom:${zoom};--image-split:${split}%">${compare?`<div class="image-before"><img src="${sourceURL}" alt="Original image"></div><div class="image-after"><img src="${processedURL}" alt="Processed image"></div><span class="comparison-line"></span><span class="comparison-label before-label">Before</span><span class="comparison-label after-label">After</span>`:`<img src="${imageView==='result'&&processedURL?processedURL:sourceURL}" alt="${imageView==='result'&&processedURL?'Processed':'Original'} image">`}</div></div>${compare?`<label class="comparison-control">Before / after<input id="module-compare-slider" type="range" min="0" max="100" value="${split}" aria-label="Adjust before and after comparison"></label>`:''}<div class="canvas-caption"><span>${esc(sourceFile?.name||'Image canvas')}</span><span>${imageView==='result'?'Processed image':compare?'Move the slider to compare':'Original image'}</span></div>`;
  $('#module-compare-slider')?.addEventListener('input',e=>{split=Number(e.target.value);$('#module-image-viewport').style.setProperty('--image-split',split+'%')});
 }
 function mediaShell(title){
  $('#module-media').classList.remove('hidden');$('#module-media').innerHTML=`<div class="media-topline"><span>${icon('audio')} ${esc(title)}</span><span id="module-media-duration">${duration?mediaTime(duration):'Audio preview'}</span></div><div id="module-waveform" class="module-waveform"><p>Waveform loads from your audio.</p></div><div class="media-transport"><button type="button" id="module-play" class="media-play" data-module="play">${icon('video')} Play</button><span id="module-current-time">00:00</span><input id="module-scrub" type="range" min="0" max="${duration||1}" step="0.05" value="0" aria-label="Seek in audio"><label><span class="sr-only">Playback speed</span><select id="module-speed"><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label></div>`;
  $('#module-scrub').addEventListener('input',e=>{if(player)player.currentTime=Number(e.target.value);syncPlayer()});$('#module-speed').addEventListener('change',e=>{if(player)player.playbackRate=Number(e.target.value)});
 }
 function syncPlayer(){
  if(!player||!$('#module-current-time'))return;const now=Number(player.currentTime)||0;$('#module-current-time').textContent=mediaTime(now);$('#module-scrub').value=now;$('#module-play').innerHTML=player.paused?`${icon('video')} Play`:`${icon('stop')} Pause`;
  const progress=duration?Math.min(100,now/duration*100):0;$('#module-waveform').style.setProperty('--played',progress+'%');
  root.querySelectorAll('[data-cue-start]').forEach(row=>row.classList.toggle('cue-current',now>=Number(row.dataset.cueStart)&&now<Number(row.dataset.cueEnd)));
 }
 function bindPlayer(element){
  player?.pause();player=element;if(!player)return;player.addEventListener('timeupdate',syncPlayer);player.addEventListener('play',syncPlayer);player.addEventListener('pause',syncPlayer);
  player.addEventListener('loadedmetadata',()=>{if(Number.isFinite(player?.duration)){duration=player.duration;$('#module-scrub').max=duration;$('#module-media-duration').textContent=mediaTime(duration)}});syncPlayer();
 }
 function waveform(samples,seconds){
  duration=seconds;const peaks=waveformPeaks(samples);$('#module-waveform').innerHTML=`<svg viewBox="0 0 576 74" preserveAspectRatio="none" role="img" aria-label="Waveform of the selected audio">${peaks.map((p,i)=>{const h=Math.max(2,p*68);return `<rect x="${i*6}" y="${(74-h)/2}" width="3" height="${h}" rx="1.5"/>`}).join('')}</svg>`;$('#module-media-duration').textContent=mediaTime(duration);$('#module-scrub').max=duration;syncPlayer();
 }
 async function fileSelected(file,url){
  if(!tool)return;root.classList.add('has-source-file');$('#dock-action-note').textContent=(tool.kind==='image'?'Image':'Audio')+' selected · '+profile.action+' when you’re ready.';sourceURL=url;processedURL='';sourceFile=file;imageView='original';zoom=1;split=50;
  if(profile.family==='image')imageStage();
  if(tool.kind==='audio'){
   const version=++mediaVersion;mediaShell(file.name);bindPlayer($('#input-preview audio'));
   const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx||!file.arrayBuffer)return;
   let ctx;try{ctx=new AudioCtx();const decoded=await ctx.decodeAudioData(await file.arrayBuffer());if(version===mediaVersion&&tool)waveform(decoded.getChannelData(0),decoded.duration)}catch{if(version===mediaVersion&&$('#module-waveform'))$('#module-waveform').innerHTML='<p>Use the player to preview this recording.</p>'}finally{await ctx?.close().catch(()=>{})}
  }
 }
 function transcriptResult(out){
  const timed=out.chunks?.length;currentText=out.text;
  $('#module-result-tools').innerHTML=tabs(timed?[['transcript-text','Transcript'],['transcript-segments','Original segments']]:[['transcript-text','Transcript']],'transcript-text','Transcript view');
  const cues=out.chunks||[];$('#output-content').innerHTML=`<textarea id="module-transcript-editor" class="result-editor transcript-editor" aria-label="Edit transcript">${esc(out.text)}</textarea><div id="module-transcript-segments" class="timed-transcript hidden">${cues.map((c,i)=>{const start=c.timestamp?.[0]||0,end=c.timestamp?.[1]??cues[i+1]?.timestamp?.[0]??out.duration;return `<div class="transcript-cue" data-cue-start="${start}" data-cue-end="${end}"><button type="button" data-module="seek" data-time="${start}" aria-label="Play from ${mediaTime(start)}">${mediaTime(start)}</button><p>${esc(c.text.trim())}</p></div>`}).join('')}</div>`;
  $('#module-transcript-editor').addEventListener('input',e=>{out.text=e.target.value;setText(e.target.value)});outputStats(out.text);
 }
 function subtitleResult(out){
  const chunks=out.chunks||[];subtitleValid=true;duration=out.duration||duration;
  if(!chunks.length)return;$('#module-result-tools').innerHTML='<span class="subtitle-count">'+chunks.length+' captions</span>';
  $('#output-content').innerHTML=`<div class="subtitle-editor"><div class="subtitle-column-labels"><span>Caption</span><span>Text & timing</span></div>${chunks.map((c,i)=>{const start=c.timestamp?.[0]||0,end=c.timestamp?.[1]??chunks[i+1]?.timestamp?.[0]??duration;return `<div class="subtitle-row" data-cue-start="${start}" data-cue-end="${end}" data-cue-index="${i}"><button type="button" data-module="seek" data-time="${start}" class="subtitle-index"><span>${i+1}</span>${mediaTime(start)}</button><div><textarea class="subtitle-text" aria-label="Caption ${i+1} text" data-subtitle-text="${i}">${esc(c.text.trim())}</textarea><div class="subtitle-timing"><label>Start <input type="number" min="0" max="${duration}" step="0.01" value="${start.toFixed(2)}" data-subtitle-start="${i}" aria-label="Caption ${i+1} start in seconds"></label><span>→</span><label>End <input type="number" min="0" max="${duration}" step="0.01" value="${end.toFixed(2)}" data-subtitle-end="${i}" aria-label="Caption ${i+1} end in seconds"></label></div></div></div>`}).join('')}<p id="module-subtitle-warning" class="result-note" role="status">Click a timestamp to preview that caption. Times are in seconds.</p></div>`;
  $('#output-content').querySelectorAll('textarea,input').forEach(el=>el.addEventListener('input',()=>{
   const next=chunks.map((c,i)=>({text:root.querySelector(`[data-subtitle-text="${i}"]`).value,timestamp:[Number(root.querySelector(`[data-subtitle-start="${i}"]`).value),Number(root.querySelector(`[data-subtitle-end="${i}"]`).value)]}));
   subtitleValid=next.every(c=>c.text.trim()&&Number.isFinite(c.timestamp[0])&&Number.isFinite(c.timestamp[1])&&c.timestamp[0]>=0&&c.timestamp[1]>c.timestamp[0]&&c.timestamp[1]<=duration+.1);onExportValidity(subtitleValid);
   $('#module-subtitle-warning').textContent=subtitleValid?'Caption edits are included in your SRT export.':'Each caption needs text and an end time after its start, within the recording.';
   if(subtitleValid){out.chunks=next;currentText=toSRT(next,duration);onEdit(currentText);root.querySelectorAll('[data-cue-index]').forEach((row,i)=>{row.dataset.cueStart=next[i].timestamp[0];row.dataset.cueEnd=next[i].timestamp[1];row.querySelector('[data-module="seek"]').dataset.time=next[i].timestamp[0]})}
  }));
  $('#module-output-stats').textContent=chunks.length+' captions · SRT';
 }
 function showDeck(){
  const card=deck[deckIndex];$('#module-result-tools').innerHTML=`<span class="deck-summary">${learned.size} / ${deck.length} learned</span><button type="button" class="text-link" data-module="shuffle-deck">Shuffle</button>`;
  $('#output-content').innerHTML=`<div class="study-deck"><div class="deck-progress"><span style="width:${learned.size/deck.length*100}%"></span></div><span class="deck-position">CARD ${deckIndex+1} OF ${deck.length}</span><button type="button" class="deck-card${revealed?' answer-shown':''}" data-module="flip-card" aria-pressed="${revealed}" aria-label="${revealed?'Show question':'Reveal answer'}"><span>${revealed?'ANSWER FROM YOUR NOTES':'QUESTION'}</span><p>${esc(revealed?card.answer:card.question||'Review this source fact')}</p><small>${revealed?'Click to see the question':'Click to reveal the answer'}</small></button><div class="deck-controls"><button type="button" data-module="previous-card" aria-label="Previous flashcard"${deckIndex===0?' disabled':''}>←</button><button type="button" class="secondary-button" data-module="flip-card">${revealed?'Show question':'Show answer'}</button><button type="button" data-module="next-card" aria-label="Next flashcard"${deckIndex===deck.length-1?' disabled':''}>→</button></div><button type="button" class="deck-learned" data-module="mark-learned" aria-pressed="${learned.has(card.id)}">${icon('check-circle')} ${learned.has(card.id)?'Learned · tap to review again':'Mark as learned'}</button></div>`;$('#module-output-stats').textContent=deck.length+' source-based flashcards';
 }
 function taskCard(task){return `<div class="plan-task" draggable="true" data-task-id="${task.id}"><label class="task-check"><input type="checkbox" data-task-check="${task.id}"${task.status==='done'?' checked':''} aria-label="Mark task ${task.id+1} complete"><span class="task-text${task.status==='done'?' completed':''}">${inline(task.text)}</span></label><label class="sr-only" for="task-status-${task.id}">Task ${task.id+1} status</label><select id="task-status-${task.id}" data-task-status="${task.id}">${[['todo','To do'],['doing','In progress'],['done','Done']].map(([v,l])=>`<option value="${v}"${task.status===v?' selected':''}>${l}</option>`).join('')}</select></div>`}
 function showPlan(){
  $('#module-result-tools').innerHTML=tabs([['plan-list','List'],['plan-board','Board']],board?'plan-board':'plan-list','Plan view');
  const done=tasks.filter(t=>t.status==='done').length;
  $('#output-content').innerHTML=`<div class="plan-progress"><span>${done} of ${tasks.length} complete</span><progress max="${tasks.length||1}" value="${done}" aria-label="Plan completion"></progress></div>${board?`<div class="plan-board">${[['todo','To do'],['doing','In progress'],['done','Done']].map(([status,name])=>`<section class="plan-column" data-drop-status="${status}"><h3><span class="column-dot ${status}"></span>${name}<span>${tasks.filter(t=>t.status===status).length}</span></h3>${tasks.filter(t=>t.status===status).map(taskCard).join('')||'<p class="empty-column">Move a task here</p>'}</section>`).join('')}</div>`:`<div class="plan-list">${tasks.map(taskCard).join('')}</div>`}<form id="module-add-task" class="add-task-form"><label class="sr-only" for="module-new-task">Add a task</label><input id="module-new-task" type="text" maxlength="250" placeholder="Add a task…" required><button type="submit" aria-label="Add task">${icon('plus')}</button></form>`;
  root.querySelectorAll('[data-task-check]').forEach(el=>el.addEventListener('change',()=>{tasks.find(t=>t.id===Number(el.dataset.taskCheck)).status=el.checked?'done':'todo';showPlan();setText(planTranscript(tasks))}));
  root.querySelectorAll('[data-task-status]').forEach(el=>el.addEventListener('change',()=>{tasks.find(t=>t.id===Number(el.dataset.taskStatus)).status=el.value;showPlan();setText(planTranscript(tasks))}));
  root.querySelectorAll('[data-task-id]').forEach(el=>el.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',el.dataset.taskId)));
  root.querySelectorAll('[data-drop-status]').forEach(el=>{el.addEventListener('dragover',e=>e.preventDefault());el.addEventListener('drop',e=>{e.preventDefault();const task=tasks.find(t=>t.id===Number(e.dataTransfer.getData('text/plain')));if(task){task.status=el.dataset.dropStatus;showPlan();setText(planTranscript(tasks))}})});
  $('#module-add-task').addEventListener('submit',e=>{e.preventDefault();const text=$('#module-new-task').value.trim();if(text){tasks.push({id:tasks.reduce((n,t)=>Math.max(n,t.id),-1)+1,text,status:'todo'});showPlan();setText(planTranscript(tasks))}});$('#module-output-stats').textContent=tasks.length+' tasks';
 }
 function entityResult(out){
  const names={PER:'People',ORG:'Organizations',LOC:'Places',MISC:'Other'};
  $('#module-result-tools').innerHTML='<label class="entity-filter">Show <select id="module-entity-filter"><option value="all">All entities</option>'+Object.entries(names).map(([v,l])=>`<option value="${v}">${l}</option>`).join('')+'</select></label>';
  $('#module-entity-filter').addEventListener('change',e=>root.querySelectorAll('.entity-item').forEach(el=>el.classList.toggle('hidden',e.target.value!=='all'&&el.dataset.entity!==e.target.value)));
  root.querySelectorAll('.entity-item').forEach((el,i)=>el.dataset.entity=out.items[i].entity_group||out.items[i].entity);
  $('#module-output-stats').textContent=out.items.length+' entities';
 }
 function result(out,{text,source,processed}={}){
  if(!tool)return;$('#dock-action-note').textContent='Your result is ready. Copy or download it from this bar.';currentResult=out;currentText=text||'';processedURL=processed||'';sourceURL=source||sourceURL;$('#module-result-tools').innerHTML='';activity('Result ready');
  if(tool.id==='photo-editor'||out.kind==='photo-editor'||profile.family==='photo-editor'){$('#module-output-stats').textContent='High-Res Edited Photo';return}
  if(tool.id==='logo-designer'||out.kind==='logos'){$('#module-output-stats').textContent=(out.logos?.length||4)+' concepts · Vector SVG / PNG';return}
  if(profile.family==='image'&&processedURL){imageView='result';imageStage();$('#module-output-stats').textContent=out.kind==='detection'?out.items.length+' objects · PNG':'PNG';return}
  if(out.kind==='flashcards'&&out.cards.length){deck=out.cards.map((c,id)=>({...c,id}));deckIndex=0;revealed=false;learned.clear();showDeck();return}
  if(profile.family==='planner'&&out.kind==='text'&&out.text?.trim()){tasks=planItems(out.text);board=false;showPlan();setText(planTranscript(tasks));return}
  if(profile.family==='subtitles'&&out.chunks?.length){subtitleResult(out);return}
  if(out.kind==='transcription'&&profile.family==='audio'){transcriptResult(out);return}
  if(out.kind==='audio'){
   duration=out.audio.length/out.rate;mediaShell('Generated voice');bindPlayer($('#output-content audio'));waveform(out.audio,duration);$('#module-output-stats').textContent=mediaTime(duration)+' · WAV';return;
  }
  if(out.kind==='prompts'){$('#module-output-stats').textContent=out.target+' · Master Prompt';return}
  if(['text','answer','document'].includes(out.kind)&&out.text?.trim()){textResult(out.text,out.sourceText);return}
  if(out.kind==='scores'&&out.items.length){const best=out.items.reduce((a,b)=>a.score>b.score?a:b);$('#output-content').insertAdjacentHTML('afterbegin',`<div class="analysis-summary"><span class="section-kicker">HIGHEST MODEL SCORE</span><strong>${esc(best.label)}</strong><span>${(best.score*100).toFixed(1)}%</span></div>`);$('#module-output-stats').textContent=out.items.length+' labels';return}
  if(out.kind==='entities')entityResult(out);
 }
 root.addEventListener('click',async e=>{
  const b=e.target.closest('[data-module]');if(!b||!tool)return;const action=b.dataset.module;
  if(action==='tone'){if(busy)return;$('#tone-select').value=b.dataset.tone;root.querySelectorAll('[data-tone]').forEach(el=>el.setAttribute('aria-selected',String(el===b)))}
  if(action==='swap-languages'){if(busy)return;const language=$('#target-language').value,value=currentResult?.text||'';onSwap(tool.reverse?'translator':'reverse-translator',language,value)}
  if(action==='preview'||action==='edit-output'){const edit=action==='edit-output';$('#module-document-view').classList.toggle('hidden',edit);$('#module-result-editor').classList.toggle('hidden',!edit);if(edit)$('#module-result-editor').focus();root.querySelectorAll('[data-module="preview"],[data-module="edit-output"]').forEach(el=>el.setAttribute('aria-selected',String(el===b)))}
  if(action==='use-result')onUseOutput(currentResult?.text||currentText);
  if(action.startsWith('image-')){imageView=action.slice(6);imageStage()}
  if(action.startsWith('zoom-')){zoom=action==='zoom-fit'?1:Math.max(.5,Math.min(2,zoom+(action==='zoom-in'?.25:-.25)));imageStage()}
  if(action==='play'&&player){if(player.paused){try{await player.play()}catch{onNotify('Use the audio player controls to start playback.')}}else player.pause();syncPlayer()}
  if(action==='seek'&&player){player.currentTime=Number(b.dataset.time);try{await player.play()}catch{}syncPlayer()}
  if(action==='transcript-text'||action==='transcript-segments'){const segments=action==='transcript-segments';$('#module-transcript-editor').classList.toggle('hidden',segments);$('#module-transcript-segments').classList.toggle('hidden',!segments);root.querySelectorAll('[data-module="transcript-text"],[data-module="transcript-segments"]').forEach(el=>el.setAttribute('aria-selected',String(el===b)))}
  if(action==='flip-card'){revealed=!revealed;showDeck()}
  if(action==='previous-card'||action==='next-card'){deckIndex=Math.max(0,Math.min(deck.length-1,deckIndex+(action==='next-card'?1:-1)));revealed=false;showDeck()}
  if(action==='mark-learned'){const id=deck[deckIndex].id;learned.has(id)?learned.delete(id):learned.add(id);showDeck()}
  if(action==='shuffle-deck'){for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]}deckIndex=0;revealed=false;showDeck()}
  if(action==='plan-list'||action==='plan-board'){board=action==='plan-board';showPlan()}
 });
 $('#module-sidebar-toggle').addEventListener('click',()=>sidebar(mobile()?!root.classList.contains('sidebar-open'):root.classList.contains('sidebar-collapsed')));
 $('#module-sidebar-close').addEventListener('click',()=>{sidebar(false);$('#module-sidebar-toggle').focus()});$('#module-sidebar-backdrop').addEventListener('click',()=>sidebar(false));
 $('#module-tool-search').addEventListener('input',nav);$('#module-category-select').addEventListener('change',e=>{category=e.target.value;nav()});
 $('#module-paste').addEventListener('click',async()=>{if(busy)return;const version=viewNumber;try{const text=await navigator.clipboard.readText();if(version!==viewNumber||!tool)return;const input=$('#text-input');if(input){input.value=text.slice(0,tool.limit);input.dispatchEvent(new Event('input'));input.focus()}}catch{onNotify('Use Ctrl / ⌘ + V to paste into the editor.')}});
 window.addEventListener('resize',()=>{if(tool)sidebar(!mobile())});
 document.addEventListener('keydown',e=>{if(!tool)return;if(e.key==='Escape'&&root.classList.contains('sidebar-open'))sidebar(false);if((e.metaKey||e.ctrlKey)&&e.key==='Enter'&&!busy){e.preventDefault();onRun()}});
 function clearFile(){root.classList.remove('has-source-file');if(tool)$('#dock-action-note').textContent='Add your input above, then '+profile.action.toLowerCase()+'.';mediaVersion++;player?.pause();player=null;sourceURL='';processedURL='';sourceFile=null;duration=0;$('#module-media').innerHTML='';$('#module-media').classList.add('hidden')}
 function promptContext(){return (profile?.fields||[]).map(f=>{const value=$('#module-extra-'+f.id)?.value.trim();return value?`${f.label}: ${value}`:''}).filter(Boolean).join('\n')}
 return {open,hide,empty,setBusy,fail,fileSelected,clearFile,result,profile:()=>profile,promptContext,updateEditor};
}
