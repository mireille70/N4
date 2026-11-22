
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => ({
  plugins: [react()],

  // GitHub Pages deployment
  base: '/N4/',

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

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
      rollupOptions: {
        output: { inlineDynamicImports: true },
      },
    },
  }),
}));
