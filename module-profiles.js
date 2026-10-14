const rewrite=new Set(['paraphraser','grammar-fixer','tone-rewriter','text-simplifier','text-expander','text-shortener','summarizer']);
const planners=new Set(['task-planner','study-plan','content-calendar']);
const code=new Set(['code-helper','code-debugger','regex-helper','sql-helper','test-case-ideas','code-comments','readme-writer']);
const families={
 chat:{label:'AI conversation',input:'Message',output:'Conversation',action:'Send'},
 writer:{label:'Writing studio',input:'Your brief',output:'Document',action:'Generate draft',empty:'Your next draft starts here.',hint:'Add a brief on the left. Generate a draft, then edit, copy, or export it.'},
 rewrite:{label:'Text editor',input:'Original text',output:'Rewritten text',action:'Rewrite text',empty:'Make every word count.',hint:'Paste your source text and choose a tone. Your revision appears alongside it.'},
 translate:{label:'Translation',input:'Source text',output:'Translation',action:'Translate',empty:'A little less lost in translation.',hint:'Choose a language pair, add your text, and translate it here.'},
 compare:{label:'Text comparison',input:'Compare passages',output:'Similarity report',action:'Compare meaning',empty:'Two passages. One comparison.',hint:'Add both passages to compare their meaning.'},
 research:{label:'Text analysis',input:'Source material',output:'Analysis',action:'Analyze text',empty:'Find a little more in your text.',hint:'Add your source material to see a structured analysis here.'},
 image:{label:'Image editor',input:'Image & settings',output:'Canvas',action:'Process image',empty:'Your canvas is ready.',hint:'Upload an image to start. Compare the original and processed image, then export your PNG.'},
 'image-text':{label:'OCR workspace',input:'Source image',output:'Extracted text',action:'Extract text',empty:'From picture to words.',hint:'Upload a scan or screenshot. Review its text in the editor alongside your source.'},
 'image-analysis':{label:'Image analysis',input:'Source image',output:'Image report',action:'Analyze image',empty:'A closer look at your image.',hint:'Upload an image to get captions, labels, or classification scores.'},
 audio:{label:'Audio studio',input:'Recording & settings',output:'Transcript',action:'Transcribe',empty:'A workspace for every word.',hint:'Upload a recording. Play it back while you review and edit its transcript.'},
 subtitles:{label:'Subtitle editor',input:'Soundtrack',output:'Caption timeline',action:'Create subtitles',empty:'Give your audio a readable timeline.',hint:'Upload a soundtrack to generate captions. Edit their text and timing, then export SRT.'},
 voice:{label:'Voice studio',input:'Voiceover script',output:'Audio preview',action:'Generate speech',empty:'Let your words be heard.',hint:'Write a short English script. Preview the generated voice and export a WAV file.'},
 code:{label:'Coding workspace',input:'Request / source',output:'AI answer',action:'Ask code assistant',empty:'A little help with the next line.',hint:'Add a coding question or snippet. Review the AI answer in the split editor.'},
 study:{label:'Study desk',input:'Study material',output:'Study sheet',action:'Create study material',empty:'A little clarity goes a long way.',hint:'Add your notes or learning goal. Build a worksheet, explanation, or study deck.'},
 planner:{label:'Planning board',input:'Goal & constraints',output:'Your plan',action:'Create plan',empty:'Make room for a clear next step.',hint:'Describe your goal. Turn the result into a task list or board and track your progress.'}
};
const actions={paraphraser:'Paraphrase', 'grammar-fixer':'Correct grammar', 'text-simplifier':'Simplify text','text-expander':'Expand text','text-shortener':'Shorten text',summarizer:'Summarize', 'portrait-cutout':'Remove background','depth-map':'Create depth map','object-detector':'Detect objects','image-caption':'Describe image','image-text-summary':'Extract & summarize','audio-summary':'Transcribe & summarize','speech-translator':'Translate speech','sound-classifier':'Identify sounds','flashcard-maker':'Create flashcards','practice-quiz':'Draft quiz','semantic-search':'Search passages','keyword-extractor':'Find keywords','extractive-summary':'Find key sentences','duplicate-finder':'Compare passages','fill-mask':'Predict missing word', 'photo-editor':'Enhance Photo', 'logo-designer':'Generate Logos', 'prompt-generator':'Generate Prompts'};
export function workspaceProfile(tool){
 let family='writer';
 if(tool.provider)family='cloud';
 else if(tool.workspace)family=tool.workspace;
 else if(tool.id==='ai-chat')family='chat';
 else if(tool.model==='translation')family='translate';
 else if(tool.shape==='pair')family='compare';
 else if(tool.kind==='image')family=['portrait','depth','detection','canvas'].includes(tool.model)||tool.id==='photo-editor'?'image':tool.model==='ocr'?'image-text':'image-analysis';
 else if(tool.kind==='audio')family=tool.id==='subtitle-generator'?'subtitles':'audio';
 else if(tool.model==='voice')family='voice';
 else if(rewrite.has(tool.id))family='rewrite';
 else if(planners.has(tool.id))family='planner';
 else if(code.has(tool.id))family='code';
 else if(tool.category==='Study & Learning')family='study';
 else if(tool.category==='Research & Text')family='research';
 const p=family==='cloud'?{family,label:'Connected workspace',input:'Your input',output:'Provider result',action:'Run tool'}:{...families[family],family,action:actions[tool.id]||families[family].action};
 if(tool.id==='summarizer')p.output='Summary';
 if(tool.id==='grammar-fixer')p.output='Corrected text';
 if(tool.id==='text-to-speech')p.input='Voiceover script';
 if(tool.after==='summary')p.output='Summary';
 if(tool.id==='sound-classifier')p.output='Sound report';
 if(tool.id==='speech-translator')p.output='English translation';
 if(tool.mode==='flashcards'){p.label='Flashcard studio';p.output='Study deck';p.empty='Turn your notes into a study deck.'}
 const field=(id,label,placeholder)=>({id,label,placeholder,max:160});
 if(tool.id==='photo-editor')Object.assign(p,{label:'AI Photo Studio',input:'Image & filters',output:'Edited photo',action:'Enhance Photo',empty:'Your photo canvas is ready.',hint:'Upload an image to start. Choose a preset, lighting, and artistic effect, then compare before and after.',fields:[{id:'preset',label:'AI Preset Style',choices:['Auto Enhance','Cinematic Teal & Orange','Vibrant Colors','Cyberpunk Neon','Vintage Film Warmth','Crisp Monochrome B&W','Soft Portrait Glow','Dramatic High Contrast','Clean Studio Light']},{id:'lighting',label:'Lighting & Exposure',choices:['Balanced Normal','Brighten Shadows','Boost Exposure (+20%)','Dim Highlights (-20%)','HDR Clarity']},{id:'effect',label:'Artistic Effect',choices:['None','Vignette Border','Soft Background Blur','Golden Hour Glow','Cool Nordic Tint']},{id:'intensity',label:'Effect Intensity',choices:['100% Full Effect','75% Moderate','50% Subtle','125% Intense']}]});
 if(tool.id==='logo-designer')Object.assign(p,{label:'Logo Design Studio',input:'Brand brief',output:'Vector logos',action:'Generate Logos',empty:'Your brand identity starts here.',hint:'Enter your brand name, style, and industry to generate 4 distinct vector SVG logos with dark & light mockups.',fields:[field('brand','Brand Name','Your brand name (e.g. Apex, Lumina, Harbor)'),field('tagline','Slogan / Tagline (Optional)','e.g. Next Generation AI, Pure & Simple'),{id:'industry',label:'Industry / Niche',choices:['Technology & AI','Coffee & Cafe','Fitness & Athletics','Design & Creative Studio','Eco & Nature','Real Estate & Architecture','Fashion & Luxury','Gaming & Esports']},{id:'style',label:'Logo Aesthetic',choices:['Modern Geometric Mark','Minimalist Monogram','Badge & Shield Emblem','Abstract Dynamic Flow','Clean Wordmark + Icon']},{id:'palette',label:'Color Scheme',choices:['Emerald & Electric Mint','Cyber Neon Cyan & Violet','Royal Blue & Champagne Gold','Warm Sunset Amber & Coral','Charcoal, Platinum & Slate','Nordic Forest Sage & Cream']}]});
 if(tool.id==='prompt-generator')Object.assign(p,{label:'Prompt Engineering Studio',input:'Prompt concept or subject',output:'Engineered prompts',action:'Generate Prompts',empty:'Master-crafted prompts ready to use.',hint:'Describe your subject. Choose target engine, aesthetic style, lighting, and camera framing to generate production-ready prompts.',fields:[{id:'target',label:'Target AI Engine',choices:['Midjourney v6','Stable Diffusion / FLUX','DALL-E 3','ChatGPT & Claude (System Prompt)']},{id:'style',label:'Visual / Tone Style',choices:['Cinematic 35mm Photorealism','Unreal Engine 5 3D Render','Anime & Studio Ghibli Aesthetic','Cyberpunk Neon City','Vintage 1970s Film Grain','Minimalist Vector & Editorial','Dark Moody High Fantasy']},{id:'lighting',label:'Lighting & Atmosphere',choices:['Volumetric Golden Hour','Moody Chiaroscuro & Dramatic Shadows','Studio Softbox Commercial Light','Neon Cyber Rim Lighting','Ethereal Fog & Diffused Light','Overcast Natural Daylight']},{id:'shot',label:'Camera / Perspective',choices:['85mm Portrait (f/1.4 Soft Bokeh)','Wide Angle Cinematic (24mm)','Macro Detail Close-Up','Aerial Drone Bird\'s-Eye View','Dynamic Action Low Angle','Clean Centered Symmetrical']},{id:'aspect',label:'Aspect Ratio',choices:['16:9 (Landscape Cinematic)','9:16 (Vertical Story / Reel)','1:1 (Square Social)','4:5 (Instagram Portrait)','21:9 (Ultrawide Panoramic)']}]});
 if(tool.id==='email-writer')Object.assign(p,{label:'Email composer',input:'Key points',output:'Email draft',action:'Draft email',style:'email',fields:[field('recipient','Recipient','Name or role'),field('subject','Subject / goal','What is the email about?')]});
 if(tool.id==='product-copy')Object.assign(p,{input:'Features & details',output:'Product description',action:'Write description',fields:[field('product','Product name','Your product'),field('audience','Audience','Who is it for?')]});
 if(tool.id==='social-captions'||tool.id==='social-bio')Object.assign(p,{input:tool.id==='social-bio'?'Profile details':'Post brief',output:tool.id==='social-bio'?'Profile bio':'Caption drafts',action:tool.id==='social-bio'?'Write bio':'Write captions',fields:[field('brand','Brand / name','Your name or brand'),{id:'platform',label:'Platform',choices:['Instagram','Facebook','TikTok','LinkedIn','X']} ]});
 if(tool.id==='video-script')Object.assign(p,{label:'Script writer',input:'Topic & message',output:'Video script',action:'Draft script',fields:[{id:'length',label:'Video length',choices:['15 seconds','30 seconds','60 seconds']},field('audience','Audience','Who is watching?')]});
 if(tool.id==='seo-title'||tool.id==='meta-description')Object.assign(p,{style:'seo',input:'Page brief',output:tool.id==='seo-title'?'Title options':'Description options',action:tool.id==='seo-title'?'Write page titles':'Write descriptions',fields:[field('keyword','Target keyword','Your search phrase'),field('page-title','Page title','Your page title'),field('page-url','Page URL','yourwebsite.com/page')]});
 if(tool.id==='cover-letter')Object.assign(p,{input:'Experience & key points',output:'Cover letter',action:'Draft cover letter',fields:[field('role','Job title','The role you are applying for'),field('company','Company','Company name')]});
 if(tool.id==='resume-bullets')Object.assign(p,{input:'Experience & achievements',output:'Resume bullets',action:'Write resume bullets',fields:[field('role','Role','Your job title')]});
 return p;
}
export function wordCount(text){return text.trim()?text.trim().split(/\s+/).length:0}
export function mediaTime(seconds){const s=Math.max(0,Math.floor(Number(seconds)||0));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
export function waveformPeaks(samples,bins=96){
 const width=Math.max(1,Math.floor(samples.length/bins));return Array.from({length:bins},(_,i)=>{let peak=0;for(let j=i*width;j<Math.min(samples.length,(i+1)*width);j++)if(Number.isFinite(samples[j]))peak=Math.max(peak,Math.abs(samples[j]));return Math.min(1,peak)});
}
export function planItems(text){
 const lines=text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 const listed=lines.filter(x=>/^(?:[-*•]|\d+[.)])\s+/.test(x)||/^(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Day\s+\d+)\b/i.test(x));
 return (listed.length?listed:text.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean)).slice(0,20).map((text,id)=>({id,text:text.replace(/^(?:[-*•]|\d+[.)])\s+/,''),status:'todo'}));
}
export function planTranscript(items){return items.map(x=>`${x.status==='done'?'[x]':x.status==='doing'?'[~]':'[ ]'} ${x.text}`).join('\n')}
