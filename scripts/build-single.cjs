/**
 * Single-file build: `npm run build:single` → koon-site.html (project root).
 *
 * 1. `vite build --mode single` makes one JS + one CSS bundle (see vite.config.ts).
 * 2. This script inlines both into the HTML and embeds every file in public/ as a data URI.
 *    Image paths in the app are built at runtime (e.g. `/assets/hero/${slug}.webp`), so they
 *    can't be rewritten in the bundle; instead a tiny shim, run before the app, swaps any
 *    `/assets/...` src / srcset / href for its embedded copy as the page sets it.
 * The result opens straight from disk (pages use #/ URLs) — no server needed.
 * Fonts still load from Google Fonts, so they need an internet connection.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist-single');
const PUBLIC = path.join(ROOT, 'public');
const OUT = path.join(ROOT, 'koon-site.html');
const MIME = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.gif': 'image/gif', '.ico': 'image/x-icon' };

execSync('npx vite build --mode single', { cwd: ROOT, stdio: 'inherit' });

let html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const read = (rel) => fs.readFileSync(path.join(DIST, rel.replace(/^\.\//, '')), 'utf8');

// inline CSS
html = html.replace(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (_, href) => `<style>${read(href)}</style>`);

// collect public files → data URIs
const assets = {};
(function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) { walk(full); continue; }
    const type = MIME[path.extname(name).toLowerCase()];
    if (!type) continue;
    const key = '/' + path.relative(PUBLIC, full).split(path.sep).join('/');
    assets[key] = `data:${type};base64,${fs.readFileSync(full).toString('base64')}`;
  }
})(PUBLIC);

const shim = `(function(){
var A=${JSON.stringify(assets)};
function one(u){if(!u||u.slice(0,5)==='data:')return u;var k=u.replace(/^(\\.\\/|https?:\\/\\/[^/]+|file:\\/\\/[^]*?(?=\\/assets\\/|\\/favicon))/,'');if(k.charAt(0)!=='/')k='/'+k;k=k.split(/[?#]/)[0];return A[k]||u;}
function set(u){return String(u).split(',').map(function(p){var t=p.trim().split(/\\s+/);t[0]=one(t[0]);return t.join(' ');}).join(', ');}
var sa=Element.prototype.setAttribute;
Element.prototype.setAttribute=function(n,v){var l=String(n).toLowerCase();if(l==='src'||l==='href')v=one(String(v));else if(l==='srcset')v=set(v);return sa.call(this,n,v);};
function patch(proto,prop,fn){var d=Object.getOwnPropertyDescriptor(proto,prop);if(!d||!d.set)return;Object.defineProperty(proto,prop,{get:d.get,set:function(v){d.set.call(this,fn(v));},configurable:true});}
patch(HTMLImageElement.prototype,'src',function(v){return one(String(v));});
patch(HTMLImageElement.prototype,'srcset',set);
patch(HTMLSourceElement.prototype,'srcset',set);
})();`;

// inline JS (after the shim). Escape "</script" so the bundle can't close its own tag.
html = html.replace(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/, (_, src) =>
  `<script>${shim}</script>\n<script type="module">${read(src).replace(/<\/script/gi, '<\\/script')}</script>`);

// favicon
html = html.replace(/href="\.?\/favicon\.svg"/, () => `href="${assets['/favicon.svg'] || ''}"`);

fs.writeFileSync(OUT, html);
const mb = (fs.statSync(OUT).size / 1024 / 1024).toFixed(1);
console.log(`\n✔ ${path.relative(ROOT, OUT)} — ${mb} MB, ${Object.keys(assets).length} embedded files`);
