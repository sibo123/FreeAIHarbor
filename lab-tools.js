import {EXTRA_TOOLS} from './extended-tools.js';
import {NEW_LOCAL_TOOLS} from './new-local-tools.js';
import {CLOUD_TOOLS,providerFor} from './cloud-tools.js';
export const MODELS={
 chat:{task:'text-generation',id:'HuggingFaceTB/SmolLM2-360M-Instruct',revision:'a10cc1512eabd3dde888204e902eca88bddb4951',dtype:'q8',size:'365 MB',label:'SmolLM2 360M',license:'Apache 2.0'},
 summary:{task:'summarization',id:'Xenova/distilbart-cnn-6-6',revision:'6b476295a3cf27d5b20e8c8b847a54ab8e5d0df9',dtype:'q8',size:'285 MB',label:'DistilBART',license:'Apache 2.0'},
 sentiment:{task:'sentiment-analysis',id:'Xenova/distilbert-base-uncased-finetuned-sst-2-english',revision:'0b6928efcb76139cae2c6881d49cda67fe119f42',dtype:'q8',size:'67 MB',label:'DistilBERT',license:'Apache 2.0'},
 qa:{task:'question-answering',id:'Xenova/distilbert-base-cased-distilled-squad',revision:'bdbb0a5e9c617c3c7ea9f3cbaf2be3ad871bcd7d',dtype:'q8',size:'65 MB',label:'DistilBERT SQuAD',license:'Apache 2.0'},
 entities:{task:'token-classification',id:'Xenova/bert-base-NER',revision:'8e892123e8b7c2c0c2bd1dcb598b7d244c4e53aa',dtype:'q8',size:'109 MB',label:'BERT NER',license:'MIT'},
 portrait:{task:'background-removal',id:'Xenova/modnet',revision:'fa2fa546052fba4c08921230a26cc69a333fca12',dtype:'fp32',size:'26 MB',label:'MODNet',license:'Apache 2.0'},
 classification:{task:'image-classification',id:'onnx-community/mobilenet_v2_1.0_224',revision:'c5903ea5f5bb219f02c85a778af0fedf14f502d8',dtype:'q8',size:'4 MB',label:'MobileNet V2',license:'Publisher model terms'},
 caption:{task:'image-to-text',id:'Xenova/vit-gpt2-image-captioning',revision:'215b4edcb7ec1fad5905a18a03f7b2007f6fabd0',dtype:'q8',size:'250 MB',label:'ViT + GPT-2',license:'Apache 2.0'},
 detection:{task:'object-detection',id:'Xenova/detr-resnet-50',revision:'8be7ab59ff663484ee9ba2e8d8f267330d5ad03e',dtype:'q8',size:'43 MB',label:'DETR',license:'Apache 2.0'},
 depth:{task:'depth-estimation',id:'Xenova/depth-anything-small-hf',revision:'2e942621ab9f2371c1df9eb223291b5ac31475e6',dtype:'q8',size:'27 MB',label:'Depth Anything',license:'Apache 2.0'},
 speech:{task:'automatic-speech-recognition',id:'Xenova/whisper-tiny',revision:'5332fcc35e32a33b86612b9a57a89be7906102b1',dtype:'q8',size:'42 MB',label:'Whisper Tiny',license:'MIT'},
 voice:{task:'text-to-speech',id:'Xenova/speecht5_tts',revision:'1723781b8ce2d02f0400c8337be04ae8ee3d6d56',dtype:'fp32',size:'645 MB',label:'SpeechT5',license:'MIT'},
 ocr:{task:'ocr',id:'tesseract.js',size:'15 MB+',label:'Tesseract OCR',license:'Apache 2.0'},
 embeddings:{task:'feature-extraction',id:'Xenova/all-MiniLM-L6-v2',revision:'751bff37182d3f1213fa05d7196b954e230abad9',dtype:'q8',size:'23 MB',label:'MiniLM sentence embeddings',license:'Apache 2.0'},
 topics:{task:'zero-shot-classification',id:'Xenova/nli-deberta-v3-xsmall',revision:'2a4f614a701367a02d51389039afc998faeda637',dtype:'q8',size:'88 MB',label:'DeBERTa NLI',license:'Apache 2.0'},
 mask:{task:'fill-mask',id:'Xenova/distilbert-base-uncased',revision:'5d73105e39e322b779ff7a8fcd11530fa579165b',dtype:'q8',size:'68 MB',label:'DistilBERT masked language model',license:'Apache 2.0'},
 imageLabels:{task:'zero-shot-image-classification',id:'Xenova/clip-vit-base-patch32',revision:'d15189d7028b43f1d3e65039190477f6af591c2a',dtype:'q8',size:'154 MB',label:'CLIP',license:'MIT'},
 sounds:{task:'audio-classification',id:'Xenova/ast-finetuned-audioset-10-10-0.4593',revision:'249a1fbf0286b40e7f1ed687a8ae396997bf7dc6',dtype:'q8',size:'91 MB',label:'Audio Spectrogram Transformer',license:'BSD 3-Clause'}
};
export const TRANSLATIONS={
 fr:{name:'French',model:'Xenova/opus-mt-en-fr',revision:'28726206f80896b90035bd99cccd5cc1e151f916',license:'Apache 2.0'},
 es:{name:'Spanish',model:'Xenova/opus-mt-en-es',revision:'4b002a4c7edd54a7ced58877258b87f7efd3f892',license:'Apache 2.0'},
 de:{name:'German',model:'Xenova/opus-mt-en-de',revision:'1ca130c44c4c5441ef16d48aae521a424ab644f7',license:'CC BY 4.0'}
};
export const REVERSE_TRANSLATIONS={
 fr:{name:'French',model:'Xenova/opus-mt-fr-en',revision:'6b166a182780e118c997879d0ad5be4b53671644',license:'Apache 2.0'},
 es:{name:'Spanish',model:'Xenova/opus-mt-es-en',revision:'eadfd7c658a9d8929ac3b8e996b68a68e2c7d480',license:'Apache 2.0'},
 de:{name:'German',model:'Xenova/opus-mt-de-en',revision:'399dfd68706739fffd503f876093e455ae268a06',license:'Apache 2.0'}
};
export const LAB_CATEGORIES=[{name:'All tools',icon:'grid'},{name:'Chat & Writing',icon:'pen'},{name:'Research & Text',icon:'compass'},{name:'Marketing & SEO',icon:'sparkles'},{name:'Study & Learning',icon:'graduation'},{name:'Business & Work',icon:'briefcase'},{name:'Images',icon:'image'},{name:'Audio & Video',icon:'audio'},{name:'Coding & Planning',icon:'code'}];
const text=(id,name,description,icon,prompt,placeholder,category='Chat & Writing')=>({id,name,description,icon,prompt,placeholder,category,kind:'text',model:'chat',tags:['writing','text','on-site'],limit:3000});
export const LAB_TOOLS=[
 text('ai-chat','AI Chat','Ask questions, explore ideas, and talk with an AI that runs on your device.','chat','', 'Ask a question or describe what you need help with…'),
 text('writing-assistant','Writing Assistant','Turn a topic or brief into a first draft, right in this workspace.','pen','Write a clear draft based on this brief.','Describe your topic, audience, and what you want to write…'),
 text('paraphraser','Paraphraser','Rewrite your own text with fresh wording while keeping its meaning.','pen','Rewrite the following text. Keep the original facts and meaning.','Paste the text you want to rewrite…'),
 text('email-writer','Email Writer','Draft an email from your purpose, key points, and preferred tone.','pen','Write an email using the information below. Do not invent facts.','Who is the email for? What should it say?…'),
 text('social-captions','Social Caption Writer','Create caption ideas for a post, product, or upcoming announcement.','sparkles','Write three short social media captions using this brief.','Describe the post, product, and your audience…'),
 text('product-copy','Product Description','Draft product copy from the features and details you provide.','briefcase','Write a concise product description. Only use the supplied features.','Product name, features, materials, and who it is for…'),
 text('video-script','Video Script Writer','Get a short script with a hook, key points, and a call to action.','video','Write a short video script with a hook, main points, and a call to action.','Describe the topic, video length, audience, and goal…'),
 text('brainstorm','Idea Brainstormer','Explore a handful of useful directions for your next project.','sparkles','Give five distinct ideas for this brief, with one sentence explaining each.','Tell me about your project and the ideas you need…'),
 text('code-helper','Code Helper','Ask for code explanations and small coding examples.','code','Help with this coding question. Explain your reasoning and note uncertainty.','Paste a small code example or explain what you want to build…','Coding & Planning'),
 text('task-planner','Task Planner','Break a goal into smaller, practical steps you can work through.','clock','Break this goal into a practical numbered list of small steps.','Describe your goal, constraints, and deadline…','Coding & Planning'),
 {id:'summarizer',name:'Text Summarizer',description:'Get a shorter version of an article, notes, or a passage of text.',icon:'folder',category:'Research & Text',kind:'text',model:'summary',tags:['summary','article','notes'],limit:5000,placeholder:'Paste an English article or passage to summarize…'},
 {id:'translator',name:'Text Translator',description:'Translate English text into French, Spanish, or German.',icon:'graduation',category:'Research & Text',kind:'text',model:'translation',tags:['translation','french','spanish','german'],limit:1200,placeholder:'Enter English text to translate…'},
 {id:'sentiment',name:'Sentiment Analyzer',description:'See whether English text sounds positive or negative, with a model score.',icon:'compass',category:'Research & Text',kind:'text',model:'sentiment',tags:['sentiment','reviews','analysis'],limit:1800,placeholder:'Paste a review, message, or short piece of English text…'},
 {id:'ask-text',name:'Ask Your Text',description:'Find a short answer to a question inside a passage you provide.',icon:'chat',category:'Research & Text',kind:'qa',model:'qa',tags:['questions','documents','answers'],limit:4500,placeholder:'Paste the English passage containing the answer…'},
 {id:'entity-finder',name:'Entity Finder',description:'Find people, organizations, locations, and other named entities in English text.',icon:'search',category:'Research & Text',kind:'text',model:'entities',tags:['names','people','locations','analysis'],limit:2500,placeholder:'Paste the English text you want to analyze…'},
 {id:'portrait-cutout',name:'Portrait Background Remover',description:'Create a transparent PNG cutout of a person in a photo.',icon:'image',category:'Images',kind:'image',model:'portrait',tags:['background removal','portrait','transparent png'],note:'Designed for photos of people. It may not work well on products or other objects.'},
 {id:'image-ocr',name:'Image to Text',description:'Extract written text from an image using local OCR.',icon:'pen',category:'Images',kind:'image',model:'ocr',tags:['ocr','text extraction','scan'],note:'Clear, straight text works best. Handwriting and decorative type may be inaccurate.'},
 {id:'image-caption',name:'Image Captioner',description:'Generate a short description of what is visible in a picture.',icon:'image',category:'Images',kind:'image',model:'caption',tags:['image description','caption','accessibility'],note:'The model can miss details or describe objects incorrectly. Check its output.'},
 {id:'image-classifier',name:'Image Classifier',description:'Get the most likely image labels and their model scores.',icon:'grid',category:'Images',kind:'image',model:'classification',tags:['image labels','recognition','classification'],note:'Uses ImageNet categories. Results are model estimates, not verified identifications.'},
 {id:'object-detector',name:'Object Detector',description:'Find common objects and draw labeled boxes on an image.',icon:'search',category:'Images',kind:'image',model:'detection',tags:['detection','objects','image recognition'],note:'Recognizes a fixed set of common object types. Small or unusual objects may be missed.'},
 {id:'depth-map',name:'Image Depth Map',description:'Create a grayscale estimate of the relative depth in your image.',icon:'image',category:'Images',kind:'image',model:'depth',tags:['depth','image processing','3d'],note:'Relative depth only. This is not a measurement of real-world distances.'},
 {id:'audio-transcription',name:'Audio Transcriber',description:'Turn a short audio recording into text without uploading it to a service.',icon:'audio',category:'Audio & Video',kind:'audio',model:'speech',tags:['speech to text','transcription','audio'],note:'Audio up to 2 minutes. Accuracy varies with language, recording quality, and background noise.'},
 {id:'subtitle-generator',name:'Subtitle Generator',description:'Create timed SRT subtitles from a short audio recording or video soundtrack.',icon:'video',category:'Audio & Video',kind:'audio',model:'speech',tags:['subtitles','srt','captions','video'],note:'Audio up to 2 minutes. For a video, upload its audio track. Check timings and text before publishing.'},
 {id:'text-to-speech',name:'Text to Speech',description:'Generate an English voice recording and download it as a WAV file.',icon:'audio',category:'Audio & Video',kind:'text',model:'voice',tags:['tts','voiceover','narration','speech'],limit:600,placeholder:'Type a short English passage to turn into speech…',note:'Uses one synthetic English voice. It does not clone voices.'},
 {id:'photo-editor',name:'AI Photo Editor',description:'Enhance, retouch, and apply cinematic AI-style filters and lighting adjustments to photos for free in your browser.',icon:'image',category:'Images',kind:'image',model:'canvas',tags:['photo editor','filters','enhance','retouch','color grade','free','on-site'],note:'Processes 100% on your device via client-side canvas. No file size or privacy limits.'},
 {id:'logo-designer',name:'AI Logo Designer',description:'Design free professional vector logos, modern brand emblems, and geometric marks with instant SVG & PNG export.',icon:'sparkles',category:'Marketing & SEO',kind:'text',model:'client',tags:['logo','branding','vector','svg','graphic design','free','on-site'],limit:300,placeholder:'Enter your brand name (e.g. Apex AI, Lumina, Harbor)…',note:'Generates 4 distinct vector SVG concepts with dark & light mockups. Download SVG or high-res PNG for free.'},
 {id:'prompt-generator',name:'AI Prompt Generator',description:'Generate masterfully engineered prompts for Midjourney, Stable Diffusion, DALL-E, ChatGPT, and Claude with customizable styles and parameters.',icon:'sparkles',category:'Chat & Writing',kind:'text',model:'client',tags:['prompt generator','midjourney','chatgpt','dall-e','flux','claude','free'],limit:2000,placeholder:'Describe your idea or subject (e.g. a futuristic cyberpunk street market in Tokyo during rain)…',note:'Creates master prompts, parameter flags, negative prompt tokens, and creative variations with 1-click copy.'},
 ...EXTRA_TOOLS,
 ...NEW_LOCAL_TOOLS
];
export const FEATURED_LAB=['photo-editor','logo-designer','prompt-generator','ai-chat','portrait-cutout','audio-transcription'];
export function findTools({query='',category='All tools',access='all',savedOnly=false,saved=new Set()}={}){
 const terms=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
 return LAB_TOOLS.filter(t=>(category==='All tools'||t.category===category)&&(access==='all'||(access==='local-free'?!t.provider:t.access===access))&&(!savedOnly||saved.has(t.id))&&terms.every(w=>[t.name,t.description,...t.tags].join(' ').toLowerCase().includes(w)));
}
export function translationFor(tool,target='fr'){const list=tool.reverse?REVERSE_TRANSLATIONS:TRANSLATIONS;return list[target]||list.fr}
export function modelInfo(tool){
 if(tool.provider){const provider=providerFor(tool);return {label:provider.name,size:'No model download',allowance:provider.allowance,license:'Provider terms'}}
 if(tool.model==='translation'){const m=translationFor(tool);return {...m,id:m.model,label:'Opus MT',size:'110 MB per language pair'}}
 if(tool.after==='summary')return {...MODELS[tool.model],label:MODELS[tool.model].label+' + DistilBART',size:tool.model==='ocr'?'300 MB+':'327 MB'};
 if(!tool.model||tool.model==='canvas'||tool.model==='client'||!MODELS[tool.model])return {label:'In-browser engine',size:'Instant · 0 MB',license:'Client-side / Free'};
 return MODELS[tool.model];
}
export function taskMessages(tool,text,tone='Natural',history=[]){
 const content=tool.prompt?`${tool.prompt}\nUse a ${tone.toLowerCase()} tone.\n\n${text}`:text;
 return [{role:'system',content:'You are Free AI Harbor, a concise and helpful AI assistant. Be honest about uncertainty. Never pretend to be ChatGPT, Gemini, or Claude.'},...(tool.id==='ai-chat'?history.slice(-6):[]),{role:'user',content}];
}
export function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
export function formatTimestamp(seconds){const ms=Math.max(0,Math.round((seconds||0)*1000));return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms%3600000/60000)).padStart(2,'0')}:${String(Math.floor(ms%60000/1000)).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`}
export function toSRT(chunks,duration){return chunks.map((c,i)=>`${i+1}\n${formatTimestamp(c.timestamp?.[0]||0)} --> ${formatTimestamp(c.timestamp?.[1]??chunks[i+1]?.timestamp?.[0]??duration)}\n${c.text.trim()}\n`).join('\n')}
export function encodeWAV(samples,rate){const buffer=new ArrayBuffer(44+samples.length*2),v=new DataView(buffer);const s=(i,str)=>{for(let j=0;j<str.length;j++)v.setUint8(i+j,str.charCodeAt(j))};s(0,'RIFF');v.setUint32(4,36+samples.length*2,true);s(8,'WAVE');s(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);s(36,'data');v.setUint32(40,samples.length*2,true);for(let i=0;i<samples.length;i++){const x=Math.max(-1,Math.min(1,samples[i]));v.setInt16(44+i*2,x<0?x*32768:x*32767,true)}return buffer}
