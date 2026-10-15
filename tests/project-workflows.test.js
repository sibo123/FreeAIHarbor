import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {LAB_TOOLS,FEATURED_LAB} from '../lab-tools.js';
import {PROJECT_TEMPLATES,createProject,projectPrompt,exportProject,validateProject,weeklyChallenge,structuredDraft,hookLines,sampleBrief} from '../project-hub.js';
test('active tools are entirely local and starter tools stay unchanged',()=>{
 assert.equal(LAB_TOOLS.length,131);assert.ok(LAB_TOOLS.every(t=>!t.provider));
 assert.deepEqual(FEATURED_LAB,['photo-editor','logo-designer','prompt-generator','ai-chat','portrait-cutout','audio-transcription']);
 const catalog=JSON.parse(fs.readFileSync(new URL('../tools.json',import.meta.url)));assert.deepEqual(catalog.tools,JSON.parse(JSON.stringify(LAB_TOOLS)));assert.equal(catalog.providers,undefined);
});
test('every project step uses a registered free tool and carries facts forward',()=>{
 for(const t of PROJECT_TEMPLATES){const p=createProject(t.id);p.brief.product='Test wallet';p.brief.facts='Four card slots. Leather exterior.';p.outputs[0]='Selected first draft';p.hook='Four slots. Less bulk.';
 for(let i=0;i<t.steps.length;i++){assert.ok(LAB_TOOLS.some(x=>x.id===t.steps[i].tool));const prompt=projectPrompt(p,i);assert.ok(prompt.includes(p.brief.facts));assert.ok(prompt.includes(p.hook));if(i>0)assert.ok(prompt.includes(p.outputs[0]))}
 assert.ok(exportProject(p).includes('Four card slots. Leather exterior.'));assert.equal(validateProject(JSON.parse(JSON.stringify(p))).template,t.id)}
});
test('untrusted backups cannot introduce tools or unbounded project stages',()=>{
 assert.equal(validateProject({template:'remote-paid-api'}),null);assert.equal(validateProject({template:'product-ad',brief:{},id:'x'}),null);
 const p=createProject('product-ad');p.stage=500;p.name='x'.repeat(500);p.outputs[0]='y'.repeat(20000);p.updatedAt=Infinity;
 const safe=validateProject(p);assert.equal(safe.stage,5);assert.equal(safe.name.length,100);assert.equal(safe.outputs[0].length,12000);assert.ok(Number.isFinite(safe.updatedAt));p.stage=1.5;assert.equal(validateProject(p).stage,1);
});
test('challenge stays consistent within a week and rotates the following week',()=>{
 assert.equal(weeklyChallenge(new Date('2026-10-15')).title,weeklyChallenge(new Date('2026-10-16')).title);
 assert.notEqual(weeklyChallenge(new Date('2026-10-15')).title,weeklyChallenge(new Date('2026-10-22')).title);
});

test('instant ad kit carries supplied facts and CTA without requiring inference',()=>{const p=createProject('product-ad');p.brief={brand:'Mastan',product:'Leather card holder',facts:'Four card slots. Leather exterior.',audience:'Minimalists',goal:'Introduce',cta:'Follow Mastan',duration:'25 seconds'};p.hook=structuredDraft(p,0).split('\n')[0];for(let i=0;i<5;i++)assert.ok(structuredDraft(p,i).length>30);assert.ok(structuredDraft(p,1).includes(p.brief.facts));assert.ok(structuredDraft(p,3).includes('Follow Mastan'));assert.ok(!structuredDraft(p,1).includes('discount'));});

test('hook choices exclude model introductions and labels',()=>{assert.deepEqual(hookLines('Here are three hooks:\n\nAd Hook 1:\n"Keep your everyday cards together."\n\nAd Hook 2: "A closer look at a compact wallet."'),['Keep your everyday cards together.','A closer look at a compact wallet.']);});
test('all guided templates have useful local sample briefs and instant drafts',()=>{for(const t of PROJECT_TEMPLATES.filter(x=>x.id!=='saved-draft')){const p=createProject(t.id);p.brief=sampleBrief(t.id);for(let i=0;i<t.steps.length;i++)assert.ok(structuredDraft(p,i).length>30)}assert.ok(sampleBrief('study-session').facts.includes('Chlorophyll'));});
