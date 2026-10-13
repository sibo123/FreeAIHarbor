import {readStoredValue} from './browser-storage.js';
export const CHAT_KEY='freeaiharbor-chat-history-v1';
export function loadChats(storage){
 try{const raw=JSON.parse(readStoredValue(storage,CHAT_KEY,'openshelf-chat-history-v1')||'[]');if(!Array.isArray(raw))return [];
  const ids=new Set();return raw.filter(c=>c&&typeof c.id==='string'&&c.id.length<100&&!ids.has(c.id)&&ids.add(c.id)&&Array.isArray(c.messages)).map(c=>({
   id:c.id,title:String(c.title||'New chat').slice(0,100),createdAt:Number(c.createdAt)||Date.now(),updatedAt:Number(c.updatedAt)||Number(c.createdAt)||Date.now(),
   messages:c.messages.filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string').map(m=>({role:m.role,content:m.content,status:m.status==='streaming'?'interrupted':['complete','error','interrupted'].includes(m.status)?m.status:'complete',...(m.error?{error:String(m.error).slice(0,1000)}:{})}))
  })).sort((a,b)=>b.updatedAt-a.updatedAt);
 }catch{return []}
}
export function saveChats(storage,chats){try{storage.setItem(CHAT_KEY,JSON.stringify(chats));return true}catch{return false}}
export function titleFromMessage(text){const title=text.replace(/\s+/g,' ').trim();return title.length>46?title.slice(0,43)+'…':title||'New chat'}
export function createConversation(text,now=Date.now(),id=globalThis.crypto.randomUUID()){return {id,title:titleFromMessage(text),createdAt:now,updatedAt:now,messages:[]}}
export function conversationContext(messages){
 const context=[];for(let i=0;i<messages.length;i++){const m=messages[i];if(m.role==='user'&&messages[i+1]?.role==='assistant'&&messages[i+1].status==='complete'){context.push({role:'user',content:m.content},{role:'assistant',content:messages[++i].content})}}
 return context.slice(-6);
}
export function exportConversation(chat){return `${chat.title}\n\n${chat.messages.filter(m=>m.content).map(m=>`${m.role==='user'?'You':'Free AI Harbor'}\n${m.content}${m.status==='interrupted'?'\n[Response stopped]':''}`).join('\n\n')}`}
