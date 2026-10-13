import {providerFor} from './cloud-tools.js';

const CHAT_ENDPOINTS={groq:'https://api.groq.com/openai/v1/chat/completions',mistral:'https://api.mistral.ai/v1/chat/completions',openrouter:'https://openrouter.ai/api/v1/chat/completions',cerebras:'https://api.cerebras.ai/v1/chat/completions',fireworks:'https://api.fireworks.ai/inference/v1/chat/completions'};
const textOf=value=>typeof value==='string'?value:Array.isArray(value)?value.map(x=>x.text||'').join('\n'):'';
const form=entries=>{const body=new FormData();for(const [key,value] of Object.entries(entries))if(value!==undefined&&value!==null&&value!=='')body.append(key,value);return body};
const json=value=>({body:JSON.stringify(value),headers:{'Content-Type':'application/json'}});
const wait=(ms,signal)=>new Promise((resolve,reject)=>{if(signal?.aborted){reject(new DOMException('Stopped','AbortError'));return}const done=()=>{signal?.removeEventListener('abort',abort);resolve()};const timer=setTimeout(done,ms);const abort=()=>{clearTimeout(timer);reject(new DOMException('Stopped','AbortError'))};signal?.addEventListener('abort',abort,{once:true})});
function utteranceText(items,milliseconds=false){return items.map(x=>`[${Math.floor((x.start||0)/(milliseconds?1000:1)/60).toString().padStart(2,'0')}:${Math.floor((x.start||0)/(milliseconds?1000:1)%60).toString().padStart(2,'0')}] Speaker ${typeof x.speaker==='number'?x.speaker+1:x.speaker||'?'}: ${x.transcript||x.text||''}`).join('\n\n')}
function publicURL(value){let url;try{url=new URL(value)}catch{throw new Error('Enter a complete public web page URL beginning with https://.')}if(!['https:','http:'].includes(url.protocol)||url.username||url.password||!url.hostname.includes('.')||/^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(url.hostname)||url.hostname.includes(':'))throw new Error('Use a public http or https web page URL. Local and private addresses are not supported.');return url.href}
export function validateCloudInput(tool,input){
 if(['transcribe','audio-translate','image-remove','image-upscale','vision'].includes(tool.operation)&&!input.file)throw new Error('Choose a file first.');
 if(input.file){const image=['image-remove','image-upscale','vision'].includes(tool.operation);if(image&&!['image/jpeg','image/png','image/webp'].includes(input.file.type))throw new Error('Choose a JPG, PNG, or WebP image.');if(!image&&!/^audio\//.test(input.file.type)&&!['video/mp4','video/webm'].includes(input.file.type))throw new Error('Choose an audio recording or an MP4 / WebM soundtrack.');if(input.file.size>(image?10:20)*1024*1024)throw new Error(`Choose a file under ${image?10:20} MB.`)}
 if(!['transcribe','audio-translate','image-remove','image-upscale'].includes(tool.operation)&&!input.text?.trim())throw new Error('Add your text, question, or prompt first.');
 if((input.text||'').length>12000)throw new Error('Keep your text under 12,000 characters.');
 if(tool.operation==='rerank'){const docs=input.documents?.split(/\r?\n/).map(x=>x.trim()).filter(Boolean)||[];if(docs.length<2||docs.length>20||docs.some(x=>x.length>1500))throw new Error('Add 2–20 passages, one per line, with at most 1,500 characters each.');return docs}
 if(tool.operation==='reader')publicURL(input.text.trim());
 if(tool.operation==='tts'&&tool.provider==='cartesia'&&!input.voice?.trim())throw new Error('Choose or enter a Cartesia voice ID.');
 return null;
}
export async function runCloudTool({tool,key,input,history=[],signal,onStatus=()=>{},fetchImpl=globalThis.fetch,pollMs=3000}){
 const provider=providerFor(tool);if(!provider)throw new Error('Unknown provider.');if(!key?.trim())throw new Error(`Connect your ${provider.name} API key first.`);const documents=validateCloudInput(tool,input);key=key.trim();
 async function request(url,options={},kind='json'){
  if(signal?.aborted)throw new DOMException('Stopped','AbortError');
  let response;try{response=await fetchImpl(url,{method:'POST',...options,signal,credentials:'omit',referrerPolicy:'no-referrer'})}catch(error){if(error.name==='AbortError')throw error;throw new Error(`Could not connect to ${provider.name}. Check your connection and provider availability. A browser or provider restriction may block this request.`)}
  if(!response.ok){let detail='';try{const data=await response.json();detail=data.error?.message||data.error||data.message||data.detail||'';if(typeof detail!=='string')detail=''}catch{}
   detail=detail.split(key).join('[hidden]').slice(0,240);
   if(response.status===401||response.status===403)throw new Error(`${provider.name} rejected this key or its permissions. Reconnect a valid key for this feature.${detail?' '+detail:''}`);
   if(response.status===402||response.status===429)throw new Error(`${provider.name} reports an exhausted balance or usage limit. ${provider.after} Check your provider dashboard before trying again.`);
   throw new Error(`${provider.name} request failed (${response.status}).${detail?' '+detail:' Check the model and input, then try again.'}`);
  }
  if(kind==='blob'){const blob=await response.blob();if(!blob.size)throw new Error('The provider returned an empty file.');return blob}
  if(kind==='text')return response.text();
  return response.json();
 }
 const bearer={'Authorization':'Bearer '+key};const maxTokens=Math.max(128,Math.min(2048,Number(input.maxTokens)||1024));
 const system=tool.system||'You are a helpful AI assistant. Be honest about uncertainty. Do not invent facts or claim to execute actions.';
 const previous=history.slice(-12).filter(x=>['user','assistant'].includes(x.role)).map(x=>({role:x.role,content:String(x.content).slice(0,12000)}));
 let prompt=input.text?.trim()||'';if(tool.operation==='translate')prompt=`Translate the following text into ${String(input.language||'Urdu').slice(0,60)}. Preserve its meaning and return only the translation.\n\n${prompt}`;
 onStatus('Sending your input to '+provider.name+'…');
 if(CHAT_ENDPOINTS[tool.provider]&&['chat','text'].includes(tool.operation)){
  const model=provider.model;const data=await request(CHAT_ENDPOINTS[tool.provider],{...json({model,messages:[{role:'system',content:system},...(tool.operation==='chat'?previous:[]),{role:'user',content:prompt}],max_tokens:maxTokens,stream:false}),headers:{...bearer,'Content-Type':'application/json'}});
  return {kind:'text',text:textOf(data.choices?.[0]?.message?.content),model:data.model||model};
 }
 if(tool.provider==='gemini'){
  const parts=[{text:prompt}];if(tool.operation==='vision'){const bytes=new Uint8Array(await input.file.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));parts.push({inlineData:{mimeType:input.file.type,data:btoa(binary)}})}
  const data=await request(`https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent`,{...json({systemInstruction:{parts:[{text:system}]},contents:[...(tool.operation==='chat'?previous.map(x=>({role:x.role==='assistant'?'model':'user',parts:[{text:x.content}]})):[]),{role:'user',parts}],generationConfig:{maxOutputTokens:maxTokens}}),headers:{'x-goog-api-key':key,'Content-Type':'application/json'}});
  const text=data.candidates?.[0]?.content?.parts?.filter(x=>!x.thought).map(x=>x.text||'').join('\n');if(!text)throw new Error('Gemini returned no readable text. The request may have been blocked or reached an output limit. Check the prompt and try a shorter input.');return {kind:'text',text,model:provider.model};
 }
 if(tool.provider==='jina'){
  if(tool.operation==='reader'){const data=await request('https://r.jina.ai/'+publicURL(prompt),{method:'GET',headers:{...bearer,'Accept':'text/plain'}},'text');return {kind:'text',text:data}}
  if(tool.operation==='web-search'){const data=await request('https://deepsearch.jina.ai/v1/chat/completions',{...json({model:'jina-deepsearch-v1',messages:[{role:'user',content:prompt}],max_tokens:maxTokens,stream:false}),headers:{...bearer,'Content-Type':'application/json'}});return {kind:'text',text:textOf(data.choices?.[0]?.message?.content),links:data.choices?.[0]?.message?.annotations||[]}}
  const data=await request('https://api.jina.ai/v1/rerank',{...json({model:provider.model,query:prompt,documents,top_n:Math.min(5,documents.length)}),headers:{...bearer,'Content-Type':'application/json'}});return {kind:'ranked',items:(data.results||[]).map(x=>({text:documents[x.index],score:x.relevance_score,index:x.index}))};
 }
 if(tool.provider==='groq'&&['transcribe','audio-translate'].includes(tool.operation)){
  const translating=tool.operation==='audio-translate';const data=await request('https://api.groq.com/openai/v1/audio/'+(translating?'translations':'transcriptions'),{headers:bearer,body:form({file:input.file,model:translating?'whisper-large-v3':'whisper-large-v3-turbo',response_format:'json'})});return {kind:'text',text:data.text};
 }
 if(tool.provider==='stability'){
  const path=tool.operation==='image-generate'?'generate/core':tool.operation==='image-remove'?'edit/remove-background':'upscale/fast';
  const body=tool.operation==='image-generate'?form({prompt,output_format:'png',aspect_ratio:input.aspect||'1:1'}):form({image:input.file,output_format:'png'});
  const blob=await request('https://api.stability.ai/v2beta/stable-image/'+path,{headers:{...bearer,Accept:'image/*'},body},'blob');return {kind:'image',blob};
 }
 if(tool.provider==='elevenlabs'){
  const headers={'xi-api-key':key};
  if(tool.operation==='transcribe'){const data=await request('https://api.elevenlabs.io/v1/speech-to-text',{headers,body:form({file:input.file,model_id:'scribe_v2',diarize:'true',timestamps_granularity:'word'})});return {kind:'text',text:data.text,words:data.words||[]}}
  if(tool.operation==='sound-effects'){const blob=await request('https://api.elevenlabs.io/v1/sound-generation',{headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({text:prompt,model_id:'eleven_text_to_sound_v2',duration_seconds:Math.max(.5,Math.min(30,Number(input.duration)||5)),prompt_influence:.3})},'blob');return {kind:'audio',blob}}
  const voice=encodeURIComponent(input.voice||'JBFqnCBsd6RMkjVDRZzb');const blob=await request('https://api.elevenlabs.io/v1/text-to-speech/'+voice+'?output_format=mp3_44100_128',{headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({text:prompt,model_id:'eleven_flash_v2_5'})},'blob');return {kind:'audio',blob};
 }
 if(tool.provider==='cartesia'){
  const headers={...bearer,'Cartesia-Version':'2026-08-14'};
  if(tool.operation==='transcribe'){const data=await request('https://api.cartesia.ai/stt',{headers,body:form({file:input.file,model:'ink-whisper',language:'en','timestamp_granularities[]':'word'})});return {kind:'text',text:data.text}}
  const blob=await request('https://api.cartesia.ai/tts/bytes',{headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({model_id:'sonic-3.6',transcript:prompt,voice:input.voice||'db6b0ed5-d5d3-463d-ae85-518a07d3c2b4',language:'en',output_format:{container:'wav',encoding:'pcm_s16le',sample_rate:44100}})},'blob');return {kind:'audio',blob};
 }
 if(tool.provider==='deepgram'){
  const auth={'Authorization':'Token '+key};
  if(tool.operation==='tts'){const blob=await request('https://api.deepgram.com/v1/speak?model=aura-2-thalia-en&encoding=linear16&container=wav&sample_rate=24000',{...json({text:prompt}),headers:{...auth,'Content-Type':'application/json'}},'blob');return {kind:'audio',blob}}
  const data=await request('https://api.deepgram.com/v1/listen?model=nova-3&language=en&diarize_model=latest&punctuate=true&smart_format=true&utterances=true',{headers:{...auth,'Content-Type':input.file.type||'application/octet-stream'},body:input.file});return {kind:'text',text:input.speakers&&data.results?.utterances?.length?utteranceText(data.results.utterances):data.results?.channels?.[0]?.alternatives?.[0]?.transcript||''};
 }
 if(tool.provider==='assemblyai'){
  const auth={'Authorization':key};onStatus('Uploading audio to AssemblyAI…');
  const uploaded=await request('https://api.assemblyai.com/v2/upload',{headers:{...auth,'Content-Type':'application/octet-stream'},body:input.file});
  const created=await request('https://api.assemblyai.com/v2/transcript',{...json({audio_url:uploaded.upload_url,speech_models:['universal-3-5-pro','universal-2'],speaker_labels:!!tool.speakers,punctuate:true,format_text:true,language_detection:true}),headers:{...auth,'Content-Type':'application/json'}});
  if(!created.id)throw new Error('AssemblyAI did not return a transcript ID. Check your provider dashboard before submitting again.');
  for(let attempt=0;attempt<80;attempt++){onStatus('AssemblyAI is transcribing your recording…');await wait(pollMs,signal);const data=await request('https://api.assemblyai.com/v2/transcript/'+encodeURIComponent(created.id),{method:'GET',headers:auth});if(data.status==='error')throw new Error('AssemblyAI could not transcribe this recording: '+String(data.error||'unknown error').split(key).join('[hidden]').slice(0,220));if(data.status==='completed')return {kind:'text',text:tool.speakers&&data.utterances?.length?utteranceText(data.utterances,true):data.text||''}}
  throw new Error('Your AssemblyAI job is still processing. Check your provider dashboard before submitting again; this recording may already be billed.');
 }
 throw new Error('This provider operation is not supported.');
}

export async function listCloudVoices(providerId,key,{signal,fetchImpl=globalThis.fetch}={}){
 if(!key)throw new Error('Connect your API key before loading voices.');
 const cartesia=providerId==='cartesia';if(!cartesia&&providerId!=='elevenlabs')throw new Error('This provider uses a fixed default voice.');
 const response=await fetchImpl(cartesia?'https://api.cartesia.ai/voices':'https://api.elevenlabs.io/v1/voices',{headers:cartesia?{'Authorization':'Bearer '+key,'Cartesia-Version':'2026-08-14'}:{'xi-api-key':key},signal,credentials:'omit',referrerPolicy:'no-referrer'});if(!response.ok)throw new Error('Could not load voices. Check the key’s permissions and provider availability.');
 const data=await response.json();const items=cartesia?(Array.isArray(data)?data:data.data||[]):data.voices||[];return items.map(x=>({id:x.id||x.voice_id,name:x.name||x.id||x.voice_id})).filter(x=>x.id).slice(0,100);
}
