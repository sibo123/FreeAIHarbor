import {modelInfo,escapeHTML as esc} from './lab-tools.js';
const modelHelp={
 chat:'This small language model writes short drafts. English works best. It has no live web access and may invent details; compare names, dates, and claims with your source before using the result.',
 summary:'Paste a short English passage. DistilBART rewrites it into a shorter summary; very long source text can exceed the model context. Check that qualifiers, quantities, and conclusions survive the rewrite.',
 translation:'Use the supported source and target language pair. Check names, numbers, and specialist vocabulary with a fluent speaker. This tool does not detect and support every language automatically.',
 portrait:'Use a clear photo of a person. MODNet is a portrait model, not a general product background remover. Inspect hair, hands, and clothing edges before downloading the transparent PNG.',
 ocr:'Choose the OCR language that matches the image. Straight, sharply focused printed text works best. Check similar characters such as O/0 and I/1; tables and handwriting may require manual correction.',
 speech:'Upload a recording under 40 MB and no longer than 2 minutes. Use a WAV or MP3 soundtrack if your browser cannot decode a video. Whisper Tiny can miss quiet speech and invent text during silence; listen while reviewing the transcript.',
 voice:'Enter a short English script, up to 600 characters. SpeechT5 uses one synthetic voice and a large first download (about 645 MB plus runtime). It does not clone a person’s voice.',
 topics:'Compare short English text against the available labels. Scores depend on this label set and are not calibrated probabilities about a person or situation. Review ambiguous results manually.',
 embeddings:'This model compares semantic similarity, not factual truth. Similar wording can hide opposite meanings. Review the original passages before treating matches as duplicates or evidence.',
 entities:'Use clear English text. The model estimates names, organizations, and places; it can split names or miss unfamiliar entities. Check spelling and boundaries against the original.',
 qa:'Provide both a source passage and a question answered by it. The model extracts a span from that passage; it cannot verify the source and may select an unrelated answer when the answer is absent.',
 sentiment:'The model compares positive and negative wording. Sarcasm, mixed feelings, and specialist language can confuse it. Scores are model estimates, not a measurement of a person’s actual emotion.',
 classification:'Labels come from a fixed model vocabulary. An unfamiliar object may still receive a confident label. Use results as suggestions and inspect the source image.',
 caption:'A short caption can omit or invent details. Check the picture yourself before using the result as alt text or publishing it.',
 detection:'The detector recognizes a limited set of common objects. Boxes may miss small or overlapping objects. The downloaded PNG includes the marked detections.',
 depth:'The grayscale image estimates relative depth from a single picture. It does not measure distance or produce a complete 3D model.',
 imageLabels:'Compare the image with your candidate labels. The highest score means the closest match among those options, not a verified identification.',
 sounds:'Use a clip no longer than 10 seconds. The audio classifier suggests likely sound categories; overlapping sounds and background noise can change its ranking.',
 mask:'Include exactly one [MASK] token. Suggested words reflect model patterns and may not be factually or grammatically correct in your intended context.',
 canvas:'The Photo Editor uses Canvas filters and keyword matching, not generative AI. Upload JPG, PNG, WebP, or BMP under 15 MB. Photos are reduced to a maximum 2200px edge. It cannot remove objects, replace backgrounds, or reconstruct faces.',
 client:'This utility combines your choices with templates; it does not call an AI model. Logo concepts need a trademark and originality review before brand use. Prompt syntax may need adapting to your chosen generator.'
};
export function helpHTML(tool){
 const m=modelInfo(tool);const local=['canvas','client'].includes(tool.model);
 return `<summary>How to use ${esc(tool.name)} · limits &amp; help</summary><p>${esc(tool.description)}</p><p>${esc(modelHelp[tool.model]||tool.note||'Review the output against your source before using it.')}</p>${tool.note?`<p><strong>Tool note:</strong> ${esc(tool.note)}</p>`:''}${tool.example?`<p><strong>Example input:</strong></p><pre>${esc(tool.example)}</pre>`:''}<p><strong>Processing:</strong> ${esc(m.label)}. ${local?'No model download.':'First download approximately '+esc(m.size)+', plus runtime files. Downloads may be cached.'} Your input is processed on this device.</p><p><strong>If a run fails:</strong> check your connection for model downloads, try a smaller input, close memory-heavy tabs, then retry. Stop cancels a local run. Download results you want to keep before leaving the page.</p><p><a href="/guides.html">Read the practical guides</a> · <a href="/catalog.html">Browse all workflows</a> · <a href="/contact.html">Report a problem</a></p>`;
}
