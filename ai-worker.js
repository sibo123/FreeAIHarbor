import {MODELS,LAB_TOOLS,taskMessages,translationFor} from './lab-tools.js';
import {runSemantic,labelsFrom,flashcardFacts} from './semantic-tools.js';
let libPromise=null,currentPipe=null,currentKey=null;
const send=(id,type,data={})=>self.postMessage({id,type,...data});
async function library(){
 if(!libPromise)libPromise=import('./vendor/transformers.min.js').then(lib=>{
  lib.env.allowLocalModels=false;
  lib.env.useBrowserCache=true;
  lib.env.backends.onnx.wasm.numThreads=1;
  lib.env.backends.onnx.wasm.proxy=false;
  return lib;
 });
 return libPromise;
}
async function getPipe(id,tool,input){
 const lib=await library(),translation=translationFor(tool,input.target),spec=tool.model==='translation'?{task:'translation',id:translation.model,dtype:'q8',revision:translation.revision}:MODELS[tool.model];
 const key=[spec.id,spec.task,spec.dtype,spec.revision].join(':');
 if(currentKey!==key){
  if(currentPipe){await currentPipe.dispose();currentPipe=null;currentKey=null}
  send(id,'status',{message:'Preparing AI model. The first run downloads its files.'});
  const files=new Map();
  currentPipe=await lib.pipeline(spec.task,spec.id,{device:'wasm',dtype:spec.dtype,...(spec.revision?{revision:spec.revision}:{}),progress_callback:p=>{
   if(p.status==='progress'){files.set(p.file,{loaded:p.loaded||0,total:p.total||0});const all=[...files.values()];const total=all.reduce((n,f)=>n+f.total,0),loaded=all.reduce((n,f)=>n+f.loaded,0);send(id,'progress',{progress:total?Math.round(loaded/total*100):0,message:'Downloading model files…'})}
   else if(p.status==='ready')send(id,'status',{message:'Model loaded. Processing on your device…'});
   else if(p.status==='initiate')send(id,'status',{message:'Loading model files…'});
  }});
  currentKey=key;
 }
 send(id,'status',{message:'Model ready. Processing on your device…'});
 return {pipe:currentPipe,lib};
}
function generatedText(result){const value=result[0]?.generated_text??'';return typeof value==='string'?value:(value.findLast(m=>m.role==='assistant')?.content||'')}
function summaryOptions(text){const words=text.trim().split(/\s+/).length;return {max_new_tokens:Math.max(24,Math.min(130,Math.round(words*.8))),min_new_tokens:8,min_length:0,no_repeat_ngram_size:3,do_sample:false,truncation:true}}
async function execute(id,tool,input){
 if(tool.model==='ocr'&&tool.after==='summary')return summarizeSource(id,input.text,'Extracted text');
 if(tool.model==='mask'&&(input.text.match(/\[MASK\]/g)||[]).length!==1)throw new Error('Use exactly one [MASK] placeholder in your sentence.');
 const labels=tool.shape==='labels'?labelsFrom(input.labels||''):tool.labels;
 const {pipe,lib}=await getPipe(id,tool,input);
 if(tool.model==='chat'){
  if(tool.mode==='flashcards'){
   const facts=flashcardFacts(input.text),cards=[];
   for(const [index,fact] of facts.entries()){
    send(id,'status',{message:`Creating flashcard ${index+1} of ${facts.length}…`});
    const out=await pipe([{role:'user',content:`Create one simple question whose answer is this fact. Return only the question. Fact: ${fact}`}],{max_new_tokens:60,do_sample:false,return_full_text:false});
    cards.push({question:generatedText(out).trim().replace(/^Question:\s*/i,''),answer:fact});
   }
   return {kind:'flashcards',cards};
  }
  let partial='';const streamer=new lib.TextStreamer(pipe.tokenizer,{skip_prompt:true,skip_special_tokens:true,callback_function:text=>{partial+=text;send(id,'partial',{text:partial})}});
  const messages=input.project?[{role:'system',content:'Write concise, useful drafts. Use only the facts supplied by the user. Do not invent claims, prices, testimonials, or results.'},{role:'user',content:input.text}]:taskMessages(tool,input.text,input.tone,input.history);
  const result=await pipe(messages,{max_new_tokens:input.project?180:tool.id==='ai-chat'?128:240,do_sample:!input.project,temperature:.65,top_p:.9,repetition_penalty:1.12,return_full_text:false,streamer});
  return {kind:'text',text:generatedText(result)||partial};
 }
 if(tool.model==='summary'){const out=await pipe(input.text,summaryOptions(input.text));return {kind:'text',text:out[0].summary_text}}
 if(tool.model==='translation'){const out=await pipe(input.text,{max_new_tokens:180,do_sample:false});return {kind:'text',text:out[0].translation_text}}
 if(tool.model==='embeddings')return runSemantic(tool,input,pipe,message=>send(id,'status',{message}));
 if(tool.model==='topics'){const out=await pipe(input.text,labels,{multi_label:false});return {kind:'scores',items:out.labels.map((label,i)=>({label,score:out.scores[i]}))}}
 if(tool.model==='mask'){const out=await pipe(input.text,{top_k:5});return {kind:'mask',items:out.map(x=>({word:x.token_str.trim(),text:x.sequence,score:x.score}))}}
 if(tool.model==='sentiment'){const out=await pipe(input.text,{top_k:null,truncation:true});return {kind:'scores',items:out.flat().map(x=>({label:x.label,score:x.score}))}}
 if(tool.model==='qa'){const out=await pipe(input.question,input.text,{truncation:true});return {kind:'answer',text:out.answer,score:out.score}}
 if(tool.model==='entities'){const out=await pipe(input.text,{aggregation_strategy:'simple',truncation:true});return {kind:'entities',items:out}}
 if(tool.model==='speech'){
  const options={chunk_length_s:30,stride_length_s:5,return_timestamps:true,task:tool.speechTask||'transcribe'};if(input.language&&input.language!=='auto')options.language=input.language;
  const out=await pipe(input.audio,options);
  if(tool.after==='summary')return summarizeSource(id,out.text,'Transcript');
  return {kind:'transcription',text:out.text,chunks:out.chunks||[],duration:input.duration};
 }
 if(tool.model==='sounds'){
  if(input.duration>10)throw new Error('Use an audio clip up to 10 seconds long.');
  const out=await pipe(input.audio,{top_k:5});return {kind:'scores',items:out};
 }
 if(tool.model==='voice'){
  const out=await pipe(input.text,{speaker_embeddings:'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin'});
  return {kind:'audio',audio:out.audio,rate:out.sampling_rate};
 }
 const image=await lib.RawImage.fromBlob(input.image);
 if(tool.model==='imageLabels'){const out=await pipe(image,labels);return {kind:'scores',items:out}}
 if(tool.model==='portrait'){const out=await pipe(image);const blob=await out[0].toBlob();return {kind:'image',buffer:await blob.arrayBuffer(),mime:'image/png'}}
 if(tool.model==='classification'){const out=await pipe(image,{top_k:5});return {kind:'scores',items:out}}
 if(tool.model==='caption'){const out=await pipe(image,{max_new_tokens:50});return {kind:'text',text:out[0].generated_text}}
 if(tool.model==='detection'){const out=await pipe(image,{threshold:.55,percentage:true});return {kind:'detection',items:out}}
 if(tool.model==='depth'){const out=await pipe(image);const blob=await out.depth.toBlob();return {kind:'image',buffer:await blob.arrayBuffer(),mime:'image/png'}}
 throw new Error('This tool is not supported.');
}
async function summarizeSource(id,text,sourceTitle){
 if(!text?.trim())throw new Error('No readable text was found to summarize. Try a clearer recording or scan.');
 const sourceText=text.trim();
 if(sourceText.split(/\s+/).length<30)return {kind:'document',text:sourceText,sourceText,sourceTitle,brief:true,shortened:false};
 const {pipe}=await getPipe(id,{model:'summary'},{});
 const out=await pipe(sourceText.slice(0,5000),summaryOptions(sourceText.slice(0,5000)));
 return {kind:'document',text:out[0].summary_text,sourceText,sourceTitle,shortened:sourceText.length>5000};
}
self.onmessage=async event=>{
 const {id,toolId,input}=event.data,tool=LAB_TOOLS.find(t=>t.id===toolId);
 if(!tool){send(id,'error',{message:'Unknown tool.'});return}
 try{const result=await execute(id,tool,input);const transfer=[];if(result.buffer)transfer.push(result.buffer);if(result.audio?.buffer)transfer.push(result.audio.buffer);self.postMessage({id,type:'result',result},transfer)}
 catch(error){send(id,'error',{message:error?.message||'AI processing failed.'});currentPipe=null;currentKey=null;libPromise=null}
};
