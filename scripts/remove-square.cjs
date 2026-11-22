/**
 * One-off: removes the white rounded-square placeholder from the top-left of each reel card source
 * (assets-src/reel/*.png) at full resolution — no scaling, so nothing gets pixelated.
 *
 * The hole is filled by Poisson ("seamless") cloning: a nearby patch of the same card is copied in for
 * its texture/grain, and a smooth correction is solved so its edges match the surrounding colours
 * exactly. Originals are backed up to assets-src/reel-with-square/ first (never overwritten).
 * Run: node scripts/remove-square.cjs   then   npm run reel
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC = path.join(__dirname, '..', 'assets-src', 'reel');
const BAK = path.join(__dirname, '..', 'assets-src', 'reel-with-square');
const PAD = { roblox: 12 }; // roblox's square has a dark frame around it
const DEFAULT_PAD = 7;

async function fix(file) {
  const name = path.basename(file, '.png');
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const s = w / 1080;
  const at = (x, y, ch) => data[(y * w + x) * 3 + ch];

  // bounding box of near-white pixels in the expected square area
  const bx0 = Math.round(90 * s), bx1 = Math.round(280 * s);
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let y = bx0; y < bx1; y++) for (let x = bx0; x < bx1; x++) {
    if (at(x, y, 0) > 235 && at(x, y, 1) > 235 && at(x, y, 2) > 235) {
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    }
  }
  if (x1 < 0) { console.log(`${name}: no square found, skipped`); return; }
  const pad = Math.round((PAD[name] ?? DEFAULT_PAD) * s);
  x0 -= pad; y0 -= pad; x1 += pad; y1 += pad;
  const hw = x1 - x0 + 1, hh = y1 - y0 + 1;

  // pick a source patch: same size, nearby, not overlapping the hole, whose border best matches the hole's border
  const border = [];
  for (let x = x0 - 1; x <= x1 + 1; x++) border.push([x, y0 - 1], [x, y1 + 1]);
  for (let y = y0; y <= y1; y++) border.push([x0 - 1, y], [x1 + 1, y]);
  let best = null;
  for (let dist = Math.max(hw, hh) + 4; dist <= Math.max(hw, hh) * 2; dist += 8) {
    for (let a = 0; a < 32; a++) {
      const ang = (a / 32) * Math.PI * 2;
      const dx = Math.round(Math.cos(ang) * dist), dy = Math.round(Math.sin(ang) * dist);
      if (x0 - 1 + dx < 20 * s || y0 - 1 + dy < 40 * s || x1 + 1 + dx >= w - 20 * s || y1 + 1 + dy >= h - 20 * s) continue;
      // reject patches holding bright pixels (text, logos) or overlapping the hole
      if (Math.abs(dx) <= hw + 2 && Math.abs(dy) <= hh + 2) continue;
      let bright = 0, total = 0;
      for (let y = y0; y <= y1; y += 2) for (let x = x0; x <= x1; x += 2) {
        total++;
        if (Math.max(at(x + dx, y + dy, 0), at(x + dx, y + dy, 1), at(x + dx, y + dy, 2)) > 170) bright++;
      }
      if (bright > total * 0.002) continue;
      // cost = variance of (target - source) along the border → how smooth the correction must be
      let cost = 0;
      for (let ch = 0; ch < 3; ch++) {
        let sum = 0, sq = 0;
        for (const [x, y] of border) { const d = at(x, y, ch) - at(x + dx, y + dy, ch); sum += d; sq += d * d; }
        cost += sq / border.length - (sum / border.length) ** 2;
      }
      if (!best || cost < best.cost) best = { dx, dy, cost };
    }
  }
  // no clean patch nearby → plain smooth (harmonic) fill: copy "nothing" and let the correction do it all
  if (!best) best = { dx: 0, dy: 0, cost: NaN, flat: true };
  const src = (x, y, ch) => (best.flat ? 0 : src(x, y, ch));

  // solve Laplace for the correction d inside the hole (Dirichlet: d = target - source on the border), SOR
  const out = Buffer.from(data);
  const W = hw + 2, H = hh + 2;
  for (let ch = 0; ch < 3; ch++) {
    const d = new Float64Array(W * H);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      if (i === 0 || j === 0 || i === W - 1 || j === H - 1) {
        const x = x0 - 1 + i, y = y0 - 1 + j;
        d[j * W + i] = at(x, y, ch) - src(x, y, ch);
      }
    }
    // initialise interior with the mean border correction to speed up convergence
    let m = 0, n = 0;
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (i === 0 || j === 0 || i === W - 1 || j === H - 1) { m += d[j * W + i]; n++; }
    m /= n;
    for (let j = 1; j < H - 1; j++) for (let i = 1; i < W - 1; i++) d[j * W + i] = m;
    const omega = 1.94;
    for (let it = 0; it < 1500; it++) {
      for (let j = 1; j < H - 1; j++) for (let i = 1; i < W - 1; i++) {
        const k = j * W + i;
        const g = (d[k - 1] + d[k + 1] + d[k - W] + d[k + W]) / 4;
        d[k] += omega * (g - d[k]);
      }
    }
    for (let j = 1; j < H - 1; j++) for (let i = 1; i < W - 1; i++) {
      const x = x0 - 1 + i, y = y0 - 1 + j;
      const v = src(x, y, ch) + d[j * W + i];
      out[(y * w + x) * 3 + ch] = Math.max(0, Math.min(255, Math.round(v)));
    }
  }

  fs.mkdirSync(BAK, { recursive: true });
  const bak = path.join(BAK, path.basename(file));
  if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);
  await sharp(out, { raw: { width: w, height: h, channels: 3 } }).png({ compressionLevel: 9 }).toFile(file + '.tmp');
  fs.renameSync(file + '.tmp', file);
  console.log(`${name}: filled ${hw}x${hh} at (${x0},${y0}) from offset (${best.dx},${best.dy}) cost ${best.cost.toFixed(1)}`);
}

(async () => {
  for (const f of fs.readdirSync(SRC).filter((f) => f.endsWith('.png'))) await fix(path.join(SRC, f));
})();
