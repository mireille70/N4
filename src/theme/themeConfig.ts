/**
 * THEME CONFIGURATION — the single source of truth for the visual system.
 *
 * "Obsidian Ember" — cinematic dark UI, industrial minimalism, matte black
 * surfaces lit by warm orange studio light. ≈80% near-black / charcoal
 * surfaces, ≈15% typography and neutral detail, ≈5% ember accent. Everything visual is
 * injected as CSS variables / data-attributes by <ThemeProvider>; the gradient
 * presets, elevation and motion tokens live in src/styles/index.css (:root).
 * Content lives separately in src/content.
 */

export type MotionLevel = 'off' | 'subtle' | 'full';
export type ButtonShape = 'notched' | 'rounded' | 'pill';
export type ProductCardVariant = 'poster' | 'framed';
export type BannerStyle = 'editorial' | 'solid';

export interface ThemeConfig {
  colors: {
    /** Page background */
    bg: string;
    /** Elevated surface (cards, inputs) */
    surface: string;
    /** Soft fill between bg and surface */
    raised: string;
    /** Functional accent — focus, active states, small highlights */
    accent: string;
    /** Secondary accent — discount tags */
    gold: string;
    /** Contrast-section surface */
    paper: string;
    /** Dark ink — primary buttons and text on paper */
    ink: string;
    /** Primary text */
    fg: string;
    muted: string;
    line: string;
    danger: string;
  };
  lightColors: ThemeConfig['colors'];
  /** Pastel tile tints, cycled across category cards (exposed as --tint-0…n) */
  tints: string[];
  colorScheme: 'light' | 'dark';
  /** Colour scopes: partial palettes applied to any element with the class `scope-<name>` */
  scopes: Record<string, Partial<ThemeConfig['colors']> & { colorScheme?: 'light' | 'dark' }>;
  fonts: { display: string; body: string; mono: string };
  /** 8 / 16 / 24 / 32 — controls, buttons, cards, large containers */
  radius: { sm: number; md: number; lg: number; xl: number };
  notch: number;
  shadows: { card: string; lift: string; stage: string };
  spacing: {
    /** Vertical section padding, mobile → desktop (fluid in between) */
    section: [number, number];
    /** Horizontal page gutter, mobile → desktop */
    gutter: [number, number];
  };
  container: { max: number; narrow: number };
  grid: {
    products: { mobile: number; tablet: number; desktop: number };
    gap: [number, number];
  };
  productCard: {
    variant: ProductCardVariant;
    aspect: string;
    showEnglishName: boolean;
    quickAdd: boolean;
  };
  banner: { style: BannerStyle; showGeometry: boolean };
  buttons: { shape: ButtonShape; height: [number, number] };
  motion: MotionLevel;
  mobile: { bottomNav: boolean; stickyBuyBar: boolean };
  features: { showRatings: boolean };
}

export const themeConfig: ThemeConfig = {
  colors: {
    bg: '#04110B',
    surface: '#06130E',
    raised: '#0A1F17',
    accent: '#3FD8C0',
    gold: '#8BEBDA',
    paper: '#06130E',
    /** charcoal ink: toasts and secondary solid buttons (light text on top) */
    ink: '#0A1F17',
    fg: '#F2F7F4',
    muted: '#8FA89E',
    line: '#15352A',
    danger: '#E5484D',
  },
  // light-mode palette (applied by ThemeProvider when the visitor picks light)
  lightColors: {
    bg: '#F2F8F5',
    surface: '#FFFFFF',
    raised: '#E4EFE9',
    accent: '#0E9C86',
    gold: '#17806F',
    paper: '#FFFFFF',
    ink: '#0B2A20',
    fg: '#0A1F17',
    muted: '#4F6B5F',
    line: '#CBDDD3',
    danger: '#D93036',
  },
  // matte neutrals with a faint warm cast — cycled across tiles
  tints: ['#040F0A', '#061610', '#0A1F17', '#08170F', '#08170F', '#061610'],
  colorScheme: 'dark',
  scopes: {
    dark: { colorScheme: 'dark' },
    /** form side of the auth pages: the same matte surface, light text */
    paper: { paper: '#06130E', ink: '#F2F7F4', fg: '#F2F7F4', muted: '#8FA89E', line: '#15352A', colorScheme: 'dark' },
  },
  fonts: {
    // Latin glyphs and numerals in Inter, Arabic falls through to IBM Plex Sans Arabic
    display: "'Inter', 'IBM Plex Sans Arabic', system-ui, sans-serif",
    body: "'Inter', 'IBM Plex Sans Arabic', system-ui, sans-serif",
    mono: "'IBM Plex Mono', 'IBM Plex Sans Arabic', ui-monospace, monospace",
  },
  // small elements · buttons · cards · large containers
  radius: { sm: 12, md: 16, lg: 24, xl: 32 },
  notch: 0,
  shadows: {
    card: 'inset 0 1px 0 rgba(255,255,255,.04), 0 1px 2px rgba(0,0,0,.4), 0 12px 32px -12px rgba(0,0,0,.7)',
    lift: 'inset 0 1px 0 rgba(255,255,255,.05), 0 2px 4px rgba(0,0,0,.4), 0 24px 56px -16px rgba(0,0,0,.85)',
    stage: '0 8px 16px rgba(0,0,0,.4), 0 48px 96px -24px rgba(0,0,0,.9)',
  },
  spacing: { section: [88, 136], gutter: [16, 32] },
  container: { max: 1280, narrow: 1040 },
  grid: { products: { mobile: 2, tablet: 3, desktop: 4 }, gap: [16, 24] },
  productCard: { variant: 'poster', aspect: '4 / 5', showEnglishName: true, quickAdd: true },
  banner: { style: 'editorial', showGeometry: true },
  buttons: { shape: 'rounded', height: [48, 56] },
  motion: 'full',
  // bottom tab bar off: on phones everything lives in the header's burger menu
  mobile: { bottomNav: false, stickyBuyBar: true },
  features: { showRatings: true },
};
