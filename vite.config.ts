import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// GitHub Pages project site: https://mireille70.github.io/N4/
const PAGES_BASE = '/N4/';

// The app references public files as root-absolute literals (`/assets/...`, built at runtime and
// in data files), which would 404 under a sub-path. Prefix them with the base at build time so the
// source stays untouched. Not used in `single` mode (its inlining shim expects `/assets/...`).
const prefixPublicAssets = (base: string): Plugin => ({
  name: 'prefix-public-assets',
  enforce: 'pre',
  transform(code, id) {
    if (!/[\\/]src[\\/].*\.(tsx?|json)$/.test(id) || !code.includes('/assets/')) return null;
    return { code: code.replace(/(["'`]|,\s)\/assets\//g, `$1${base}assets/`), map: null };
  },
});

export default defineConfig(({ mode }) => ({
  base: PAGES_BASE,
  plugins: [react(), ...(mode === 'single' ? [] : [prefixPublicAssets(PAGES_BASE)])],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: {
    port: 5173,
    // raw artwork is only read by `npm run images`; watching it can crash the dev server (EBUSY) while large files copy in
    watch: { ignored: ['**/assets-src/**'] },
  },
  // `vite build --mode single` (npm run build:single): one JS + one CSS file with relative
  // paths, which scripts/build-single.cjs then inlines — with every image — into one HTML
  ...(mode === 'single' && {
    base: './',
    build: {
      outDir: 'dist-single',
      emptyOutDir: true,
      copyPublicDir: false,
      cssCodeSplit: false,
      assetsInlineLimit: 100_000_000,
      modulePreload: false,
      rollupOptions: { output: { inlineDynamicImports: true } },
    },
  }),
}));
