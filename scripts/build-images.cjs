/**
 * IMAGE PIPELINE — `npm run images`
 *
 * Drop original artwork into /assets-src and run this script. It produces
 * every image the storefront uses, at 4K plus a lighter rendition, and writes
 * src/content/image-manifest.json so the app picks the new files up.
 *
 *   assets-src/games/<slug>.(jpg|png|webp)    game key art (portrait, 2160x2880+ ideal)
 *     -> public/assets/hero/<slug>.webp        hero card 3:4 in the KOON frame (up to 2160x2880)
 *     -> public/assets/hero/<slug>-1080.webp
 *     -> public/assets/products/<slug>-hd.webp product image 4:5 (up to 2160x2700)
 *     -> public/assets/products/<slug>.webp    540w rendition
 *   assets-src/hero/<slug>.(png|jpg|webp)     OPTIONAL ready-made hero card (already framed)
 *     -> replaces the generated hero card; used as-is, dark surround made transparent
 *   Sources are never upscaled: outputs are capped at the source resolution.
 *   assets-src/brands/<slug>.(svg|png|jpg|webp)   shopping-card brand logo / artwork
 *     -> public/assets/brands/<slug>-2160.webp   card tile 1.586:1 (2160x1362) on the brand colour
 *     -> public/assets/brands/<slug>.webp        1080x681
 *   assets-src/avatars/<name>.(png|jpg|webp)  profile avatar (square)
 *     -> public/assets/avatars/<name>.webp       1024x1024
 *
 * Games without supplied art still get a hero card (geometric pattern, no photo).
 * Anything smaller than 4K is processed but reported as a warning.
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'assets-src');
const PUB = path.join(ROOT, 'public', 'assets');
const MANIFEST = path.join(ROOT, 'src', 'content', 'image-manifest.json');

// keep in sync with themeConfig.colors.accent
const LIME = '#BCD86A';
const DISPLAY = "Bahnschrift, 'Segoe UI', Arial, sans-serif";
const MONO = "Consolas, 'Courier New', monospace";
const DOT = '·';

/** Hero card copy per game (Latin title split over two lines + small tag) */
const GAMES = {
  'valorant': { lines: ['VALO', 'RANT'], tag: 'TACTICAL', pattern: 'chevrons' },
  'free-fire': { lines: ['FREE', 'FIRE'], tag: 'BATTLE ROYALE', pattern: 'radar' },
  'pubg': { lines: ['PUBG', 'MOBILE'], tag: 'BATTLEGROUNDS', pattern: 'contours' },
  'mobile-legends': { lines: ['MOBILE', 'LEGENDS'], tag: 'MOBA', pattern: 'hexes' },
  'fortnite': { lines: ['FORT', 'NITE'], tag: 'BUILD ' + DOT + ' BATTLE', pattern: 'floor' },
  'genshin-impact': { lines: ['GENSHIN', 'IMPACT'], tag: 'OPEN WORLD', pattern: 'hexes' },
  'lords-mobile': { lines: ['LORDS', 'MOBILE'], tag: 'STRATEGY', pattern: 'chevrons' },
  'yalla-ludo': { lines: ['YALLA', 'LUDO'], tag: 'BOARD', pattern: 'floor' },
  'call-of-duty': { lines: ['CALL OF', 'DUTY'], tag: 'MOBILE', pattern: 'contours' },
  'roblox': { lines: ['ROB', 'LOX'], tag: 'SANDBOX', pattern: 'hexes' },
};
/** Brand tile background colours (match catalog.ts `tile`) */
const BRANDS = {
  'ebay': '#FEFEFE', 'hungerstation': '#F7D006', 'bath-body-works': '#FFFFFF',
  'amazon': '#FFFFFF', 'shein': '#000000', 'noon': '#FFEE02',
};

const warnings = [];
const manifest = { products: {}, brands: {}, hero: {}, avatars: {} };
const findSrc = (dir, name) => {
  for (const ext of ['png', 'jpg', 'jpeg', 'webp', 'svg']) {
    const f = path.join(SRC, dir, `${name}.${ext}`);
    if (fs.existsSync(f)) return f;
  }
  return null;
};
const checkSize = async (file, minW, minH, label) => {
  const m = await sharp(file).metadata();
  if (m.format !== 'svg' && ((m.width ?? 0) < minW || (m.height ?? 0) < minH)) {
    warnings.push(`${label}: ${m.width}x${m.height} is below ${minW}x${minH} (not 4K) - ${path.relative(ROOT, file)}`);
  }
};
const webp = (img, out, q = 88) => img.webp({ quality: q, effort: 4 }).toFile(out);
const kb = (f) => `${Math.round(fs.statSync(f).size / 1024)}KB`;

/* ——— Hero card ——————————————————————————————————————————————— */
const W = 2160, H = 2880, R = 120;
const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const patterns = {
  chevrons() {
    let p = '';
    for (let i = -6; i < 16; i++) {
      const y = i * 170;
      p += `<path d="M-100 ${y + 600} L${W / 2} ${y} L${W + 100} ${y + 600}" fill="none" stroke="${LIME}" stroke-opacity="${i === 3 ? 1 : 0.13}" stroke-width="${i === 3 ? 22 : 6}"/>`;
    }
    return p;
  },
  radar() {
    const cx = W * 0.62, cy = H * 0.36;
    let p = `<path d="M${cx} ${cy} L${cx + 1500} ${cy - 700} A1650 1650 0 0 1 ${cx + 1500} ${cy + 700} Z" fill="url(#sweep)"/>`;
    for (let r = 160; r < 2200; r += 160) p += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${LIME}" stroke-opacity="0.12" stroke-width="5"/>`;
    p += `<path d="M${cx - 2200} ${cy}H${cx + 2200}M${cx} ${cy - 2200}V${cy + 2200}" stroke="${LIME}" stroke-opacity="0.12" stroke-width="4"/>`;
    p += `<circle cx="${cx}" cy="${cy}" r="36" fill="${LIME}"/><circle cx="${cx + 520}" cy="${cy - 260}" r="20" fill="${LIME}"/>`;
    return p;
  },
  contours() {
    const rand = rng(7);
    let p = '';
    for (let k = 0; k < 22; k++) {
      const base = 120 + k * 120;
      let d = `M-50 ${base}`;
      for (let x = 0; x <= W + 100; x += 120) d += ` Q${x + 60} ${base + Math.sin((x + k * 90) / 260) * 90 + (rand() - 0.5) * 50} ${x + 120} ${base + Math.cos((x + k * 50) / 300) * 70}`;
      p += `<path d="${d}" fill="none" stroke="${LIME}" stroke-opacity="${k === 5 ? 0.9 : 0.12}" stroke-width="${k === 5 ? 14 : 5}"/>`;
    }
    return p;
  },
  hexes() {
    const s = 150, h = Math.sqrt(3) * s;
    let p = '';
    for (let row = -1; row < H / h + 2; row++) {
      for (let col = -1; col < W / (s * 1.5) + 2; col++) {
        const cx = col * s * 1.5, cy = row * h + (col % 2 ? h / 2 : 0);
        const pts = Array.from({ length: 6 }, (_, i) => `${cx + (s - 10) * Math.cos((Math.PI / 3) * i)},${cy + (s - 10) * Math.sin((Math.PI / 3) * i)}`).join(' ');
        const hot = row === 3 && col === 8;
        p += `<polygon points="${pts}" fill="${hot ? LIME : 'none'}" fill-opacity="${hot ? 0.9 : 0}" stroke="${LIME}" stroke-opacity="${hot ? 1 : 0.11}" stroke-width="5"/>`;
      }
    }
    return p;
  },
  floor() {
    const vx = W / 2, vy = H * 0.3;
    let p = '';
    for (let i = -14; i <= 14; i++) p += `<line x1="${vx}" y1="${vy}" x2="${vx + i * 380}" y2="${H + 200}" stroke="${LIME}" stroke-opacity="0.13" stroke-width="5"/>`;
    for (let k = 1; k < 16; k++) {
      const y = vy + Math.pow(k / 15, 2.2) * (H - vy + 200);
      p += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${LIME}" stroke-opacity="${0.04 + k * 0.009}" stroke-width="5"/>`;
    }
    p += `<circle cx="${vx}" cy="${vy - 120}" r="230" fill="none" stroke="${LIME}" stroke-width="16"/>`;
    return p;
  },
};

/** Card body: graphite gradient, lime glow and the game's geometric pattern. */
function baseSvg(slug) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22272B"/><stop offset="0.55" stop-color="#16191C"/><stop offset="1" stop-color="#0D0F11"/></linearGradient>
    <radialGradient id="glow" cx="0.7" cy="0.25" r="0.75"><stop offset="0" stop-color="${LIME}" stop-opacity="0.16"/><stop offset="1" stop-color="${LIME}" stop-opacity="0"/></radialGradient>
    <radialGradient id="sweep" cx="0" cy="0.5" r="1"><stop offset="0" stop-color="${LIME}" stop-opacity="0.22"/><stop offset="1" stop-color="${LIME}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#body)"/><rect width="${W}" height="${H}" fill="url(#glow)"/>${patterns[GAMES[slug].pattern]()}
</svg>`;
}

/** Card frame drawn over the body/art: fades, header, title, footer. `hasArt` hides the chip and deepens the top fade. */
function cardSvg(slug, index, hasArt) {
  const g = GAMES[slug];
  const [l1, l2] = g.lines;
  const big = Math.max(l1.length, l2.length) > 7 ? 270 : Math.max(l1.length, l2.length) > 5 ? 320 : 380;
  const serial = `KN${DOT}${String(index + 1).padStart(2, '0')}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0D0F11" stop-opacity="${hasArt ? 0.55 : 0}"/>
      <stop offset="${hasArt ? 0.16 : 0.35}" stop-color="#0D0F11" stop-opacity="0"/>
      <stop offset="${hasArt ? 0.5 : 0.35}" stop-color="#0D0F11" stop-opacity="0"/>
      <stop offset="0.82" stop-color="#0D0F11" stop-opacity="0.97"/>
    </linearGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.10"/><stop offset="0.4" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <clipPath id="shape"><rect width="${W}" height="${H}" rx="${R}"/></clipPath>
  </defs>
  <g clip-path="url(#shape)">
    <rect width="${W}" height="${H}" fill="url(#fade)"/>
    <rect width="${W}" height="${H}" fill="url(#sheen)"/>
    <g transform="translate(150 170)">
      <path d="M0 22 L22 0 H96 V96 H0 Z" fill="${LIME}"/>
      <path d="M26 18h17v28l23-28h20L59 50l28 32H66L43 56v26H26Z" fill="#121417"/>
      <text x="130" y="76" font-family="${DISPLAY}" font-weight="700" font-size="78" letter-spacing="16" fill="#fff">KOON</text>
    </g>
    <text x="${W - 150}" y="246" text-anchor="end" font-family="${MONO}" font-size="54" letter-spacing="10" fill="#fff" fill-opacity="0.7">${g.tag}</text>
    ${hasArt ? '' : `<g transform="translate(150 1180)"><rect width="250" height="190" rx="34" fill="none" stroke="${LIME}" stroke-width="8"/><path d="M0 95H90M160 95H250M125 0V60M125 130V190M90 60H160V130H90Z" fill="none" stroke="${LIME}" stroke-width="6"/></g>`}
    <text x="150" y="${H - 780}" font-family="${DISPLAY}" font-weight="700" font-size="${big}" letter-spacing="-4" fill="#fff">${l1}</text>
    <text x="150" y="${H - 780 + big * 0.98}" font-family="${DISPLAY}" font-weight="700" font-size="${big}" letter-spacing="-4" fill="${LIME}">${l2}</text>
    <rect x="150" y="${H - 300}" width="${W - 300}" height="3" fill="#fff" fill-opacity="0.18"/>
    <text x="150" y="${H - 180}" font-family="${MONO}" font-size="58" letter-spacing="12" fill="#fff" fill-opacity="0.7">DIGITAL GAME CARD</text>
    <text x="${W - 150}" y="${H - 180}" text-anchor="end" font-family="${MONO}" font-size="58" letter-spacing="8" fill="${LIME}">${serial}</text>
  </g>
  <rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="${R - 3}" fill="none" stroke="#fff" stroke-opacity="0.12" stroke-width="6"/>
</svg>`;
}

/**
 * Output size never exceeds the source: we fit the target aspect inside the
 * original pixels (no upscaling), capped at the 4K target.
 */
const fitNoUpscale = (srcW, srcH, targetW, targetH) => {
  const s = Math.min(1, srcW / targetW, srcH / targetH);
  return [Math.round(targetW * s), Math.round(targetH * s)];
};

/** Minimal frame for supplied key art (it already carries the game logo): bottom fade, small mark + serial, hairline border. */
function photoFrameSvg(w, h, index) {
  const k = w / W; // scale everything from the 2160 design grid
  const r = R * k;
  const serial = `KN${DOT}${String(index + 1).padStart(2, '0')}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0.78" stop-color="#0D0F11" stop-opacity="0"/><stop offset="1" stop-color="#0D0F11" stop-opacity="0.85"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#f)"/>
  <g transform="translate(${150 * k} ${h - 230 * k}) scale(${k})">
    <path d="M0 22 L22 0 H96 V96 H0 Z" fill="${LIME}"/>
    <path d="M26 18h17v28l23-28h20L59 50l28 32H66L43 56v26H26Z" fill="#121417"/>
    <text x="130" y="76" font-family="${DISPLAY}" font-weight="700" font-size="74" letter-spacing="16" fill="#fff">KOON</text>
  </g>
  <text x="${w - 150 * k}" y="${h - 150 * k}" text-anchor="end" font-family="${MONO}" font-size="${58 * k}" letter-spacing="${8 * k}" fill="${LIME}">${serial}</text>
  <rect x="${3 * k}" y="${3 * k}" width="${w - 6 * k}" height="${h - 6 * k}" rx="${r - 3 * k}" fill="none" stroke="#fff" stroke-opacity="0.14" stroke-width="${6 * k}"/>
</svg>`;
}

async function buildHero(slug, index, art) {
  let full, width;
  if (art) {
    const meta = await sharp(art).metadata();
    const [w, h] = fitNoUpscale(meta.width, meta.height, W, H);
    const k = w / W;
    const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${R * k}" fill="#fff"/></svg>`);
    let photo;
    if (meta.hasAlpha) {
      // cut-out art: stand it on the card body, anchored to the bottom
      const body = await sharp(Buffer.from(baseSvg(slug))).resize(w, h).png().toBuffer();
      const figure = await sharp(art).resize(Math.round(w * 0.95), Math.round(h * 0.9), { fit: 'inside', withoutEnlargement: true }).toBuffer();
      photo = await sharp(body).composite([{ input: figure, gravity: 'south' }]).png().toBuffer();
    } else {
      photo = await sharp(art).resize(w, h, { fit: 'cover', position: 'north' }).png().toBuffer();
    }
    full = await sharp(photo).composite([{ input: Buffer.from(photoFrameSvg(w, h, index)) }, { input: mask, blend: 'dest-in' }]).png().toBuffer();
    width = w;
  } else {
    const layers = [
      { input: Buffer.from(cardSvg(slug, index, false)) },
      { input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" rx="${R}" fill="#fff"/></svg>`), blend: 'dest-in' },
    ];
    full = await sharp(Buffer.from(baseSvg(slug))).composite(layers).png().toBuffer();
    width = W;
  }
  const out = path.join(PUB, 'hero', `${slug}.webp`);
  const small = path.join(PUB, 'hero', `${slug}-1080.webp`);
  await webp(sharp(full), out, 92);
  await webp(sharp(full).resize({ width: Math.min(1080, width) }), small, 90);
  manifest.hero[slug] = { art: `/assets/hero/${slug}.webp`, small: `/assets/hero/${slug}-1080.webp`, width, photo: Boolean(art) };
  console.log(`hero      ${slug.padEnd(16)} ${art ? 'photo  ' : 'pattern'} ${width}w  ${kb(out)} / ${kb(small)}`);
}

/**
 * Ready-made hero card (assets-src/hero/<slug>): used as-is, no KOON frame.
 * The flat near-black surround that touches the image border is flood-filled
 * to transparent so the card (and its own glow) floats on the page.
 */
async function buildReadyHero(slug, file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const LIMIT = 24; // max channel value still treated as background
  const isBg = (i) => data[i] <= LIMIT && data[i + 1] <= LIMIT && data[i + 2] <= LIMIT;
  const seen = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const p = stack.pop();
    if (seen[p]) continue;
    seen[p] = 1;
    if (!isBg(p * 4)) continue;
    data[p * 4 + 3] = 0;
    const x = p % w, y = (p - x) / w;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - w);
    if (y < h - 1) stack.push(p + w);
  }
  // feather the cut edge by 1px so it never looks jagged
  const alpha = await sharp(data, { raw: { width: w, height: h, channels: 4 } }).extractChannel(3).blur(0.8).toBuffer();
  const rgba = await sharp(data, { raw: { width: w, height: h, channels: 4 } }).removeAlpha().joinChannel(alpha, { raw: { width: w, height: h, channels: 1 } }).png().toBuffer();
  const out = path.join(PUB, 'hero', `${slug}.webp`);
  const small = path.join(PUB, 'hero', `${slug}-1080.webp`);
  await webp(sharp(rgba), out, 92);
  await webp(sharp(rgba).resize({ width: Math.min(1080, w) }), small, 90);
  manifest.hero[slug] = { art: `/assets/hero/${slug}.webp`, small: `/assets/hero/${slug}-1080.webp`, width: w, photo: true, ready: true };
  console.log(`hero      ${slug.padEnd(16)} ready   ${w}w  ${kb(out)} / ${kb(small)}`);
}

async function buildProduct(slug, art) {
  const meta = await sharp(art).metadata();
  const [pw, ph] = fitNoUpscale(meta.width, meta.height, 2160, 2700);
  const sw = Math.min(540, pw), sh = Math.round(sw * 1.25);
  const full = path.join(PUB, 'products', `${slug}-hd.webp`);
  const small = path.join(PUB, 'products', `${slug}.webp`);
  let img;
  if (meta.hasAlpha) {
    // cut-out art: keep the whole figure, standing on the card body
    const figure = await sharp(art).resize(Math.round(pw * 0.95), Math.round(ph * 0.92), { fit: 'inside', withoutEnlargement: true }).toBuffer();
    const base = await sharp(Buffer.from(baseSvg(slug))).resize(pw, ph, { fit: 'cover' }).toBuffer();
    img = await sharp(base).composite([{ input: figure, gravity: 'south' }]).png().toBuffer();
  } else {
    // key art keeps its logo at the top, so trim from the bottom
    img = await sharp(art).resize(pw, ph, { fit: 'cover', position: 'north' }).png().toBuffer();
  }
  await webp(sharp(img), full);
  await webp(sharp(img).resize(sw, sh), small);
  manifest.products[slug] = {
    image: `/assets/products/${slug}.webp`,
    imageHd: `/assets/products/${slug}-hd.webp`,
    imageSet: `/assets/products/${slug}.webp ${sw}w, /assets/products/${slug}-hd.webp ${pw}w`,
  };
  console.log(`product   ${slug.padEnd(16)} ${pw}w  ${kb(full)} / ${kb(small)}`);
}

async function buildBrand(slug, art) {
  const bg = BRANDS[slug] ?? '#FFFFFF';
  const [w, h] = [2160, 1362];
  const logo = await sharp(art, { density: 300 }).resize(Math.round(w * 0.72), Math.round(h * 0.62), { fit: 'inside' }).toBuffer();
  const tile = await sharp({ create: { width: w, height: h, channels: 4, background: bg } }).composite([{ input: logo, gravity: 'center' }]).png().toBuffer();
  const full = path.join(PUB, 'brands', `${slug}-2160.webp`);
  const small = path.join(PUB, 'brands', `${slug}.webp`);
  await webp(sharp(tile), full, 92);
  await webp(sharp(tile).resize({ width: 1080 }), small, 90);
  manifest.brands[slug] = { image: `/assets/brands/${slug}.webp`, imageHd: `/assets/brands/${slug}-2160.webp`, imageSet: `/assets/brands/${slug}.webp 1080w, /assets/brands/${slug}-2160.webp 2160w` };
  console.log(`brand     ${slug.padEnd(16)} ${kb(full)} / ${kb(small)}`);
}

async function buildAvatar(name, art) {
  const out = path.join(PUB, 'avatars', `${name}.webp`);
  await webp(sharp(art).resize(1024, 1024, { fit: 'cover', position: 'attention' }), out, 92);
  manifest.avatars[name] = `/assets/avatars/${name}.webp`;
  console.log(`avatar    ${name.padEnd(16)} ${kb(out)}`);
}

(async () => {
  for (const d of ['hero', 'products', 'brands', 'avatars']) fs.mkdirSync(path.join(PUB, d), { recursive: true });

  const slugs = Object.keys(GAMES);
  for (let i = 0; i < slugs.length; i++) {
    const art = findSrc('games', slugs[i]);
    if (art) {
      await checkSize(art, 2160, 2700, `game ${slugs[i]}`);
      await buildProduct(slugs[i], art);
    }
    const ready = findSrc('hero', slugs[i]);
    if (ready) {
      await checkSize(ready, 2160, 2880, `hero ${slugs[i]}`);
      await buildReadyHero(slugs[i], ready);
    } else {
      await buildHero(slugs[i], i, art);
    }
  }
  for (const slug of Object.keys(BRANDS)) {
    const art = findSrc('brands', slug);
    if (!art) continue;
    await checkSize(art, 2160, 1000, `brand ${slug}`);
    await buildBrand(slug, art);
  }
  const avatarDir = path.join(SRC, 'avatars');
  for (const f of fs.existsSync(avatarDir) ? fs.readdirSync(avatarDir) : []) {
    if (!/\.(png|jpe?g|webp)$/i.test(f)) continue;
    const file = path.join(avatarDir, f);
    await checkSize(file, 1024, 1024, `avatar ${f}`);
    await buildAvatar(path.parse(f).name, file);
  }

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  const missing = slugs.filter((s) => !manifest.products[s]);
  console.log(`\nmanifest  ${path.relative(ROOT, MANIFEST)}`);
  if (missing.length) console.log(`no art yet for: ${missing.join(', ')} (old product images kept; hero uses pattern card)`);
  if (warnings.length) console.log('\nWARNINGS\n- ' + warnings.join('\n- '));
})();
