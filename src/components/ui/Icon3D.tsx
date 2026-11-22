import type { ReactNode } from 'react';
import type { CategoryIcon } from '@/content/catalog';

/**
 * Glossy 3D-style category icons (emerald body, light top, dark details, soft
 * drop shadow). Render <Icon3DDefs /> once on the page, then any number of
 * <Icon3D icon="…" /> — the gradients are shared by id.
 */

const B = 'url(#i3-body)'; // body
const D = '#0b1712'; // dark detail
const S = 'url(#i3-shine)'; // highlight stroke

export function Icon3DDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="i3-body" x1="0" y1="0" x2=".35" y2="1">
          <stop offset="0" style={{ stopColor: 'color-mix(in srgb, rgb(var(--c-accent)) 40%, white)' }} />
          <stop offset=".4" style={{ stopColor: 'rgb(var(--c-accent))' }} />
          <stop offset="1" style={{ stopColor: 'color-mix(in srgb, rgb(var(--c-accent)) 45%, black)' }} />
        </linearGradient>
        <linearGradient id="i3-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id="i3-drop" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000" floodOpacity=".6" />
        </filter>
      </defs>
    </svg>
  );
}

const DARK_EDGE = { fill: 'color-mix(in srgb, rgb(var(--c-accent)) 40%, black)' };

const ICONS: Record<CategoryIcon, ReactNode> = {
  all: (
    <>
      <rect x="11" y="11" width="18" height="18" rx="5" fill={B} /><rect x="35" y="11" width="18" height="18" rx="5" fill={B} />
      <rect x="11" y="35" width="18" height="18" rx="5" fill={B} /><rect x="35" y="35" width="18" height="18" rx="5" fill={D} style={{ stroke: 'rgb(var(--c-accent))' }} strokeWidth="2" />
      <path d="M14 15h8M38 15h8M14 39h8" stroke={S} strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),
  games: (
    <>
      <path d="M13 26c0-6 5-9 10-9h18c5 0 10 3 10 9l4 15c2 7-3 11-8 10-4 0-6-3-9-7H26c-3 4-5 7-9 7-5 1-10-3-8-10Z" fill={B} />
      <rect x="18.5" y="28" width="10" height="3.6" rx="1.2" fill={D} />
      <rect x="21.7" y="24.8" width="3.6" height="10" rx="1.2" fill={D} />
      <circle cx="42" cy="26.5" r="2.4" fill={D} /><circle cx="46.5" cy="31" r="2.4" fill={D} /><circle cx="37.5" cy="31" r="2.4" fill={D} /><circle cx="42" cy="35.5" r="2.4" fill={D} />
      <path d="M22 20h20" stroke={S} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  gifts: (
    <>
      <rect x="12" y="28" width="40" height="25" rx="4" fill={B} />
      <rect x="9" y="19" width="46" height="11" rx="3.5" fill={B} />
      <rect x="29" y="19" width="6" height="34" style={DARK_EDGE} />
      <path d="M32 19c-3-7-12-9-13-4-1 4 6 5 13 4Zm0 0c3-7 12-9 13-4 1 4-6 5-13 4Z" fill={B} />
      <path d="M13 22h14" stroke={S} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  best: (
    <>
      <path d="M21 12h22v13a11 11 0 0 1-22 0Z" fill={B} />
      <path d="M21 16h-5a5 5 0 0 0 5 9M43 16h5a5 5 0 0 1-5 9" fill="none" style={{ stroke: 'rgb(var(--c-accent))' }} strokeWidth="3.5" strokeLinecap="round" />
      <rect x="29" y="35" width="6" height="8" style={DARK_EDGE} />
      <rect x="21" y="43" width="22" height="8" rx="2.5" fill={B} />
      <path d="M32 18l2 4 4.4.6-3.2 3 .8 4.4-4-2.1-4 2.1.8-4.4-3.2-3 4.4-.6Z" fill={D} opacity=".85" />
      <path d="M24 15v7" stroke={S} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  entertainment: (
    <>
      <rect x="9" y="15" width="46" height="31" rx="5" fill={B} />
      <path d="M28 24v13l11-6.5Z" fill={D} />
      <rect x="22" y="48" width="20" height="4" rx="2" style={DARK_EDGE} />
      <path d="M13 19h18" stroke={S} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  voice: (
    <>
      <rect x="23" y="9" width="18" height="30" rx="9" fill={B} />
      <rect x="28" y="16" width="8" height="10" rx="4" fill={D} />
      <path d="M15 32a17 17 0 0 0 34 0" fill="none" style={{ stroke: 'rgb(var(--c-accent))' }} strokeWidth="3.5" strokeLinecap="round" />
      <rect x="29.5" y="48" width="5" height="6" style={DARK_EDGE} />
      <rect x="23" y="53" width="18" height="4" rx="2" fill={B} />
      <path d="M27 13v6" stroke={S} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  delivery: (
    <>
      <rect x="7" y="19" width="31" height="23" rx="3.5" fill={B} />
      <path d="M38 26h9l7 8v8H38Z" fill={B} />
      <path d="M41 29h5l4 5h-9Z" fill={D} opacity=".85" />
      <circle cx="18" cy="44" r="6" fill={D} /><circle cx="18" cy="44" r="2.3" style={{ fill: 'rgb(var(--c-accent))' }} />
      <circle cx="46" cy="44" r="6" fill={D} /><circle cx="46" cy="44" r="2.3" style={{ fill: 'rgb(var(--c-accent))' }} />
      <path d="M11 23h18" stroke={S} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  stores: (
    <>
      <rect x="13" y="28" width="38" height="25" rx="3" fill={B} />
      <path d="M10 18h44l-3 10c-1 4-7 4-8 0-1 4-7 4-8 0-1 4-7 4-8 0-1 4-7 4-8 0-1 4-7 4-8 0Z" fill={B} />
      <rect x="27" y="37" width="10" height="16" rx="2" fill={D} />
      <path d="M14 21h16" stroke={S} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
};

export function Icon3D({ icon, className }: { icon: CategoryIcon; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className ?? 'block h-auto w-full overflow-visible'} aria-hidden="true">
      <g filter="url(#i3-drop)">{ICONS[icon]}</g>
    </svg>
  );
}
