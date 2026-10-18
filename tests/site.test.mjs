import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createServer,resolvePublicPath} from '../server.js';
import {LAB_TOOLS,MODELS,modelInfo,toSRT} from '../lab-tools.js';
import {workspaceProfile} from '../module-profiles.js';
import {helpHTML} from '../tool-help.js';
import {generateLogos,generatePrompts} from '../tool-generators.js';
import {runCloudTool} from '../cloud-engine.js';
test('catalog workflows resolve to a supported runtime and workspace',()=>{
 assert.equal(new Set(LAB_TOOLS.map(t=>t.id)).size,LAB_TOOLS.length);
 const catalog=fs.readFileSync(new URL('../catalog.html',import.meta.url),'utf8');
 for(const t of LAB_TOOLS){assert.ok(MODELS[t.model]||['translation','cloud','canvas','client'].includes(t.model),t.id);assert.ok(modelInfo(t));assert.ok(workspaceProfile(t).action,t.id);assert.ok(catalog.includes('/?tool='+t.id),t.id);if(!t.provider)assert.ok(helpHTML(t).includes('Processing:'))}
});
test('invalid and private paths are rejected; valid pages and extensionless routes resolve',()=>{
 for(const u of ['/not-a-page','/missing.js','/.git/config','/%2e%2e/server.js','/server.js','/scripts/build-content.mjs'])assert.equal(resolvePublicPath(u).status,404,u);
 assert.equal(resolvePublicPath('/%E0%A4%A').status,400);
 for(const u of ['/','/?tool=image-ocr','/guides/ocr-clean-text.html','/about'])assert.equal(resolvePublicPath(u).status,200,u);
});
test('HTTP returns genuine status codes, HEAD bodies and compression',async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{const base='http://127.0.0.1:'+server.address().port;
 let r=await fetch(base+'/missing');assert.equal(r.status,404);assert.match(await r.text(),/Page not found/);
 r=await fetch(base+'/lab.js');assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/javascript/);
 r=await fetch(base+'/',{method:'HEAD'});assert.equal(r.status,200);assert.equal(await r.text(),'');
 r=await fetch(base+'/',{method:'POST'});assert.equal(r.status,405);
 r=await fetch(base+'/guides/subtitles-from-audio.html');assert.equal(r.status,200);assert.match(await r.text(),/00:00:00,500/);
 }finally{await new Promise(r=>server.close(r))}
});
test('utility outputs escape supplied brand names and preserve SRT timing',()=>{
 const logos=generateLogos({brand:'<script>alert(1)</script>',tagline:'A & B'});assert.equal(logos.length,4);for(const l of logos){assert.ok(l.svgLight.includes('<svg'));assert.ok(!l.svgLight.includes('<script>'))}
 const prompt=generatePrompts({subject:'A ceramic cup',target:'Midjourney v6',style:'Cinematic 35mm Photorealism',lighting:'Volumetric Golden Hour',shot:'Wide',aspect:'16:9 (Landscape Cinematic)'});assert.ok(prompt.master.includes('A ceramic cup'));
 assert.match(toSRT([{timestamp:[0.5,2.8],text:'Hello'}],3),/00:00:00,500 --> 00:00:02,800/);
});
test('provider errors redact the key and report quota failures without retrying',async()=>{
 const tool=LAB_TOOLS.find(t=>t.id==='groq-chat');let calls=0;
 await assert.rejects(runCloudTool({tool,key:'test-private-key',input:{text:'Hello'},fetchImpl:async()=>{calls++;return new Response(JSON.stringify({error:{message:'test-private-key invalid'}}),{status:401})}}),e=>!e.message.includes('test-private-key')&&e.message.includes('[hidden]'));
 assert.equal(calls,1);
 await assert.rejects(runCloudTool({tool,key:'test',input:{text:'Hello'},fetchImpl:async()=>new Response('{}',{status:429})}),/usage limit/);
});
