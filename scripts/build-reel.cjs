/**
 * Hero reel cards: assets-src/reel/*.png → public/assets/reel/<name>.webp (+ -540w).
 *
 * The owner's card images sit on a light grey sheet with a soft drop shadow.
 * For each one we find the card itself (pixels that clearly differ from the
 * sheet colour — the shadow is too faint to count), crop to it and cut it out
 * with a rounded-rectangle mask so it sits cleanly on the dark site. Images are
 * never upscaled. Run: npm run reel
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC = path.join(__dirname, '..', 'assets-src', 'reel');
const OUT = path.join(__dirname, '..', 'public', 'assets', 'reel');
const DIFF = 150; // min colour distance (sum over RGB) from the sheet to count as card; the drop shadow stays below it
const RADIUS = 0.085; // corner radius as a share of the card width (slightly rounder than the source cards)
const INSET = 6; // px trimmed inside the detected edge so no sheet colour survives anti-aliasing
/** extra px cut off the bottom of cards whose source has a grey strip there that reads as card */
const EXTRA_BOTTOM = { 'free-fire': 26 };

async function process(file) {
  const name = path.basename(file, path.extname(file));
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const px = (x, y) => { const i = (y * w + x) * c; return [data[i], data[i + 1], data[i + 2]]; };
  const sheet = px(2, 2);
  // The sheet and its drop shadow are light, colourless greys; the card's edge pixels are either dark
  // or clearly coloured. So a pixel counts as card when it is dark, or saturated and not near-white.
  const isCard = (x, y) => {
    const [r, g, b] = px(x, y);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max ? (max - min) / max : 0;
    return max < 110 || (sat > 0.22 && max > 40 && Math.abs(r - sheet[0]) + Math.abs(g - sheet[1]) + Math.abs(b - sheet[2]) > DIFF);
  };

  // bounds: first/last rows and columns where a solid run of card pixels appears
  const rowHas = (y) => { let run = 0; for (let x = 0; x < w; x++) { run = isCard(x, y) ? run + 1 : 0; if (run > w * 0.3) return true; } return false; };
  const colHas = (x) => { let run = 0; for (let y = 0; y < h; y++) { run = isCard(x, y) ? run + 1 : 0; if (run > h * 0.3) return true; } return false; };
  let top = 0; while (top < h && !rowHas(top)) top++;
  let bottom = h - 1; while (bottom > top && !rowHas(bottom)) bottom--;
  let left = 0; while (left < w && !colHas(left)) left++;
  let right = w - 1; while (right > left && !colHas(right)) right--;
  // bright artwork can hide the right edge from the column test; every card has a dark band along its
  // top, so also read the right edge off a few rows just below the top and keep the widest
  for (const f of [0.02, 0.035, 0.05]) {
    const y = Math.round(top + (bottom - top) * f);
    let x = w - 1;
    while (x > left && !isCard(x, y)) x--;
    right = Math.max(right, x);
  }
  // trim a hair inside so no sheet colour survives on the anti-aliased edge
  top += INSET; left += INSET; bottom -= INSET + (EXTRA_BOTTOM[name] ?? 0); right -= INSET;
  const cw = right - left + 1;
  const ch = bottom - top + 1;
  const r = Math.round(cw * RADIUS);
  const mask = Buffer.from(`<svg width="${cw}" height="${ch}"><rect width="${cw}" height="${ch}" rx="${r}" ry="${r}" fill="#fff"/></svg>`);

  const card = await sharp(file)
    .extract({ left, top, width: cw, height: ch })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  await sharp(card).webp({ quality: 92, alphaQuality: 100 }).toFile(path.join(OUT, `${name}.webp`));
  await sharp(card).resize({ width: Math.min(540, cw), withoutEnlargement: true }).webp({ quality: 88, alphaQuality: 100 }).toFile(path.join(OUT, `${name}-540.webp`));
  console.log(`${name}: ${w}x${h} → card ${cw}x${ch} (r=${r})${cw < 2160 ? '  [below 4K — upload a larger original for sharper results]' : ''}`);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const files = fs.readdirSync(SRC).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
  for (const f of files) await process(path.join(SRC, f));
})();
