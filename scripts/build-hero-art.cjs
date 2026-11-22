const sharp = require('sharp'); const fs = require('fs'); const path = require('path');
const src = path.resolve('assets-src/hero'), out = path.resolve('public/assets/hero');
(async () => { for (const f of fs.readdirSync(src).filter((f) => f.endsWith('.png'))) {
  const info = await sharp(path.join(src, f)).resize({ width: 900, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(out, f.replace('.png', '.webp')));
  console.log(f, info.width + 'x' + info.height, info.size);
} })();
