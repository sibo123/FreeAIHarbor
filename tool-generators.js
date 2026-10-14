// Client-side instant engines for Free AI Harbor tools: Photo Editor, Logo Designer, and Prompt Generator.
// 100% free, runs entirely on-device with zero API keys or external server dependencies.

export function applyPhotoEnhancement(sourceCanvas, {
  preset = 'Auto Enhance',
  lighting = 'Balanced Normal',
  effect = 'None',
  intensity = '100% Full Effect'
} = {}) {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(sourceCanvas, 0, 0);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const len = data.length;

  const mult = intensity.includes('50%') ? 0.5 : intensity.includes('75%') ? 0.75 : intensity.includes('125%') ? 1.25 : 1.0;

  // 1. Calculate luminance stats for auto-levels
  let minLum = 255, maxLum = 0, sumLum = 0;
  for (let i = 0; i < len; i += 16) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (lum < minLum) minLum = lum;
    if (lum > maxLum) maxLum = lum;
    sumLum += lum;
  }
  const avgLum = sumLum / (len / 16);
  const lumRange = Math.max(30, maxLum - minLum);

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    // Apply Presets
    if (preset === 'Auto Enhance') {
      // Dynamic range expansion + S-curve contrast + vibrance
      let norm = (lum - minLum) / lumRange;
      norm = Math.max(0, Math.min(1, norm));
      const sCurve = norm < 0.5 ? 2 * norm * norm : 1 - Math.pow(-2 * norm + 2, 2) / 2;
      const boost = (sCurve - (lum / 255)) * 45 * mult;

      r += boost;
      g += boost;
      b += boost;

      // Vibrance boost
      const maxC = Math.max(r, g, b);
      const sat = maxC === 0 ? 0 : (maxC - Math.min(r, g, b)) / maxC;
      const vib = (1 - sat) * 22 * mult;
      r += (r - lum) * (0.2 + vib / 100);
      g += (g - lum) * (0.2 + vib / 100);
      b += (b - lum) * (0.2 + vib / 100);
    } else if (preset === 'Cinematic Teal & Orange') {
      // Hollywood blockbuster color grading
      const shadowWeight = Math.max(0, 1 - lum / 160);
      const highlightWeight = Math.max(0, (lum - 90) / 165);

      // Shadows -> Teal (boost cyan/blue, reduce red)
      r -= 18 * shadowWeight * mult;
      g += 8 * shadowWeight * mult;
      b += 22 * shadowWeight * mult;

      // Highlights -> Amber/Orange (boost red, reduce blue)
      r += 26 * highlightWeight * mult;
      g += 10 * highlightWeight * mult;
      b -= 20 * highlightWeight * mult;

      // Contrast punch
      const s = (lum - 128) * 0.25 * mult;
      r += s; g += s; b += s;
    } else if (preset === 'Vibrant Colors') {
      // Rich saturation & vivid punch
      const satBoost = 0.45 * mult;
      r = lum + (r - lum) * (1 + satBoost);
      g = lum + (g - lum) * (1 + satBoost);
      b = lum + (b - lum) * (1 + satBoost);
      // Slight contrast
      const c = (lum - 128) * 0.15 * mult;
      r += c; g += c; b += c;
    } else if (preset === 'Cyberpunk Neon') {
      // Electric Violet & Fluorescent Cyan
      if (lum < 110) {
        // Deep shadows towards electric violet
        r += 18 * mult;
        b += 30 * mult;
      } else {
        // Mids & Highlights towards neon cyan/pink
        g += 15 * mult;
        b += 24 * mult;
      }
      // High contrast
      const s = (lum - 128) * 0.35 * mult;
      r += s; g += s; b += s;
    } else if (preset === 'Vintage Film Warmth') {
      // Warm sepia tone + matte shadows
      r += 22 * mult;
      g += 8 * mult;
      b -= 18 * mult;
      // Lift black floor (matte look)
      if (r < 25) r = 25 * mult + r * (1 - mult);
      if (g < 25) g = 25 * mult + g * (1 - mult);
      if (b < 25) b = 25 * mult + b * (1 - mult);
    } else if (preset === 'Crisp Monochrome B&W') {
      // High contrast fine art monochrome
      const bw = lum;
      const s = (bw - 128) * 0.42 * mult;
      const finalBw = Math.max(0, Math.min(255, bw + s));
      r = finalBw;
      g = finalBw;
      b = finalBw;
    } else if (preset === 'Soft Portrait Glow') {
      // Flattering warm skin tones with soft highlight roll-off
      r += 10 * mult;
      g += 4 * mult;
      b -= 2 * mult;
      if (lum > 170) {
        // Soft highlight compression
        const soft = (lum - 170) * 0.2 * mult;
        r -= soft; g -= soft; b -= soft;
      }
    } else if (preset === 'Dramatic High Contrast') {
      // Aggressive contrast
      const diff = lum - 128;
      const factor = (diff * Math.abs(diff)) / 128 * 0.45 * mult;
      r += factor;
      g += factor;
      b += factor;
    } else if (preset === 'Clean Studio Light') {
      // Neutral daylight balance, shadow fill
      if (lum < 140) {
        const shadowLift = (140 - lum) * 0.3 * mult;
        r += shadowLift;
        g += shadowLift;
        b += shadowLift;
      }
      r += 4 * mult;
      g += 4 * mult;
      b += 4 * mult;
    }

    // Apply Lighting Adjustments
    if (lighting === 'Brighten Shadows' && lum < 130) {
      const lift = (130 - lum) * 0.4 * mult;
      r += lift; g += lift; b += lift;
    } else if (lighting === 'Boost Exposure (+20%)') {
      r *= 1 + 0.2 * mult;
      g *= 1 + 0.2 * mult;
      b *= 1 + 0.2 * mult;
    } else if (lighting === 'Dim Highlights (-20%)' && lum > 160) {
      const dim = (lum - 160) * 0.35 * mult;
      r -= dim; g -= dim; b -= dim;
    } else if (lighting === 'HDR Clarity') {
      // Shadow boost + highlight tone mapping
      if (lum < 120) {
        const boost = (120 - lum) * 0.3 * mult;
        r += boost; g += boost; b += boost;
      } else if (lum > 180) {
        const comp = (lum - 180) * 0.25 * mult;
        r -= comp; g -= comp; b -= comp;
      }
      const mid = 1 - Math.abs(lum - 128) / 128;
      r += (r - lum) * 0.25 * mid * mult;
      g += (g - lum) * 0.25 * mid * mult;
      b += (b - lum) * 0.25 * mid * mult;
    }

    // Cool Nordic Tint
    if (effect === 'Cool Nordic Tint') {
      b += 14 * mult;
      g += 4 * mult;
      r -= 8 * mult;
    }

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  ctx.putImageData(imgData, 0, 0);

  // Apply Vignette Effect
  if (effect === 'Vignette Border') {
    const rx = width / 2;
    const ry = height / 2;
    const maxR = Math.hypot(rx, ry);
    const grad = ctx.createRadialGradient(rx, ry, maxR * 0.4, rx, ry, maxR);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.7, 'rgba(0,0,0,0.15)');
    grad.addColorStop(1, `rgba(0,0,0,${0.55 * mult})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (effect === 'Golden Hour Glow') {
    // Warm sunburst gradient from top-right
    const grad = ctx.createRadialGradient(width * 0.9, height * 0.1, 10, width * 0.5, height * 0.5, Math.hypot(width, height) * 0.85);
    grad.addColorStop(0, `rgba(255,190,70,${0.35 * mult})`);
    grad.addColorStop(0.4, `rgba(255,140,40,${0.18 * mult})`);
    grad.addColorStop(1, 'rgba(255,100,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (effect === 'Soft Background Blur') {
    // Subtle tilt-shift radial focus
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.filter = `blur(${Math.max(4, Math.round(width / 180))}px)`;
    tempCtx.drawImage(canvas, 0, 0);

    // Mask center out of blurred image
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = width;
    maskCanvas.height = height;
    const mCtx = maskCanvas.getContext('2d');
    const rx = width / 2, ry = height / 2;
    const maxR = Math.hypot(rx, ry);
    const rad = mCtx.createRadialGradient(rx, ry, maxR * 0.25, rx, ry, maxR * 0.7);
    rad.addColorStop(0, 'rgba(0,0,0,0)');
    rad.addColorStop(1, 'rgba(0,0,0,1)');
    mCtx.fillStyle = rad;
    mCtx.fillRect(0, 0, width, height);

    tempCtx.globalCompositeOperation = 'destination-in';
    tempCtx.drawImage(maskCanvas, 0, 0);

    ctx.drawImage(tempCanvas, 0, 0);
  }

  return canvas;
}

// ----------------------------------------------------
// AI LOGO DESIGNER ENGINE
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

  // Palette definitions
  const palettes = {
    'Emerald & Electric Mint': { primary: '#10b981', secondary: '#059669', accent: '#34d399', dark: '#022c22', light: '#ecfdf5', glow: '#6ee7b7' },
    'Cyber Neon Cyan & Violet': { primary: '#06b6d4', secondary: '#3b82f6', accent: '#8b5cf6', dark: '#0f172a', light: '#f0f9ff', glow: '#38bdf8' },
    'Royal Blue & Champagne Gold': { primary: '#1d4ed8', secondary: '#2563eb', accent: '#f59e0b', dark: '#0f172a', light: '#f8fafc', glow: '#fbbf24' },
    'Warm Sunset Amber & Coral': { primary: '#f97316', secondary: '#ea580c', accent: '#ec4899', dark: '#2e1065', light: '#fff7ed', glow: '#fdba74' },
    'Charcoal, Platinum & Slate': { primary: '#334155', secondary: '#1e293b', accent: '#0284c7', dark: '#0b0f19', light: '#f1f5f9', glow: '#94a3b8' },
    'Nordic Forest Sage & Cream': { primary: '#2d6a4f', secondary: '#1b4332', accent: '#74c69d', dark: '#081c15', light: '#f4fbf7', glow: '#b7e4c7' }
  };
  const c = palettes[palette] || palettes['Emerald & Electric Mint'];

  // Industry graphic motifs
  const isTech = industry.includes('Tech') || industry.includes('AI');
  const isCoffee = industry.includes('Coffee') || industry.includes('Food');
  const isFitness = industry.includes('Fitness') || industry.includes('Sports');
  const isCreative = industry.includes('Design') || industry.includes('Creative');
  const isEco = industry.includes('Eco') || industry.includes('Nature');
  const isLuxury = industry.includes('Fashion') || industry.includes('Luxury');
  const isRealEstate = industry.includes('Real Estate') || industry.includes('Architecture');
  const isGaming = industry.includes('Gaming') || industry.includes('Entertainment');

  // SVG Concept 1: Modern Geometric Symbol + Wordmark
  function buildConcept1(isDark = true) {
    const bg = isDark ? c.dark : c.light;
    const textCol = isDark ? '#ffffff' : '#0f172a';
    const tagCol = isDark ? c.glow : c.secondary;

    let iconPath = '';
    if (isTech) {
      iconPath = `
        <polygon points="120,45 155,65 155,105 120,125 85,105 85,65" fill="none" stroke="url(#c1_grad)" stroke-width="6"/>
        <circle cx="120" cy="85" r="14" fill="url(#c1_grad)"/>
        <line x1="120" y1="45" x2="120" y2="71" stroke="${c.accent}" stroke-width="3"/>
        <line x1="85" y1="105" x2="108" y2="92" stroke="${c.accent}" stroke-width="3"/>
        <line x1="155" y1="105" x2="132" y2="92" stroke="${c.accent}" stroke-width="3"/>
      `;
    } else if (isCoffee) {
      iconPath = `
        <path d="M100 65 h34 a18 18 0 0 1 18 18 v10 a18 18 0 0 1 -18 18 h-34 a6 6 0 0 1 -6 -6 v-34 a6 6 0 0 1 6 -6 z" fill="none" stroke="url(#c1_grad)" stroke-width="5"/>
        <path d="M134 75 h8 a9 9 0 0 1 9 9 v6 a9 9 0 0 1 -9 9 h-8" fill="none" stroke="${c.accent}" stroke-width="4"/>
        <path d="M108 52 q5 -10 0 -18" stroke="${c.accent}" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M120 50 q5 -12 0 -20" stroke="${c.primary}" stroke-width="3" stroke-linecap="round" fill="none"/>
      `;
    } else if (isFitness) {
      iconPath = `
        <polygon points="125,40 100,85 118,85 110,125 140,78 122,78" fill="url(#c1_grad)"/>
        <circle cx="120" cy="85" r="42" fill="none" stroke="${c.accent}" stroke-width="4" stroke-dasharray="14 8"/>
      `;
    } else if (isEco) {
      iconPath = `
        <path d="M120 120 c0 -35 22 -60 38 -65 c0 28 -14 55 -38 65 z" fill="url(#c1_grad)"/>
        <path d="M120 120 c0 -30 -18 -50 -32 -55 c0 24 12 45 32 55 z" fill="${c.accent}" opacity="0.85"/>
        <line x1="120" y1="120" x2="120" y2="60" stroke="${isDark ? '#fff' : c.dark}" stroke-width="2.5"/>
      `;
    } else if (isLuxury) {
      iconPath = `
        <polygon points="120,45 152,80 120,122 88,80" fill="none" stroke="url(#c1_grad)" stroke-width="5"/>
        <polygon points="120,58 142,80 120,108 98,80" fill="${c.accent}" opacity="0.3"/>
        <circle cx="120" cy="80" r="4" fill="${textCol}"/>
      `;
    } else {
      // Modern Geometric Diamond Prism
      iconPath = `
        <polygon points="120,42 155,70 120,125 85,70" fill="none" stroke="url(#c1_grad)" stroke-width="5.5"/>
        <line x1="85" y1="70" x2="155" y2="70" stroke="${c.accent}" stroke-width="3"/>
        <line x1="120" y1="42" x2="120" y2="125" stroke="${c.accent}" stroke-width="2" stroke-dasharray="4 4"/>
      `;
    }

    return `
<svg viewBox="0 0 500 170" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <defs>
    <linearGradient id="c1_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.primary}"/>
      <stop offset="100%" stop-color="${c.accent}"/>
    </linearGradient>
  </defs>
  <rect width="500" height="170" rx="16" fill="${bg}"/>
  <g transform="translate(10, 0)">
    ${iconPath}
    <text x="180" y="93" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,sans-serif" font-size="34" font-weight="800" letter-spacing="1.5" fill="${textCol}">${escapeXml(safeBrand)}</text>
    ${safeTagline ? `<text x="182" y="122" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" font-size="12" font-weight="600" letter-spacing="4" fill="${tagCol}">${escapeXml(safeTagline)}</text>` : ''}
  </g>
</svg>`;
  }

  // SVG Concept 2: Minimalist Monogram / Lettermark Emblem
  function buildConcept2(isDark = true) {
    const bg = isDark ? '#0b101b' : '#ffffff';
    const borderCol = isDark ? '#1e293b' : '#e2e8f0';
    const textCol = isDark ? '#ffffff' : '#0f172a';
    const tagCol = isDark ? '#94a3b8' : '#64748b';

    return `
<svg viewBox="0 0 500 170" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <defs>
    <linearGradient id="c2_grad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${c.secondary}"/>
      <stop offset="100%" stop-color="${c.primary}"/>
    </linearGradient>
  </defs>
  <rect width="500" height="170" rx="16" fill="${bg}" stroke="${borderCol}" stroke-width="1.5"/>
  <g transform="translate(45, 25)">
    <rect x="20" y="10" width="100" height="100" rx="24" fill="url(#c2_grad)"/>
    <circle cx="70" cy="60" r="42" fill="none" stroke="${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}" stroke-width="3"/>
    <text x="70" y="74" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Georgia,serif" font-size="46" font-weight="900" fill="#ffffff" letter-spacing="-1">${escapeXml(initials)}</text>
  </g>
  <g transform="translate(180, 72)">
    <text x="0" y="20" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" font-size="32" font-weight="700" letter-spacing="2" fill="${textCol}">${escapeXml(safeBrand)}</text>
    ${safeTagline ? `<text x="2" y="46" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="11" font-weight="600" letter-spacing="3.5" fill="${tagCol}">${escapeXml(safeTagline)}</text>` : ''}
  </g>
</svg>`;
  }

  // SVG Concept 3: Modern Badge & Shield Crest
  function buildConcept3(isDark = true) {
    const bg = isDark ? c.dark : '#f8fafc';
    const textCol = isDark ? '#ffffff' : '#0f172a';
    const bannerBg = isDark ? c.primary : c.secondary;

    return `
<svg viewBox="0 0 500 170" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <defs>
    <linearGradient id="c3_shield" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.primary}"/>
      <stop offset="50%" stop-color="${c.secondary}"/>
      <stop offset="100%" stop-color="${c.accent}"/>
    </linearGradient>
  </defs>
  <rect width="500" height="170" rx="16" fill="${bg}"/>
  <g transform="translate(50, 15)">
    <!-- Badge / Shield outline -->
    <path d="M70 20 L115 32 V75 C115 105 70 125 70 125 C70 125 25 105 25 75 V32 Z" fill="none" stroke="url(#c3_shield)" stroke-width="4.5"/>
    <path d="M70 30 L103 40 V72 C103 96 70 113 70 113 C70 113 37 96 37 72 V40 Z" fill="${c.accent}" opacity="0.18"/>
    <!-- Central Icon Initial -->
    <text x="70" y="80" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="34" font-weight="900" fill="${c.accent}">${escapeXml(initials[0] || 'A')}</text>
    <!-- Stars -->
    <circle cx="50" cy="50" r="2.5" fill="${c.glow}"/>
    <circle cx="90" cy="50" r="2.5" fill="${c.glow}"/>
  </g>
  <g transform="translate(195, 75)">
    <text x="0" y="16" font-family="Georgia,serif" font-size="32" font-weight="700" letter-spacing="1" fill="${textCol}">${escapeXml(safeBrand)}</text>
    <rect x="0" y="27" width="160" height="2" fill="${c.accent}"/>
    <text x="0" y="47" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="10.5" font-weight="700" letter-spacing="4" fill="${c.glow}">${escapeXml(safeTagline || industry.toUpperCase())}</text>
  </g>
</svg>`;
  }

  // SVG Concept 4: Abstract Dynamic Flow / Tech Wave
  function buildConcept4(isDark = true) {
    const bg = isDark ? '#080d1a' : '#f1f5f9';
    const textCol = isDark ? '#ffffff' : '#0f172a';

    return `
<svg viewBox="0 0 500 170" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <defs>
    <linearGradient id="c4_grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.primary}"/>
      <stop offset="100%" stop-color="${c.accent}"/>
    </linearGradient>
    <linearGradient id="c4_grad2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${c.accent}"/>
      <stop offset="100%" stop-color="${c.glow}"/>
    </linearGradient>
  </defs>
  <rect width="500" height="170" rx="16" fill="${bg}"/>
  <g transform="translate(30, 20)">
    <!-- Interlocking kinetic loops -->
    <path d="M50 85 C50 50 80 50 95 70 C110 90 140 90 140 55" fill="none" stroke="url(#c4_grad1)" stroke-width="7" stroke-linecap="round"/>
    <path d="M50 55 C50 90 80 90 95 70 C110 50 140 50 140 85" fill="none" stroke="url(#c4_grad2)" stroke-width="7" stroke-linecap="round" opacity="0.85"/>
    <circle cx="95" cy="70" r="7" fill="${c.accent}"/>
  </g>
  <g transform="translate(195, 74)">
    <text x="0" y="18" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" font-size="33" font-weight="900" letter-spacing="2.5" fill="${textCol}">${escapeXml(safeBrand)}</text>
    <text x="2" y="44" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="11" font-weight="600" letter-spacing="3" fill="${c.accent}">${escapeXml(safeTagline || 'STUDIO')}</text>
  </g>
</svg>`;
  }

  return [
    {
      id: 'concept-geometric',
      name: 'Concept 1: Modern Geometric Symbol',
      desc: 'Clean geometric glyph paired with modern bold wordmark and tracked tagline.',
      svgDark: buildConcept1(true),
      svgLight: buildConcept1(false),
      palette: [c.primary, c.accent, c.secondary, c.dark]
    },
    {
      id: 'concept-monogram',
      name: 'Concept 2: Minimalist Monogram Emblem',
      desc: 'Distinctive squircle badge featuring brand initials for modern apps and social icons.',
      svgDark: buildConcept2(true),
      svgLight: buildConcept2(false),
      palette: [c.secondary, c.primary, c.glow]
    },
    {
      id: 'concept-badge',
      name: 'Concept 3: Modern Badge & Shield Crest',
      desc: 'Authoritative emblem mark with established styling, star accents, and classic typography.',
      svgDark: buildConcept3(true),
      svgLight: buildConcept3(false),
      palette: [c.primary, c.accent, c.dark]
    },
    {
      id: 'concept-flow',
      name: 'Concept 4: Dynamic Kinetic Flow Mark',
      desc: 'Forward-moving dual-loop ribbon representing synergy, momentum, and continuous innovation.',
      svgDark: buildConcept4(true),
      svgLight: buildConcept4(false),
      palette: [c.primary, c.accent, c.glow]
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

  // Model-specific flags & syntax
  const isMidjourney = target.includes('Midjourney');
  const isDalle = target.includes('DALL-E');
  const isFlux = target.includes('FLUX') || target.includes('Stable');
  const isChatGpt = target.includes('ChatGPT') || target.includes('Claude');

  // Aspect ratio flag
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

  // 1. Master Production Prompt
  let masterPrompt = `${userConcept}, ${selectedStyle}, ${selectedShot}, ${selectedLight}`;
  if (isMidjourney) {
    masterPrompt += ` --ar ${ar} --v 6.0 --stylize 250 --quality 2`;
  }

  // 2. Parameters & Flags
  let params = '';
  if (isMidjourney) {
    params = `--ar ${ar} --v 6.0 --stylize 250 --quality 2 --chaos 5`;
  } else if (isFlux) {
    params = `Steps: 28, Sampler: Euler, Guidance Scale (CFG): 3.5, Aspect Ratio: ${ar}, Resolution: 1024x${ar === '16:9' ? '576' : '1024'}`;
  } else {
    params = `Aspect Ratio: ${ar}, Quality: HD, Style: Natural & Vivid, Composition: High-Fidelity 4K`;
  }

  // 3. Negative Prompt
  const negativePrompt = 'deformed, bad anatomy, distorted limbs, blurry background artifacts, duplicate features, extra fingers, poorly rendered faces, low quality textures, pixelated, watermark, signature, banner text, logo overlay, overexposed, oversaturated';

  // 4. Creative Alternative (Minimalist / Story-driven for FLUX and DALL-E)
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
