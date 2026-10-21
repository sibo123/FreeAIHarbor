// craft-graphics.js - High-fidelity "Craft" design system engine for Free AI Harbor
// Generates dark-theme software UI banners, woodcut engraved mascots, and dual-tone cards.

import {escapeHTML as esc} from './lab-tools.js';
import {providerFor} from './cloud-tools.js';

// Vibrant category palette matching the Craft suite (PhotoCraft, VectorCraft, FilmCraft, etc.)
export const CRAFT_PALETTES = {
  'Images': {
    accent: '#38bdf8', // Sky Blue
    badgeBg: '#0284c7',
    badgeText: '#041d33',
    line: '#1e3a5f',
    darkBg: '#09131f',
    label: 'IMAGE EDITOR & CANVAS'
  },
  'Coding & Planning': {
    accent: '#34d399', // Emerald / Mint
    badgeBg: '#059669',
    badgeText: '#02231b',
    line: '#134e48',
    darkBg: '#091c19',
    label: 'CODE WORKBENCH & IDE'
  },
  'Audio & Video': {
    accent: '#c084fc', // Violet / Purple
    badgeBg: '#7c3aed',
    badgeText: '#1e0538',
    line: '#3b1f66',
    darkBg: '#150a24',
    label: 'VIDEO & AUDIO WORKBENCH'
  },
  'Marketing & SEO': {
    accent: '#fb7185', // Rose / Pink
    badgeBg: '#e11d48',
    badgeText: '#2e040f',
    line: '#581c2f',
    darkBg: '#1c080f',
    label: 'MARKETING & COPY LAB'
  },
  'Chat & Writing': {
    accent: '#fb923c', // Sunset Orange
    badgeBg: '#ea580c',
    badgeText: '#2e1002',
    line: '#542710',
    darkBg: '#1a0c05',
    label: 'WRITING & DIALOGUE STUDIO'
  },
  'Research & Text': {
    accent: '#2dd4bf', // Neon Teal
    badgeBg: '#0d9488',
    badgeText: '#022421',
    line: '#134e4a',
    darkBg: '#081a18',
    label: 'RESEARCH & NLP WORKBENCH'
  },
  'Study & Learning': {
    accent: '#818cf8', // Indigo
    badgeBg: '#4f46e5',
    badgeText: '#0b0933',
    line: '#2e2560',
    darkBg: '#0f0c24',
    label: 'KNOWLEDGE & STUDY SUITE'
  },
  'Business & Work': {
    accent: '#facc15', // Amber / Gold
    badgeBg: '#ca8a04',
    badgeText: '#2b2100',
    line: '#4d3c0d',
    darkBg: '#1a1503',
    label: 'WORK & DOCUMENT STUDIO'
  }
};

// Specialized provider accents
export const PROVIDER_THEMES = {
  groq: { accent: '#f55036', badgeBg: '#f55036', badgeText: '#2b0904', label: 'GROQ LPU ACCELERATOR' },
  cerebras: { accent: '#e6ff00', badgeBg: '#d8e200', badgeText: '#242600', label: 'CEREBRAS CS-3 FAST INFERENCE' },
  deepseek: { accent: '#4589ff', badgeBg: '#0f62fe', badgeText: '#001438', label: 'DEEPSEEK REASONING CLOUD' },
  sambanova: { accent: '#ff6b35', badgeBg: '#ff5722', badgeText: '#2e0f05', label: 'SAMBANOVA RDU ACCELERATOR' },
  gemini: { accent: '#4ade80', badgeBg: '#16a34a', badgeText: '#02240c', label: 'GOOGLE GEMINI API' },
  mistral: { accent: '#f97316', badgeBg: '#ea580c', badgeText: '#2b0f02', label: 'MISTRAL LE CHAT & API' },
  stability: { accent: '#a855f7', badgeBg: '#9333ea', badgeText: '#1e0538', label: 'STABILITY AI DIFFUSION' },
  elevenlabs: { accent: '#38bdf8', badgeBg: '#0284c7', badgeText: '#041d33', label: 'ELEVENLABS NEURAL VOICE' },
  cartesia: { accent: '#c084fc', badgeBg: '#7c3aed', badgeText: '#1a0433', label: 'CARTESIA SONIC SPEED' },
  deepgram: { accent: '#2dd4bf', badgeBg: '#0d9488', badgeText: '#022421', label: 'DEEPGRAM NOVA SPEECH' },
  assemblyai: { accent: '#60a5fa', badgeBg: '#2563eb', badgeText: '#051838', label: 'ASSEMBLYAI SPEECH RECOGNITION' },
  fireworks: { accent: '#f43f5e', badgeBg: '#e11d48', badgeText: '#29040c', label: 'FIREWORKS ACCELERATED AI' }
};

export function craftTheme(tool, index = 0) {
  if (tool.provider && PROVIDER_THEMES[tool.provider]) {
    const pt = PROVIDER_THEMES[tool.provider];
    return {
      accent: pt.accent,
      badgeBg: pt.badgeBg,
      badgeText: pt.badgeText,
      line: '#283142',
      darkBg: '#0d1118',
      label: pt.label
    };
  }
  const catTheme = CRAFT_PALETTES[tool.category] || CRAFT_PALETTES['Chat & Writing'];
  // Refine label for prominent tools
  let label = catTheme.label;
  if (tool.id === 'photo-editor') label = 'IMAGE EDITOR & CANVAS';
  else if (tool.id === 'logo-designer') label = 'VECTOR ILLUSTRATION & BRAND';
  else if (tool.id === 'video-script' || tool.id === 'subtitle-generator') label = 'VIDEO & MOTION WORKBENCH';
  else if (tool.id === 'audio-transcription' || tool.id === 'text-to-speech') label = 'AUDIO & SPEECH WORKBENCH';
  else if (tool.id === 'image-ocr') label = 'OPTICAL CHARACTER RECOGNITION';
  else if (tool.id === 'portrait-cutout') label = 'BACKGROUND REMOVAL & MATTE';
  else if (tool.id === 'code-helper' || tool.id === 'code-debugger') label = 'CODE INTERFACE & DEBUGGER';
  else if (tool.id === 'ai-chat') label = 'CONVERSATIONAL INTELLIGENCE';
  else if (tool.id === 'depth-map') label = '3D DEPTH PERCEPTION & VISION';
  else if (tool.id === 'object-detector') label = 'COMPUTER VISION & DETECTION';

  return {
    ...catTheme,
    label
  };
}

export function craftTitleSplit(name, accentColor) {
  const parts = name.trim().split(/\s+/);
  if (parts.length > 1) {
    const last = parts.pop();
    const prefix = parts.join(' ');
    return `<span class="craft-title-prefix">${esc(prefix)} </span><span class="craft-title-suffix" style="color:${accentColor}">${esc(last)}</span>`;
  }
  // Single word: split at ~60% length
  const w = parts[0];
  if (w.length <= 4) {
    return `<span class="craft-title-prefix">${esc(w)}</span>`;
  }
  const splitIdx = Math.max(3, Math.ceil(w.length * 0.55));
  const p1 = w.slice(0, splitIdx);
  const p2 = w.slice(splitIdx);
  return `<span class="craft-title-prefix">${esc(p1)}</span><span class="craft-title-suffix" style="color:${accentColor}">${esc(p2)}</span>`;
}

// -------------------------------------------------------------
// MASCOT & OFFICIAL LOGO SVGs (Engraved Woodcut & Official Logos)
// -------------------------------------------------------------

// Official logos for providers
const OFFICIAL_LOGOS = {
  groq: `
    <rect width="40" height="40" rx="8" fill="#f55036"/>
    <circle cx="20" cy="18" r="9" fill="none" stroke="#fff" stroke-width="3"/>
    <path d="M23 21l6 7" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/>
  `,
  cerebras: `
    <rect width="40" height="40" rx="8" fill="#14170c"/>
    <path d="M20 7l11 6.5v13L20 33l-11-6.5v-13z" fill="none" stroke="#e6ff00" stroke-width="2.5"/>
    <circle cx="20" cy="20" r="4.5" fill="#e6ff00"/>
    <path d="M20 7v8.5M20 33v-8.5M9 13.5l7.5 4M31 26.5l-7.5-4M31 13.5l-7.5 4M9 26.5l7.5-4" stroke="#e6ff00" stroke-width="1.8"/>
  `,
  deepseek: `
    <rect width="40" height="40" rx="8" fill="#0f1d38"/>
    <!-- DeepSeek Whale Crest -->
    <path d="M8 24c4-7 11-11 20-9 3 1 6 3 7 6-2 1-5 1-7-1-4-3-11-2-15 3-2 3-3 4-5 1z" fill="#4589ff"/>
    <path d="M27 15c2-3 5-4 7-3-1 2-2 4-4 5z" fill="#38bdf8"/>
    <circle cx="25" cy="18" r="1.5" fill="#ffffff"/>
    <path d="M12 26c3 2 8 2 12 0" stroke="#38bdf8" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  `,
  sambanova: `
    <rect width="40" height="40" rx="8" fill="#241008"/>
    <path d="M12 28c0-7 6-8 10-10s6-3 6-6-3-5-7-5-7 3-7 6" fill="none" stroke="#ff6b35" stroke-width="3" stroke-linecap="round"/>
    <circle cx="28" cy="10" r="2.5" fill="#ff9e66"/>
    <circle cx="12" cy="28" r="2.5" fill="#ff9e66"/>
  `,
  gemini: `
    <rect width="40" height="40" rx="8" fill="#0b1726"/>
    <path d="M20 6c0 7.7-6.3 14-14 14 7.7 0 14 6.3 14 14 0-7.7 6.3-14 14-14-7.7 0-14-6.3-14-14z" fill="url(#gemini-grad)"/>
    <defs><linearGradient id="gemini-grad" x1="6" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse"><stop stop-color="#4ade80"/><stop offset="0.5" stop-color="#38bdf8"/><stop offset="1" stop-color="#a855f7"/></linearGradient></defs>
  `,
  mistral: `
    <rect width="40" height="40" rx="8" fill="#1f1105"/>
    <path d="M9 11h4v4H9zM15 11h4v4h-4zM21 11h4v4h-4zM27 11h4v4h-4zM9 17h4v4H9zM27 17h4v4h-4zM9 23h4v4H9zM15 23h4v4h-4zM21 23h4v4h-4zM27 23h4v4h-4z" fill="#f97316"/>
  `,
  stability: `
    <rect width="40" height="40" rx="8" fill="#140824"/>
    <circle cx="20" cy="20" r="11" fill="none" stroke="#a855f7" stroke-width="2.5"/>
    <circle cx="20" cy="20" r="5" fill="#c084fc"/>
    <circle cx="20" cy="9" r="2" fill="#e9d5ff"/>
    <circle cx="20" cy="31" r="2" fill="#e9d5ff"/>
    <circle cx="9" cy="20" r="2" fill="#e9d5ff"/>
    <circle cx="31" cy="20" r="2" fill="#e9d5ff"/>
  `,
  elevenlabs: `
    <rect width="40" height="40" rx="8" fill="#07192b"/>
    <rect x="13" y="10" width="4" height="20" rx="2" fill="#38bdf8"/>
    <rect x="23" y="10" width="4" height="20" rx="2" fill="#38bdf8"/>
  `,
  cartesia: `
    <rect width="40" height="40" rx="8" fill="#1a0b2e"/>
    <path d="M9 20h4l3-7 4 14 4-10 3 5 4-2" fill="none" stroke="#c084fc" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  deepgram: `
    <rect width="40" height="40" rx="8" fill="#04201c"/>
    <circle cx="20" cy="20" r="11" fill="none" stroke="#2dd4bf" stroke-width="2"/>
    <path d="M15 16v8M18 13v14M21 10v20M24 15v10" stroke="#2dd4bf" stroke-width="2.2" stroke-linecap="round"/>
  `,
  assemblyai: `
    <rect width="40" height="40" rx="8" fill="#07152b"/>
    <path d="M20 9l11 19H9z" fill="none" stroke="#60a5fa" stroke-width="2.5"/>
    <circle cx="20" cy="22" r="3" fill="#60a5fa"/>
  `,
  fireworks: `
    <rect width="40" height="40" rx="8" fill="#240710"/>
    <path d="M20 7c2 5 6 7 11 8-5 2-7 6-8 11-2-5-6-7-11-8 5-2 7-6 8-11z" fill="#f43f5e"/>
    <circle cx="20" cy="19" r="2" fill="#ffe4e6"/>
  `,
  whisper: `
    <rect width="40" height="40" rx="8" fill="#140a24"/>
    <path d="M20 8v24M14 11v18M26 11v18M8 15v10M32 15v10" stroke="#a78bfa" stroke-width="2.4" stroke-linecap="round"/>
  `,
  tesseract: `
    <rect width="40" height="40" rx="8" fill="#041f26"/>
    <rect x="9" y="9" width="22" height="22" rx="4" fill="none" stroke="#22d3ee" stroke-width="2"/>
    <path d="M14 16h12M20 16v10M16 26h8" stroke="#22d3ee" stroke-width="2" stroke-linecap="round"/>
  `
};

// Intricate Woodcut / Engraved Mascots (Fox, Dragon, Owl, Lynx, Lion, Unicorn, Cat, Chameleon, etc.)
// Detailed crosshatching, fur lines, feather texture, scales!
const WOODCUT_MASCOTS = {
  // 1. PhotoCraft Nine-Tailed Kitsune Fox
  fox: `
    <g fill="#ffffff" stroke="#111827" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round">
      <!-- Nine tails radiating -->
      <path d="M20 28c-4-4-10-8-12-16 5 2 9 6 11 11" fill="#f8fafc"/>
      <path d="M20 28c-6-2-13-4-15-11 5 1 10 4 13 8" fill="#f8fafc"/>
      <path d="M20 28c-7 0-14-1-15-6 6 0 11 2 14 5" fill="#f8fafc"/>
      <path d="M20 28c4-4 10-8 12-16-5 2-9 6-11 11" fill="#f8fafc"/>
      <path d="M20 28c6-2 13-4 15-11-5 1-10 4-13 8" fill="#f8fafc"/>
      <path d="M20 28c7 0 14-1 15-6-6 0-11 2-14 5" fill="#f8fafc"/>
      <!-- Body & Neck -->
      <path d="M16 24c-2 4-1 8 4 8s6-4 4-8" fill="#f8fafc"/>
      <!-- Head -->
      <path d="M20 11l-5 7 5 6 5-6z" fill="#ffffff"/>
      <!-- Ears -->
      <path d="M15 13L13 6l5 6z" fill="#f8fafc"/>
      <path d="M25 13l2-7-5 6z" fill="#f8fafc"/>
      <path d="M14 7l2 4M26 7l-2 4" stroke="#111827" stroke-width="0.8"/>
      <!-- Facial Hatching & Whiskers -->
      <circle cx="17.5" cy="16" r="1.1" fill="#111827"/>
      <circle cx="22.5" cy="16" r="1.1" fill="#111827"/>
      <path d="M20 20v1.5" stroke="#111827" stroke-width="1.2"/>
      <path d="M14 18l-3-1M14 19l-3 1M26 18l3-1M26 19l3 1" stroke="#111827" stroke-width="0.7"/>
      <path d="M18 21c1 1 3 1 4 0" fill="none" stroke="#111827" stroke-width="0.9"/>
    </g>
  `,

  // 2. VectorCraft Winged Dragon
  dragon: `
    <g fill="#ffffff" stroke="#111827" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round">
      <!-- Wing behind -->
      <path d="M23 15c4-7 11-8 14-7-3 3-5 8-5 14-2-2-5-4-9-7z" fill="#f8fafc"/>
      <path d="M28 10c3 3 5 8 5 14M32 10c2 4 3 8 2 12" stroke="#111827" stroke-width="0.8"/>
      <!-- Dragon Neck & Back -->
      <path d="M14 31c-3-8 0-16 6-20l5 3c-4 5-5 11-2 17z" fill="#ffffff"/>
      <!-- Spines along neck -->
      <path d="M16 17l-3-2 3 4M17 21l-3-1 3 3M19 25l-3-1 3 3" stroke="#111827" stroke-width="1.1"/>
      <!-- Head & Horns -->
      <path d="M19 12l4-6 1 4 3-4-1 6 4 2-8 5z" fill="#ffffff"/>
      <!-- Jaw & Snout -->
      <path d="M27 14l5 1-4 3z" fill="#ffffff"/>
      <!-- Eye & Nostril -->
      <circle cx="23" cy="13" r="1" fill="#111827"/>
      <circle cx="29" cy="15" r="0.6" fill="#111827"/>
      <!-- Scales Hatching -->
      <path d="M17 25c1 1 3 1 4 0M18 22c1 1 3 1 4 0M19 19c1 1 2 1 3 0" stroke="#111827" stroke-width="0.8"/>
    </g>
  `,

  // 3. FilmCraft Wise Horned Owl
  owl: `
    <g fill="#ffffff" stroke="#111827" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round">
      <!-- Body -->
      <ellipse cx="20" cy="22" rx="9" ry="10" fill="#ffffff"/>
      <!-- Breast Feather Hatching -->
      <path d="M16 23c2 2 6 2 8 0M15 26c3 2 7 2 10 0M17 29c2 1 4 1 6 0" fill="none" stroke="#111827" stroke-width="0.9"/>
      <!-- Wings -->
      <path d="M11 18c-2 5-1 11 2 14M29 18c2 5 1 11-2 14" stroke="#111827" stroke-width="1.1"/>
      <!-- Ear Tufts -->
      <path d="M13 14l2-6 3 4M27 14l-2-6-3 4" fill="#ffffff"/>
      <!-- Big Concentric Eyes -->
      <circle cx="16" cy="15" r="3.6" fill="#ffffff" stroke="#111827" stroke-width="1.1"/>
      <circle cx="24" cy="15" r="3.6" fill="#ffffff" stroke="#111827" stroke-width="1.1"/>
      <circle cx="16" cy="15" r="1.8" fill="#111827"/>
      <circle cx="24" cy="15" r="1.8" fill="#111827"/>
      <circle cx="15.4" cy="14.4" r="0.5" fill="#ffffff"/>
      <circle cx="23.4" cy="14.4" r="0.5" fill="#ffffff"/>
      <!-- Beak -->
      <path d="M19 16l1 4 1-4z" fill="#111827"/>
    </g>
  `,

  // 4. LightCraft Lynx / Bobcat
  lynx: `
    <g fill="#ffffff" stroke="#111827" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round">
      <!-- Head Contour -->
      <path d="M13 16c-3 4-2 9 1 12 3 3 9 3 12 0 3-3 4-8 1-12" fill="#ffffff"/>
      <!-- Tufted Ears -->
      <path d="M13 16L12 8l4 6z" fill="#f8fafc"/>
      <path d="M27 16l1-8-4 6z" fill="#f8fafc"/>
      <!-- Ear Tuft Whisps -->
      <path d="M12 8L10 5M28 8l2-3" stroke="#111827" stroke-width="1.2"/>
      <!-- Eyes -->
      <ellipse cx="16" cy="17" rx="1.8" ry="1.2" fill="#111827"/>
      <ellipse cx="24" cy="17" rx="1.8" ry="1.2" fill="#111827"/>
      <!-- Nose & Mouth -->
      <path d="M19 20h2l-1 2z" fill="#111827"/>
      <path d="M18 23c1 1 3 1 4 0" fill="none" stroke="#111827" stroke-width="1"/>
      <!-- Whisker Spots & Cheeks -->
      <circle cx="17" cy="22" r="0.5" fill="#111827"/>
      <circle cx="16" cy="23" r="0.5" fill="#111827"/>
      <circle cx="23" cy="22" r="0.5" fill="#111827"/>
      <circle cx="24" cy="23" r="0.5" fill="#111827"/>
      <!-- Whiskers -->
      <path d="M15 22l-4-1M15 23l-4 1M25 22l4-1M25 23l4 1" stroke="#111827" stroke-width="0.7"/>
      <!-- Spotted Fur Shading -->
      <path d="M19 13h2M18 15h4M17 26c2 1 4 1 6 0" stroke="#111827" stroke-width="0.8"/>
    </g>
  `,

  // 5. PdfCraft Regal Lion
  lion: `
    <g fill="#ffffff" stroke="#111827" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round">
      <!-- Mane Waves -->
      <path d="M20 7c-7 0-12 5-12 13 0 9 6 13 12 13s12-4 12-13c0-8-5-13-12-13z" fill="#f8fafc"/>
      <path d="M13 10c-3 3-4 8-2 13M27 10c3 3 4 8 2 13M10 17c-2 4 0 9 3 12M30 17c2 4 0 9-3 12M16 8c-2 3-1 6 0 9M24 8c2 3 1 6 0 9" stroke="#111827" stroke-width="0.8"/>
      <!-- Lion Face -->
      <ellipse cx="20" cy="20" rx="6" ry="7" fill="#ffffff"/>
      <!-- Eyes & Brow -->
      <path d="M16 16l2 1M24 16l-2 1" stroke="#111827" stroke-width="1.1"/>
      <circle cx="17.5" cy="18" r="1.1" fill="#111827"/>
      <circle cx="22.5" cy="18" r="1.1" fill="#111827"/>
      <!-- Broad Nose -->
      <path d="M19 21h2l-1 2z" fill="#111827"/>
      <path d="M20 23v2M18 25c1 1 3 1 4 0" fill="none" stroke="#111827" stroke-width="1"/>
    </g>
  `,

  // 6. EffectCraft Mythical Unicorn
  unicorn: `
    <g fill="#ffffff" stroke="#111827" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round">
      <!-- Spiral Horn -->
      <path d="M23 14L32 5l-6 10z" fill="#ffffff"/>
      <path d="M25 12l5-5M27 13l3-4" stroke="#111827" stroke-width="0.9"/>
      <!-- Neck & Wavy Mane -->
      <path d="M14 31c-3-6-2-12 2-16l6 3c-2 5-1 9 2 13z" fill="#f8fafc"/>
      <path d="M13 17c-3 4-4 9-2 13M11 22c-2 3-2 6 0 9" stroke="#111827" stroke-width="0.8"/>
      <!-- Head & Muzzle -->
      <path d="M18 16l5-3 5 4-4 5-6 1z" fill="#ffffff"/>
      <path d="M27 18l5 2-4 3-4-1z" fill="#ffffff"/>
      <!-- Eye & Ear -->
      <ellipse cx="23" cy="17" rx="1.1" ry="1.4" fill="#111827"/>
      <path d="M21 14l-1-5 3 4z" fill="#ffffff"/>
      <!-- Nostril -->
      <circle cx="30" cy="21" r="0.7" fill="#111827"/>
    </g>
  `,

  // 7. DesignCraft Bandana Cat
  cat: `
    <g fill="#ffffff" stroke="#111827" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round">
      <!-- Cat Head -->
      <circle cx="20" cy="17" r="8" fill="#ffffff"/>
      <!-- Pointy Ears -->
      <path d="M14 13L11 6l6 4z" fill="#f8fafc"/>
      <path d="M26 13l3-7-6 4z" fill="#f8fafc"/>
      <path d="M13 8l2 3M27 8l-2 3" stroke="#111827" stroke-width="0.8"/>
      <!-- Big Curious Eyes -->
      <ellipse cx="16.5" cy="16.5" rx="1.8" ry="2.2" fill="#111827"/>
      <ellipse cx="23.5" cy="16.5" rx="1.8" ry="2.2" fill="#111827"/>
      <circle cx="16" cy="15.5" r="0.7" fill="#ffffff"/>
      <circle cx="23" cy="15.5" r="0.7" fill="#ffffff"/>
      <!-- Nose & Mouth -->
      <path d="M19.3 19.5h1.4l-.7 1z" fill="#111827"/>
      <path d="M18.5 21.2c.8.6 2.2.6 3 0" fill="none" stroke="#111827" stroke-width="0.9"/>
      <!-- Whiskers -->
      <path d="M14 19l-4-1M14 20.5l-4 1M26 19l4-1M26 20.5l4 1" stroke="#111827" stroke-width="0.7"/>
      <!-- Polka-dot Bandana / Scarf around neck -->
      <path d="M12 24c4 4 12 4 16 0l-8 7z" fill="#ffffff" stroke="#111827" stroke-width="1.1"/>
      <circle cx="16" cy="26" r="0.7" fill="#111827"/>
      <circle cx="20" cy="26" r="0.7" fill="#111827"/>
      <circle cx="24" cy="26" r="0.7" fill="#111827"/>
      <circle cx="20" cy="28.5" r="0.7" fill="#111827"/>
    </g>
  `,

  // 8. FigCraft Chameleon
  chameleon: `
    <g fill="#ffffff" stroke="#111827" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round">
      <!-- Branch -->
      <path d="M6 26c9 0 19-1 28-2" stroke="#111827" stroke-width="1.6"/>
      <!-- Coiled Tail -->
      <path d="M12 24c-3 0-5-3-4-6s4-4 6-2 2 4 0 5-3 0-3-2" fill="none" stroke="#111827" stroke-width="1.3"/>
      <!-- Body -->
      <path d="M14 23c-1-5 2-10 8-11 5-1 9 2 11 6-3 4-7 6-12 6z" fill="#ffffff"/>
      <!-- Turret Eye with Cone -->
      <circle cx="27" cy="15" r="3.2" fill="#ffffff" stroke="#111827" stroke-width="1"/>
      <circle cx="27" cy="15" r="1.3" fill="#111827"/>
      <circle cx="26.5" cy="14.5" r="0.4" fill="#ffffff"/>
      <!-- Snout -->
      <path d="M30 18l3-1-3-2" stroke="#111827" stroke-width="1"/>
      <!-- Scales & Ridges Hatching -->
      <path d="M18 13l1-2 1 2M21 12l1-2 1 2M24 13l1-2 1 2" stroke="#111827" stroke-width="0.8"/>
      <path d="M19 18c2 2 5 2 7 0M18 20c2 2 5 2 7 0" stroke="#111827" stroke-width="0.7"/>
    </g>
  `,

  // 9. Timber Wolf
  wolf: `
    <g fill="#ffffff" stroke="#111827" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round">
      <path d="M13 28c-3-6-2-12 1-16l5-2 3-5 3 5 4 3 4 5-3 10z" fill="#ffffff"/>
      <path d="M18 10l-2-5 3 3M23 10l2-5-3 3" stroke="#111827" stroke-width="1"/>
      <circle cx="18" cy="14" r="1.1" fill="#111827"/>
      <path d="M14 17l6 2-3 4z" fill="#ffffff"/>
      <circle cx="15" cy="18" r="0.8" fill="#111827"/>
      <path d="M16 23c2 2 6 2 8 0M17 26c2 1 5 1 7 0" stroke="#111827" stroke-width="0.8"/>
    </g>
  `,

  // 10. Soaring Eagle / Falcon
  eagle: `
    <g fill="#ffffff" stroke="#111827" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round">
      <!-- Spread Wings -->
      <path d="M8 20c4-9 10-12 18-12 3 3 4 8 2 13-3-2-7-3-11-2-4 1-7 3-9 1z" fill="#ffffff"/>
      <path d="M12 13c3 4 5 9 5 13M16 11c3 3 5 8 5 12" stroke="#111827" stroke-width="0.8"/>
      <!-- Hooked Beak & Head -->
      <path d="M26 12c3-1 6 0 7 3-2 3-4 3-7 1z" fill="#ffffff"/>
      <path d="M33 15c1 3-1 4-3 4" stroke="#111827" stroke-width="1.2"/>
      <circle cx="27" cy="13" r="1.1" fill="#111827"/>
      <circle cx="26.7" cy="12.7" r="0.4" fill="#ffffff"/>
    </g>
  `
};

export function craftMascot(tool, index = 0, theme) {
  // 1. Check if official logo applies
  if (tool.provider && OFFICIAL_LOGOS[tool.provider]) {
    return `<svg class="craft-mascot-svg" viewBox="0 0 40 40" aria-hidden="true">${OFFICIAL_LOGOS[tool.provider]}</svg>`;
  }
  if (tool.id.includes('whisper')) {
    return `<svg class="craft-mascot-svg" viewBox="0 0 40 40" aria-hidden="true">${OFFICIAL_LOGOS.whisper}</svg>`;
  }
  if (tool.id.includes('ocr')) {
    return `<svg class="craft-mascot-svg" viewBox="0 0 40 40" aria-hidden="true">${OFFICIAL_LOGOS.tesseract}</svg>`;
  }

  // 2. Select woodcut mascot based on tool identity or index
  const mascotKeys = ['fox', 'dragon', 'owl', 'lynx', 'lion', 'unicorn', 'cat', 'chameleon', 'wolf', 'eagle'];
  let key = mascotKeys[index % mascotKeys.length];

  // Specific thematic pairings:
  if (tool.id === 'photo-editor') key = 'fox'; // Like PhotoCraft
  else if (tool.id === 'logo-designer') key = 'dragon'; // Like VectorCraft
  else if (tool.id === 'video-script' || tool.id === 'subtitle-generator') key = 'owl'; // Like FilmCraft
  else if (tool.id === 'depth-map' || tool.id === 'object-detector') key = 'lynx'; // Like LightCraft
  else if (tool.id === 'image-ocr' || tool.id.includes('pdf')) key = 'lion'; // Like PdfCraft
  else if (tool.id === 'portrait-cutout' || tool.category === 'Marketing & SEO') key = 'unicorn'; // Like EffectCraft
  else if (tool.id === 'writing-assistant' || tool.id === 'paraphraser') key = 'cat'; // Like DesignCraft
  else if (tool.id === 'code-helper' || tool.id === 'code-debugger') key = 'chameleon'; // Like FigCraft
  else if (tool.id === 'ai-chat') key = 'wolf';
  else if (tool.id === 'audio-transcription' || tool.id === 'text-to-speech') key = 'eagle';

  const woodcutBody = WOODCUT_MASCOTS[key] || WOODCUT_MASCOTS.fox;

  return `
    <svg class="craft-mascot-svg" viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="9" fill="${theme.badgeBg}"/>
      ${woodcutBody}
    </svg>
  `;
}

// -------------------------------------------------------------
// DARK SOFTWARE VIEWPORT BANNERS (Showing what work the tool does)
// -------------------------------------------------------------

export function craftBanner(tool, index = 0, theme) {
  const tId = tool.id;
  const accent = theme.accent;

  // 1. Photo Editor ("The Great Wave" Japanese woodcut wave on dark Photoshop canvas)
  if (tId === 'photo-editor' || tool.category === 'Images' && !tool.provider && (tId.includes('photo') || tId.includes('filter'))) {
    return `
      <svg class="craft-banner-svg" viewBox="0 0 340 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <!-- Dark IDE Chrome -->
        <rect width="340" height="160" fill="#0d1117"/>
        <!-- Window title bar -->
        <rect width="340" height="22" fill="#161b22"/>
        <circle cx="14" cy="11" r="3" fill="#ff5f56"/>
        <circle cx="24" cy="11" r="3" fill="#ffbd2e"/>
        <circle cx="34" cy="11" r="3" fill="#27c93f"/>
        <text x="50" y="14" fill="#8b949e" font-family="monospace" font-size="8.5">PhotoCraft - The Great Wave off Kanagawa.raw [100%]</text>
        
        <!-- Left Toolbar -->
        <rect x="0" y="22" width="26" height="138" fill="#161b22"/>
        <rect x="4" y="28" width="18" height="14" rx="2" fill="#21262d"/>
        <path d="M8 35h10M13 30v10" stroke="#8b949e" stroke-width="1.2"/>
        <circle cx="13" cy="53" r="5" fill="none" stroke="#8b949e" stroke-width="1.2"/>
        <path d="M8 70l10 5-5-10z" fill="#8b949e"/>
        <rect x="6" y="85" width="14" height="14" rx="2" fill="none" stroke="#8b949e" stroke-width="1.2"/>

        <!-- Canvas Area -->
        <rect x="36" y="30" width="220" height="120" rx="3" fill="#031326"/>
        <!-- Mt. Fuji in distance -->
        <path d="M125 100l20-30 20 30z" fill="#1e293b"/>
        <path d="M135 85l10-15 10 15z" fill="#f8fafc"/>
        <!-- The Great Wave cresting swells -->
        <path d="M36 150c30-5 50-30 70-35 30-8 50 15 80 5 20-7 40-30 70-20v50H36z" fill="#1d4ed8"/>
        <!-- Massive crest wave rising from left -->
        <path d="M36 140c20-10 40-50 65-75 15-15 35-25 50-20-8 5-12 15-20 18-12 4-25 15-35 30-10 15-25 35-60 47z" fill="#2563eb"/>
        <!-- Wave claws and white foam -->
        <path d="M151 45c-4 5-1 12-6 16-5 4-12 3-15 9-3 6-8 10-12 12" stroke="#f8fafc" stroke-width="2" fill="none"/>
        <circle cx="152" cy="43" r="2" fill="#fff"/>
        <circle cx="145" cy="50" r="1.5" fill="#fff"/>
        <circle cx="134" cy="58" r="1.5" fill="#fff"/>
        <circle cx="120" cy="70" r="1.8" fill="#fff"/>
        <!-- Canvas Label -->
        <text x="44" y="142" fill="#ffffff" font-family="sans-serif" font-weight="700" font-size="9.5" letter-spacing="0.3">The Great Wave</text>

        <!-- Right Curves Adjustment Dock -->
        <rect x="264" y="22" width="76" height="138" fill="#161b22"/>
        <text x="272" y="36" fill="#8b949e" font-family="sans-serif" font-size="7.5" font-weight="600">CURVES</text>
        <!-- Curves Graph -->
        <rect x="272" y="42" width="60" height="50" fill="#0d1117" stroke="#30363d" stroke-width="0.8"/>
        <path d="M272 67h60M302 42v50" stroke="#21262d" stroke-width="0.8"/>
        <!-- S-Curve -->
        <path d="M272 87c20 0 25-15 30-20s15-20 30-20" fill="none" stroke="${accent}" stroke-width="1.8"/>
        <circle cx="295" cy="72" r="2.2" fill="${accent}"/>
        <circle cx="315" cy="52" r="2.2" fill="${accent}"/>
        <!-- Sliders -->
        <rect x="272" y="104" width="60" height="4" rx="2" fill="#21262d"/>
        <circle cx="305" cy="106" r="4" fill="${accent}"/>
        <rect x="272" y="118" width="60" height="4" rx="2" fill="#21262d"/>
        <circle cx="290" cy="120" r="4" fill="${accent}"/>
        <rect x="272" y="132" width="60" height="4" rx="2" fill="#21262d"/>
        <circle cx="318" cy="134" r="4" fill="${accent}"/>
      </svg>
    `;
  }

  // 2. VectorCraft / Logo Designer (80s Neon Synthwave Grid, Sunset & Bezier Anchors)
  if (tId === 'logo-designer' || tId.includes('vector') || tId.includes('logo')) {
    return `
      <svg class="craft-banner-svg" viewBox="0 0 340 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="340" height="160" fill="#0b0716"/>
        <!-- Window title bar -->
        <rect width="340" height="22" fill="#150d29"/>
        <circle cx="14" cy="11" r="3" fill="#ff5f56"/>
        <circle cx="24" cy="11" r="3" fill="#ffbd2e"/>
        <circle cx="34" cy="11" r="3" fill="#27c93f"/>
        <text x="50" y="14" fill="#a78bfa" font-family="monospace" font-size="8.5">VectorCraft - neon_drive.svg [CMYK / 300 DPI]</text>
        
        <!-- Left Toolbar -->
        <rect x="0" y="22" width="26" height="138" fill="#150d29"/>
        <path d="M8 32l10 5-5 2-2 5z" fill="#fb923c"/>
        <path d="M10 50l7-7 2 2-7 7z" stroke="#a78bfa" stroke-width="1.2"/>
        <circle cx="13" cy="70" r="5" stroke="#a78bfa" stroke-width="1.2" fill="none"/>
        <rect x="8" y="86" width="10" height="10" stroke="#a78bfa" stroke-width="1.2" fill="none"/>

        <!-- Canvas Area -->
        <g transform="translate(34, 28)">
          <rect width="224" height="124" rx="3" fill="#0f0724"/>
          <!-- Synthwave Neon Sun with Blinds -->
          <circle cx="112" cy="65" r="34" fill="url(#sun-grad)"/>
          <path d="M78 55h68M78 61h68M78 68h68M78 76h68M78 85h68" stroke="#0f0724" stroke-width="2"/>
          <!-- Mountain Silhouettes -->
          <path d="M20 90l35-25 45 25 35-30 45 30 44-15v10H20z" fill="#2a0845"/>
          <!-- Perspective Wireframe Grid Floor -->
          <path d="M0 90h224M0 98h224M0 108h224M0 120h224" stroke="#c084fc" stroke-width="0.8" opacity="0.6"/>
          <path d="M112 90L10 124M112 90L45 124M112 90L80 124M112 90L112 124M112 90L144 124M112 90L179 124M112 90L214 124" stroke="#c084fc" stroke-width="0.8" opacity="0.6"/>
          <!-- Title Typo -->
          <text x="112" y="44" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-weight="900" font-size="14" letter-spacing="2">NEON DRIVE</text>
          <!-- Vector Bezier Anchors and Tangent Handles -->
          <path d="M40 70C70 40 100 80 140 50" fill="none" stroke="#22d3ee" stroke-width="2"/>
          <circle cx="40" cy="70" r="3" fill="#22d3ee"/>
          <circle cx="140" cy="50" r="3" fill="#22d3ee"/>
          <line x1="140" y1="50" x2="165" y2="35" stroke="#f472b6" stroke-width="1.2"/>
          <circle cx="165" cy="35" r="2.5" fill="#f472b6"/>
        </g>

        <!-- Right Color & Inspector Dock -->
        <rect x="266" y="22" width="74" height="138" fill="#150d29"/>
        <text x="274" y="36" fill="#a78bfa" font-family="sans-serif" font-size="7.5" font-weight="600">SWATCHES</text>
        <!-- Swatch grid -->
        <rect x="274" y="44" width="16" height="16" rx="3" fill="#fb923c"/>
        <rect x="294" y="44" width="16" height="16" rx="3" fill="#f43f5e"/>
        <rect x="314" y="44" width="16" height="16" rx="3" fill="#c084fc"/>
        <rect x="274" y="64" width="16" height="16" rx="3" fill="#38bdf8"/>
        <rect x="294" y="64" width="16" height="16" rx="3" fill="#4ade80"/>
        <rect x="314" y="64" width="16" height="16" rx="3" fill="#facc15"/>
        <text x="274" y="98" fill="#a78bfa" font-family="sans-serif" font-size="7.5" font-weight="600">BEZIER NODE</text>
        <rect x="274" y="104" width="58" height="16" rx="3" fill="#241445"/>
        <text x="280" y="115" fill="#22d3ee" font-family="monospace" font-size="7.5">X: 140 Y: 50</text>
        <defs>
          <linearGradient id="sun-grad" x1="0" y1="0" x2="0" y2="1">
            <stop stop-color="#facc15"/>
            <stop offset="0.5" stop-color="#fb923c"/>
            <stop offset="1" stop-color="#f43f5e"/>
          </linearGradient>
        </defs>
      </svg>
    `;
  }

  // 3. FilmCraft / Video Editor & Subtitles (Multi-Track NLE Timeline with Playhead & Preview)
  if (tId === 'video-script' || tId === 'subtitle-generator' || tool.category === 'Audio & Video' && (tId.includes('video') || tId.includes('subtitle') || tId.includes('script'))) {
    return `
      <svg class="craft-banner-svg" viewBox="0 0 340 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="340" height="160" fill="#0d0f14"/>
        <!-- Window title bar -->
        <rect width="340" height="22" fill="#161922"/>
        <circle cx="14" cy="11" r="3" fill="#ff5f56"/>
        <circle cx="24" cy="11" r="3" fill="#ffbd2e"/>
        <circle cx="34" cy="11" r="3" fill="#27c93f"/>
        <text x="50" y="14" fill="#9ca3af" font-family="monospace" font-size="8.5">FilmCraft - sequence_01.fc · 4K 24fps · Prores 422</text>
        
        <!-- Top Half: Preview Monitor & Media Bin -->
        <!-- Media Bin (left) -->
        <rect x="8" y="28" width="80" height="64" rx="2" fill="#161922"/>
        <text x="14" y="38" fill="#6b7280" font-family="sans-serif" font-size="7">MEDIA BIN</text>
        <rect x="14" y="44" width="32" height="20" rx="1" fill="#262c3d"/>
        <rect x="50" y="44" width="32" height="20" rx="1" fill="#262c3d"/>
        <rect x="14" y="68" width="32" height="20" rx="1" fill="#262c3d"/>
        <rect x="50" y="68" width="32" height="20" rx="1" fill="#262c3d"/>

        <!-- Center Preview Monitor -->
        <rect x="94" y="28" width="170" height="64" rx="2" fill="#000000"/>
        <!-- Movie Scene: Two figures in cinematic shot -->
        <path d="M125 92c0-12 8-18 16-18s16 6 16 18z" fill="#1e293b"/>
        <circle cx="141" cy="62" r="7" fill="#f0ab7a"/>
        <path d="M165 92c0-14 10-20 20-20s20 6 20 20z" fill="#dc2626"/>
        <circle cx="185" cy="60" r="7" fill="#fbcfe8"/>
        <!-- Subtitle overlay -->
        <rect x="110" y="80" width="138" height="10" rx="2" fill="rgba(0,0,0,0.7)"/>
        <text x="179" y="88" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="6.5">"The open-source revolution is here."</text>

        <!-- Right VU Audio Meters -->
        <rect x="270" y="28" width="62" height="64" rx="2" fill="#161922"/>
        <text x="278" y="38" fill="#6b7280" font-family="sans-serif" font-size="7">AUDIO dB</text>
        <rect x="282" y="44" width="6" height="42" fill="#1f2937"/>
        <rect x="282" y="58" width="6" height="28" fill="#10b981"/>
        <rect x="292" y="44" width="6" height="42" fill="#1f2937"/>
        <rect x="292" y="54" width="6" height="32" fill="#10b981"/>
        <rect x="292" y="48" width="6" height="6" fill="#f59e0b"/>

        <!-- Bottom Half: Multi-track Timeline -->
        <rect x="0" y="96" width="340" height="64" fill="#11141c"/>
        <!-- Track Labels -->
        <text x="8" y="112" fill="#6b7280" font-family="monospace" font-size="7">V1</text>
        <text x="8" y="128" fill="#6b7280" font-family="monospace" font-size="7">A1</text>
        <text x="8" y="144" fill="#6b7280" font-family="monospace" font-size="7">A2</text>
        <!-- V1 Video Clips -->
        <rect x="28" y="102" width="70" height="13" rx="2" fill="#2563eb" stroke="#1d4ed8" stroke-width="1"/>
        <rect x="102" y="102" width="110" height="13" rx="2" fill="#3b82f6" stroke="#2563eb" stroke-width="1"/>
        <rect x="216" y="102" width="90" height="13" rx="2" fill="#1d4ed8" stroke="#1e40af" stroke-width="1"/>
        <!-- A1 Audio Wave Clips -->
        <rect x="28" y="118" width="184" height="13" rx="2" fill="#059669"/>
        <path d="M32 124h176" stroke="#34d399" stroke-width="1.5" stroke-dasharray="2 1"/>
        <!-- A2 Music Clips -->
        <rect x="80" y="134" width="226" height="13" rx="2" fill="#7c3aed"/>
        <path d="M84 140h218" stroke="#c084fc" stroke-width="1.5" stroke-dasharray="3 1.5"/>

        <!-- Yellow Vertical Playhead -->
        <line x1="160" y1="96" x2="160" y2="160" stroke="#facc15" stroke-width="1.5"/>
        <polygon points="156,96 164,96 160,103" fill="#facc15"/>
      </svg>
    `;
  }

  // 4. Optical Character Recognition (OCR) / Document Workbench (PdfCraft style)
  if (tId === 'image-ocr' || tId.includes('ocr') || tId.includes('pdf')) {
    return `
      <svg class="craft-banner-svg" viewBox="0 0 340 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="340" height="160" fill="#0d1117"/>
        <!-- Header -->
        <rect width="340" height="22" fill="#161b22"/>
        <circle cx="14" cy="11" r="3" fill="#ff5f56"/>
        <circle cx="24" cy="11" r="3" fill="#ffbd2e"/>
        <circle cx="34" cy="11" r="3" fill="#27c93f"/>
        <text x="50" y="14" fill="#8b949e" font-family="monospace" font-size="8.5">PdfCraft / OCR - scanned_invoice_904.pdf [Tesseract 5.0 Engine]</text>
        
        <!-- Left Thumbnail Sidebar -->
        <rect x="0" y="22" width="46" height="138" fill="#161b22"/>
        <rect x="8" y="28" width="30" height="38" rx="2" fill="#ffffff" stroke="#2dd4bf" stroke-width="1.2"/>
        <text x="18" y="48" fill="#0d1117" font-family="monospace" font-size="8">01</text>
        <rect x="8" y="72" width="30" height="38" rx="2" fill="#21262d"/>
        <text x="18" y="92" fill="#8b949e" font-family="monospace" font-size="8">02</text>
        <rect x="8" y="116" width="30" height="38" rx="2" fill="#21262d"/>

        <!-- Center Scanned Document Page -->
        <g transform="translate(60, 26)">
          <rect width="180" height="126" rx="3" fill="#ffffff" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))"/>
          <!-- Document Header -->
          <text x="14" y="20" fill="#0f172a" font-family="sans-serif" font-weight="900" font-size="11">COMMERCIAL INVOICE</text>
          <text x="14" y="30" fill="#64748b" font-family="sans-serif" font-size="6.5">Invoice #INV-2026-881 · Date: 2026-10-21</text>
          
          <!-- OCR Glowing Bounding Boxes -->
          <!-- Box 1: Billed To -->
          <rect x="12" y="38" width="70" height="24" rx="2" fill="rgba(45,212,191,0.12)" stroke="#0d9488" stroke-width="1.2" stroke-dasharray="3 2"/>
          <text x="16" y="47" fill="#0f172a" font-family="monospace" font-size="6" font-weight="700">Acme Global Ltd</text>
          <text x="16" y="55" fill="#334155" font-family="monospace" font-size="5.5">San Francisco, CA</text>

          <!-- Box 2: Total Amount (High Confidence) -->
          <rect x="100" y="38" width="68" height="24" rx="2" fill="rgba(16,185,129,0.15)" stroke="#059669" stroke-width="1.2"/>
          <text x="104" y="47" fill="#047857" font-family="monospace" font-size="6" font-weight="700">TOTAL: $4,920.00</text>
          <text x="104" y="56" fill="#059669" font-family="monospace" font-size="5">99.8% CONFIDENCE</text>

          <!-- Table Line Items -->
          <line x1="12" y1="70" x2="168" y2="70" stroke="#e2e8f0" stroke-width="1"/>
          <!-- Box 3: Detected table line -->
          <rect x="12" y="74" width="156" height="14" rx="1" fill="rgba(56,189,248,0.12)" stroke="#0284c7" stroke-width="1"/>
          <text x="16" y="83" fill="#0f172a" font-family="monospace" font-size="6">01 Enterprise Cloud Node Cluster    $3,200.00</text>
          <rect x="12" y="92" width="156" height="14" rx="1" fill="rgba(56,189,248,0.08)" stroke="#38bdf8" stroke-width="0.8"/>
          <text x="16" y="101" fill="#0f172a" font-family="monospace" font-size="6">02 High-Speed Neural Inference API    $1,720.00</text>
        </g>

        <!-- Right Side: Structured JSON Output -->
        <rect x="250" y="22" width="90" height="138" fill="#161b22"/>
        <text x="258" y="36" fill="#2dd4bf" font-family="monospace" font-size="7" font-weight="700">EXTRACTED JSON</text>
        <g fill="#94a3b8" font-family="monospace" font-size="5.8" transform="translate(258, 48)">
          <text y="0">{"invoice":</text>
          <text y="10" fill="#38bdf8"> "INV-881",</text>
          <text y="20"> "total":</text>
          <text y="30" fill="#34d399"> 4920.00,</text>
          <text y="40"> "currency":</text>
          <text y="50" fill="#facc15"> "USD",</text>
          <text y="60"> "status":</text>
          <text y="70" fill="#34d399"> "PAID"</text>
          <text y="80">}</text>
        </g>
      </svg>
    `;
  }

  // 5. Background Remover / Portrait Cutout (Alpha Checkerboard Split-View)
  if (tId === 'portrait-cutout' || tId.includes('cutout') || tId.includes('background')) {
    return `
      <svg class="craft-banner-svg" viewBox="0 0 340 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="340" height="160" fill="#0d1117"/>
        <rect width="340" height="22" fill="#161b22"/>
        <circle cx="14" cy="11" r="3" fill="#ff5f56"/>
        <circle cx="24" cy="11" r="3" fill="#ffbd2e"/>
        <circle cx="34" cy="11" r="3" fill="#27c93f"/>
        <text x="50" y="14" fill="#8b949e" font-family="monospace" font-size="8.5">EffectCraft / Matte - portrait_cutout.png [MODNet AI Segmentation]</text>
        
        <!-- Left Side: Solid Studio Photo -->
        <rect x="18" y="30" width="150" height="120" fill="#1e293b"/>
        <!-- Studio Portrait Silhouette on Left -->
        <ellipse cx="93" cy="80" rx="26" ry="32" fill="#f87171"/>
        <circle cx="93" cy="65" r="16" fill="#fbcfe8"/>
        <path d="M67 115c0-18 12-25 26-25s26 7 26 25z" fill="#0f172a"/>
        <text x="26" y="44" fill="#94a3b8" font-family="sans-serif" font-size="7.5" font-weight="700">ORIGINAL</text>

        <!-- Right Side: Alpha Transparency Checkerboard -->
        <g transform="translate(170, 30)">
          <rect width="152" height="120" fill="#ffffff"/>
          <!-- Checkerboard Pattern -->
          <pattern id="checker" width="12" height="12" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="#e2e8f0"/>
            <rect x="6" y="6" width="6" height="6" fill="#e2e8f0"/>
          </pattern>
          <rect width="152" height="120" fill="url(#checker)"/>
          
          <!-- Perfectly Cutout Portrait with Neon Green Matting Edge -->
          <g transform="translate(-75, 0)">
            <!-- Neon Edge Outline -->
            <ellipse cx="93" cy="80" rx="27" ry="33" fill="none" stroke="#22c55e" stroke-width="1.8"/>
            <!-- Cutout Person -->
            <ellipse cx="93" cy="80" rx="26" ry="32" fill="#f87171"/>
            <circle cx="93" cy="65" r="16" fill="#fbcfe8"/>
            <path d="M67 115c0-18 12-25 26-25s26 7 26 25z" fill="#0f172a"/>
          </g>
          <text x="80" y="16" fill="#059669" font-family="sans-serif" font-size="7.5" font-weight="700">100% TRANSPARENT</text>
        </g>

        <!-- Split Slider Handle -->
        <line x1="170" y1="30" x2="170" y2="150" stroke="#ffffff" stroke-width="2"/>
        <circle cx="170" cy="90" r="9" fill="#ffffff" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))"/>
        <path d="M167 90l2-2v4zM173 90l-2-2v4z" fill="#0f172a"/>
      </svg>
    `;
  }

  // 6. Audio Transcription & Speech (DAW / Waveform & Timed SRT Stream)
  if (tId === 'audio-transcription' || tId === 'text-to-speech' || tId.includes('speech') || tId.includes('audio')) {
    return `
      <svg class="craft-banner-svg" viewBox="0 0 340 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="340" height="160" fill="#0b0e14"/>
        <rect width="340" height="22" fill="#151922"/>
        <circle cx="14" cy="11" r="3" fill="#ff5f56"/>
        <circle cx="24" cy="11" r="3" fill="#ffbd2e"/>
        <circle cx="34" cy="11" r="3" fill="#27c93f"/>
        <text x="50" y="14" fill="#9ca3af" font-family="monospace" font-size="8.5">SoundCraft - whisper_transcribe.wav [48kHz · 16-bit PCM · Stereo]</text>
        
        <!-- Waveform Spectrum Viewport -->
        <g transform="translate(18, 28)">
          <rect width="304" height="60" rx="3" fill="#111726"/>
          <!-- Dynamic Waveform Frequency Bars -->
          <g fill="${accent}">
            <rect x="6" y="24" width="3" height="12" rx="1.5"/>
            <rect x="12" y="18" width="3" height="24" rx="1.5"/>
            <rect x="18" y="12" width="3" height="36" rx="1.5"/>
            <rect x="24" y="6" width="3" height="48" rx="1.5"/>
            <rect x="30" y="16" width="3" height="28" rx="1.5"/>
            <rect x="36" y="22" width="3" height="16" rx="1.5"/>
            <rect x="42" y="14" width="3" height="32" rx="1.5"/>
            <rect x="48" y="8" width="3" height="44" rx="1.5"/>
            <rect x="54" y="4" width="3" height="52" rx="1.5"/>
            <rect x="60" y="10" width="3" height="40" rx="1.5"/>
            <rect x="66" y="18" width="3" height="24" rx="1.5"/>
            <rect x="72" y="26" width="3" height="8" rx="1.5"/>
            <rect x="78" y="14" width="3" height="32" rx="1.5"/>
            <rect x="84" y="8" width="3" height="44" rx="1.5"/>
            <rect x="90" y="12" width="3" height="36" rx="1.5"/>
            <rect x="96" y="20" width="3" height="20" rx="1.5"/>
            <rect x="102" y="16" width="3" height="28" rx="1.5"/>
            <rect x="108" y="6" width="3" height="48" rx="1.5"/>
            <rect x="114" y="2" width="3" height="56" rx="1.5"/>
            <rect x="120" y="8" width="3" height="44" rx="1.5"/>
            <rect x="126" y="14" width="3" height="32" rx="1.5"/>
            <rect x="132" y="22" width="3" height="16" rx="1.5"/>
            <rect x="138" y="16" width="3" height="28" rx="1.5"/>
            <rect x="144" y="10" width="3" height="40" rx="1.5"/>
            <rect x="150" y="18" width="3" height="24" rx="1.5"/>
            <rect x="156" y="24" width="3" height="12" rx="1.5"/>
            <rect x="162" y="12" width="3" height="36" rx="1.5"/>
            <rect x="168" y="6" width="3" height="48" rx="1.5"/>
            <rect x="174" y="14" width="3" height="32" rx="1.5"/>
            <rect x="180" y="20" width="3" height="20" rx="1.5"/>
            <rect x="186" y="8" width="3" height="44" rx="1.5"/>
            <rect x="192" y="4" width="3" height="52" rx="1.5"/>
            <rect x="198" y="12" width="3" height="36" rx="1.5"/>
            <rect x="204" y="16" width="3" height="28" rx="1.5"/>
            <rect x="210" y="22" width="3" height="16" rx="1.5"/>
            <rect x="216" y="14" width="3" height="32" rx="1.5"/>
            <rect x="222" y="8" width="3" height="44" rx="1.5"/>
            <rect x="228" y="12" width="3" height="36" rx="1.5"/>
            <rect x="234" y="18" width="3" height="24" rx="1.5"/>
            <rect x="240" y="24" width="3" height="12" rx="1.5"/>
            <rect x="246" y="14" width="3" height="32" rx="1.5"/>
            <rect x="252" y="8" width="3" height="44" rx="1.5"/>
            <rect x="258" y="4" width="3" height="52" rx="1.5"/>
            <rect x="264" y="10" width="3" height="40" rx="1.5"/>
            <rect x="270" y="18" width="3" height="24" rx="1.5"/>
            <rect x="276" y="26" width="3" height="8" rx="1.5"/>
            <rect x="282" y="16" width="3" height="28" rx="1.5"/>
            <rect x="288" y="10" width="3" height="40" rx="1.5"/>
            <rect x="294" y="18" width="3" height="24" rx="1.5"/>
          </g>
          <!-- Playhead line -->
          <line x1="140" y1="0" x2="140" y2="60" stroke="#f43f5e" stroke-width="2"/>
        </g>

        <!-- Bottom: Synchronized SRT Caption Cards -->
        <g transform="translate(18, 96)">
          <rect width="304" height="54" rx="3" fill="#131824" stroke="#1e2738" stroke-width="1"/>
          <!-- Active timestamp badge -->
          <rect x="8" y="8" width="94" height="14" rx="2" fill="#1e293b"/>
          <text x="12" y="18" fill="${accent}" font-family="monospace" font-size="7">00:00:14,250 ➔ 00:00:18,500</text>
          <text x="8" y="32" fill="#ffffff" font-family="sans-serif" font-weight="600" font-size="8.5">"Antigravity local models operate seamlessly on your browser."</text>
          <text x="8" y="44" fill="#64748b" font-family="sans-serif" font-size="7">Word Error Rate (WER): 2.4% · Model: OpenAI Whisper Tiny (On-Device)</text>
        </g>
      </svg>
    `;
  }

  // 7. Code Helper & Code Debugger (Dark IDE with syntax highlighting & error diagnostic)
  if (tool.category === 'Coding & Planning' || tId.includes('code') || tId.includes('regex') || tId.includes('sql')) {
    return `
      <svg class="craft-banner-svg" viewBox="0 0 340 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="340" height="160" fill="#0b0f14"/>
        <rect width="340" height="22" fill="#141922"/>
        <circle cx="14" cy="11" r="3" fill="#ff5f56"/>
        <circle cx="24" cy="11" r="3" fill="#ffbd2e"/>
        <circle cx="34" cy="11" r="3" fill="#27c93f"/>
        <text x="50" y="14" fill="#8b949e" font-family="monospace" font-size="8.5">CodeCraft IDE - app_worker.ts [TypeScript 5.4 · ESLint: Clean]</text>

        <!-- Left File Explorer -->
        <rect x="0" y="22" width="55" height="138" fill="#111620"/>
        <text x="8" y="36" fill="#64748b" font-family="monospace" font-size="6.5">EXPLORER</text>
        <text x="8" y="50" fill="#38bdf8" font-family="monospace" font-size="6.5">▾ src</text>
        <text x="14" y="62" fill="#34d399" font-family="monospace" font-size="6.5">  worker.ts</text>
        <text x="14" y="74" fill="#94a3b8" font-family="monospace" font-size="6.5">  model.onnx</text>
        <text x="14" y="86" fill="#94a3b8" font-family="monospace" font-size="6.5">  types.d.ts</text>

        <!-- Editor Workspace -->
        <g transform="translate(55, 22)">
          <!-- Line Numbers -->
          <rect width="22" height="138" fill="#0b0f14"/>
          <g fill="#475569" font-family="monospace" font-size="6.5" text-anchor="end">
            <text x="16" y="18">01</text>
            <text x="16" y="30">02</text>
            <text x="16" y="42">03</text>
            <text x="16" y="54">04</text>
            <text x="16" y="66">05</text>
            <text x="16" y="78">06</text>
            <text x="16" y="90">07</text>
            <text x="16" y="102">08</text>
            <text x="16" y="114">09</text>
            <text x="16" y="126">10</text>
          </g>

          <!-- Syntax Highlighted Code -->
          <g font-family="monospace" font-size="6.8" transform="translate(26, 0)">
            <text y="18"><tspan fill="#f43f5e">import</tspan><tspan fill="#f8fafc"> { pipeline } </tspan><tspan fill="#f43f5e">from</tspan><tspan fill="#34d399"> '@xenova/transformers'</tspan>;</text>
            <text y="30"><tspan fill="#f43f5e">export async function</tspan><tspan fill="#38bdf8"> runInference</tspan><tspan fill="#f8fafc">(task: </tspan><tspan fill="#facc15">string</tspan><tspan fill="#f8fafc">) {</tspan></text>
            <text y="42"><tspan fill="#f8fafc">  const pipe = </tspan><tspan fill="#f43f5e">await</tspan><tspan fill="#38bdf8"> pipeline</tspan><tspan fill="#f8fafc">(task, </tspan><tspan fill="#34d399">'SmolLM2-360M'</tspan><tspan fill="#f8fafc">);</tspan></text>
            <text y="54"><tspan fill="#f8fafc">  const out = </tspan><tspan fill="#f43f5e">await</tspan><tspan fill="#f8fafc"> pipe(prompt, { max_new_tokens: </tspan><tspan fill="#c084fc">256</tspan><tspan fill="#f8fafc"> });</tspan></text>
            <!-- Squiggly line under error / suggestion -->
            <path d="M4 56q2 1 4 0t4 0t4 0t4 0t4 0" stroke="#f43f5e" stroke-width="0.8" fill="none"/>
            <text y="66"><tspan fill="#f43f5e">  return</tspan><tspan fill="#f8fafc"> out[</tspan><tspan fill="#c084fc">0</tspan><tspan fill="#f8fafc">].generated_text;</tspan></text>
            <text y="78"><tspan fill="#f8fafc">}</tspan></text>
          </g>

          <!-- Diagnostic Floating Bubble -->
          <g transform="translate(30, 86)">
            <rect width="220" height="38" rx="4" fill="#1e1828" stroke="#a855f7" stroke-width="1" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.5))"/>
            <circle cx="12" cy="14" r="5" fill="#a855f7"/>
            <path d="M10 14l2 2 3-3" stroke="#fff" stroke-width="1.2" fill="none"/>
            <text x="22" y="16" fill="#f8fafc" font-family="sans-serif" font-weight="700" font-size="7.5">AI Code Insight · Zero allocations detected</text>
            <text x="22" y="28" fill="#c084fc" font-family="sans-serif" font-size="6.8">⚡ Stream tokens via TextStreamer for instant 0ms latency UI.</text>
          </g>
        </g>
      </svg>
    `;
  }

  // 8. AI Chat & Brainstorm & Writing (Dark Terminal / Dialogue Stream)
  if (tId === 'ai-chat' || tool.category === 'Chat & Writing' || tId.includes('chat') || tId.includes('brainstorm')) {
    return `
      <svg class="craft-banner-svg" viewBox="0 0 340 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="340" height="160" fill="#0b0e14"/>
        <rect width="340" height="22" fill="#141822"/>
        <circle cx="14" cy="11" r="3" fill="#ff5f56"/>
        <circle cx="24" cy="11" r="3" fill="#ffbd2e"/>
        <circle cx="34" cy="11" r="3" fill="#27c93f"/>
        <text x="50" y="14" fill="#8b949e" font-family="monospace" font-size="8.5">ChatCraft - SmolLM2-360M-Instruct [Local WebGPU / 125 tok/s]</text>

        <!-- Chat History Stream -->
        <g transform="translate(16, 30)">
          <!-- User Prompt Bubble (right-aligned) -->
          <rect x="80" y="0" width="228" height="26" rx="6" fill="#1e293b"/>
          <text x="92" y="16" fill="#f8fafc" font-family="sans-serif" font-size="7.5">How does on-device AI preserve user privacy and data security?</text>

          <!-- Assistant Response Bubble (left-aligned) with Avatar -->
          <g transform="translate(0, 34)">
            <circle cx="12" cy="14" r="10" fill="${accent}"/>
            <text x="12" y="18" text-anchor="middle" fill="#0f172a" font-family="sans-serif" font-weight="900" font-size="9">AI</text>
            
            <rect x="28" y="0" width="280" height="84" rx="6" fill="#131b2c" stroke="#1e293b" stroke-width="1"/>
            <text x="40" y="18" fill="#ffffff" font-family="sans-serif" font-weight="700" font-size="8">Zero data leaves your browser:</text>
            <text x="40" y="32" fill="#94a3b8" font-family="sans-serif" font-size="7.2">• Weights download directly to browser CacheStorage.</text>
            <text x="40" y="46" fill="#94a3b8" font-family="sans-serif" font-size="7.2">• Computations execute locally on your device CPU/GPU.</text>
            <text x="40" y="60" fill="#94a3b8" font-family="sans-serif" font-size="7.2">• No servers, telemetry logs, or accounts required.</text>
            
            <!-- Live token cursor -->
            <rect x="236" y="52" width="5" height="10" fill="${accent}">
              <animate attributeName="opacity" values="1;0;1" dur="0.8s" repeatCount="indefinite"/>
            </rect>

            <!-- Latency badge -->
            <rect x="40" y="68" width="134" height="10" rx="2" fill="#0c1322"/>
            <text x="44" y="76" fill="#38bdf8" font-family="monospace" font-size="6">Latency: 12ms · 128 tokens streamed</text>
          </g>
        </g>
      </svg>
    `;
  }

  // 9. Cloud Provider Accelerated Inference (Groq, Cerebras, DeepSeek, SambaNova, etc.)
  if (tool.provider) {
    const provName = tool.provider.toUpperCase();
    return `
      <svg class="craft-banner-svg" viewBox="0 0 340 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="340" height="160" fill="#080b11"/>
        <rect width="340" height="22" fill="#121824"/>
        <circle cx="14" cy="11" r="3" fill="#ff5f56"/>
        <circle cx="24" cy="11" r="3" fill="#ffbd2e"/>
        <circle cx="34" cy="11" r="3" fill="#27c93f"/>
        <text x="50" y="14" fill="#8b949e" font-family="monospace" font-size="8.5">${provName} Cloud Engine - Ultra-Fast Dedicated LPUs</text>

        <!-- Speedometer & Telemetry Dashboard -->
        <g transform="translate(18, 30)">
          <!-- Speed Gauge Card -->
          <rect width="140" height="116" rx="4" fill="#0f1420" stroke="#1a2334" stroke-width="1"/>
          <text x="14" y="22" fill="#8b949e" font-family="sans-serif" font-size="7" font-weight="700">TOKEN GENERATION SPEED</text>
          <!-- Big Speed Readout -->
          <text x="14" y="60" fill="${accent}" font-family="monospace" font-weight="900" font-size="28">1,250</text>
          <text x="14" y="74" fill="#ffffff" font-family="sans-serif" font-weight="600" font-size="8.5">TOKENS / SECOND</text>
          
          <!-- Speed Graph Bar -->
          <rect x="14" y="86" width="112" height="6" rx="3" fill="#1a2334"/>
          <rect x="14" y="86" width="102" height="6" rx="3" fill="${accent}"/>
          <text x="14" y="104" fill="#64748b" font-family="monospace" font-size="6.5">Time to First Token: 8.2ms</text>

          <!-- Right Telemetry Panel -->
          <g transform="translate(148, 0)">
            <rect width="156" height="116" rx="4" fill="#0f1420" stroke="#1a2334" stroke-width="1"/>
            <text x="14" y="22" fill="#8b949e" font-family="sans-serif" font-size="7" font-weight="700">INFERENCE TELEMETRY</text>
            
            <g font-family="monospace" font-size="6.5" fill="#94a3b8" transform="translate(14, 38)">
              <text y="0">Architecture:  <tspan fill="#ffffff">Dense LPU</tspan></text>
              <text y="14">Quantization:  <tspan fill="#ffffff">FP8 Native</tspan></text>
              <text y="28">Throughput:    <tspan fill="#34d399">100% Sustained</tspan></text>
              <text y="42">Quota State:   <tspan fill="#38bdf8">Free Tier Active</tspan></text>
              <text y="56">API Key:       <tspan fill="#fbbf24">••••••••BYOK</tspan></text>
            </g>
          </g>
        </g>
      </svg>
    `;
  }

  // 10. Default Rich Workspace (Research & NLP & Universal)
  return `
    <svg class="craft-banner-svg" viewBox="0 0 340 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="340" height="160" fill="#0b0e14"/>
      <rect width="340" height="22" fill="#141822"/>
      <circle cx="14" cy="11" r="3" fill="#ff5f56"/>
      <circle cx="24" cy="11" r="3" fill="#ffbd2e"/>
      <circle cx="34" cy="11" r="3" fill="#27c93f"/>
      <text x="50" y="14" fill="#8b949e" font-family="monospace" font-size="8.5">${esc(tool.name)} - Universal Studio [On-Device Model]</text>

      <!-- Split Research Workspace -->
      <g transform="translate(18, 30)">
        <!-- Input Document Pane -->
        <rect width="144" height="116" rx="3" fill="#101522" stroke="#1a2334" stroke-width="1"/>
        <text x="12" y="18" fill="#64748b" font-family="sans-serif" font-size="7" font-weight="700">SOURCE ANALYSIS</text>
        <line x1="12" y1="30" x2="132" y2="30" stroke="#334155" stroke-width="1.5"/>
        <line x1="12" y1="42" x2="118" y2="42" stroke="#334155" stroke-width="1.5"/>
        <line x1="12" y1="54" x2="128" y2="54" stroke="#334155" stroke-width="1.5"/>
        <line x1="12" y1="66" x2="90" y2="66" stroke="#334155" stroke-width="1.5"/>
        <rect x="12" y="80" width="80" height="18" rx="2" fill="#1e293b"/>
        <text x="18" y="92" fill="${accent}" font-family="monospace" font-size="6.5">100% On-Device</text>

        <!-- Processed Output Pane -->
        <g transform="translate(152, 0)">
          <rect width="152" height="116" rx="3" fill="#131b2a" stroke="#1e293b" stroke-width="1"/>
          <text x="12" y="18" fill="#38bdf8" font-family="sans-serif" font-size="7" font-weight="700">INTELLIGENT SYNTHESIS</text>
          
          <rect x="12" y="28" width="128" height="22" rx="2" fill="#1e293b"/>
          <text x="18" y="42" fill="#ffffff" font-family="sans-serif" font-size="7.2">Key Insight Generated</text>

          <rect x="12" y="56" width="128" height="22" rx="2" fill="#1e293b"/>
          <text x="18" y="70" fill="#ffffff" font-family="sans-serif" font-size="7.2">Validated &amp; Formatted</text>

          <rect x="12" y="86" width="128" height="16" rx="2" fill="${accent}" opacity="0.15"/>
          <text x="18" y="97" fill="${accent}" font-family="monospace" font-size="6.5">Ready for Export</text>
        </g>
      </g>
    </svg>
  `;
}

// -------------------------------------------------------------
// PILL TAGS GENERATOR
// -------------------------------------------------------------

export function craftPillTags(tool) {
  let row1 = '';
  let row2 = '';

  if (tool.provider) {
    const provName = tool.provider.toUpperCase();
    row1 = `
      <span class="craft-pill-tag craft-pill-status">FREE API</span>
      <span class="craft-pill-tag craft-pill-status">BYO KEY</span>
      <span class="craft-pill-tag craft-pill-status">${esc(provName)}</span>
    `;
    row2 = `
      <span class="craft-pill-tag craft-pill-format">CLOUD</span>
      <span class="craft-pill-tag craft-pill-format">MACOS</span>
      <span class="craft-pill-tag craft-pill-format">WINDOWS</span>
      <span class="craft-pill-tag craft-pill-format">LINUX</span>
      <span class="craft-pill-tag craft-pill-format">WEB</span>
    `;
  } else if (['canvas', 'client'].includes(tool.model)) {
    row1 = `
      <span class="craft-pill-tag craft-pill-status">CANVAS &amp; UTILITY</span>
      <span class="craft-pill-tag craft-pill-status">100% FREE</span>
      <span class="craft-pill-tag craft-pill-status">NO ACCOUNT</span>
    `;
    row2 = `
      <span class="craft-pill-tag craft-pill-format">MACOS</span>
      <span class="craft-pill-tag craft-pill-format">WINDOWS</span>
      <span class="craft-pill-tag craft-pill-format">LINUX</span>
      <span class="craft-pill-tag craft-pill-format">WEB</span>
    `;
  } else {
    row1 = `
      <span class="craft-pill-tag craft-pill-status">ON-DEVICE AI</span>
      <span class="craft-pill-tag craft-pill-status">100% FREE</span>
      <span class="craft-pill-tag craft-pill-status">PRIVATE</span>
    `;
    row2 = `
      <span class="craft-pill-tag craft-pill-format">WASM</span>
      <span class="craft-pill-tag craft-pill-format">MACOS</span>
      <span class="craft-pill-tag craft-pill-format">WINDOWS</span>
      <span class="craft-pill-tag craft-pill-format">LINUX</span>
      <span class="craft-pill-tag craft-pill-format">WEB</span>
    `;
  }

  return `
    <div class="craft-tag-row">${row1}</div>
    <div class="craft-tag-row craft-tag-subrow">${row2}</div>
  `;
}

// -------------------------------------------------------------
// COMPLETE CRAFT CARD HTML BUILDER
// -------------------------------------------------------------

export function craftCardHTML(tool, featured = false, index = 0, isSaved = false) {
  const theme = craftTheme(tool, index);
  const numBadge = String(index + 1).padStart(2, '0');
  const banner = craftBanner(tool, index, theme);
  const mascot = craftMascot(tool, index, theme);
  const titleSplit = craftTitleSplit(tool.name, theme.accent);
  const pillTags = craftPillTags(tool);

  return `
    <article class="craft-card tool-card identity-card${tool.provider ? ' cloud-card' : ''}${featured ? ' featured-card' : ''}" 
             data-card="${esc(tool.id)}" 
             style="--craft-accent:${theme.accent};--craft-badge-bg:${theme.badgeBg};--craft-badge-ink:${theme.badgeText};--craft-line:${theme.line};--craft-dark:${theme.darkBg};">
      
      <!-- Top header bar: Number badge + Monospace Category -->
      <div class="craft-card-header">
        <span class="craft-num-badge">${esc(numBadge)}</span>
        <span class="craft-category-label">${esc(theme.label)}</span>
      </div>

      <!-- Banner image: Dark software UI viewport mockup showing work in action -->
      <button type="button" class="craft-banner-viewport" data-open="${esc(tool.id)}" aria-label="Open ${esc(tool.name)}">
        ${banner}
      </button>

      <!-- Overlapping rounded-square app icon -->
      <div class="craft-icon-anchor">
        <button type="button" class="craft-app-icon" data-open="${esc(tool.id)}" aria-label="Open ${esc(tool.name)}">
          ${mascot}
        </button>
        <button class="craft-save-btn save-button${isSaved ? ' is-saved' : ''}" 
                data-save="${esc(tool.id)}" 
                aria-pressed="${isSaved}" 
                aria-label="${isSaved ? 'Unsave' : 'Save'} ${esc(tool.name)}">
          <svg class="craft-bookmark-icon" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>

      <!-- Card body content -->
      <div class="craft-card-body">
        <h3 class="craft-title">
          <a href="/?tool=${esc(tool.id)}" data-open="${esc(tool.id)}">
            ${titleSplit}
          </a>
        </h3>

        <p class="craft-description">${esc(tool.description)}</p>

        <!-- Monospace pill tags -->
        <div class="craft-tags-wrapper">
          ${pillTags}
        </div>

        <!-- Explore action link -->
        <div class="craft-card-footer">
          <a class="craft-explore-link" href="/?tool=${esc(tool.id)}" data-open="${esc(tool.id)}">
            <span class="craft-explore-text">EXPLORE ${esc(tool.name.toUpperCase())}</span>
            <span class="craft-explore-arrow">↗</span>
          </a>
        </div>
      </div>
    </article>
  `;
}
