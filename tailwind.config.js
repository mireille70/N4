/**
 * Tailwind reads every design value from CSS variables that ThemeProvider
 * writes from src/theme/themeConfig.ts — edit the config, not this file.
 */
const c = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    screens: { sm: '480px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1440px' },
    extend: {
      colors: {
        bg: c('bg'),
        surface: c('surface'),
        raised: c('raised'),
        accent: c('accent'),
        gold: c('gold'),
        paper: c('paper'),
        ink: c('ink'),
        fg: c('fg'),
        muted: c('muted'),
        line: c('line'),
        danger: c('danger'),
        /** text on the ember accent (near-black for contrast) */
        onaccent: '#04140F',
        copper: '#17806F',
        burnt: '#2BB9A1',
        amber: '#8BEBDA',
        elevated: '#0A1F17',
        container: '#040F0A',
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
        mono: 'var(--font-mono)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        lift: 'var(--shadow-lift)',
        stage: 'var(--shadow-stage)',
      },
      maxWidth: { container: 'var(--container)', narrow: 'var(--container-narrow)' },
      spacing: { section: 'var(--section-y)', gutter: 'var(--gutter)' },
      transitionDuration: { DEFAULT: 'var(--dur)', slow: 'var(--dur-slow)' },
      transitionTimingFunction: { DEFAULT: 'cubic-bezier(.2,.7,.2,1)' },
    },
  },
  plugins: [],
};
