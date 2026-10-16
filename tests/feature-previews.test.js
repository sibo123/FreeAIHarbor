import test from 'node:test';
import assert from 'node:assert/strict';
import {LAB_TOOLS,FEATURED_LAB} from '../lab-tools.js';
import {FEATURE_SPECS,previewSource,renderFeaturePreview} from '../feature-previews.js';
import {toolVisual} from '../tool-identity.js';
test('every registered tool has an explicit, complete feature preview',()=>{
 assert.equal(LAB_TOOLS.length,158);
 assert.deepEqual(Object.keys(FEATURE_SPECS).sort(),LAB_TOOLS.map(t=>t.id).sort());
 for(const t of LAB_TOOLS){const s=FEATURE_SPECS[t.id];for(const field of ['scene','headline','input','output'])assert.ok(s[field]?.trim(),`${t.id}: ${field}`);const html=toolVisual(t);assert.ok(html.includes(`data-open="${t.id}"`));assert.ok(html.includes('Illustrated example'));assert.ok(!/undefined|NaN/.test(html),t.id);assert.ok(!/<img|<iframe|https?:\/\//.test(html),'No remote screenshots, tracking or embeds');}
 assert.deepEqual(FEATURED_LAB,['photo-editor','logo-designer','prompt-generator','ai-chat','portrait-cutout','audio-transcription']);
});
test('specialist functions use the correct visual metaphor',()=>{
 const expectations={'portrait-cutout':'cutout','subtitle-generator':'subtitles','image-ocr':'scan','object-detector':'detection','depth-map':'depth','logo-designer':'logo','sql-helper':'database','text-to-speech':'voice','translator':'translate','purchase-intent':'scores'};
 for(const [id,scene] of Object.entries(expectations))assert.equal(FEATURE_SPECS[id].scene,scene);
 assert.ok(renderFeaturePreview(LAB_TOOLS.find(t=>t.id==='portrait-cutout')).includes('TRANSPARENT'));
 assert.ok(renderFeaturePreview(LAB_TOOLS.find(t=>t.id==='subtitle-generator')).includes('00:01'));
});
test('provider references are correct and text is escaped',()=>{
 assert.equal(previewSource(LAB_TOOLS.find(t=>t.id==='gemini-vision')),'Google Gemini');
 assert.equal(previewSource(LAB_TOOLS[0]),'Free AI Harbor');
 assert.ok(!renderFeaturePreview({...LAB_TOOLS[0],name:'<img src=x onerror=alert(1)>'}).includes('<img'));
 assert.throws(()=>renderFeaturePreview({id:'unknown'}),/Missing feature preview/);
});
