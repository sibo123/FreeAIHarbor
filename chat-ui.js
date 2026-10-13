import {icon} from './icons.js';
import {escapeHTML as esc} from './lab-tools.js';
import {CHAT_KEY,loadChats,saveChats,createConversation,conversationContext,exportConversation} from './chat-store.js';
export function createChatUI({onExit,notify}){
 const $=s=>document.querySelector(s),root=$('#chat-layout');
 let storage;try{storage=localStorage}catch{storage={getItem:()=>null,setItem:()=>{throw new Error('No storage')}}}
 let chats=loadChats(storage),currentId=null,visible=false,busy=false,worker=null,requestId=0,pending=null,search='',partialTimer=null;
 const current=()=>chats.find(c=>c.id===currentId);
 function persist(){const ok=saveChats(storage,chats);$('#chat-storage-note').textContent=ok?'Conversations saved on this browser.':'History cannot be saved here. Export a chat before closing this tab.';return ok}
 function resizeComposer(){const input=$('#chat-input');input.style.height='auto';input.style.height=Math.min(180,Math.max(28,input.scrollHeight))+'px';$('#chat-character-count').textContent=input.value.length>2500?`${input.value.length} / 3,000`:'';syncSend()}
 function syncSend(){const b=$('#chat-send');b.disabled=!busy&&!$('#chat-input').value.trim();b.classList.toggle('is-stopping',busy);b.setAttribute('aria-label',busy?'Stop response':'Send message');b.innerHTML=icon(busy?'stop':'arrow-up');$('#chat-input').disabled=busy;$('#chat-runtime-status').classList.toggle('hidden',!busy)}
 function closeSidebar(){root.classList.remove('sidebar-open');const mobile=window.matchMedia?.('(max-width:720px)').matches;$('#chat-sidebar-toggle').setAttribute('aria-expanded',String(!mobile&&!root.classList.contains('sidebar-collapsed')));$('#chat-sidebar').inert=mobile||root.classList.contains('sidebar-collapsed');$('#chat-main').inert=false}
 function setURL(push=false){const u=new URL(location.href);u.search='';u.hash='';u.searchParams.set('tool','ai-chat');if(currentId)u.searchParams.set('chat',currentId);history[push?'pushState':'replaceState']({tool:'ai-chat',chat:currentId},'',u.pathname+u.search)}
 function renderSidebar(){
  const sorted=[...chats].sort((a,b)=>b.updatedAt-a.updatedAt).filter(c=>[c.title,...c.messages.map(m=>m.content)].join(' ').toLowerCase().includes(search.toLowerCase()));
  const midnight=new Date();midnight.setHours(0,0,0,0);let lastGroup='';
  $('#chat-recents').innerHTML=sorted.map(c=>{const group=c.updatedAt>=midnight.getTime()?'Today':c.updatedAt>=midnight.getTime()-86400000?'Yesterday':'Earlier';const heading=group!==lastGroup?`<div class="recent-group">${group}</div>`:'';lastGroup=group;return `${heading}<div class="recent-item${c.id===currentId?' selected':''}"><button class="recent-open" data-chat-open="${esc(c.id)}" title="${esc(c.title)}" ${c.id===currentId?'aria-current="true"':''}>${icon('chat')}<span>${esc(c.title)}</span></button><button class="recent-more" data-chat-menu="${esc(c.id)}" aria-label="Options for ${esc(c.title)}">${icon('more')}</button><div class="recent-menu hidden" data-menu-for="${esc(c.id)}"><button data-chat-rename="${esc(c.id)}">${icon('edit')} Rename</button><button data-chat-delete="${esc(c.id)}">${icon('trash')} Delete</button></div></div>`}).join('')||`<div class="recent-empty">${search?'No matching conversations.':'Your conversations will appear here.'}</div>`;
  $('#chat-panel-title').textContent=current()?.title||'New chat';$('#chat-export').disabled=!current()?.messages.some(m=>m.content);
 }
 function nearBottom(){const el=$('#chat-messages');return el.scrollHeight-el.scrollTop-el.clientHeight<100}
 function scrollBottom(force=false){const el=$('#chat-messages');if(force||nearBottom())el.scrollTop=el.scrollHeight}
 function messageHTML(m,index){
  const assistant=m.role==='assistant',text=m.content;
  return `<article class="conversation-message ${assistant?'assistant-message':'user-message'}" data-message-index="${index}">${assistant?`<span class="assistant-avatar"><img src="/favicon.svg" width="31" height="31" alt=""></span>`:''}<div class="message-body">${assistant?'<span class="message-author">Free AI Harbor</span>':''}<div class="message-text">${text?esc(text):m.status==='streaming'?'<span class="chat-thinking"><span></span><span></span><span></span></span>':''}</div>${m.status==='error'?`<div class="chat-response-error">${esc(m.error||'This response could not finish.')}<button data-chat-retry>Try again ${icon('arrow-right')}</button></div>`:''}${m.status==='interrupted'?'<div class="message-state">Response stopped</div>':''}${assistant&&text&&m.status!=='streaming'?`<button class="message-copy" data-chat-copy="${index}" aria-label="Copy response">${icon('check')} Copy</button>`:''}</div></article>`;
 }
 function renderMessages(force=true){const el=$('#chat-messages'),stick=force||nearBottom(),oldTop=el.scrollTop,chat=current();
  el.innerHTML=chat?.messages.length?`<div class="conversation-thread">${chat.messages.map(messageHTML).join('')}</div>`:`<div class="chat-welcome"><span class="chat-welcome-mark">${icon('sparkles')}</span><span class="section-kicker">YOUR IDEAS. YOUR SPACE.</span><h2>What’s on your mind?</h2><p>A place to think, write, and work things out.</p><div class="chat-suggestions"><button data-chat-suggestion="Help me brainstorm five content ideas for a small business.">${icon('sparkles')} Brainstorm an idea<small>Find a fresh direction</small></button><button data-chat-suggestion="Write a friendly email asking a client for feedback on a video draft.">${icon('pen')} Help me find the words<small>Start with a first draft</small></button><button data-chat-suggestion="Explain how solar panels work in simple words.">${icon('compass')} Explain something<small>Make the complicated clearer</small></button><button data-chat-suggestion="Break planning a productive week into small steps.">${icon('clock')} Make a simple plan<small>Take the next small step</small></button></div></div>`;
  if(stick)scrollBottom(true);else el.scrollTop=oldTop;
 }
 function renderPartial(text){if(!pending)return;const el=$('#chat-messages'),stick=nearBottom();pending.content=text;const node=el.querySelector(`[data-message-index="${current().messages.length-1}"] .message-text`);if(node)node.textContent=text;if(stick)scrollBottom(true);clearTimeout(partialTimer);partialTimer=setTimeout(persist,600)}
 function activate(id,push=true){stop(false);currentId=chats.some(c=>c.id===id)?id:null;pending=null;$('#chat-input').value='';resizeComposer();renderSidebar();renderMessages();setURL(push);closeSidebar();$('#chat-input').focus({preventScroll:true})}
 function newChat(){activate(null);$('#chat-announcement').textContent='New chat started.'}
 function runtime(message,percent){$('#chat-runtime-text').textContent=message;$('#chat-runtime-percent').textContent=percent===undefined?'':percent+'%';if(percent===undefined)$('#chat-runtime-progress').removeAttribute('value');else $('#chat-runtime-progress').value=percent}
 function complete(text){
  if(!pending)return;clearTimeout(partialTimer);pending.content=text||pending.content;pending.status='complete';if(!pending.content){pending.status='error';pending.error='No response was returned. Try a shorter or clearer message.'}
  current().updatedAt=Date.now();busy=false;pending=null;persist();renderSidebar();renderMessages(false);syncSend();$('#chat-announcement').textContent='Response ready.';$('#chat-input').focus({preventScroll:true});
 }
 function fail(detail){
  let message=detail;if(/fetch|download|network|404/i.test(detail))message='The model download could not finish. Check your connection and browser storage, then try again.';if(/memory|allocation|out of bounds/i.test(detail))message='There is not enough available memory. Close other tabs or try a desktop browser.';
  if(pending){pending.status='error';pending.error=message;pending=null}busy=false;worker?.terminate();worker=null;persist();renderMessages(false);syncSend();$('#chat-announcement').textContent='The response could not finish.';
 }
 function getWorker(){if(!worker){worker=new Worker('/ai-worker.js',{type:'module'});worker.onmessage=e=>{const d=e.data;if(d.id!==requestId||!visible||!busy)return;if(d.type==='status')runtime(d.message);if(d.type==='progress')runtime(d.message,d.progress);if(d.type==='partial')renderPartial(d.text);if(d.type==='result')complete(d.result.text);if(d.type==='error')fail(d.message)};worker.onerror=()=>fail('The AI runtime could not start. Try a recent desktop browser.')};return worker}
 function send(text,retry=false){
  if(busy)return;const message=(text??$('#chat-input').value).trim();if(!message)return;if(message.length>3000){notify('Please keep your message under 3,000 characters.');return}
  let chat=current();if(!chat){chat=createConversation(message);chats.unshift(chat);currentId=chat.id}
  let context=conversationContext(chat.messages);
  if(retry){const last=chat.messages.at(-1);if(last?.role==='assistant'&&last.status!=='complete')chat.messages.pop();context=conversationContext(chat.messages)}else chat.messages.push({role:'user',content:message,status:'complete'});
  pending={role:'assistant',content:'',status:'streaming'};chat.messages.push(pending);chat.updatedAt=Date.now();busy=true;requestId++;$('#chat-input').value='';resizeComposer();renderSidebar();renderMessages();persist();setURL(false);runtime('Preparing AI on your device…');syncSend();
  try{getWorker().postMessage({id:requestId,toolId:'ai-chat',input:{text:message,history:context,tone:'Natural'}})}catch(e){fail(e.message)}
 }
 function stop(announce=true){if(!busy)return;requestId++;worker?.terminate();worker=null;clearTimeout(partialTimer);if(pending){pending.status='interrupted';pending=null}busy=false;persist();renderMessages(false);syncSend();if(announce)$('#chat-announcement').textContent='Response stopped.'}
 function show(id){visible=true;document.body.classList.add('chat-view');root.classList.remove('hidden');$('#workspace').setAttribute('aria-labelledby','chat-panel-title');search='';$('#chat-search').value='';if(chats.some(c=>c.id===id))currentId=id;else if(!currentId)currentId=chats[0]?.id||null;renderSidebar();renderMessages();syncSend();persist();setURL(false);closeSidebar()}
 function hide(){stop(false);worker?.terminate();worker=null;visible=false;root.classList.add('hidden');document.body.classList.remove('chat-view');$('#workspace').setAttribute('aria-labelledby','workspace-title');document.querySelectorAll('.recent-menu').forEach(m=>m.classList.add('hidden'))}
 async function copy(value){try{if(!navigator.clipboard)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(value);notify('Response copied.')}catch{notify('Select the response to copy it manually.')}}
 let renameId=null;
 root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-chat-new')){newChat();return}if(b.dataset.chatOpen){activate(b.dataset.chatOpen);return}
  if(b.dataset.chatMenu){const menu=[...root.querySelectorAll('[data-menu-for]')].find(el=>el.dataset.menuFor===b.dataset.chatMenu);const opening=menu?.classList.contains('hidden');root.querySelectorAll('.recent-menu').forEach(el=>el.classList.add('hidden'));menu?.classList.toggle('hidden',!opening);if(menu&&opening)menu.classList.toggle('menu-up',b.getBoundingClientRect().bottom+85>$('#chat-recents').getBoundingClientRect().bottom);return}
  if(b.dataset.chatRename){renameId=b.dataset.chatRename;$('#chat-rename-input').value=chats.find(c=>c.id===renameId)?.title||'';$('#chat-rename-dialog').showModal();$('#chat-rename-input').focus();root.querySelectorAll('.recent-menu').forEach(el=>el.classList.add('hidden'));return}
  if(b.dataset.chatDelete){const id=b.dataset.chatDelete;chats=chats.filter(c=>c.id!==id);if(id===currentId)activate(null,false);persist();renderSidebar();notify('Conversation deleted from this browser.');return}
  if(b.hasAttribute('data-chat-copy')){copy(current()?.messages[Number(b.dataset.chatCopy)]?.content||'');return}
  if(b.dataset.chatSuggestion){$('#chat-input').value=b.dataset.chatSuggestion;resizeComposer();$('#chat-input').focus();return}
  if(b.hasAttribute('data-chat-retry')){const text=[...(current()?.messages||[])].reverse().find(m=>m.role==='user')?.content;if(text)send(text,true);return}
 });
 $('#chat-form').addEventListener('submit',e=>{e.preventDefault();busy?stop():send()});$('#chat-input').addEventListener('input',resizeComposer);$('#chat-input').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();if(!busy)send()}});
 $('#chat-search').addEventListener('input',e=>{search=e.target.value;renderSidebar()});$('#chat-exit').addEventListener('click',onExit);
 $('#chat-sidebar-toggle').addEventListener('click',()=>{const mobile=window.matchMedia?.('(max-width:720px)').matches;const open=mobile?root.classList.toggle('sidebar-open'):!root.classList.toggle('sidebar-collapsed');$('#chat-sidebar-toggle').setAttribute('aria-expanded',String(open));$('#chat-sidebar').inert=!open;$('#chat-main').inert=mobile&&open;if(mobile&&open)$('#chat-sidebar-close').focus()});$('#chat-sidebar-backdrop').addEventListener('click',closeSidebar);$('#chat-sidebar-close').addEventListener('click',()=>{closeSidebar();$('#chat-sidebar-toggle').focus()});
 $('#chat-export').addEventListener('click',()=>{const chat=current();if(!chat)return;const url=URL.createObjectURL(new Blob([exportConversation(chat)],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='freeaiharbor-chat.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
 $('#chat-rename-form').addEventListener('submit',e=>{e.preventDefault();const title=$('#chat-rename-input').value.trim();const c=chats.find(c=>c.id===renameId);if(c&&title){c.title=title.slice(0,100);persist();renderSidebar();$('#chat-rename-dialog').close()}});$('#chat-rename-cancel').addEventListener('click',()=>$('#chat-rename-dialog').close());
 document.addEventListener('click',e=>{if(!e.target.closest('.recent-item'))root.querySelectorAll('.recent-menu').forEach(el=>el.classList.add('hidden'))});document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeSidebar();root.querySelectorAll('.recent-menu').forEach(el=>el.classList.add('hidden'))}});
 window.addEventListener('pagehide',()=>{clearTimeout(partialTimer);persist()});window.addEventListener('storage',e=>{if(e.key===CHAT_KEY&&!busy){chats=loadChats(storage);if(!chats.some(c=>c.id===currentId))currentId=null;if(visible){renderSidebar();renderMessages(false)}}});
 return {show,hide};
}
