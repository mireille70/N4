/**
 * Game logos: assets-src/game-logos/<slug>.png (the owner's black marks on white)
 * → public/assets/game-logos/<slug>.webp as WHITE marks on a transparent background,
 * so they sit on the gradient tiles. Alpha comes from darkness (black = opaque, white = clear,
 * anti-aliased edges stay smooth); then trimmed and fitted in a 640px box.
 * Run: node scripts/build-game-logos.cjs
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC = path.join(__dirname, '..', 'assets-src', 'game-logos');
const OUT = path.join(__dirname, '..', 'public', 'assets', 'game-logos');

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const file of fs.readdirSync(SRC).filter((f) => f.endsWith('.png'))) {
    // flatten any transparency onto white first, then one grey channel per pixel
    const { data, info } = await sharp(path.join(SRC, file)).flatten({ background: '#ffffff' }).toColourspace('b-w').raw().toBuffer({ resolveWithObject: true });
    if (info.channels !== 1) throw new Error(`${file}: expected 1 channel, got ${info.channels}`);
    const out = Buffer.alloc(info.width * info.height * 4);
    for (let i = 0; i < info.width * info.height; i++) {
      // stretch so near-white paper is fully clear and near-black ink fully opaque
      const a = Math.max(0, Math.min(255, Math.round(((235 - data[i]) / 215) * 255)));
      out[i * 4] = out[i * 4 + 1] = out[i * 4 + 2] = 255;
      out[i * 4 + 3] = a;
    }
    const png = await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
    const trimmed = await sharp(png).trim({ threshold: 1 }).png().toBuffer();
    const dest = path.join(OUT, file.replace('.png', '.webp'));
    await sharp(trimmed).resize(640, 640, { fit: 'inside' }).webp({ quality: 92, alphaQuality: 100 }).toFile(dest);
    const m = await sharp(dest).metadata();
    console.log(`${file}: ${m.width}x${m.height}`);
  }
})();
