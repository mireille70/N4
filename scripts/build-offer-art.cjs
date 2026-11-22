/**
 * Offer banner characters: public/assets/reel/<key>.webp (made by `npm run reel`) → public/assets/offers/<key>.webp.
 * Each tall card is cropped to its character, leaving out the logo strip and the white badge square
 * at the top-left, so the banner can blend the character into its own backdrop. Boxes are fractions of
 * the card [left, top, right, bottom]. Run after `npm run reel`: npm run offer-art
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC = path.join(__dirname, '..', 'public', 'assets', 'reel');
const OUT = path.join(__dirname, '..', 'public', 'assets', 'offers');
const BOXES = {
  'call-of-duty': [0.27, 0.15, 1, 0.86],
  valorant: [0.22, 0.14, 1, 0.86],
  pubg: [0.35, 0.14, 1, 0.86],
  roblox: [0.25, 0.13, 1, 0.88],
  'free-fire': [0.24, 0.13, 1, 0.86],
  fortnite: [0.22, 0.14, 1, 0.86],
  'lords-mobile': [0.3, 0.12, 1, 0.86],
  'yalla-ludo': [0.27, 0.4, 1, 0.96],
};
const EDGE = 0.012; // keep clear of the card's rounded corners / edge

/**
 * Full banner scenes the owner made (assets-src/offers/<file>): the art half is cut out as
 * public/assets/offers/<key>-scene.webp and used as the banner's art side. Box = fractions [l, t, r, b].
 */
const SCENES = {
  pubg: ['pubg-banner.png', [0, 0, 0.6, 1]],
  valorant: ['valorant-banner.png', [0, 0, 0.56, 1]],
  roblox: ['roblox-banner.png', [0, 0, 0.57, 1]],
  'call-of-duty': ['call-of-duty-banner.png', [0, 0, 0.515, 1]],
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const [key, [file, [l, t, r, b]]] of Object.entries(SCENES)) {
    const src = path.join(__dirname, '..', 'assets-src', 'offers', file);
    if (!fs.existsSync(src)) continue;
    const { width: w, height: h } = await sharp(src).metadata();
    const box = { left: Math.round(w * l), top: Math.round(h * t), width: Math.round(w * (r - l)), height: Math.round(h * (b - t)) };
    await sharp(src).extract(box).webp({ quality: 92 }).toFile(path.join(OUT, `${key}-scene.webp`));
    console.log(`${key}-scene: ${box.width}x${box.height}${w < 3840 ? '  [below 4K]' : ''}`);
  }
  for (const [key, [l, t, r, b]] of Object.entries(BOXES)) {
    const file = path.join(SRC, `${key}.webp`);
    const { width: w, height: h } = await sharp(file).metadata();
    const left = Math.round(w * Math.max(l, EDGE));
    const top = Math.round(h * Math.max(t, EDGE));
    const width = Math.round(w * Math.min(r, 1 - EDGE)) - left;
    const height = Math.round(h * Math.min(b, 1 - EDGE)) - top;
    await sharp(file).extract({ left, top, width, height }).flatten({ background: '#030303' }).webp({ quality: 90 }).toFile(path.join(OUT, `${key}.webp`));
    console.log(`${key}: ${width}x${height}`);
  }
})();
