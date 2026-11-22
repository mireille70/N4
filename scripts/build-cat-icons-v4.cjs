/**
 * Category icons v4: assets-src/categories/v4/sheet.png — the owner's five 3D icons in one row on a
 * transparent sheet (with stray specks from the cut-out) → public/assets/categories/<icon>.webp.
 *
 * 1. Split: columns that contain solid icon pixels form bands; the five widest bands, left to right,
 *    are the icons (ORDER below).
 * 2. Clean each band: solid pixels (alpha ≥ SOLID) are grouped into connected pieces; pieces smaller
 *    than KEEP of the largest are specks and dropped (small real parts such as sparkles stay above
 *    it). The kept body is grown by GROW px so soft edges and glow survive; the rest becomes clear.
 * 3. Trim and fit in a SIZE box.  Run: node scripts/build-cat-icons-v4.cjs
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC = path.join(__dirname, '..', 'assets-src', 'categories', 'v4', 'sheet.png');
const OUT = path.join(__dirname, '..', 'public', 'assets', 'categories');
const ORDER = ['all', 'stores', 'best', 'gifts', 'games']; // left → right on the sheet
const SOLID = 200;
const KEEP = 0.004;
const GROW = 6;
const SIZE = 560;
const MIN_GAP = 12; // empty columns needed between two icons

function clean(data, w, h) {
  const N = w * h;
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
      if (x > 0 && !label[k - 1] && data[(k - 1) * 4 + 3] >= SOLID) { label[k - 1] = id; stack.push(k - 1); }
      if (x < w - 1 && !label[k + 1] && data[(k + 1) * 4 + 3] >= SOLID) { label[k + 1] = id; stack.push(k + 1); }
      if (y > 0 && !label[k - w] && data[(k - w) * 4 + 3] >= SOLID) { label[k - w] = id; stack.push(k - w); }
      if (y < h - 1 && !label[k + w] && data[(k + w) * 4 + 3] >= SOLID) { label[k + w] = id; stack.push(k + w); }
    }
    sizes.push(count);
  }
  const largest = Math.max(...sizes);
  let keep = new Uint8Array(N);
  for (let k = 0; k < N; k++) if (label[k] && sizes[label[k]] >= largest * KEEP) keep[k] = 1;
  const grow = (src, horizontal) => {
    const dst = new Uint8Array(N);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      for (let d = -GROW; d <= GROW; d++) {
        const xx = horizontal ? x + d : x;
        const yy = horizontal ? y : y + d;
        if (xx >= 0 && yy >= 0 && xx < w && yy < h && src[yy * w + xx]) { dst[y * w + x] = 1; break; }
      }
    }
    return dst;
  };
  keep = grow(grow(keep, true), false);
  for (let k = 0; k < N; k++) if (!keep[k]) data[k * 4 + 3] = 0;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;

  // columns with enough solid pixels (a few specks don't count)
  const col = new Array(W).fill(0);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (data[(y * W + x) * 4 + 3] >= SOLID) col[x]++;
  const bands = [];
  let start = -1;
  let gap = 0;
  for (let x = 0; x <= W; x++) {
    const on = x < W && col[x] > 3;
    if (on) { if (start < 0) start = x; gap = 0; }
    else if (start >= 0 && ++gap >= MIN_GAP) { bands.push([start, x - gap]); start = -1; gap = 0; }
  }
  const icons = bands.sort((a, b) => (b[1] - b[0]) - (a[1] - a[0])).slice(0, ORDER.length).sort((a, b) => a[0] - b[0]);
  if (icons.length !== ORDER.length) throw new Error(`found ${icons.length} icons, expected ${ORDER.length}: ${JSON.stringify(bands)}`);

  for (let i = 0; i < icons.length; i++) {
    const pad = 20;
    const left = Math.max(0, icons[i][0] - pad);
    const right = Math.min(W - 1, icons[i][1] + pad);
    const w = right - left + 1;
    const band = Buffer.alloc(w * H * 4);
    for (let y = 0; y < H; y++) data.copy(band, y * w * 4, (y * W + left) * 4, (y * W + right + 1) * 4);
    clean(band, w, H);
    const png = await sharp(band, { raw: { width: w, height: H, channels: 4 } }).png().toBuffer();
    const trimmed = await sharp(png).trim({ threshold: 1 }).png().toBuffer();
    const dest = path.join(OUT, `${ORDER[i]}.webp`);
    await sharp(trimmed).resize(SIZE, SIZE, { fit: 'inside' }).webp({ quality: 90, alphaQuality: 100 }).toFile(dest);
    const m = await sharp(dest).metadata();
    console.log(`${ORDER[i]}: columns ${icons[i][0]}–${icons[i][1]} → ${m.width}x${m.height}`);
  }
})();
