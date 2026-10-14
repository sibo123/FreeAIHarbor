// Client-side instant engines for Free AI Harbor tools: Photo Editor, Logo Designer, and Prompt Generator.
// 100% free, runs entirely on-device with zero API keys or external server dependencies.

// ----------------------------------------------------
// AI PHOTO STUDIO ENGINE (Natural Language Client Instruction Parser & Darkroom Filters)
// ----------------------------------------------------

export function processClientPhoto(sourceCanvas, {
  instruction = '',
  preset = '',
  adjustments = {}
} = {}) {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(sourceCanvas, 0, 0);

  const rawText = `${instruction} ${preset}`.toLowerCase();
  const appliedNotes = [];

  // Parse instruction for color temperature & lighting
  let warmth = 0;       // -50 (cool) to +50 (warm)
  let contrast = 0;     // -50 to +50
  let saturation = 0;   // -100 to +100
  let brightness = 0;   // -50 to +50
  let isBW = false;
  let isCinematic = false;
  let isCyberpunk = false;
  let isVintage = false;
  let isSoftPortrait = false;
  let isSharp = false;
  let isVignette = false;
  let isGoldenHour = false;
  let isNordic = false;
  let isShadowLift = false;
  let summary = 'AI Photo Enhancement';

  // Keyword Matching in Client Instructions
  if (rawText.includes('golden') || rawText.includes('sunset') || rawText.includes('warm') || rawText.includes('amber') || rawText.includes('sun')) {
    warmth += 35;
    contrast += 16;
    saturation += 15;
    isGoldenHour = true;
    appliedNotes.push('Golden Hour Sunset Warmth (+35K warmth)');
    summary = 'Golden Hour Sunset Warmth';
  }
  if (rawText.includes('cinematic') || rawText.includes('teal') || rawText.includes('orange') || rawText.includes('hollywood') || rawText.includes('movie')) {
    isCinematic = true;
    contrast += 22;
    appliedNotes.push('Cinematic Teal & Orange Split Toning');
    summary = 'Cinematic Teal & Orange';
  }
  if (rawText.includes('b&w') || rawText.includes('black and white') || rawText.includes('monochrome') || rawText.includes('grayscale') || rawText.includes('noir')) {
    isBW = true;
    contrast += 25;
    appliedNotes.push('Dramatic Noir Monochrome (High Contrast B&W)');
    summary = 'Dramatic Noir B&W';
  }
  if (rawText.includes('cyberpunk') || rawText.includes('neon') || rawText.includes('synthwave') || rawText.includes('violet') || rawText.includes('magenta')) {
    isCyberpunk = true;
    contrast += 28;
    saturation += 30;
    appliedNotes.push('Cyberpunk Neon Electric Lighting (Violet & Cyan)');
    summary = 'Cyberpunk Neon';
  }
  if (rawText.includes('vintage') || rawText.includes('film') || rawText.includes('retro') || rawText.includes('35mm') || rawText.includes('sepia') || rawText.includes('analog') || rawText.includes('kodak')) {
    isVintage = true;
    warmth += 20;
    appliedNotes.push('Vintage 35mm Analog Film Grain & Matte Shadows');
    summary = 'Vintage 35mm Film';
  }
  if (rawText.includes('portrait') || rawText.includes('soft') || rawText.includes('glow') || rawText.includes('skin') || rawText.includes('dreamy') || rawText.includes('pastel')) {
    isSoftPortrait = true;
    warmth += 10;
    appliedNotes.push('Soft Portrait Glow & Skin Tone Flattery');
    summary = 'Soft Portrait Glow';
  }
  if (rawText.includes('vibrant') || rawText.includes('pop') || rawText.includes('vivid') || rawText.includes('saturat') || rawText.includes('color')) {
    saturation += 40;
    contrast += 14;
    appliedNotes.push('Vibrant Color Pop (+40% saturation boost)');
    if (summary === 'AI Photo Enhancement') summary = 'Vibrant Color Pop';
  }
  if (rawText.includes('bright') || rawText.includes('lift') || rawText.includes('shadow') || rawText.includes('lighten') || rawText.includes('exposure')) {
    brightness += 22;
    isShadowLift = true;
    appliedNotes.push('Shadow Recovery & Exposure Boost (+22%)');
    if (summary === 'AI Photo Enhancement') summary = 'Brighten & Lift Shadows';
  }
  if (rawText.includes('dark') || rawText.includes('moody') || rawText.includes('dim') || rawText.includes('night') || rawText.includes('dusk')) {
    brightness -= 18;
    contrast += 20;
    appliedNotes.push('Moody Low-Key Lighting & Deep Contrast');
    if (summary === 'AI Photo Enhancement') summary = 'Moody Low-Key';
  }
  if (rawText.includes('sharp') || rawText.includes('detail') || rawText.includes('crisp') || rawText.includes('clarity') || rawText.includes('focus')) {
    isSharp = true;
    appliedNotes.push('Crystal Sharpness & Edge Clarity');
    if (summary === 'AI Photo Enhancement') summary = 'Crystal Sharp & Clarity';
  }
  if (rawText.includes('nordic') || rawText.includes('cool') || rawText.includes('blue') || rawText.includes('frost') || rawText.includes('winter') || rawText.includes('cold')) {
    isNordic = true;
    warmth -= 28;
    appliedNotes.push('Cool Nordic Atmosphere (Cool Cyan/Blue Cast)');
    summary = 'Cool Nordic Atmosphere';
  }
  if (rawText.includes('vignette') || rawText.includes('focus center')) {
    isVignette = true;
    appliedNotes.push('Subtle Cinematic Radial Vignette');
  }

  // Combine manual sliders if passed
  if (adjustments.brightness) brightness += Number(adjustments.brightness);
  if (adjustments.contrast) contrast += Number(adjustments.contrast);
  if (adjustments.saturation) saturation += Number(adjustments.saturation);
  if (adjustments.temperature) warmth += Number(adjustments.temperature);
  if (adjustments.vignette && Number(adjustments.vignette) > 0) isVignette = true;
  if (adjustments.sharpness && Number(adjustments.sharpness) > 0) isSharp = true;

  // Default fallback if no instruction given
  if (appliedNotes.length === 0) {
    contrast += 16;
    saturation += 15;
    brightness += 8;
    isSharp = true;
    appliedNotes.push('Auto Dynamic Range Optimization', 'Enhanced Vibrance & Contrast', 'Edge Sharpening');
    summary = 'Natural Auto Enhancement';
  }

  // 1. Pixel Level Color & Tone Grading
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const len = data.length;

  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  const satFactor = (100 + saturation) / 100;

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Standard perceptual luminance
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Apply brightness
    if (brightness !== 0) {
      if (isShadowLift && lum < 140) {
        // Targeted shadow lift without blowing highlights
        const shadowWeight = (140 - lum) / 140;
        r += brightness * 1.5 * shadowWeight;
        g += brightness * 1.5 * shadowWeight;
        b += brightness * 1.5 * shadowWeight;
      } else {
        r += brightness * 1.2;
        g += brightness * 1.2;
        b += brightness * 1.2;
      }
    }

    // Apply Contrast
    if (contrast !== 0) {
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;
    }

    // Apply B&W
    if (isBW) {
      let bw = lum;
      // High contrast S-curve for deep blacks
      bw = contrastFactor * (bw - 128) + 128;
      r = bw; g = bw; b = bw;
    }

    // Apply Cinematic Teal & Orange
    if (isCinematic && !isBW) {
      const shadowWeight = Math.max(0, 1 - lum / 150);
      const highlightWeight = Math.max(0, (lum - 100) / 155);

      // Deep shadows -> Teal
      r -= 20 * shadowWeight;
      g += 8 * shadowWeight;
      b += 24 * shadowWeight;

      // Highlights -> Amber / Warm Bronze
      r += 28 * highlightWeight;
      g += 12 * highlightWeight;
      b -= 18 * highlightWeight;
    }

    // Apply Cyberpunk Neon
    if (isCyberpunk && !isBW) {
      if (lum < 115) {
        // Shadows to intense neon purple/violet
        r += 24;
        b += 38;
      } else {
        // Mids & Highlights to fluorescent cyan
        g += 18;
        b += 30;
      }
    }

    // Apply Vintage Film
    if (isVintage && !isBW) {
      r += 18;
      g += 6;
      b -= 16;
      // Matte shadows: raise black floor
      if (r < 28) r = 28 + r * 0.2;
      if (g < 28) g = 28 + g * 0.2;
      if (b < 28) b = 28 + b * 0.2;
    }

    // Apply Nordic Cool
    if (isNordic && !isBW) {
      b += 20;
      g += 6;
      r -= 14;
    }

    // Apply Warmth / Temperature
    if (warmth !== 0 && !isBW) {
      if (warmth > 0) {
        r += warmth * 0.75;
        g += warmth * 0.3;
        b -= warmth * 0.45;
      } else {
        const cool = Math.abs(warmth);
        b += cool * 0.7;
        g += cool * 0.2;
        r -= cool * 0.5;
      }
    }

    // Apply Saturation / Vibrance
    if (saturation !== 0 && !isBW) {
      const currentLum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      r = currentLum + (r - currentLum) * satFactor;
      g = currentLum + (g - currentLum) * satFactor;
      b = currentLum + (b - currentLum) * satFactor;
    }

    // Soft Portrait glow highlight compression
    if (isSoftPortrait && !isBW) {
      if (lum > 170) {
        const rollOff = (lum - 170) * 0.25;
        r -= rollOff;
        g -= rollOff;
        b -= rollOff;
      }
      r += 8;
      g += 4;
    }

    // Analog film noise simulation
    if (isVintage) {
      const noise = (Math.random() - 0.5) * 12;
      r += noise;
      g += noise;
      b += noise;
    }

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  ctx.putImageData(imgData, 0, 0);

  // 2. Convolution Sharpening Filter (Real 3x3 unsharp masking kernel)
  if (isSharp) {
    const sharpCanvas = document.createElement('canvas');
    sharpCanvas.width = width;
    sharpCanvas.height = height;
    const sCtx = sharpCanvas.getContext('2d');
    const srcData = ctx.getImageData(0, 0, width, height);
    const dstData = sCtx.createImageData(width, height);
    const s = srcData.data;
    const d = dstData.data;

    // Kernel:
    // [  0, -0.6,  0 ]
    // [ -0.6, 3.4, -0.6 ]
    // [  0, -0.6,  0 ]
    const w = width, h = height;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4;
        const up = ((y - 1) * w + x) * 4;
        const down = ((y + 1) * w + x) * 4;
        const left = (y * w + (x - 1)) * 4;
        const right = (y * w + (x + 1)) * 4;

        for (let c = 0; c < 3; c++) {
          const val = 3.4 * s[idx + c] - 0.6 * (s[up + c] + s[down + c] + s[left + c] + s[right + c]);
          d[idx + c] = Math.max(0, Math.min(255, val));
        }
        d[idx + 3] = s[idx + 3]; // Preserve alpha
      }
    }
    sCtx.putImageData(dstData, 0, 0);
    ctx.drawImage(sharpCanvas, 0, 0);
  }

  // 3. Volumetric Warm Sunburst / Radial Lighting Overlay
  if (isGoldenHour) {
    const sunGrad = ctx.createRadialGradient(
      width * 0.9, height * 0.1, 10,
      width * 0.45, height * 0.45, Math.hypot(width, height) * 0.9
    );
    sunGrad.addColorStop(0, 'rgba(255, 195, 60, 0.32)');
    sunGrad.addColorStop(0.35, 'rgba(255, 145, 30, 0.16)');
    sunGrad.addColorStop(0.7, 'rgba(255, 100, 20, 0.05)');
    sunGrad.addColorStop(1, 'rgba(255, 90, 0, 0)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, width, height);
  }

  // 4. Subtle Radial Vignette
  if (isVignette || isVintage || isCinematic) {
    const rx = width / 2;
    const ry = height / 2;
    const maxR = Math.hypot(rx, ry);
    const vignetteGrad = ctx.createRadialGradient(rx, ry, maxR * 0.42, rx, ry, maxR * 0.98);
    vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGrad.addColorStop(0.75, 'rgba(0, 0, 0, 0.18)');
    vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, width, height);
  }

  return {
    canvas,
    appliedNotes,
    summary
  };
}

// Backward-compatible alias
export function applyPhotoEnhancement(sourceCanvas, options = {}) {
  const result = processClientPhoto(sourceCanvas, {
    preset: options.preset || 'Auto Enhance',
    instruction: `${options.lighting || ''} ${options.effect || ''}`,
    adjustments: {
      intensity: options.intensity
    }
  });
  return result.canvas;
}

// ----------------------------------------------------
// AI LOGO DESIGNER ENGINE (Crisp, High-Resolution Vector Studio)
// ----------------------------------------------------

export function generateLogos({
  brand = 'Apex',
  tagline = '',
  industry = 'Technology & AI',
  style = 'Modern Geometric Mark',
  palette = 'Emerald & Electric Mint'
} = {}) {
  const brandName = (brand || 'Brand').trim();
  const safeBrand = brandName.toUpperCase();
  const safeTagline = (tagline || '').trim().toUpperCase();
  const initials = safeBrand.split(/\s+/).map(w => w[0]).join('').slice(0, 2) || safeBrand.slice(0, 2);

  // Curated premium design agency palettes
  const palettes = {
    'Emerald & Electric Mint': {
      primary: '#10b981', secondary: '#059669', accent: '#34d399', dark: '#041d17', light: '#ffffff', glow: '#6ee7b7'
    },
    'Cyber Neon Cyan & Violet': {
      primary: '#06b6d4', secondary: '#3b82f6', accent: '#8b5cf6', dark: '#090d19', light: '#ffffff', glow: '#38bdf8'
    },
    'Royal Blue & Champagne Gold': {
      primary: '#1d4ed8', secondary: '#2563eb', accent: '#f59e0b', dark: '#0a1024', light: '#ffffff', glow: '#fbbf24'
    },
    'Warm Sunset Amber & Coral': {
      primary: '#f97316', secondary: '#ea580c', accent: '#ec4899', dark: '#1b0d24', light: '#ffffff', glow: '#fdba74'
    },
    'Charcoal, Platinum & Slate': {
      primary: '#475569', secondary: '#1e293b', accent: '#0ea5e9', dark: '#070b12', light: '#ffffff', glow: '#94a3b8'
    },
    'Nordic Forest Sage & Cream': {
      primary: '#2d6a4f', secondary: '#1b4332', accent: '#52b788', dark: '#071810', light: '#ffffff', glow: '#95d5b2'
    }
  };

  const c = palettes[palette] || palettes['Emerald & Electric Mint'];

  // Industry graphic motifs
  const isTech = industry.includes('Tech') || industry.includes('AI') || industry.includes('Cyber');
  const isCoffee = industry.includes('Coffee') || industry.includes('Food') || industry.includes('Cafe');
  const isFitness = industry.includes('Fitness') || industry.includes('Sports') || industry.includes('Athletics');
  const isCreative = industry.includes('Design') || industry.includes('Creative') || industry.includes('Studio');
  const isEco = industry.includes('Eco') || industry.includes('Nature') || industry.includes('Green');
  const isLuxury = industry.includes('Fashion') || industry.includes('Luxury') || industry.includes('Jewelry');
  const isRealEstate = industry.includes('Real Estate') || industry.includes('Architecture') || industry.includes('Build');
  const isGaming = industry.includes('Gaming') || industry.includes('Esports') || industry.includes('Entertainment');

  // ==========================================
  // CONCEPT 1: Modern Geometric Tech Mark
  // ==========================================
  function getEmblemPath1() {
    if (isTech) {
      return `
        <!-- Isometric High-Tech Hexagon Cube -->
        <polygon points="0,-75 65,-38 65,38 0,75 -65,38 -65,-38" fill="none" stroke="url(#c1_grad)" stroke-width="8" stroke-linejoin="round"/>
        <line x1="0" y1="0" x2="0" y2="75" stroke="url(#c1_grad)" stroke-width="8"/>
        <line x1="0" y1="0" x2="65" y2="-38" stroke="url(#c1_grad)" stroke-width="8"/>
        <line x1="0" y1="0" x2="-65" y2="-38" stroke="url(#c1_grad)" stroke-width="8"/>
        <circle cx="0" cy="0" r="16" fill="${c.accent}"/>
        <circle cx="0" cy="-75" r="7" fill="${c.glow}"/>
        <circle cx="65" cy="38" r="7" fill="${c.glow}"/>
        <circle cx="-65" cy="38" r="7" fill="${c.glow}"/>
      `;
    }
    if (isCoffee) {
      return `
        <!-- Minimalist Coffee Cup & Aroma Steam -->
        <path d="M-40,-15 h80 a35,35 0 0 1 35,35 v10 a35,35 0 0 1 -35,35 h-80 a10,10 0 0 1 -10,-10 v-60 a10,10 0 0 1 10,-10 z" fill="none" stroke="url(#c1_grad)" stroke-width="9"/>
        <path d="M40,5 h22 a20,20 0 0 1 20,20 v5 a20,20 0 0 1 -20,20 h-22" fill="none" stroke="${c.accent}" stroke-width="8"/>
        <path d="M-20,-35 q15,-20 0,-40" stroke="${c.glow}" stroke-width="6" stroke-linecap="round" fill="none"/>
        <path d="M10,-30 q15,-25 0,-48" stroke="${c.accent}" stroke-width="6" stroke-linecap="round" fill="none"/>
        <line x1="-55" y1="75" x2="55" y2="75" stroke="${c.accent}" stroke-width="7" stroke-linecap="round"/>
      `;
    }
    if (isFitness) {
      return `
        <!-- Kinetic Power Lightning Prism -->
        <polygon points="10,-80 -45,5 -5,5 -20,80 48,-5 8,-5" fill="url(#c1_grad)"/>
        <circle cx="0" cy="0" r="72" fill="none" stroke="${c.accent}" stroke-width="6" stroke-dasharray="28 14"/>
        <circle cx="0" cy="0" r="82" fill="none" stroke="${c.glow}" stroke-width="2.5" opacity="0.6"/>
      `;
    }
    if (isEco) {
      return `
        <!-- Sacred Geometry Leaf Crest -->
        <path d="M0,75 C0,10 45,-40 70,-55 C70,-5 40,45 0,75 Z" fill="url(#c1_grad)"/>
        <path d="M0,75 C0,15 -38,-35 -58,-50 C-58,-5 -30,45 0,75 Z" fill="${c.accent}" opacity="0.85"/>
        <line x1="0" y1="75" x2="0" y2="-40" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round"/>
      `;
    }
    if (isLuxury) {
      return `
        <!-- Precision Faceted Brilliant Diamond -->
        <polygon points="0,-75 68,-10 0,75 -68,-10" fill="none" stroke="url(#c1_grad)" stroke-width="8"/>
        <polygon points="0,-48 44,-10 0,48 -44,-10" fill="${c.accent}" opacity="0.25"/>
        <line x1="-68" y1="-10" x2="68" y2="-10" stroke="${c.accent}" stroke-width="5"/>
        <circle cx="0" cy="-10" r="10" fill="${c.glow}"/>
      `;
    }
    if (isRealEstate) {
      return `
        <!-- Modern Architecture Spire & Horizon -->
        <polygon points="-55,65 -55,0 0,-70 55,0 55,65 15,65 15,-10 -15,-10 -15,65" fill="none" stroke="url(#c1_grad)" stroke-width="8" stroke-linejoin="round"/>
        <polygon points="-30,65 -30,25 0,-10 30,25 30,65" fill="${c.accent}" opacity="0.3"/>
        <circle cx="0" cy="-35" r="9" fill="${c.glow}"/>
      `;
    }
    // Universal Geometric Nexus Diamond
    return `
      <polygon points="0,-75 70,0 0,75 -70,0" fill="none" stroke="url(#c1_grad)" stroke-width="9" stroke-linejoin="round"/>
      <circle cx="0" cy="0" r="32" fill="none" stroke="${c.accent}" stroke-width="6"/>
      <line x1="-70" y1="0" x2="70" y2="0" stroke="${c.glow}" stroke-width="4"/>
      <line x1="0" y1="-75" x2="0" y2="75" stroke="${c.glow}" stroke-width="4"/>
      <circle cx="0" cy="0" r="12" fill="url(#c1_grad)"/>
    `;
  }

  function buildConcept1(surface = 'dark', layout = 'stacked') {
    const isDark = surface === 'dark';
    const isTrans = surface === 'transparent';
    const bg = isTrans ? 'none' : isDark ? c.dark : c.light;
    const textCol = isDark || isTrans ? '#ffffff' : '#0f172a';
    const tagCol = isDark || isTrans ? c.glow : c.secondary;
    const emblem = getEmblemPath1();

    if (layout === 'horizontal') {
      return `
<svg viewBox="0 0 900 300" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <defs>
    <linearGradient id="c1_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.primary}"/>
      <stop offset="100%" stop-color="${c.accent}"/>
    </linearGradient>
  </defs>
  ${!isTrans ? `<rect width="900" height="300" rx="20" fill="${bg}"/>` : ''}
  <g transform="translate(160, 150) scale(1.15)">
    ${emblem}
  </g>
  <g transform="translate(320, 145)">
    <text x="0" y="20" font-family="-apple-system,BlinkMacSystemFont,'Montserrat','Inter','Segoe UI',sans-serif" font-size="58" font-weight="900" letter-spacing="3" fill="${textCol}">${escapeXml(safeBrand)}</text>
    ${safeTagline ? `<text x="4" y="65" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" font-size="18" font-weight="700" letter-spacing="6" fill="${tagCol}">${escapeXml(safeTagline)}</text>` : ''}
  </g>
</svg>`;
    }

    // Stacked (Centered)
    return `
<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <defs>
    <linearGradient id="c1_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.primary}"/>
      <stop offset="100%" stop-color="${c.accent}"/>
    </linearGradient>
  </defs>
  ${!isTrans ? `<rect width="800" height="600" rx="24" fill="${bg}"/>` : ''}
  <g transform="translate(400, 230) scale(1.45)">
    ${emblem}
  </g>
  <g transform="translate(400, 440)">
    <text x="0" y="0" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'Montserrat','Inter','Segoe UI',sans-serif" font-size="64" font-weight="900" letter-spacing="4" fill="${textCol}">${escapeXml(safeBrand)}</text>
    ${safeTagline ? `<text x="0" y="48" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" font-size="20" font-weight="700" letter-spacing="8" fill="${tagCol}">${escapeXml(safeTagline)}</text>` : ''}
  </g>
</svg>`;
  }

  // ==========================================
  // CONCEPT 2: Luxury Monogram Crest Emblem
  // ==========================================
  function buildConcept2(surface = 'dark', layout = 'stacked') {
    const isDark = surface === 'dark';
    const isTrans = surface === 'transparent';
    const bg = isTrans ? 'none' : isDark ? '#080d19' : '#ffffff';
    const textCol = isDark || isTrans ? '#ffffff' : '#0f172a';
    const tagCol = isDark || isTrans ? '#94a3b8' : '#475569';
    const borderCol = isDark ? '#1e293b' : '#e2e8f0';

    const emblem = `
      <rect x="-85" y="-85" width="170" height="170" rx="42" fill="url(#c2_grad)" filter="drop-shadow(0 12px 24px rgba(0,0,0,0.35))"/>
      <rect x="-73" y="-73" width="146" height="146" rx="34" fill="none" stroke="${isDark ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.45)'}" stroke-width="4"/>
      <circle cx="0" cy="0" r="54" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
      <text x="0" y="24" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'Playfair Display',Georgia,serif" font-size="76" font-weight="900" fill="#ffffff" letter-spacing="-2">${escapeXml(initials)}</text>
    `;

    if (layout === 'horizontal') {
      return `
<svg viewBox="0 0 900 300" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <defs>
    <linearGradient id="c2_grad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${c.secondary}"/>
      <stop offset="100%" stop-color="${c.primary}"/>
    </linearGradient>
  </defs>
  ${!isTrans ? `<rect width="900" height="300" rx="20" fill="${bg}" stroke="${borderCol}" stroke-width="1.5"/>` : ''}
  <g transform="translate(170, 150) scale(0.95)">
    ${emblem}
  </g>
  <g transform="translate(320, 145)">
    <text x="0" y="18" font-family="-apple-system,BlinkMacSystemFont,'Cinzel','Times New Roman',Georgia,serif" font-size="56" font-weight="800" letter-spacing="3" fill="${textCol}">${escapeXml(safeBrand)}</text>
    ${safeTagline ? `<text x="2" y="60" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" font-size="16" font-weight="700" letter-spacing="6" fill="${tagCol}">${escapeXml(safeTagline)}</text>` : ''}
  </g>
</svg>`;
    }

    // Stacked
    return `
<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <defs>
    <linearGradient id="c2_grad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${c.secondary}"/>
      <stop offset="100%" stop-color="${c.primary}"/>
    </linearGradient>
  </defs>
  ${!isTrans ? `<rect width="800" height="600" rx="24" fill="${bg}" stroke="${borderCol}" stroke-width="1.5"/>` : ''}
  <g transform="translate(400, 220) scale(1.25)">
    ${emblem}
  </g>
  <g transform="translate(400, 440)">
    <text x="0" y="0" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'Cinzel','Times New Roman',Georgia,serif" font-size="62" font-weight="800" letter-spacing="4" fill="${textCol}">${escapeXml(safeBrand)}</text>
    ${safeTagline ? `<text x="0" y="46" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" font-size="18" font-weight="700" letter-spacing="7" fill="${tagCol}">${escapeXml(safeTagline)}</text>` : ''}
  </g>
</svg>`;
  }

  // ==========================================
  // CONCEPT 3: Dynamic Abstract Flow Mark
  // ==========================================
  function buildConcept3(surface = 'dark', layout = 'stacked') {
    const isDark = surface === 'dark';
    const isTrans = surface === 'transparent';
    const bg = isTrans ? 'none' : isDark ? '#070b16' : '#ffffff';
    const textCol = isDark || isTrans ? '#ffffff' : '#0f172a';
    const tagCol = isDark || isTrans ? c.accent : c.primary;

    const emblem = `
      <!-- Interlocking Möbius Infinity Wave -->
      <path d="M-75,25 C-75,-45 -25,-45 0,-5 C25,35 75,35 75,-35" fill="none" stroke="url(#c3_flow1)" stroke-width="16" stroke-linecap="round"/>
      <path d="M-75,-25 C-75,45 -25,45 0,5 C25,-35 75,-35 75,35" fill="none" stroke="url(#c3_flow2)" stroke-width="16" stroke-linecap="round" opacity="0.88"/>
      <circle cx="0" cy="0" r="14" fill="${c.glow}"/>
      <circle cx="-75" cy="25" r="9" fill="${c.accent}"/>
      <circle cx="75" cy="-35" r="9" fill="${c.primary}"/>
    `;

    if (layout === 'horizontal') {
      return `
<svg viewBox="0 0 900 300" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <defs>
    <linearGradient id="c3_flow1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.primary}"/>
      <stop offset="100%" stop-color="${c.accent}"/>
    </linearGradient>
    <linearGradient id="c3_flow2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${c.accent}"/>
      <stop offset="100%" stop-color="${c.glow}"/>
    </linearGradient>
  </defs>
  ${!isTrans ? `<rect width="900" height="300" rx="20" fill="${bg}"/>` : ''}
  <g transform="translate(170, 150) scale(1.1)">
    ${emblem}
  </g>
  <g transform="translate(330, 145)">
    <text x="0" y="20" font-family="-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif" font-size="58" font-weight="900" letter-spacing="3" fill="${textCol}">${escapeXml(safeBrand)}</text>
    ${safeTagline ? `<text x="2" y="62" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="18" font-weight="700" letter-spacing="6" fill="${tagCol}">${escapeXml(safeTagline)}</text>` : ''}
  </g>
</svg>`;
    }

    // Stacked
    return `
<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <defs>
    <linearGradient id="c3_flow1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.primary}"/>
      <stop offset="100%" stop-color="${c.accent}"/>
    </linearGradient>
    <linearGradient id="c3_flow2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${c.accent}"/>
      <stop offset="100%" stop-color="${c.glow}"/>
    </linearGradient>
  </defs>
  ${!isTrans ? `<rect width="800" height="600" rx="24" fill="${bg}"/>` : ''}
  <g transform="translate(400, 220) scale(1.4)">
    ${emblem}
  </g>
  <g transform="translate(400, 440)">
    <text x="0" y="0" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif" font-size="64" font-weight="900" letter-spacing="4" fill="${textCol}">${escapeXml(safeBrand)}</text>
    ${safeTagline ? `<text x="0" y="48" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="19" font-weight="700" letter-spacing="8" fill="${tagCol}">${escapeXml(safeTagline)}</text>` : ''}
  </g>
</svg>`;
  }

  // ==========================================
  // CONCEPT 4: Authority Badge & Shield Crest
  // ==========================================
  function buildConcept4(surface = 'dark', layout = 'stacked') {
    const isDark = surface === 'dark';
    const isTrans = surface === 'transparent';
    const bg = isTrans ? 'none' : isDark ? c.dark : '#ffffff';
    const textCol = isDark || isTrans ? '#ffffff' : '#0f172a';
    const bannerBg = isDark ? c.primary : c.secondary;

    const emblem = `
      <!-- Regal Crest Shield -->
      <path d="M0,-85 L72,-55 V15 C72,60 0,90 0,90 C0,90 -72,60 -72,15 V-55 Z" fill="none" stroke="url(#c4_crest)" stroke-width="8" stroke-linejoin="round"/>
      <path d="M0,-68 L54,-45 V12 C54,48 0,72 0,72 C0,72 -54,48 -54,12 V-45 Z" fill="${c.accent}" opacity="0.2"/>
      <line x1="0" y1="-85" x2="0" y2="90" stroke="url(#c4_crest)" stroke-width="4" stroke-dasharray="8 6"/>
      <!-- Monogram Initial inside crest -->
      <text x="0" y="24" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Georgia,serif" font-size="60" font-weight="900" fill="${c.glow}">${escapeXml(initials[0] || 'A')}</text>
      <!-- Shield stars -->
      <circle cx="-30" cy="-35" r="4.5" fill="${c.glow}"/>
      <circle cx="30" cy="-35" r="4.5" fill="${c.glow}"/>
    `;

    if (layout === 'horizontal') {
      return `
<svg viewBox="0 0 900 300" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <defs>
    <linearGradient id="c4_crest" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.primary}"/>
      <stop offset="50%" stop-color="${c.secondary}"/>
      <stop offset="100%" stop-color="${c.accent}"/>
    </linearGradient>
  </defs>
  ${!isTrans ? `<rect width="900" height="300" rx="20" fill="${bg}"/>` : ''}
  <g transform="translate(170, 150) scale(1.05)">
    ${emblem}
  </g>
  <g transform="translate(325, 145)">
    <text x="0" y="18" font-family="-apple-system,BlinkMacSystemFont,Georgia,serif" font-size="56" font-weight="900" letter-spacing="2" fill="${textCol}">${escapeXml(safeBrand)}</text>
    <rect x="0" y="32" width="220" height="3.5" rx="1.5" fill="${c.accent}"/>
    <text x="2" y="64" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="16" font-weight="800" letter-spacing="6" fill="${c.glow}">${escapeXml(safeTagline || industry.toUpperCase())}</text>
  </g>
</svg>`;
    }

    // Stacked
    return `
<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <defs>
    <linearGradient id="c4_crest" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.primary}"/>
      <stop offset="50%" stop-color="${c.secondary}"/>
      <stop offset="100%" stop-color="${c.accent}"/>
    </linearGradient>
  </defs>
  ${!isTrans ? `<rect width="800" height="600" rx="24" fill="${bg}"/>` : ''}
  <g transform="translate(400, 220) scale(1.35)">
    ${emblem}
  </g>
  <g transform="translate(400, 440)">
    <text x="0" y="0" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Georgia,serif" font-size="62" font-weight="900" letter-spacing="3" fill="${textCol}">${escapeXml(safeBrand)}</text>
    <rect x="-110" y="16" width="220" height="3.5" rx="1.5" fill="${c.accent}"/>
    <text x="0" y="48" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="18" font-weight="800" letter-spacing="7" fill="${c.glow}">${escapeXml(safeTagline || industry.toUpperCase())}</text>
  </g>
</svg>`;
  }

  // Generate All Variants for All 4 Concepts
  return [
    {
      id: 'concept-1',
      name: 'Concept 1: Modern Geometric Emblem',
      desc: `High-impact geometric mark tailored for ${industry}. Sharp, modern, and memorable.`,
      svgDark: buildConcept1('dark', 'stacked'),
      svgLight: buildConcept1('light', 'stacked'),
      svgTrans: buildConcept1('transparent', 'stacked'),
      svgDarkH: buildConcept1('dark', 'horizontal'),
      svgLightH: buildConcept1('light', 'horizontal'),
      svgTransH: buildConcept1('transparent', 'horizontal'),
      palette: [c.primary, c.accent, c.secondary, c.dark]
    },
    {
      id: 'concept-2',
      name: 'Concept 2: Luxury Monogram Crest',
      desc: 'Sophisticated squircle badge with brand initials. Perfect for app icons and premium identity.',
      svgDark: buildConcept2('dark', 'stacked'),
      svgLight: buildConcept2('light', 'stacked'),
      svgTrans: buildConcept2('transparent', 'stacked'),
      svgDarkH: buildConcept2('dark', 'horizontal'),
      svgLightH: buildConcept2('light', 'horizontal'),
      svgTransH: buildConcept2('transparent', 'horizontal'),
      palette: [c.secondary, c.primary, c.glow]
    },
    {
      id: 'concept-3',
      name: 'Concept 3: Dynamic Abstract Flow',
      desc: 'Dual-loop kinetic ribbon symbolizing momentum, seamless flow, and innovation.',
      svgDark: buildConcept3('dark', 'stacked'),
      svgLight: buildConcept3('light', 'stacked'),
      svgTrans: buildConcept3('transparent', 'stacked'),
      svgDarkH: buildConcept3('dark', 'horizontal'),
      svgLightH: buildConcept3('light', 'horizontal'),
      svgTransH: buildConcept3('transparent', 'horizontal'),
      palette: [c.primary, c.accent, c.glow]
    },
    {
      id: 'concept-4',
      name: 'Concept 4: Authority Shield Crest',
      desc: 'Regal heraldic crest with classic typography and precision star accents. Inspires trust.',
      svgDark: buildConcept4('dark', 'stacked'),
      svgLight: buildConcept4('light', 'stacked'),
      svgTrans: buildConcept4('transparent', 'stacked'),
      svgDarkH: buildConcept4('dark', 'horizontal'),
      svgLightH: buildConcept4('light', 'horizontal'),
      svgTransH: buildConcept4('transparent', 'horizontal'),
      palette: [c.primary, c.secondary, c.accent]
    }
  ];
}

// ----------------------------------------------------
// AI PROMPT GENERATOR ENGINE
// ----------------------------------------------------
export function generatePrompts({
  subject = '',
  target = 'Midjourney v6',
  style = 'Cinematic 35mm Photorealism',
  lighting = 'Volumetric Golden Hour',
  shot = '85mm Portrait (f/1.4 Soft Bokeh)',
  aspect = '16:9 (Landscape Cinematic)'
} = {}) {
  const userConcept = (subject || 'A serene mountain cabin by a quiet lake at dawn').trim();

  const isMidjourney = target.includes('Midjourney');
  const isDalle = target.includes('DALL-E');
  const isFlux = target.includes('FLUX') || target.includes('Stable');
  const isChatGpt = target.includes('ChatGPT') || target.includes('Claude');

  const arMatch = aspect.match(/\b(\d+:\d+)\b/);
  const ar = arMatch ? arMatch[1] : '16:9';

  if (isChatGpt) {
    const systemPrompt = `You are a world-class expert assistant specializing in: "${userConcept}".
Your tone should be authoritative, insightful, and practical.

OBJECTIVE:
Provide a comprehensive, high-leverage solution for the user's objective, structured logically into clear actionable sections.

CONSTRAINTS & RULES:
1. Be direct and avoid introductory fluff or generic conversational preamble.
2. Break complex explanations into numbered steps or concise bullet points.
3. Highlight edge cases, potential pitfalls, and high-impact recommendations.
4. Conclude with a clear next step or implementation roadmap.

TASK TO EXECUTE:
${userConcept}`;

    const shortPrompt = `Act as an expert consultant. Solve the following objective with clear, step-by-step guidance, real-world examples, and actionable advice: "${userConcept}"`;

    return {
      master: systemPrompt,
      params: 'Role: Senior Expert Consultant\nTemperature: 0.65\nResponse Format: Structured Markdown\nTarget Audience: Professional',
      negative: 'Avoid generic buzzwords, avoid unnecessary preamble, no vague high-level generalities without concrete examples.',
      alternative: shortPrompt,
      target
    };
  }

  // Visual Prompt Engineering
  const styleKeywords = {
    'Cinematic 35mm Photorealism': 'cinematic 35mm film still, shot on Arri Alexa, master color grading, authentic fine film grain, depth of field, photorealistic textures, hyperdetailed 8k resolution',
    'Unreal Engine 5 3D Render': 'octane render, Unreal Engine 5 showcase, ray-traced ambient occlusion, subsurface scattering, 3D architectural digital art, volumetric lighting, photorealistic rendering',
    'Anime & Studio Ghibli Aesthetic': 'Makoto Shinkai and Studio Ghibli inspired, lush painted background, vibrant watercolor gradients, hand-drawn anime aesthetic, ethereal emotional atmosphere, masterpiece',
    'Cyberpunk Neon City': 'cyberpunk aesthetic, rainy neon-soaked streets, glowing holographic advertisements, reflective puddle reflections, cyan and magenta color palette, dark dystopian sci-fi atmosphere',
    'Vintage 1970s Film Grain': 'vintage 1970s Kodak Kodachrome photograph, muted nostalgic tones, analog film warmth, slight chromatic aberration, retro documentary aesthetic',
    'Minimalist Vector & Editorial': 'modern vector editorial illustration, clean geometric lines, flat color palette, thoughtful negative space, contemporary design poster',
    'Dark Moody High Fantasy': 'dark fantasy concept art, atmospheric mist, ancient Gothic architecture, moody chiaroscuro lighting, intricate heroic details, ArtStation trending'
  };

  const lightingKeywords = {
    'Volumetric Golden Hour': 'warm golden hour sunlight, god rays breaking through, soft amber backlight, long dramatic shadows, atmospheric haze',
    'Moody Chiaroscuro & Dramatic Shadows': 'chiaroscuro lighting, deep velvety shadows, sharp directional key light, high contrast, Renaissance oil painting lighting',
    'Studio Softbox Commercial Light': 'commercial studio softbox lighting, clean rim light, balanced neutral fill, crisp reflections, pristine beauty lighting',
    'Neon Cyber Rim Lighting': 'electric neon rim lights, vivid dual lighting with cyan and magenta edge highlights, high contrast reflections',
    'Ethereal Fog & Diffused Light': 'ethereal dense ground fog, diffused soft morning light, mystical atmospheric scattering, serene ambient luminescence',
    'Overcast Natural Daylight': 'soft diffused overcast daylight, even natural color tones, realistic gentle shadows, true-to-life outdoor ambience'
  };

  const cameraKeywords = {
    '85mm Portrait (f/1.4 Soft Bokeh)': '85mm lens, f/1.4 aperture, creamy background bokeh, sharp subject focus, intimate portrait composition',
    'Wide Angle Cinematic (24mm)': '24mm wide angle cinematic composition, expansive establishing view, dynamic perspective, panoramic scale',
    'Macro Detail Close-Up': 'macro photography, extreme close-up, microscopic surface textures, shallow depth of field, crisp focal plane',
    'Aerial Drone Bird\'s-Eye View': 'aerial drone photography, bird\'s-eye overhead perspective, vast sweeping landscape scale, topographical depth',
    'Dynamic Action Low Angle': 'dramatic low angle perspective, heroic posture, kinetic energy, wide focal view',
    'Clean Centered Symmetrical': 'perfectly centered symmetrical composition, Wes Anderson style balance, clean vanishing point'
  };

  const selectedStyle = styleKeywords[style] || styleKeywords['Cinematic 35mm Photorealism'];
  const selectedLight = lightingKeywords[lighting] || lightingKeywords['Volumetric Golden Hour'];
  const selectedShot = cameraKeywords[shot] || cameraKeywords['Wide Angle Cinematic (24mm)'];

  let masterPrompt = `${userConcept}, ${selectedStyle}, ${selectedShot}, ${selectedLight}`;
  if (isMidjourney) {
    masterPrompt += ` --ar ${ar} --v 6.0 --stylize 250 --quality 2`;
  }

  let params = '';
  if (isMidjourney) {
    params = `--ar ${ar} --v 6.0 --stylize 250 --quality 2 --chaos 5`;
  } else if (isFlux) {
    params = `Steps: 28, Sampler: Euler, Guidance Scale (CFG): 3.5, Aspect Ratio: ${ar}, Resolution: 1024x${ar === '16:9' ? '576' : '1024'}`;
  } else {
    params = `Aspect Ratio: ${ar}, Quality: HD, Style: Natural & Vivid, Composition: High-Fidelity 4K`;
  }

  const negativePrompt = 'deformed, bad anatomy, distorted limbs, blurry background artifacts, duplicate features, extra fingers, poorly rendered faces, low quality textures, pixelated, watermark, signature, banner text, logo overlay, overexposed, oversaturated';
  const altPrompt = `An evocative and natural scene depicting ${userConcept}. Captured with natural lighting and ${lighting.toLowerCase()}, rendered with rich realistic textures and subtle depth. Clean composition with zero distortion.`;

  return {
    master: masterPrompt,
    params,
    negative: negativePrompt,
    alternative: altPrompt,
    target
  };
}

function escapeXml(unsafe) {
  return String(unsafe).replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}
