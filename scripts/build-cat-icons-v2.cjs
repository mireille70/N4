/**
 * Category icons v2: assets-src/categories/v2/<icon>.png (the owner's 3D icons, each on a flat
 * light backdrop) → public/assets/categories/<icon>.webp with a transparent background.
 *
 * The backdrop colour is sampled from the corners. Starting from the image border, every connected
 * pixel close to that colour is treated as backdrop: its alpha follows how far it is from the
 * backdrop, and its colour is "un-blended" from it, so the soft contact shadow survives as a real
 * translucent shadow. Light parts inside the icon (e.g. a white controller) are not connected to
 * the border, so they stay opaque. Then trimmed and resized. Run: node scripts/build-cat-icons-v2.cjs
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC = path.join(__dirname, '..', 'assets-src', 'categories', 'v2');
const OUT = path.join(__dirname, '..', 'public', 'assets', 'categories');
const NAMES = ['all', 'best', 'games', 'gifts', 'stores'];
const NEAR = 60; // max colour distance still counted as backdrop/shadow (flood limit)
const CLEAR = 6; // distance below which a pixel is fully transparent
const SIZE = 560; // output box (longest side)
/** the controller's handle opening */
const SEEDS = { all: [[0.5, 0.64]] };

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const name of NAMES) {
    const { data, info } = await sharp(path.join(SRC, `${name}.png`)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width: w, height: h } = info;
    const px = (x, y) => (y * w + x) * 3;

    // backdrop = average of the four corner patches
    const bg = [0, 0, 0];
    let n = 0;
    for (const [cx, cy] of [[0, 0], [w - 12, 0], [0, h - 12], [w - 12, h - 12]]) {
      for (let y = cy; y < cy + 12; y++) for (let x = cx; x < cx + 12; x++) { const i = px(x, y); bg[0] += data[i]; bg[1] += data[i + 1]; bg[2] += data[i + 2]; n++; }
    }
    bg.forEach((_, k) => (bg[k] /= n));
    const dist = (i) => Math.hypot(data[i] - bg[0], data[i + 1] - bg[1], data[i + 2] - bg[2]);

    // flood from the border through near-backdrop pixels
    const isBg = new Uint8Array(w * h);
    const stack = [];
    const push = (x, y) => { const k = y * w + x; if (!isBg[k] && dist(k * 3) < NEAR) { isBg[k] = 1; stack.push(k); } };
    for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
    for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
    // enclosed see-through holes (fractions of width/height) that the border flood cannot reach
    for (const [fx, fy] of SEEDS[name] ?? []) push(Math.round(fx * w), Math.round(fy * h));
    while (stack.length) {
      const k = stack.pop();
      const x = k % w;
      const y = (k - x) / w;
      if (x > 0) push(x - 1, y);
      if (x < w - 1) push(x + 1, y);
      if (y > 0) push(x, y - 1);
      if (y < h - 1) push(x, y + 1);
    }

    const out = Buffer.alloc(w * h * 4);
    for (let k = 0; k < w * h; k++) {
      const i = k * 3;
      const o = k * 4;
      let a = 1;
      if (isBg[k]) a = Math.max(0, Math.min(1, (dist(i) - CLEAR) / (NEAR - CLEAR)));
      for (let c = 0; c < 3; c++) {
        // un-blend from the backdrop so the pixel composites back to its original colour
        const v = a > 0 ? (data[i + c] - bg[c] * (1 - a)) / a : 0;
        out[o + c] = Math.max(0, Math.min(255, Math.round(v)));
      }
      out[o + 3] = Math.round(a * 255);
    }

    const trimmed = await sharp(out, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
    const t = await sharp(trimmed).trim({ threshold: 1 }).png().toBuffer();
    await sharp(t).resize(SIZE, SIZE, { fit: 'inside' }).webp({ quality: 90, alphaQuality: 100 }).toFile(path.join(OUT, `${name}.webp`));
    const meta = await sharp(path.join(OUT, `${name}.webp`)).metadata();
    console.log(`${name}: bg rgb(${bg.map(Math.round).join(',')}) → ${meta.width}x${meta.height}`);
  }
})();
