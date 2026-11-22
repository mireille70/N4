import type { CategoryIcon } from '@/content/catalog';

/**
 * Custom category artwork: each glyph is drawn as a small "card object" —
 * an outlined card stock with one solid accent shape (currentColor = accent).
 */
export function CategoryGlyph({ icon, className }: { icon: CategoryIcon; className?: string }) {
  const stroke = { fill: 'none', stroke: 'rgb(var(--c-fg))', strokeWidth: 1.6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  const solid = { fill: 'currentColor' };
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {icon === 'all' && (
        <>
          <rect x="10" y="10" width="19" height="19" rx="4" {...stroke} />
          <rect x="35" y="10" width="19" height="19" rx="4" {...solid} />
          <rect x="10" y="35" width="19" height="19" rx="4" {...stroke} />
          <rect x="35" y="35" width="19" height="19" rx="4" {...stroke} />
        </>
      )}
      {icon === 'games' && (
        <>
          <path d="M18 22h28c6 0 10 5 11 12l1.5 9c.6 4-4.5 6.5-7.3 3.6L45 40H19l-6.2 6.6C10 49.5 5 47 5.5 43L7 34c1-7 5-12 11-12Z" {...stroke} />
          <path d="M19 29v8M15 33h8" {...stroke} />
          <circle cx="42" cy="30.5" r="2.6" {...solid} />
          <circle cx="47.5" cy="36" r="2.6" {...solid} />
        </>
      )}
      {icon === 'gifts' && (
        <>
          <rect x="8" y="16" width="48" height="32" rx="5" {...stroke} />
          <path d="M8 30h48" {...stroke} />
          <rect x="24" y="16" width="7" height="32" {...solid} />
          <path d="M27.5 30c-6-1-11-5-8.5-8.5s7 2 8.5 8.5c1.5-6.5 6-11.5 8.5-8.5S33.5 29 27.5 30Z" {...stroke} />
        </>
      )}
      {icon === 'best' && (
        <>
          <path d="M22 10h20v10a10 10 0 0 1-20 0Z" {...stroke} />
          <path d="M22 13h-7c0 7 3 10 7 10M42 13h7c0 7-3 10-7 10M32 30v8M24 52h16l-2-8H26Z" {...stroke} />
          <path d="m32 13 1.6 3.4 3.6.4-2.7 2.4.8 3.6-3.3-1.9-3.3 1.9.8-3.6-2.7-2.4 3.6-.4Z" {...solid} />
        </>
      )}
      {icon === 'entertainment' && (
        <>
          <rect x="7" y="15" width="50" height="32" rx="5" {...stroke} />
          <path d="M24 53h16M32 47v6" {...stroke} />
          <path d="M28 24.5v13l11-6.5Z" {...solid} />
        </>
      )}
      {icon === 'voice' && (
        <>
          <rect x="24" y="8" width="16" height="28" rx="8" {...stroke} />
          <path d="M14 30a18 18 0 0 0 36 0M32 48v8M24 56h16" {...stroke} />
          <rect x="28" y="14" width="8" height="10" rx="4" {...solid} />
        </>
      )}
      {icon === 'delivery' && (
        <>
          <path d="M8 40V22h24v18M32 28h10l7 7v5h-4" {...stroke} />
          <path d="M8 40h6m10 0h12" {...stroke} />
          <circle cx="19" cy="42" r="5" {...stroke} />
          <circle cx="41" cy="42" r="5" {...solid} />
          <path d="M13 28h12M13 33h8" {...stroke} />
        </>
      )}
      {icon === 'stores' && (
        <>
          <path d="M10 26h44v24a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3Z" {...stroke} />
          <path d="M8 26 13 12h38l5 14" {...stroke} />
          <path d="M8 26c0 4 3 6 6 6s6-2 6-6c0 4 3 6 6 6s6-2 6-6c0 4 3 6 6 6s6-2 6-6c0 4 3 6 6 6s6-2 6-6" {...stroke} />
          <rect x="26" y="38" width="12" height="15" rx="1.5" {...solid} />
        </>
      )}
    </svg>
  );
}
