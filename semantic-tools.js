// Ranking is performed on real model embeddings. Scores are cosine similarities, not probabilities.
export function cosine(a,b){
 let dot=0,aa=0,bb=0;
 for(let i=0;i<a.length;i++){dot+=a[i]*b[i];aa+=a[i]*a[i];bb+=b[i]*b[i]}
 return aa&&bb?Math.max(-1,Math.min(1,dot/Math.sqrt(aa*bb))):0;
}
export function passages(text){
 const items=text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 if(items.length<2||items.length>20)throw new Error('Enter 2–20 passages, with one passage on each line.');
 if(items.some(x=>x.length>700))throw new Error('Keep each passage under 700 characters.');
 return items;
}
export function labelsFrom(text){
 const labels=[...new Set(text.split(/[,\n]/).map(x=>x.trim()).filter(Boolean))];
 if(labels.length<2||labels.length>8)throw new Error('Enter 2–8 labels, separated by commas or new lines.');
 if(labels.some(x=>x.length>80))throw new Error('Keep each label under 80 characters.');
 return labels;
}
export function flashcardFacts(text){return text.split(/\n+|(?<=[.!?])\s+/).map(x=>x.trim()).filter(Boolean).slice(0,4)}
export function sentencesFrom(text){
 const parts=(text.match(/[^.!?]+(?:[.!?]+|$)/g)||[]).map(x=>x.trim()).filter(Boolean);
 if(parts.length<2||parts.length>20)throw new Error('Use a passage with 2–20 sentences.');
 if(parts.some(x=>x.length>700))throw new Error('Keep each sentence under 700 characters.');
 return parts;
}
export function ranked(query,vectors,texts){return texts.map((text,i)=>({text,score:cosine(query,vectors[i]),index:i})).sort((a,b)=>b.score-a.score||a.index-b.index)}
export function closestPairs(vectors,texts){
 const pairs=[];
 for(let i=0;i<texts.length;i++)for(let j=i+1;j<texts.length;j++)pairs.push({first:texts[i],second:texts[j],score:cosine(vectors[i],vectors[j]),firstIndex:i,secondIndex:j});
 return pairs.sort((a,b)=>b.score-a.score||a.firstIndex-b.firstIndex||a.secondIndex-b.secondIndex).slice(0,5);
}
const stops=new Set('a an the and or but if then as at by for from in into of on onto to with without is am are was were be been being it its this that these those i you he she we they them our your their his her my me us have has had do does did can could will would should may might must not no so very more most some any all each than also about when where which who how what why over under such only just through'.split(' '));
export function keywordCandidates(text){
 const items=new Map();
 for(const segment of text.toLowerCase().split(/[.!?;:,\n]/)){
  const words=segment.match(/[a-z][a-z'-]*/g)||[];
  for(let i=0;i<words.length;i++){
   for(let n=1;n<=3&&i+n<=words.length;n++){
    const part=words.slice(i,i+n);if(part.some(w=>stops.has(w)||w.length<3))break;
    const phrase=part.join(' ');items.set(phrase,(items.get(phrase)||0)+1);
   }
  }
 }
 return [...items].sort((a,b)=>b[1]-a[1]||b[0].split(' ').length-a[0].split(' ').length).slice(0,80).map(([phrase])=>phrase);
}
export function diverseKeywords(items){
 const picked=[];
 for(const item of items){if(!picked.some(x=>x.text.includes(item.text)||item.text.includes(x.text)))picked.push(item);if(picked.length===8)break}
 return picked;
}
export function representativeSentences(vectors,texts){
 const center=vectors[0].map((_,i)=>vectors.reduce((sum,v)=>sum+v[i],0)/vectors.length),chosen=[];
 const candidates=ranked(center,vectors,texts);
 while(chosen.length<Math.min(3,texts.length)){
  const best=candidates.filter(x=>!chosen.includes(x)).map(x=>({item:x,value:x.score*.75-(chosen.length?Math.max(...chosen.map(y=>cosine(vectors[x.index],vectors[y.index]))):0)*.25})).sort((a,b)=>b.value-a.value)[0];
  chosen.push(best.item);
 }
 return chosen.sort((a,b)=>a.index-b.index);
}
export async function runSemantic(tool,input,pipe,onProgress=()=>{}){
 const embed=async texts=>{
  const vectors=[];
  for(let start=0;start<texts.length;start+=4){const tensor=await pipe(texts.slice(start,start+4),{pooling:'mean',normalize:true});vectors.push(...tensor.tolist());onProgress(`Comparing meanings… ${Math.min(start+4,texts.length)} / ${texts.length}`)}
  return vectors;
 };
 if(tool.shape==='pair'){
  if(!input.secondary?.trim())throw new Error('Enter both passages to compare.');
  const vectors=await embed([input.text,input.secondary]);return {kind:'similarity',score:cosine(vectors[0],vectors[1])};
 }
 if(tool.shape==='search'){
  if(!input.question?.trim())throw new Error('Enter a search query.');
  const items=passages(input.text),vectors=await embed([input.question,...items]);return {kind:'ranked',title:'Closest passages',items:ranked(vectors[0],vectors.slice(1),items)};
 }
 if(tool.shape==='duplicates'){const items=passages(input.text),vectors=await embed(items);return {kind:'pairs',items:closestPairs(vectors,items)}}
 if(tool.shape==='sentences'){const items=sentencesFrom(input.text),vectors=await embed(items);return {kind:'text',text:representativeSentences(vectors,items).map(x=>x.text).join('\n\n')}}
 const candidates=keywordCandidates(input.text);if(!candidates.length)throw new Error('Add a passage with some descriptive English words.');
 const vectors=await embed([input.text,...candidates]);return {kind:'ranked',title:'Relevant phrases',items:diverseKeywords(ranked(vectors[0],vectors.slice(1),candidates))};
}
