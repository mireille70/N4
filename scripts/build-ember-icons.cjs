/**
 * Obsidian Ember: warm-toned copies of the category 3D icons.
 * Reads public/assets/categories/<name>.webp (left untouched) and writes
 * public/assets/categories/ember/<name>.webp — mapped by luminance onto a satin-graphite ramp
 * whose highlights warm toward copper/amber, so the icons read as matte objects under warm light.
 *   node scripts/build-ember-icons.cjs
 */
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const SRC = path.join(__dirname, '..', 'public', 'assets', 'categories');
const OUT = path.join(SRC, 'ember');
const NAMES = ['all', 'best', 'games', 'gifts', 'stores'];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const name of NAMES) {
    const src = path.join(SRC, `${name}.webp`);
    const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    // luminance → satin graphite ramp with a warm (copper → amber) lift in the highlights
    const stops = [[0, [14, 14, 16]], [0.45, [70, 66, 64]], [0.72, [150, 112, 88]], [0.9, [222, 176, 140]], [1, [255, 232, 214]]];
    const ramp = (t) => {
      for (let i = 1; i < stops.length; i++) {
        const [t1, c1] = stops[i];
        const [t0, c0] = stops[i - 1];
        if (t <= t1) { const k = (t - t0) / (t1 - t0); return c0.map((v, j) => v + (c1[j] - v) * k); }
      }
      return stops[stops.length - 1][1];
    };
    for (let p = 0; p < data.length; p += 4) {
      const l = (0.2126 * data[p] + 0.7152 * data[p + 1] + 0.0722 * data[p + 2]) / 255;
      const [r, g, b] = ramp(Math.pow(l, 1.15));
      data[p] = r; data[p + 1] = g; data[p + 2] = b;
    }
    await sharp(data, { raw: info }).webp({ quality: 90, alphaQuality: 100 }).toFile(path.join(OUT, `${name}.webp`));
    console.log('ember icon:', name);
  }
})();
