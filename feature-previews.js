// Editorial illustrations of each workflow, not screenshots or live model results.
// Every registered tool has an explicit feature specification; no category fallback.
const rows=`
ai-chat|chat|Ask. Explore. Continue.|How can I start?|Let’s work through it.
writing-assistant|document|From brief to first draft|Your topic + audience|An editable first draft
paraphraser|rewrite|Same meaning. New wording.|A fresh start|A new beginning
email-writer|email|Turn notes into an email|Purpose · recipient · tone|Subject + message
social-captions|social|Captions for your next post|A new product reveal|Caption ideas + CTA
product-copy|product|Features into product copy|Leather · four card slots|A compact card holder
video-script|timeline|Build your video script|HOOK / MAIN POINT / CTA|A script you can film
brainstorm|ideas|Explore different directions|Your project idea|Five possible approaches
code-helper|code|Understand your code|items.map(double)|Explain each step
task-planner|checklist|Break a goal into steps|One big goal|Small practical tasks
summarizer|summary|Long passage. Short version.|Article + notes|A shorter summary
translator|translate|English into another language|Good morning|Bonjour
sentiment|scores|Positive or negative wording|I love the friendly service.|Positive / Negative
ask-text|answer|Find answers in your passage|When does it start?|Friday at 3 PM
entity-finder|entities|Highlight names and places|Marie Curie worked in Paris.|PERSON / LOCATION
portrait-cutout|cutout|Remove a portrait background|Portrait photo|Transparent PNG
image-ocr|scan|Read text from an image|Scanned printed text|Editable extracted text
image-caption|caption|Describe what is in a photo|A landscape photo|A short image description
image-classifier|image-labels|Suggest labels for a photo|Your uploaded image|Likely image categories
object-detector|detection|Find objects in an image|A person and a bicycle|Labeled bounding boxes
depth-map|depth|Estimate the depth of a scene|Your photo|Relative-depth image
audio-transcription|transcript|Speech into editable text|Your audio recording|A readable transcript
subtitle-generator|subtitles|Speech into timed subtitles|00:01 → 00:03|Download an SRT file
text-to-speech|voice|Turn your text into speech|Welcome to Free AI Harbor.|Listen + download WAV
photo-editor|photo|Adjust light, color, and detail|Original photo|Enhanced photo
logo-designer|logo|Create editable logo concepts|Your brand name|SVG + PNG concepts
prompt-generator|prompt|Build a detailed AI prompt|Subject + style + lighting|Prompt + parameters
grammar-fixer|correction|Correct grammar and spelling|We was planning.|We were planning.
tone-rewriter|rewrite|Change the tone of a message|Send it today.|Could you send it today?
text-simplifier|rewrite|Make complex wording simpler|Facilitate collaboration|Help people work together
text-expander|expand|Develop short notes into prose|Opening · Saturday · free|A fuller paragraph
text-shortener|summary|Keep the point. Use fewer words.|A longer paragraph|A concise version
blog-outline|outline|Give your article a structure|Your topic|Title + section headings
blog-intro|document|Start your article clearly|Topic + audience|An opening paragraph
headline-generator|headlines|Explore headline options|Your article idea|Five headline directions
seo-title|search-result|Draft search-friendly titles|Your target phrase|A concise page title
meta-description|search-result|Write your search snippet|Your page brief|A short page description
ad-copy|social|Turn product facts into an ad|Offer + real features|Headline + copy + CTA
slogan-generator|headlines|Find a short brand line|Your brand personality|Short slogan ideas
brand-names|ideas|Explore names for your brand|A cozy candle business|Five naming directions
content-calendar|calendar|Plan a week of content|Your audience + goal|Seven post ideas
audience-persona|profile|Sketch a customer persona|Your audience brief|Needs + possible objections
social-bio|profile|Write a concise profile bio|Who you are + what you do|Three short bio options
hashtag-ideas|tags|Find topic-relevant hashtags|Leather craft video|#Leathercraft #Handmade
call-to-action|cta|Give readers a clear next step|Your offer + goal|Download the checklist
concept-explainer|concept|Understand a difficult idea|Why do plants need light?|A simple explanation
study-notes|notes|Turn source text into notes|Your lesson material|Concise revision points
flashcard-maker|flashcards|Notes into study flashcards|What keeps planets in orbit?|Reveal the source answer
practice-quiz|mcq|Test what you have learned|Your source passage|Questions + answer key
lesson-plan|calendar|Plan a lesson around a goal|Topic + learning objective|Activity + quick check
vocabulary-helper|vocabulary|Learn words in context|reliable|Meaning + example sentence
analogy-maker|concept|Explain ideas with an analogy|Computer memory|An everyday comparison
study-plan|calendar|Fit revision into your time|Five days · three chapters|A manageable study plan
code-debugger|debug|Explore the cause of an error|Cannot read properties of null|A likely fix to review
regex-helper|regex|Draft a pattern and examples|Six numeric digits|^\\d{6}$
sql-helper|database|Turn a schema into a query|orders: customer_id, total|SELECT · SUM · GROUP BY
test-case-ideas|checklist|Think through edge cases|Age must be 18 or older|17 / 18 / 19 / invalid
code-comments|code|Explain code with comments|function double(n)|// Return twice the value
readme-writer|outline|Document your project|Purpose + setup + usage|A Markdown README
meeting-minutes|checklist|Notes into decisions and actions|Sara sends the draft Friday.|Owner / action / date
resume-bullets|document|Make your experience clearer|Your real responsibilities|Clear resume bullet points
cover-letter|email|Match experience to a role|Your experience + job details|A concise cover letter
interview-practice|quiz|Prepare for your interview|Role + responsibilities|Five practice questions
proposal-outline|outline|Structure a project proposal|Scope + supplied constraints|Deliverables + open questions
story-starter|document|Start a fictional scene|A book changes each night.|The opening of a story
character-builder|profile|Build a fictional character|A mechanic in a floating city|Motivation + conflict
poem-writer|poem|Give an idea a poetic shape|A garden after the rain|A short original poem
joke-writer|chat|Try a lighthearted joke|Plants + forgotten watering|Three playful directions
prompt-builder|prompt|Turn a rough ask into a prompt|I need video ideas.|Task + context + format
text-similarity|similarity|Compare meaning, not just words|A child plays with a dog.|A young person and a puppy.
semantic-search|search-list|Find a passage by meaning|Where can I borrow books?|The library lends books.
keyword-extractor|tags|Find phrases that represent a text|Urban gardens bring neighbors together.|urban gardens / community
duplicate-finder|duplicates|Find closely related passages|The cafe opens at eight.|Coffee is served from 8 AM.
extractive-summary|highlight|Find representative sentences|Your source passage|Key sentences, unchanged
topic-classifier|scores|Compare everyday topic labels|The new computer uses less energy.|Technology / Environment
custom-classifier|scores|Classify using your own labels|Your text + custom labels|Design / Price / Delivery
fill-mask|mask|Predict a missing word|A cup of [MASK]|tea / coffee / water
custom-image-labels|image-labels|Compare a photo with your labels|A cat · a dog · a bicycle|CLIP compares your choices
sound-classifier|sound|Estimate what a recording contains|A short sound clip|Music / barking / speech
speech-translator|audio-translate|Translate speech into English|Bonjour, bienvenue.|Hello, welcome.
audio-summary|audio-summary|Recording into transcript + summary|Your short recording|Transcript → summary
image-text-summary|scan-summary|Scan into text + summary|A printed document|OCR → shorter summary
reverse-translator|translate|French, Spanish, German to English|Bonjour|Good morning
ad-hook-lab|hooks|Explore different ad openings|One product brief|Hook + matching visual idea
ugc-shot-script|storyboard|Pair spoken lines with shots|Hook → problem → demo|Voice line / shot to film
vsl-outline|funnel|Structure a video sales letter|Offer + supplied evidence|Hook → solution → CTA
creative-brief|brief|Give your campaign a clear brief|Goal + audience + constraints|A focused creative direction
storyboard-planner|storyboard|Plan your video scene by scene|Scene 01 / 02 / 03|Framing + action + text
broll-planner|storyboard|Find shots that support your script|Your script line|A practical supporting shot
sound-design-brief|sound|Plan the sound of your edit|Quiet → reveal → logo|Music mood + effects
thumbnail-brief|thumbnail|Plan a readable thumbnail|One clear focal point|Short headline + layout
youtube-description|social|Write your video description|Topic + supplied links|Introduction + takeaways
carousel-planner|carousel|Turn an idea into social slides|One useful idea|Six-slide sequence
launch-checklist|checklist|Prepare for a product launch|What is ready? What is missing?|Before / launch / follow-up
ad-angle-explorer|ideas|Find different reasons to care|One product, five angles|Need + feature + hook
client-reply|email|Reply with clarity and care|Your client’s message|A professional reply
followup-email|email|Follow up with a clear next step|A draft awaiting feedback|A short, polite follow-up
invoice-email|invoice|Send the supplied invoice details|Invoice 014 · $180|Amount / due date / method
project-handover|folders|Explain what you are delivering|Final reels + project files|Files / usage / open items
portfolio-bio|profile|Introduce your real experience|Experience + services + tools|A first-person portfolio bio
case-study-outline|outline|Explain a project and its decisions|Brief + process + real results|Challenge → decisions → outcome
feedback-organizer|feedback|Turn scattered feedback into tasks|Larger captions. Less music.|Grouped revision actions
scope-questions|quiz|Ask the questions before you quote|An incomplete client request|Deliverables / assets / deadline
brief-checklist|checklist|Find what a brief is missing|Format is known; deadline is not.|Supplied / missing details
bullets-to-paragraph|expand|Connect bullet points into prose|Friday · two hours · free|One natural paragraph
faq-writer|faq|Facts into questions and answers|Workshop details|FAQ pairs grounded in your text
newsletter-draft|newsletter|Shape updates into a newsletter|Three announcements|Subject + sections + CTA
review-reply|review|Respond to customer feedback|A customer review|Acknowledgment + next step
proofreading-notes|correction|Understand suggested text edits|are new workshop|our new workshop + explanation
quiz-explanations|answer|Explain an answer from your notes|Question + answer + source|A grounded explanation
teachback-coach|feedback|Check your understanding|My explanation / source notes|Aligned points + gaps
socratic-questions|quiz|Examine an idea through questions|How can we reduce food waste?|Five thoughtful questions
reading-guide|outline|Give your reading a direction|A passage or chapter outline|Topics + questions + terms
essay-outline|outline|Organize an essay before writing|Topic + source notes|Introduction / body / conclusion
json-explainer|json|Understand fields and structure|{ "status": "draft" }|Field-by-field explanation
api-doc-draft|api|Describe how an endpoint works|GET /items|Inputs / response / known errors
commit-message|commit|Turn changes into a clear commit|Added filter; fixed empty state.|A concise Git commit message
css-helper|layout|Explore a responsive layout fix|Fixed-width columns overflow.|A flexible grid suggestion
shell-explainer|terminal|Understand a command safely|rg --files src|Explain without executing
algorithm-walkthrough|algorithm|Follow an algorithm step by step|Binary search for 8|Compare → narrow → find
purchase-intent|scores|Estimate a customer’s buying intent|I am ready to order.|Buy / compare / ask / support
customer-emotion|scores|Compare expressed customer emotions|This is so frustrating!|Frustrated / confused / satisfied
writing-tone|scores|Identify the tone of a passage|Please accept our apologies.|Apologetic / formal / friendly
product-category|scores|Suggest a broad shop category|A stainless steel saucepan|Home & kitchen / other labels
ad-message-angle|scores|Find the ad’s main selling angle|Fits in your pocket. Travels anywhere.|Portability / ease / value
message-intent|scores|Understand what a message is doing|Could you send the final version?|Request / question / thanks
email-priority|scores|Look for priority clues in an email|Please review this week.|Action / routine / information
review-aspect|scores|Find what a review is about|The parcel arrived quickly.|Delivery / quality / price
feedback-topics|scores|Classify creative feedback|The captions are too small.|Typography / layout / audio
request-router|scores|Compare support request categories|I cannot sign in.|Account / billing / delivery
writing-purpose|scores|Estimate a passage’s purpose|Join our free workshop.|Persuade / inform / describe
gemini-chat|chat|Draft and explore with Gemini|Your question|A Gemini conversation
gemini-vision|vision|Ask Gemini about an image|Your photo + question|An image-grounded answer
gemini-translate|translate|Translate with Gemini|Your source text|Your selected language
groq-chat|chat|Draft with Groq inference|A question or brief|An AI conversation
groq-code|code|Draft and explain with Groq|Your code question|A code draft to review
groq-transcribe|transcript|Transcribe through Groq Whisper|Your uploaded recording|A readable transcript
groq-audio-english|audio-translate|Speech into English via Groq|Multilingual recording|An English transcript
mistral-chat|chat|Explore ideas with Mistral|Your message|A Mistral conversation
mistral-code|code|Draft code with Mistral|Your schema or code brief|An explanation + example
openrouter-chat|chat|Chat with eligible free models|Your message|An OpenRouter conversation
jina-rerank|search-list|Rank passages for your question|Your question + passages|Relevance-ranked passages
jina-reader|web|Web page into readable text|A public web page URL|Clean page text
jina-search|web-search|Research a question on the web|Your research question|Web-grounded findings
cerebras-chat|chat|Try Cerebras inference|Your message|A cloud AI conversation
stability-generate|image-generate|Create an image from a prompt|A cabin beside a quiet lake|A generated image
stability-cutout|cutout|Remove a background in the cloud|Your uploaded image|A transparent cutout
stability-upscale|upscale|Increase an image’s resolution|Smaller source image|A larger processed image
elevenlabs-voice|voice|Text into ElevenLabs speech|Your narration script|Preview + MP3 download
elevenlabs-sfx|sound|Describe and generate a sound|Soft rain on a window|A downloadable sound effect
elevenlabs-transcribe|transcript|Audio into ElevenLabs text|Your recording|A speech-to-text transcript
cartesia-voice|voice|Create speech with Cartesia|Script + selected voice|Playable voice recording
cartesia-transcribe|transcript|Transcribe with Ink Whisper|Your short recording|A readable transcript
deepgram-transcribe|speaker|Transcribe with speaker labels|A conversation recording|Speaker 1 / Speaker 2
deepgram-voice|voice|Create Deepgram Aura speech|Your narration text|Playable speech audio
assemblyai-transcribe|transcript|Transcribe with AssemblyAI|Your audio recording|A readable transcript
assemblyai-speakers|speaker|Separate conversation speakers|Your conversation recording|Numbered speaker sections
fireworks-chat|chat|Explore Fireworks inference|Your message|A cloud AI conversation
`;
export const FEATURE_SPECS=Object.fromEntries(rows.trim().split('\n').map(row=>{const [id,scene,headline,input,output]=row.split('|');return [id,{scene,headline,input,output}]}));
const providers={gemini:'Google Gemini',groq:'Groq',mistral:'Mistral',openrouter:'OpenRouter',jina:'Jina AI',cerebras:'Cerebras',stability:'Stability AI',elevenlabs:'ElevenLabs',cartesia:'Cartesia',deepgram:'Deepgram',assemblyai:'AssemblyAI',fireworks:'Fireworks AI'};
export function previewSource(tool){return tool.provider?providers[tool.provider]:'Free AI Harbor'}
const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=(x,y,value,size=11,attrs='')=>`<text x="${x}" y="${y}" font-size="${size}" ${attrs}>${safe(value)}</text>`;
const rect=(x,y,w,h,attrs='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" ${attrs}/>`;
const line=(x,y,w)=>`<path d="M${x} ${y}h${w}" fill="none" stroke="currentColor" stroke-width="3" opacity=".22" stroke-linecap="round"/>`;
const label=(x,y,value)=>text(x,y,value,10,'font-weight="600"');
function paper(x,y,w=112,h=80){return rect(x,y,w,h,'fill="white" stroke="currentColor" stroke-opacity=".16"')}
function lines(x,y,width=70,n=4){return Array.from({length:n},(_,i)=>line(x,y+i*10,width-(i%3)*12)).join('')}
function arrow(x=150,y=77){return `<path d="M${x-8} ${y}h16m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`}
function checker(x,y,w=95,h=81){return rect(x,y,w,h,'fill="#fff"')+Array.from({length:8},(_,r)=>Array.from({length:10},(_,c)=>(r+c)%2?`<rect x="${x+c*w/10}" y="${y+r*h/8}" width="${w/10}" height="${h/8}" fill="#d9e4e5"/>`:'').join('')).join('')}
function photo(x,y,w=95,h=81,{portrait=false,depth=false}={}){return rect(x,y,w,h,`fill="${depth?'#cbd2d3':'#d2e4d8'}"`)+(portrait?`<circle cx="${x+w/2}" cy="${y+27}" r="15" fill="${depth?'#f5f6f5':'#c28d72'}"/><path d="M${x+19} ${y+h}v-14c0-32 ${w-38}-32 ${w-38} 0v14" fill="${depth?'#edf0ef':'#55716a'}"/>`:`<circle cx="${x+w-23}" cy="${y+21}" r="10" fill="${depth?'#ecefee':'#f2d48c'}"/><path d="M${x} ${y+h}l${w*.39}-${h*.65} ${w*.29} ${h*.4} ${w*.32}-${h*.27}v${h*.52}z" fill="${depth?'#67787a':'#759688'}"/>`)}
function wave(x,y,width=92){return Array.from({length:23},(_,i)=>{const h=7+((i*17+13)%37);return `<path d="M${x+i*width/23} ${y-h/2}v${h}" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="${.3+(i%4)*.15}"/>`}).join('')}
function wrapped(x,y,value,max=19,size=10){const words=value.split(' '),rows=[''];for(const word of words){const last=rows.length-1;if((rows[last]+' '+word).trim().length>max&&rows[last])rows.push(word);else rows[last]=(rows[last]+' '+word).trim()}return rows.slice(0,3).map((row,i)=>text(x,y+i*14,row.length>max?row.slice(0,max-1)+'…':row,size)).join('')}
function scene(spec){const s=spec.scene;
 if(['cutout','photo','upscale','depth','image-generate','vision','caption','image-labels','detection','thumbnail'].includes(s)){
  if(s==='cutout')return photo(29,37,96,81,{portrait:true})+arrow()+checker(181,37)+`<circle cx="229" cy="64" r="15" fill="#c28d72"/><path d="M200 118v-14c0-32 58-32 58 0v14" fill="#55716a"/>`+label(32,133,'BEFORE')+label(183,133,'TRANSPARENT');
  if(s==='photo')return photo(29,37)+`<rect x="29" y="37" width="95" height="81" rx="5" fill="#18384e" opacity=".3"/>`+arrow()+photo(181,37)+label(32,133,'ORIGINAL')+label(183,133,'LIGHT + COLOR');
  if(s==='depth')return photo(29,37)+arrow()+photo(181,37,95,81,{depth:true})+label(32,133,'PHOTO')+label(183,133,'RELATIVE DEPTH');
  if(s==='upscale')return photo(33,57,59,49)+arrow(126)+photo(160,28,125,97)+label(32,136,'SMALLER')+label(163,140,'LARGER');
  let art=photo(31,32,156,104,s==='detection'?{portrait:true}:{});
  if(s==='detection')art+=`<rect x="64" y="43" width="76" height="90" rx="2" fill="none" stroke="#266a55" stroke-width="2"/>`+rect(64,35,48,14,'fill="#266a55"')+text(68,45,'person',8,'fill="white"');
  if(s==='thumbnail')art+=rect(46,90,124,27,'fill="#233e34"')+text(55,109,'ONE CLEAR IDEA',12,'fill="white" font-weight="700"');
  if(s==='image-generate')return paper(25,50,90,54)+label(36,70,'YOUR PROMPT')+lines(36,84,63,2)+arrow(145)+photo(175,30,111,104)+label(178,147,'GENERATED IMAGE');
  const words=s==='image-labels'?['Compare labels','landscape','outdoors']:s==='vision'?['Your question','What is visible?','AI answer']:s==='caption'?['Image description','A quiet landscape','with distant hills.']:s==='thumbnail'?['SHORT HEADLINE','One focal point','Readable layout']:['OBJECT BOXES','person','bicycle'];
  return art+paper(202,44,98,77)+words.map((w,i)=>text(210,64+i*18,w,i?9:9,'font-weight="600"')).join('');
 }
 if(['voice','transcript','subtitles','sound','speaker','audio-translate','audio-summary'].includes(s)){
  if(s==='voice')return paper(25,42,105,74)+label(36,63,'YOUR SCRIPT')+lines(36,79,70,3)+arrow()+wave(187,72,88)+rect(199,104,69,23,'fill="currentColor" opacity=".12"')+text(211,120,'▶  LISTEN',10);
  if(s==='sound')return wave(40,71,100)+arrow(165)+paper(192,41,101,80)+label(204,63,'SOUND')+label(204,83,'Music / speech')+line(205,102,66);
  if(s==='subtitles')return wave(30,58,96)+paper(151,28,144,110)+text(161,49,'00:01 → 00:03',10)+rect(161,58,123,25,'fill="currentColor" opacity=".1"')+text(168,74,'Your spoken words',10)+text(161,103,'00:03 → 00:05',10)+line(163,119,100);
  let art=wave(28,75,90)+arrow(143)+paper(174,29,123,107);const heading=s==='speaker'?'SPEAKER 1':s==='audio-translate'?'ENGLISH':s==='audio-summary'?'TRANSCRIPT → SUMMARY':'TRANSCRIPT';art+=label(184,50,heading)+lines(184,67,90,4);if(s==='speaker')art+=label(184,113,'SPEAKER 2');return art;
 }
 if(s==='search-result')return paper(25,28,268,111)+text(40,49,'example.com / your-page',9,'opacity=".55"')+text(40,74,spec.headline.includes('snippet')?'Your page title':'Indoor Plant Care: A Beginner Guide',13,'fill="#536eaa" font-weight="600"')+wrapped(40,97,spec.headline.includes('snippet')?'Simple advice for light, watering, and healthy indoor plants.':spec.output,38,10);
 if(s==='answer')return paper(27,30,266,108)+label(41,51,'QUESTION + SOURCE PASSAGE')+wrapped(41,73,spec.input,37,11)+rect(41,101,236,23,'fill="currentColor" opacity=".12"')+text(49,116,spec.output.slice(0,35),11,'font-weight="600"');
 if(s==='translate')return paper(26,33,113,96)+label(39,54,spec.input==='Bonjour'?'FR / ES / DE':'SOURCE TEXT')+wrapped(39,80,spec.input,17,12)+arrow(159)+paper(179,33,113,96)+label(192,54,spec.input==='Bonjour'?'ENGLISH':'TRANSLATION')+wrapped(192,80,spec.output,17,12);
 if(['scores','search-list','similarity','duplicates'].includes(s)){
  if(s==='similarity'||s==='duplicates')return paper(25,40,118,82)+paper(175,40,118,82)+wrapped(37,62,spec.input,16,10)+wrapped(187,62,spec.output,16,10)+arrow(159)+label(39,107,s==='duplicates'?'PASSAGE A':'MEANING A')+label(188,107,s==='duplicates'?'PASSAGE B':'MEANING B');
  return paper(27,33,103,90)+label(38,54,s==='scores'?'YOUR TEXT':'YOUR QUERY')+wrapped(38,73,spec.input,14,10)+arrow(153)+paper(179,29,118,105)+[85,57,31].slice(0,s==='scores'?Math.min(3,spec.output.split('/').length):3).map((w,i)=>text(190,49+i*28,s==='scores'?spec.output.split('/')[i].trim().slice(0,17):['1. Best match','2. Next passage','3. Another match'][i],9)+rect(190,55+i*28,w,6,`fill="currentColor" opacity="${.7-i*.2}"`)).join('');
 }
 if(['scan','scan-summary','web','web-search'].includes(s))return paper(29,30,109,105)+label(40,50,s.startsWith('web')?'WEB PAGE':'SCANNED PAGE')+lines(40,66,78,5)+`<rect x="37" y="60" width="91" height="23" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3"/>`+arrow(158)+paper(183,42,111,87)+label(194,63,s==='scan-summary'?'TEXT → SUMMARY':s==='web-search'?'FINDINGS':'EDITABLE TEXT')+lines(194,80,76,s==='scan-summary'?2:4);
 if(['calendar','checklist','feedback','folders','brief','invoice'].includes(s)){
  if(s==='calendar')return paper(30,27,258,111)+label(43,47,'YOUR PLAN')+Array.from({length:5},(_,i)=>rect(43+i*47,57,39,65,'fill="currentColor" opacity=".07"')+text(49+i*47,72,['MON','TUE','WED','THU','FRI'][i],8)+line(49+i*47,87,24)+line(49+i*47,100,18)).join('');
  const title={checklist:'CLEAR NEXT STEPS',feedback:'REVISION TASKS',folders:'HANDOVER FILES',brief:'CREATIVE BRIEF',invoice:'INVOICE DETAILS'}[s];return paper(46,25,222,116)+label(61,46,title)+[0,1,2].map(i=>rect(62,59+i*24,12,12,'fill="currentColor" opacity=".1"')+`<path d="m65 ${65+i*24} 3 3 5-6" fill="none" stroke="currentColor" stroke-width="1.4"/>`+line(87,65+i*24,145-i*20)).join('');
 }
 if(['code','debug','regex','database','json','api','commit','layout','terminal','algorithm'].includes(s)){
  if(s==='layout')return paper(31,26,254,113)+label(44,46,'RESPONSIVE GRID')+[0,1,2].map(i=>rect(45+i*74,59,62,64,'fill="currentColor" opacity=".12"')).join('');
  const examples={code:['const items = [1, 2, 3];','items.map(double);','// Explanation below'],debug:['const items = null;','items.map(...)  ← error','Check before mapping'],regex:['PATTERN','^\\d{6}$','123456  ✓    abc  ×'],database:['SELECT customer_id,','SUM(total) FROM orders','GROUP BY customer_id;'],json:['{ "status": "draft",','  "tasks": ["cover"] }','Fields explained clearly'],api:['GET /items','200 → [{ id, name }]','Inputs → response'],commit:['CHANGES','Added a saved-tools filter','A clear commit title'],terminal:['$ rg --files src','rg   → search tool','--files → list files'],algorithm:['SEARCH FOR 8','[2, 4, 6, 8, 10]','middle → narrow → find']};
  return rect(30,27,258,112,'fill="#203b37"')+`<circle cx="43" cy="39" r="2" fill="#ecb0a0"/><circle cx="52" cy="39" r="2" fill="#ecd6a0"/><circle cx="61" cy="39" r="2" fill="#aed2b1"/>`+(examples[s]||examples.code).map((w,i)=>text(43,63+i*24,w,11,`fill="${i===2?'#acd6bb':'#f0f6ed'}" font-family="monospace"`)).join('');
 }
 if(['logo','profile','product'].includes(s)){
  if(s==='logo')return paper(25,33,116,100)+`<path d="m82 46 25 48H57z" fill="none" stroke="currentColor" stroke-width="3"/>`+label(57,117,'BRAND')+paper(174,33,116,100)+text(202,95,'Aa',40,'font-family="Georgia"')+label(202,117,'BRAND');
  if(s==='product')return paper(28,31,113,105)+`<path d="m84 49 32 18v37l-32 18-32-18V67zM52 67l32 18 32-18M84 85v37" fill="none" stroke="currentColor" stroke-width="2"/>`+arrow(160)+paper(184,38,109,92)+label(194,60,'PRODUCT COPY')+lines(195,77,80,4);
  return paper(40,29,238,111)+`<circle cx="71" cy="58" r="15" fill="currentColor" opacity=".15"/>`+label(97,56,'YOUR PROFILE')+line(98,69,116)+lines(57,91,182,4);
 }
 if(['social','newsletter','email','review','faq','chat'].includes(s)){
  if(s==='chat')return rect(30,29,180,39,'fill="white" stroke="currentColor" stroke-opacity=".15"')+text(41,52,spec.input.slice(0,29),11)+rect(91,80,197,47,'fill="currentColor" opacity=".12"')+text(105,103,spec.output.slice(0,26),11)+line(105,115,143);
  return paper(38,24,242,118)+label(51,44,{email:'TO: YOUR RECIPIENT',social:'YOUR NEXT POST',newsletter:'YOUR NEWSLETTER',review:'REVIEW → REPLY',faq:'QUESTIONS + ANSWERS'}[s])+line(52,57,201)+text(52,76,spec.input.slice(0,33),10)+lines(52,91,184,3)+rect(196,119,68,15,'fill="currentColor" opacity=".12"');
 }
 if(['storyboard','timeline','carousel','funnel','hooks'].includes(s)){
  if(s==='hooks')return [0,1,2].map(i=>paper(25+i*95,33+i*8,84,90)+text(36+i*95,54+i*8,'HOOK 0'+(i+1),9,'font-weight="700"')+lines(37+i*95,70+i*8,55,3)).join('');
  if(s==='funnel')return [0,1,2].map(i=>rect(41+i*21,31+i*35,230-i*42,26,'fill="currentColor" opacity=".12"')+label(102,48+i*35,['HOOK','SOLUTION','CTA'][i])).join('');
  return [0,1,2].map(i=>paper(26+i*95,33,84,94)+rect(35+i*95,43,66,43,'fill="currentColor" opacity=".1"')+text(48+i*95,70,s==='carousel'?'SLIDE':'SCENE',9)+label(36+i*95,104,'0'+(i+1))+line(55+i*95,101,38)).join('')+`<path d="M27 140h264" stroke="currentColor" stroke-width="3" opacity=".24"/>`;
 }
 if(s==='mcq')return paper(42,25,235,115)+label(57,45,'QUESTION FROM YOUR NOTES')+[0,1,2].map(i=>`<circle cx="64" cy="${66+i*25}" r="6" fill="${i===1?'currentColor':'white'}" stroke="currentColor" stroke-opacity=".3"/>`+line(81,66+i*25,159-i*13)).join('');
 if(s==='poem')return paper(53,25,213,116)+label(70,46,'A POEM FROM YOUR IDEA')+[0,1,2,3,4].map(i=>line(72,65+i*13,[126,155,109,138,91][i])).join('');
 if(s==='entities')return paper(30,30,258,105)+text(44,65,'Marie Curie worked in Paris.',15)+rect(40,49,87,22,'fill="#cbb8ea" opacity=".35"')+rect(208,49,40,22,'fill="#9ccac2" opacity=".35"')+label(49,100,'PERSON')+label(204,100,'LOCATION');
 if(['quiz','flashcards','vocabulary','concept','ideas','headlines','tags','cta','mask','prompt'].includes(s)){
  if(s==='tags')return paper(30,33,258,99)+[0,1,2,3].map(i=>rect(45+(i%2)*119,48+Math.floor(i/2)*39,105,28,'fill="currentColor" opacity=".1"')+text(54+(i%2)*119,66+Math.floor(i/2)*39,['# topic','key phrase','# relevant','source phrase'][i],10)).join('');
  if(s==='cta')return paper(41,35,235,95)+lines(59,56,188,3)+rect(75,92,167,27,'fill="currentColor"')+text(93,110,spec.output.slice(0,24),11,'fill="white" font-weight="600"');
  if(s==='mask')return paper(35,39,246,89)+text(51,67,'A cup of',15)+rect(122,47,102,28,'fill="currentColor" opacity=".12"')+label(137,66,'[MASK]')+text(51,104,'tea     coffee     water',12);
  if(s==='flashcards')return paper(30,39,121,87)+label(43,60,'QUESTION')+lines(43,77,85,3)+paper(171,28,121,98)+label(185,50,'ANSWER')+lines(185,70,83,4);
  return paper(38,29,242,111)+label(52,50,{quiz:'QUESTION → EXPLANATION',vocabulary:'WORD → MEANING',concept:'IDEA → UNDERSTANDING',ideas:'EXPLORE THE POSSIBILITIES',headlines:'HEADLINE OPTIONS',prompt:'TASK + CONTEXT + FORMAT'}[s]||'YOUR IDEAS')+[0,1,2].map(i=>rect(52,61+i*24,13,13,'fill="currentColor" opacity=".12"')+text(55,71+i*24,i+1,8)+line(78,68+i*24,165-i*15)).join('');
 }
 // Text transformations are still rendered as tool-specific input/output previews.
 return paper(26,34,115,94)+label(39,55,['summary','highlight','notes'].includes(s)?'SOURCE TEXT':'INPUT')+wrapped(39,77,spec.input,16,10)+arrow(159)+paper(179,34,115,94)+label(192,55,['summary','highlight','notes'].includes(s)?'KEY POINTS':'OUTPUT')+wrapped(192,77,spec.output,16,10)+(s==='correction'?`<path d="M40 84h65" stroke="#bc7161" stroke-width="1.5"/>`:'')+(s==='entities'||s==='highlight'?rect(42,66,65,14,'fill="currentColor" opacity=".13"'):'');
}
export function renderFeaturePreview(tool){
 const spec=FEATURE_SPECS[tool.id];if(!spec)throw new Error('Missing feature preview: '+tool.id);
 const source=previewSource(tool);
 return `<span class="feature-window" aria-hidden="true"><span class="feature-window-bar"><i></i><i></i><i></i><span>${safe(source)}</span></span><span class="feature-ghost-page"><b>${safe(tool.name)}</b><span></span><span></span><span></span></span></span><span class="feature-eyebrow" aria-hidden="true">${safe(source)} <span>· FEATURE PREVIEW</span></span><svg class="feature-demo" viewBox="0 0 320 158" fill="currentColor" font-family="Arial, sans-serif" aria-hidden="true" focusable="false">${scene(spec)}</svg><span class="feature-headline" aria-hidden="true">${safe(spec.headline)}</span><span class="feature-microcopy" aria-hidden="true">Illustrated example</span>`;
}
