import {icon} from './icons.js';
import {escapeHTML as esc} from './lab-tools.js';

export const TOOL_THEMES={
 'Chat & Writing':{label:'Writing & ideas',bg:'#fff0e1',wash:'#fffaf5',ink:'#915b30',line:'#eed9c3',accent:'#e9b888',scene:'writing'},
 'Research & Text':{label:'Text & research',bg:'#efe9fb',wash:'#fcfaff',ink:'#70509f',line:'#ded2ee',accent:'#bba5d7',scene:'research'},
 'Marketing & SEO':{label:'Marketing & SEO',bg:'#fceaf1',wash:'#fff9fb',ink:'#a44870',line:'#f0d3e0',accent:'#e6a3bd',scene:'marketing'},
 'Study & Learning':{label:'Study & learning',bg:'#e9f0ff',wash:'#fafcff',ink:'#42669b',line:'#d4dff3',accent:'#a9c0e7',scene:'study'},
 'Business & Work':{label:'Business & work',bg:'#fff2d6',wash:'#fffdf6',ink:'#806220',line:'#ecdfba',accent:'#dfc67f',scene:'business'},
 Images:{label:'Image tools',bg:'#e4f3f8',wash:'#f9fdff',ink:'#306e80',line:'#cce3eb',accent:'#95c8d6',scene:'images'},
 'Audio & Video':{label:'Audio & video',bg:'#eaf4df',wash:'#fafff6',ink:'#4f7130',line:'#d5e5c4',accent:'#b4ce95',scene:'audio'},
 'Coding & Planning':{label:'Code & planning',bg:'#e1f3ec',wash:'#f7fdfa',ink:'#34755d',line:'#c9e4d8',accent:'#98cdb5',scene:'coding'}
};
const base={
 doc:'<path d="M6 3h12l6 6v19H6zM18 3v6h6M10 14h10M10 18h8M10 22h6"/>',
 notes:'<rect x="5" y="4" width="21" height="25" rx="3"/><path d="M10 10h11M10 15h11M10 20h8M10 25h5"/>',
 mail:'<rect x="3" y="7" width="26" height="19" rx="3"/><path d="m4 9 12 9L28 9M4 25l8-8M28 25l-8-8"/>',
 bubble:'<path d="M5 5h22v17H15l-8 6v-6H5zM10 11h12M10 16h8"/>',
 post:'<rect x="4" y="3" width="23" height="26" rx="3"/><circle cx="9" cy="8" r="1"/><path d="M13 8h9M8 13h15v7H8zM8 25h10"/>',
 box:'<path d="m16 3 12 7v14l-12 7-12-7V10zm0 0v13M4 10l12 7 12-7M16 17v14M10 6l12 7"/>',
 clapper:'<rect x="4" y="10" width="24" height="19" rx="2"/><path d="M4 10V5h24v5M8 5l-3 5M15 5l-3 5M22 5l-3 5M12 17l8 4-8 4z"/>',
 bulb:'<path d="M10 23c0-3-5-5-5-11a11 11 0 0 1 22 0c0 6-5 8-5 11M10 23h12M11 27h10M13 30h6M16 4v3M10 11l2 2M22 11l-2 2"/>',
 code:'<rect x="3" y="5" width="26" height="23" rx="3"/><path d="M3 11h26M8 8h.1M12 8h.1M11 16l-4 4 4 4M21 16l4 4-4 4M18 15l-4 10"/>',
 list:'<rect x="4" y="3" width="24" height="27" rx="3"/><path d="m8 10 2 2 3-4M16 10h7m-15 8 2 2 3-4M16 18h7M8 26h5M16 26h7"/>',
 globe:'<circle cx="16" cy="16" r="13"/><ellipse cx="16" cy="16" rx="6" ry="13"/><path d="M3 16h26M6 8h20M6 24h20"/>',
 book:'<path d="M16 7C11 3 7 3 3 4v23c5-2 9-1 13 2 4-3 8-4 13-2V4c-4-1-8-1-13 3zm0 0v22M7 9h5M7 14h5M20 9h5M20 14h5"/>',
 badge:'<rect x="3" y="5" width="26" height="22" rx="3"/><circle cx="11" cy="13" r="3"/><path d="M6 22c0-5 10-5 10 0M20 11h5M20 16h5M20 21h3"/>',
 briefcase:'<rect x="3" y="9" width="26" height="20" rx="3"/><path d="M11 9V4h10v5M3 17c8 5 18 5 26 0M14 18h4v5h-4z"/>',
 calendar:'<rect x="4" y="6" width="24" height="24" rx="3"/><path d="M10 3v6M22 3v6M4 13h24M9 18h3M16 18h3M9 23h3M16 23h3"/>',
 search:'<circle cx="13" cy="13" r="9"/><path d="m20 20 9 9M8 10h10M8 14h7"/>',
 image:'<rect x="3" y="4" width="26" height="24" rx="3"/><circle cx="10" cy="11" r="2"/><path d="m3 24 8-8 5 5 6-8 7 8"/>',
 layers:'<path d="m16 3 14 8-14 8L2 11zm-12 14 12 7 12-7M4 23l12 7 12-7"/>',
 audio:'<path d="M4 13v6M9 8v16M14 3v26M19 6v20M24 10v12M29 14v4"/>',
 mic:'<rect x="11" y="3" width="10" height="17" rx="5"/><path d="M6 14v2a10 10 0 0 0 20 0v-2M16 26v5M11 31h10M13 8h6M13 12h6"/>',
 cards:'<path d="M9 4h16a3 3 0 0 1 3 3v19M4 8h17a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V11a3 3 0 0 1 3-3zM6 14h12M6 19h8M6 24h10"/>',
 quote:'<path d="M4 7h9v10c0 5-3 8-7 10l-2-3c4-2 5-4 5-7H4zm15 0h9v10c0 5-3 8-7 10l-2-3c4-2 5-4 5-7h-5z"/>',
 terminal:'<rect x="3" y="4" width="26" height="25" rx="3"/><path d="M3 10h26m-21 6 5 4-5 4M17 24h7"/>',
 clipboard:'<rect x="6" y="6" width="21" height="24" rx="3"/><rect x="11" y="3" width="11" height="6" rx="2"/><path d="M11 15h11M11 20h11M11 25h7"/>',
 person:'<circle cx="15" cy="10" r="5"/><path d="M5 28v-4c0-9 20-9 20 0v4M2 3h6M2 3v6M28 3h-6M28 3v6"/>',
 chart:'<path d="M4 4v24h25M9 23v-7h4v7M17 23V8h4v15M25 23v-11h4v11M7 10l8-5 8 3 6-5"/>',
 pencil:'<path d="m20 3 9 9-17 17H3v-9zm-3 3 9 9M3 20l9 9M7 18l7 7M3 29l3-8"/>',
 tag:'<path d="M3 5h13l14 14-11 11L3 14z"/><circle cx="9" cy="11" r="2"/>',
 grid:'<rect x="3" y="3" width="11" height="11" rx="2"/><rect x="19" y="3" width="11" height="11" rx="2"/><rect x="3" y="19" width="11" height="11" rx="2"/><rect x="19" y="19" width="11" height="11" rx="2"/>',
 translate:'<path d="M2 5h15M9 2v3M5 7c1 6 6 10 12 12M14 5c-1 8-5 12-12 15M18 29l6-15 6 15M20 24h8"/>',
 mask:'<path d="M5 5H2v22h3M27 5h3v22h-3M8 16h3M14 16h3M20 16h3"/>',
 nodes:'<circle cx="16" cy="5" r="3"/><circle cx="5" cy="25" r="3"/><circle cx="27" cy="25" r="3"/><circle cx="16" cy="17" r="3"/><path d="M16 8v6M13 20l-6 3M19 20l6 3M5 22V12h8M27 22V12h-8"/>'
};
const mini={
 pen:'<path d="m6 1 3 3-5 5H1V6z"/>',
 repeat:'<path d="M2 3h6L6 1M8 7H2l2 2M8 3v2M2 7V5"/>',
 spark:'<path d="m5 0 1.4 3.6L10 5 6.4 6.4 5 10 3.6 6.4 0 5l3.6-1.4z"/>',
 play:'<path d="m2 1 7 4-7 4z"/>',
 clock:'<circle cx="5" cy="5" r="4"/><path d="M5 2v3l2 1"/>',
 less:'<path d="M1 3h8M1 6h5M1 9h3"/>',
 check:'<path d="m1 5 3 3 5-6"/>',
 plus:'<path d="M5 1v8M1 5h8"/>',
 minus:'<path d="M1 5h8"/>',
 search:'<circle cx="4" cy="4" r="3"/><path d="m6 6 3 3"/>',
 question:'<path d="M2 3a3 3 0 0 1 6 0c0 2-3 2-3 4M5 9h.01"/>',
 person:'<circle cx="5" cy="3" r="2"/><path d="M1 9c0-5 8-5 8 0"/>',
 crop:'<path d="M3 0v7h7M0 3h7v7"/>',
 scissors:'<circle cx="2.5" cy="2.5" r="1.7"/><circle cx="2.5" cy="7.5" r="1.7"/><path d="m4 4 5 5M4 6l5-5"/>',
 text:'<path d="M1 2h8M5 2v7M3 9h4"/>',
 tag:'<path d="M1 1h4l5 5-4 4-5-5zM3 3h.01"/>',
 grid:'<path d="M1 1h8v8H1zM5 1v8M1 5h8"/>',
 wave:'<path d="M1 4v2M3 2v6M5 0v10M7 2v6M9 4v2"/>',
 sound:'<path d="M1 4h2l3-3v8L3 6H1zM8 3c2 1 2 3 0 4"/>',
 book:'<path d="M5 2C3 1 1 1 0 2v7c2-1 3-1 5 0 2-1 3-1 5 0V2C9 1 7 1 5 2zm0 0v7"/>',
 heart:'<path d="M5 9C-2 5 0-1 5 3c5-4 7 2 0 6z"/>',
 up:'<path d="M5 9V1M1 5l4-4 4 4"/>',
 down:'<path d="M5 1v8M1 5l4 4 4-4"/>',
 out:'<path d="M1 4V1h3M6 1h3v3M9 6v3H6M4 9H1V6"/>',
 in:'<path d="M1 1l3 3M4 1v3H1M9 9 6 6M6 9V6h3"/>',
 lines:'<path d="M1 2h8M1 5h8M1 8h5"/>',
 first:'<path d="M1 1h8M1 5h5M1 9h3"/>',
 heading:'<path d="M2 1v8M8 1v8M2 5h6"/>',
 globe:'<circle cx="5" cy="5" r="4"/><path d="M1 5h8M5 1c-3 2-3 6 0 8 3-2 3-6 0-8"/>',
 chart:'<path d="M1 9V5M5 9V1M9 9V3"/>',
 calendar:'<path d="M1 2h8v7H1zM3 0v3M7 0v3M1 5h8"/>',
 hash:'<path d="M4 0 2 10M8 0 6 10M0 3h10M0 7h10"/>',
 arrow:'<path d="M1 5h8M5 1l4 4-4 4"/>',
 eye:'<path d="M0 5c3-5 7-5 10 0-3 5-7 5-10 0z"/><circle cx="5" cy="5" r="1.5"/>',
 idea:'<path d="M3 7C-1 3 3-1 5 1c4-1 5 3 2 6M3 8h4M4 10h2"/>',
 brackets:'<path d="M3 1H1v8h2M7 1h2v8H7"/>',
 bug:'<ellipse cx="5" cy="6" rx="3" ry="3"/><path d="M3 3V1M7 3V1M0 4h2M8 4h2M0 8h2M8 8h2M5 4v5"/>',
 database:'<ellipse cx="5" cy="2" rx="4" ry="1.5"/><path d="M1 2v6c0 2 8 2 8 0V2M1 5c0 2 8 2 8 0"/>',
 test:'<path d="M3 1h4M4 1v4L1 9h8L6 5V1M3 7h4"/>',
 comment:'<path d="M1 1h8v6H5l-3 2V7H1z"/>',
 resume:'<path d="M2 1h6v8H2zM4 3h2M4 5h2M4 7h1"/>',
 target:'<circle cx="5" cy="5" r="4"/><circle cx="5" cy="5" r="2"/><path d="M5 5h.01"/>',
 flag:'<path d="M2 10V1h7L7 4l2 3H2"/>',
 smile:'<circle cx="5" cy="5" r="4"/><path d="M3 4h.01M7 4h.01M3 6c1 2 3 2 4 0"/>',
 link:'<path d="m4 2 1-1c4-1 5 3 3 4L6 7M6 8l-1 1c-4 1-5-3-3-4l2-2M3 7l4-4"/>',
 equal:'<path d="M1 3h8M1 7h8"/>',
 copy:'<path d="M3 1h6v6H7M1 3h6v6H1z"/>',
 filter:'<path d="M1 1h8L6 5v4H4V5z"/>'
};
// A task-specific pictogram is made from a familiar base and a meaningful small badge.
const symbols={
 'ai-chat':['bubble','spark'],'writing-assistant':['doc','pen'],paraphraser:['doc','repeat'],'email-writer':['mail','pen'],
 'social-captions':['post','comment'],'product-copy':['box','text'],'video-script':['clapper','pen'],brainstorm:['bulb','spark'],
 'code-helper':['code','question'],'task-planner':['list','clock'],summarizer:['doc','less'],translator:['translate','arrow'],
 sentiment:['bubble','smile'],'ask-text':['doc','question'],'entity-finder':['nodes','person'],'portrait-cutout':['person','scissors'],
 'image-ocr':['image','text'],'image-caption':['image','comment'],'image-classifier':['image','tag'],'object-detector':['image','target'],
 'depth-map':['layers','eye'],'audio-transcription':['audio','text'],'subtitle-generator':['clapper','text'],'text-to-speech':['mic','play'],
 'grammar-fixer':['doc','check'],'tone-rewriter':['bubble','repeat'],'text-simplifier':['doc','minus'],'text-expander':['doc','out'],
 'text-shortener':['doc','in'],'blog-outline':['notes','list'],'blog-intro':['doc','first'],'headline-generator':['doc','heading'],
 'seo-title':['search','heading'],'meta-description':['search','lines'],'ad-copy':['post','target'],'slogan-generator':['quote','spark'],
 'brand-names':['tag','idea'],'content-calendar':['calendar','post'],'audience-persona':['badge','target'],'social-bio':['badge','comment'],
 'hashtag-ideas':['post','hash'],'call-to-action':['bubble','arrow'],'concept-explainer':['book','idea'],'study-notes':['book','lines'],
 'flashcard-maker':['cards','question'],'practice-quiz':['clipboard','question'],'lesson-plan':['book','calendar'],'vocabulary-helper':['book','text'],
 'analogy-maker':['bulb','link'],'study-plan':['calendar','book'],'code-debugger':['code','bug'],'regex-helper':['code','brackets'],
 'sql-helper':['terminal','database'],'test-case-ideas':['code','test'],'code-comments':['code','comment'],'readme-writer':['terminal','book'],
 'meeting-minutes':['clipboard','clock'],'resume-bullets':['badge','list'],'cover-letter':['mail','briefcase'],'interview-practice':['briefcase','question'],
 'proposal-outline':['briefcase','lines'],'story-starter':['book','spark'],'character-builder':['person','pen'],'poem-writer':['quote','pen'],
 'joke-writer':['quote','smile'],'prompt-builder':['terminal','spark'],'text-similarity':['notes','equal'],'semantic-search':['search','idea'],
 'keyword-extractor':['search','tag'],'duplicate-finder':['cards','copy'],'extractive-summary':['notes','filter'],'topic-classifier':['grid','text'],
 'custom-classifier':['grid','plus'],'fill-mask':['mask','question'],'custom-image-labels':['image','plus'],'sound-classifier':['audio','search'],
 'speech-translator':['mic','globe'],'audio-summary':['audio','less'],'image-text-summary':['image','less'],'reverse-translator':['translate','repeat'],
 'photo-editor':['image','spark'],'logo-designer':['badge','spark'],'prompt-generator':['terminal','spark']
};
// Miniatures can also use a simplified base. This keeps all 80 symbols in one coherent system.
mini.list=mini.lines;mini.post=mini.comment;mini.briefcase='<path d="M1 3h8v6H1zM3 3V1h4v2M1 5h8"/>';
export function toolTheme(tool){return TOOL_THEMES[tool.category]||TOOL_THEMES['Chat & Writing']}
export function identityStyle(tool){const t=toolTheme(tool);return `--tool-bg:${t.bg};--tool-wash:${t.wash};--tool-ink:${t.ink};--tool-line:${t.line};--tool-accent:${t.accent}`}
export function toolSymbol(tool){
 const pair=tool.symbol||symbols[tool.id];if(!pair)return icon(tool.icon);
 const body=base[pair[0]],badge=mini[pair[1]]||(base[pair[1]]?`<g transform="scale(.31)" stroke-width="4.7">${base[pair[1]]}</g>`:mini.spark);
 const mark=tool.provider?`<rect x="0" y="0" width="10" height="10" rx="3" fill="var(--tool-bg)" stroke="none"/><text x="5" y="7.3" text-anchor="middle" fill="currentColor" stroke="none" font-family="Arial,sans-serif" font-size="7" font-weight="700">${esc(tool.provider==='groq'?'Q':tool.provider==='cartesia'?'T':tool.provider.charAt(0).toUpperCase())}</text>`:'';
 return `<svg class="tool-symbol" data-tool-symbol="${esc(tool.id)}" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}<circle cx="25" cy="24" r="6.8" fill="var(--tool-bg,#eef5e7)" stroke="none"/><g transform="translate(20 19)" stroke-width="1.45">${badge}</g>${mark}</svg>`;
}
export function toolBadge(tool,className=''){return `<span class="tool-identity-badge ${className}" style="${identityStyle(tool)}">${toolSymbol(tool)}</span>`}
const scenes={
 writing:'<path d="M75 18h59v63H75zM83 32h35M83 43h27M83 54h35M83 65h18"/><path d="m137 43 8 8-23 23-12 4 4-12z"/>',
 research:'<circle cx="113" cy="44" r="28"/><circle cx="113" cy="44" r="18"/><path d="m133 65 22 22M89 78h-25M76 27h-12M100 38h24M100 46h19M100 54h13"/>',
 marketing:'<path d="m77 41 28-8 28-15v62l-28-15-28-7zm22 20 7 23H94l-6-26M142 32l13-6M144 49h15M142 66l13 6"/>',
 study:'<path d="M113 29c-15-11-30-12-42-8v57c17-4 30-2 42 7 12-9 25-11 42-7V21c-12-4-27-3-42 8zm0 0v56M81 37h21M81 49h21M125 37h19M125 49h19"/>',
 business:'<rect x="72" y="29" width="82" height="54" rx="8"/><path d="M98 29V16h31v13M72 47c24 17 58 17 82 0M107 49h12v15h-12z"/>',
 images:'<rect x="80" y="17" width="68" height="57" rx="5"/><rect x="65" y="30" width="68" height="57" rx="5" fill="var(--tool-bg)"/><circle cx="84" cy="47" r="6"/><path d="m65 76 21-17 14 11 17-20 16 22"/>',
 audio:'<path d="M70 43v16M83 31v40M96 18v66M109 26v52M122 36v32M135 20v60M148 40v24M160 47v12"/>',
 coding:'<rect x="70" y="18" width="86" height="66" rx="7"/><path d="M70 32h86M80 25h1M88 25h1M96 25h1m-1 19-13 12 13 12M131 44l13 12-13 12M120 40l-11 33"/>'
};
export function toolVisual(tool){const theme=toolTheme(tool);return `<button class="tool-visual" data-open="${esc(tool.id)}" type="button" tabindex="-1" aria-label="Open ${esc(tool.name)}"><span class="visual-orbit" aria-hidden="true"></span><svg class="tool-scene" viewBox="0 0 180 100" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${scenes[theme.scene]}</svg>${toolBadge(tool,'tool-visual-icon')}<span class="tool-visual-category">${esc(theme.label)}</span><span class="visual-arrow" aria-hidden="true">${icon('arrow-up-right')}</span></button>`}
