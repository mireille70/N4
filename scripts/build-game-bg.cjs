/**
 * Game card backgrounds: assets-src/game-bg/sheet.png — the owner's ten tall game artworks laid out
 * on a white sheet (rows of 4, 4, 2) → public/assets/game-bg/<slug>.webp.
 *
 * Rows are found from the rows of pixels that hold artwork (not near-white), then the panels inside
 * each row from its columns. Each panel is cropped a few px inside its edge (no white seam) and
 * saved at 2× a 300px-wide card. Run: node scripts/build-game-bg.cjs
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC = path.join(__dirname, '..', 'assets-src', 'game-bg', 'sheet.png');
const OUT = path.join(__dirname, '..', 'public', 'assets', 'game-bg');
/** panels in reading order (left → right, top → bottom) */
const ORDER = ['pubg', 'valorant', 'free-fire', 'call-of-duty', 'mobile-legends', 'roblox', 'yalla-ludo', 'apex-legends', 'genshin-impact', 'lords-mobile'];
const INSET = 4;

/** runs of indices where on(i) holds, ignoring runs shorter than min */
const runs = (n, on, min) => {
  const out = [];
  let s = -1;
  for (let i = 0; i <= n; i++) {
    if (i < n && on(i)) { if (s < 0) s = i; } else if (s >= 0) { if (i - s >= min) out.push([s, i - 1]); s = -1; }
  }
  return out;
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const ink = (x, y) => { const i = (y * W + x) * 3; return data[i] < 235 || data[i + 1] < 235 || data[i + 2] < 235; };

  const rowCount = (y, x0 = 0, x1 = W - 1) => { let c = 0; for (let x = x0; x <= x1; x++) if (ink(x, y)) c++; return c; };
  const rows = runs(H, (y) => rowCount(y) > W * 0.15, 40);
  const panels = [];
  for (const [y0, y1] of rows) {
    const mid = Math.round((y0 + y1) / 2);
    // columns that hold artwork across most of the row band
    const colOn = (x) => { let c = 0; for (let y = y0; y <= y1; y += 4) if (ink(x, y)) c++; return c > ((y1 - y0) / 4) * 0.6; };
    for (const [x0, x1] of runs(W, colOn, 40)) panels.push({ x0, x1, y0, y1, mid });
  }
  if (panels.length !== ORDER.length) throw new Error(`found ${panels.length} panels: ${JSON.stringify(panels)}`);

  for (let i = 0; i < panels.length; i++) {
    const p = panels[i];
    const left = p.x0 + INSET;
    const top = p.y0 + INSET;
    const width = p.x1 - p.x0 + 1 - INSET * 2;
    const height = p.y1 - p.y0 + 1 - INSET * 2;
    const dest = path.join(OUT, `${ORDER[i]}.webp`);
    await sharp(SRC).extract({ left, top, width, height }).resize({ width: 600, withoutEnlargement: false }).webp({ quality: 84 }).toFile(dest);
    console.log(`${ORDER[i]}: ${width}x${height} at ${left},${top}`);
  }
})();
