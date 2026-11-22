/**
 * Category icons: assets-src/categories/sheet.png (the owner's 5 transparent 3D icons on one sheet)
 * → public/assets/categories/<icon>.webp. Each icon is cut out of a fixed box (the sheet's faint
 * labels sit below the boxes and are left out), then trimmed to its visible pixels. Run: npm run cat-icons
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC = path.join(__dirname, '..', 'assets-src', 'categories', 'sheet.png');
const OUT = path.join(__dirname, '..', 'public', 'assets', 'categories');
/** [left, top, right, bottom] of each icon on the 1536×1024 sheet; keys = catalog CategoryIcon */
const BOXES = {
  all: [60, 100, 540, 478],
  best: [545, 60, 1005, 478],
  games: [985, 90, 1460, 478],
  gifts: [255, 555, 725, 905],
  stores: [795, 548, 1265, 905],
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const [name, [l, t, r, b]] of Object.entries(BOXES)) {
    const w = r - l;
    const h = b - t;
    // feather the box edges so the icon's soft glow fades out instead of ending on a hard rectangle
    const f = 0.05;
    const feather = Buffer.from(`<svg width="${w}" height="${h}"><defs>
      <linearGradient id="x"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="${f}" stop-color="#fff"/><stop offset="${1 - f}" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <linearGradient id="y" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="${f}" stop-color="#fff"/><stop offset="${1 - f}" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <mask id="m"><rect width="${w}" height="${h}" fill="url(#y)"/></mask></defs>
      <rect width="${w}" height="${h}" fill="url(#x)" mask="url(#m)"/></svg>`);
    const cut = await sharp(SRC).extract({ left: l, top: t, width: w, height: h }).composite([{ input: feather, blend: 'dest-in' }]).png().toBuffer();
    // trim only the fully clear margin (the soft glow stays)
    const trimmed = await sharp(cut).trim({ threshold: 1 }).png().toBuffer({ resolveWithObject: true });
    await sharp(trimmed.data).webp({ quality: 92, alphaQuality: 100 }).toFile(path.join(OUT, `${name}.webp`));
    console.log(`${name}: ${trimmed.info.width}x${trimmed.info.height}`);
  }
})();
