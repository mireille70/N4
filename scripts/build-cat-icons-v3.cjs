/**
 * Category icons v3: assets-src/categories/v3/<icon>.png (the owner's white/pastel 3D icons, already
 * transparent but with stray specks left over from the cut-out) → public/assets/categories/<icon>.webp.
 *
 * Cleaning: pixels with alpha ≥ SOLID form a mask; its connected pieces are found and only the big
 * ones (≥ KEEP of the largest) are kept — that drops the specks around the icon and inside openings
 * such as the controller's handle. The kept mask is grown by GROW px so the icon's soft edge and glow
 * survive; everything outside it becomes fully clear. Then trimmed and fitted in a SIZE box.
 * Run: node scripts/build-cat-icons-v3.cjs
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC = path.join(__dirname, '..', 'assets-src', 'categories', 'v3');
const OUT = path.join(__dirname, '..', 'public', 'assets', 'categories');
const NAMES = ['all', 'best', 'games', 'gifts', 'stores'];
const SOLID = 200; // alpha that counts as part of the icon body
const KEEP = 0.02; // keep pieces at least this share of the largest piece
const GROW = 6; // px of soft edge kept around the body
const SIZE = 560;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const name of NAMES) {
    const { data, info } = await sharp(path.join(SRC, `${name}.png`)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width: w, height: h } = info;
    const N = w * h;

    // label connected pieces of the solid mask (4-neighbour flood fill)
    const label = new Int32Array(N);
    const sizes = [0];
    for (let s = 0; s < N; s++) {
      if (label[s] || data[s * 4 + 3] < SOLID) continue;
      const id = sizes.length;
      let count = 0;
      const stack = [s];
      label[s] = id;
      while (stack.length) {
        const k = stack.pop();
        count++;
        const x = k % w;
        const y = (k - x) / w;
        for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const nk = ny * w + nx;
          if (!label[nk] && data[nk * 4 + 3] >= SOLID) { label[nk] = id; stack.push(nk); }
        }
      }
      sizes.push(count);
    }
    const largest = Math.max(...sizes);
    const keepId = sizes.map((c) => c >= largest * KEEP);

    // kept body, then grow it by GROW px (two passes of a square max filter)
    let keep = new Uint8Array(N);
    for (let k = 0; k < N; k++) if (label[k] && keepId[label[k]]) keep[k] = 1;
    const grow = (src, horizontal) => {
      const dst = new Uint8Array(N);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        let on = 0;
        for (let d = -GROW; d <= GROW && !on; d++) {
          const xx = horizontal ? x + d : x;
          const yy = horizontal ? y : y + d;
          if (xx >= 0 && yy >= 0 && xx < w && yy < h && src[yy * w + xx]) on = 1;
        }
        dst[y * w + x] = on;
      }
      return dst;
    };
    keep = grow(grow(keep, true), false);

    let dropped = 0;
    for (let k = 0; k < N; k++) if (!keep[k] && data[k * 4 + 3] > 0) { data[k * 4 + 3] = 0; dropped++; }

    const png = await sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
    const trimmed = await sharp(png).trim({ threshold: 1 }).png().toBuffer();
    const dest = path.join(OUT, `${name}.webp`);
    await sharp(trimmed).resize(SIZE, SIZE, { fit: 'inside' }).webp({ quality: 90, alphaQuality: 100 }).toFile(dest);
    const m = await sharp(dest).metadata();
    console.log(`${name}: kept ${keepId.filter(Boolean).length} piece(s), cleared ${dropped} speck px → ${m.width}x${m.height}`);
  }
})();
