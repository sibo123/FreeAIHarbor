export const CATEGORIES = [
 {name:'Chat & Assistants',icon:'chat'}, {name:'Writing',icon:'pen'},
 {name:'Images & Design',icon:'image'}, {name:'Video',icon:'video'},
 {name:'Audio & Music',icon:'audio'}, {name:'Research',icon:'compass'},
 {name:'Coding',icon:'code'}, {name:'Productivity',icon:'clock'},
 {name:'Learning & Data',icon:'graduation'}, {name:'Local & Open Source',icon:'monitor'}
];
export const ACCESS_LABELS = {free:'Fully free','free-plan':'Free plan','open-source':'Free local software'};
export const FEATURED_IDS = ['chatgpt','perplexity','upscayl'];
export const RECOMMENDED_IDS = ['chatgpt','gemini','perplexity','notebooklm','bing-image-creator','adobe-firefly','leonardo-ai','clipchamp','adobe-enhance-speech','ttsmaker','upscayl','deepseek','quillbot','goblin-tools','bolt-new','google-ai-studio','github-copilot-free','cleanup-pictures','ideogram','krea','kdenlive','claude','duck-ai','microsoft-designer','qwen','remove-bg','elevenlabs-text-to-speech','whisper','ollama','lm-studio','grammarly'];
export const COLLECTIONS = [
 {id:'creators',name:'The creator’s toolkit',description:'Turn ideas into images, polished video, and clearer audio.',icon:'sparkles',categories:['Images & Design','Video','Audio & Music'],tags:['captions','copywriting']},
 {id:'small-business',name:'Make room for your business',description:'Write copy, plan your work, and make your everyday tasks easier.',icon:'briefcase',categories:['Writing','Productivity'],ids:['chatgpt','gemini','claude','canva','microsoft-designer','perplexity','adobe-express']},
 {id:'learners',name:'Stay curious. Learn more.',description:'Explore research, understand documents, and make sense of new ideas.',icon:'graduation',categories:['Research','Learning & Data'],ids:['chatgpt','gemini','claude','duck-ai','deepl-translate','google-translate']},
 {id:'local',name:'Bring AI closer to home',description:'Explore tools you can run on your own computer, with setup details included.',icon:'monitor',access:'open-source'}
];
export function normalize(text){return String(text||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
export function belongsToCollection(tool,collection){
 if(!collection)return true;
 return !!(collection.access && tool.access===collection.access || collection.categories?.includes(tool.category) || collection.ids?.includes(tool.id) || collection.tags?.some(tag=>tool.tags.includes(tag)));
}
export function filterTools(tools,filters={}){
 const terms=normalize(filters.query).trim().split(/\s+/).filter(Boolean);
 const saved=filters.savedIds instanceof Set ? filters.savedIds : new Set(filters.savedIds||[]);
 const collection=COLLECTIONS.find(c=>c.id===filters.collection);
 return tools.filter(tool=>{
  if(filters.category && filters.category!=='all' && tool.category!==filters.category)return false;
  if(filters.access && filters.access!=='all' && tool.access!==filters.access)return false;
  if(filters.noSignup && tool.signup==='required')return false;
  if(filters.browserOnly && (tool.access==='open-source'||!tool.platform.includes('browser')))return false;
  if(filters.savedOnly && !saved.has(tool.id))return false;
  if(!belongsToCollection(tool,collection))return false;
  const searchable=normalize([tool.name,tool.description,tool.category,...tool.tags,tool.aliases||''].join(' '));
  return terms.every(term=>searchable.includes(term));
 });
}
export function sortTools(tools,order='recommended'){
 const sorted=[...tools];
 const alpha=(a,b)=>a.name.localeCompare(b.name,'en',{sensitivity:'base'});
 if(order==='az')return sorted.sort(alpha);
 if(order==='za')return sorted.sort((a,b)=>alpha(b,a));
 const rank=id=>{const i=RECOMMENDED_IDS.indexOf(id);return i<0?1000:i};
 return sorted.sort((a,b)=>rank(a.id)-rank(b.id)||alpha(a,b));
}
export function readSaved(storage,validIds){
 try{const raw=JSON.parse(storage.getItem('freeaiharbor-saved-v1')||'[]');return new Set(Array.isArray(raw)?raw.filter(id=>validIds.has(id)):[])}catch{return new Set()}
}
export function toggleSaved(saved,id){const next=new Set(saved);next.has(id)?next.delete(id):next.add(id);return next}
export function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
