import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from 'react';
import { themeConfig as defaultTheme, type ThemeConfig } from './themeConfig';

const ThemeContext = createContext<ThemeConfig>(defaultTheme);
export const useTheme = () => useContext(ThemeContext);

const channels = (hex: string) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

/** fluid value between 375px and 1440px viewports */
const fluid = ([min, max]: [number, number]) =>
  `clamp(${min}px, calc(${min}px + ${max - min} * ((100vw - 375px) / 1065)), ${max}px)`;

/** "+" registration-mark pattern tinted with the scope's text colour */
const gridImage = (fgHex: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><circle cx='16' cy='16' r='.9' fill='${fgHex}' fill-opacity='.08'/></svg>`)}")`;

const colorVars = (colors: Partial<ThemeConfig['colors']>) => {
  const vars: Record<string, string> = {};
  for (const [k, v] of Object.entries(colors)) if (v) vars[`--c-${k}`] = channels(v);
  if (colors.fg) vars['--grid-img'] = gridImage(colors.fg);
  return vars;
};

/** `.scope-<name>` rules: re-declare the palette and re-apply text colour (inherited colour is computed, not live) */
export function themeScopesCss(t: ThemeConfig) {
  return Object.entries(t.scopes)
    .map(([name, { colorScheme, ...colors }]) => {
      const decl = Object.entries(colorVars(colors)).map(([k, v]) => `${k}:${v}`).join(';');
      return `.scope-${name}{${decl};color:rgb(var(--c-fg));${colorScheme ? `color-scheme:${colorScheme};` : ''}}`;
    })
    .join('\n');
}

export function themeToCssVars(t: ThemeConfig): Record<string, string> {
  const vars: Record<string, string> = colorVars(t.colors);
  t.tints.forEach((v, i) => { vars[`--tint-${i}`] = channels(v); });
  vars['--tint-count'] = String(t.tints.length);
  vars['--font-display'] = t.fonts.display;
  vars['--font-body'] = t.fonts.body;
  vars['--font-mono'] = t.fonts.mono;
  for (const [k, v] of Object.entries(t.radius)) vars[`--radius-${k}`] = `${v}px`;
  vars['--notch'] = `${t.notch}px`;
  vars['--shadow-card'] = t.shadows.card;
  vars['--shadow-lift'] = t.shadows.lift;
  vars['--shadow-stage'] = t.shadows.stage;
  vars['--section-y'] = fluid(t.spacing.section);
  vars['--gutter'] = fluid(t.spacing.gutter);
  vars['--container'] = `${t.container.max}px`;
  vars['--container-narrow'] = `${t.container.narrow}px`;
  vars['--grid-mobile'] = String(t.grid.products.mobile);
  vars['--grid-tablet'] = String(t.grid.products.tablet);
  vars['--grid-desktop'] = String(t.grid.products.desktop);
  vars['--grid-gap'] = fluid(t.grid.gap);
  vars['--card-aspect'] = t.productCard.aspect;
  vars['--btn-h'] = fluid(t.buttons.height);
  const speed = { off: 0, subtle: 0.6, full: 1 }[t.motion];
  // hover 180–240ms · section reveal 350–500ms
  vars['--dur'] = `${Math.round(220 * speed)}ms`;
  vars['--dur-slow'] = `${Math.round(450 * speed)}ms`;
  return vars;
}

export type ThemeMode = 'dark' | 'light';
const ModeContext = createContext<{ mode: ThemeMode; toggle: () => void }>({ mode: 'dark', toggle: () => {} });
export const useThemeMode = () => useContext(ModeContext);

const readMode = (): ThemeMode => {
  try { return localStorage.getItem('n4-mode') === 'light' ? 'light' : 'dark'; } catch { return 'dark'; }
};

export function ThemeProvider({ theme = defaultTheme, children }: { theme?: ThemeConfig; children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(readMode);
  const toggle = () => setMode((m) => {
    const next = m === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('n4-mode', next); } catch { /* ignore */ }
    return next;
  });

  useLayoutEffect(() => {
    const root = document.documentElement;
    const light = mode === 'light';
    for (const [k, v] of Object.entries(themeToCssVars(theme))) root.style.setProperty(k, v);
    if (light) for (const [k, v] of Object.entries(colorVars(theme.lightColors))) root.style.setProperty(k, v);
    root.dataset.mode = mode;
    root.style.colorScheme = light ? 'light' : theme.colorScheme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? theme.lightColors.bg : theme.colors.bg);
    let style = document.getElementById('theme-scopes');
    if (!style) {
      style = document.createElement('style');
      style.id = 'theme-scopes';
      document.head.appendChild(style);
    }
    // in light mode the "paper" scope (auth form side) follows the light palette instead of forcing dark
    style.textContent = light ? themeScopesCss({ ...theme, scopes: { ...theme.scopes, paper: { ...theme.lightColors, colorScheme: 'light' }, dark: { colorScheme: 'dark' } } }) : themeScopesCss(theme);
    root.dataset.motion = theme.motion;
    root.dataset.btn = theme.buttons.shape;
    root.dataset.card = theme.productCard.variant;
    root.dataset.banner = theme.banner.style;
    root.dataset.bottomNav = String(theme.mobile.bottomNav);
  }, [theme, mode]);

  return (
    <ThemeContext.Provider value={theme}>
      <ModeContext.Provider value={{ mode, toggle }}>{children}</ModeContext.Provider>
    </ThemeContext.Provider>
  );
}
