import type { ReactNode } from 'react';
import { siPubg, siRoblox, siValorant } from 'simple-icons';
import type { Product } from '@/content/catalog';
import { cx } from '@/lib/format';

/**
 * Tile environments for games shown without their artwork: matte charcoal with a warm studio
 * corner (the interface's light, not the game's colours — game art keeps its own palette).
 * Products get one by a stable hash of the slug.
 */
const GRADS: Record<string, string> = {};
const FALLBACK = [
  'radial-gradient(90% 70% at 85% 0%,rgb(63 216 192/.22),transparent 60%),linear-gradient(155deg,#0E2A1E 0%,#06130E 75%)',
  'radial-gradient(90% 70% at 10% 100%,rgb(23 128 111/.3),transparent 60%),linear-gradient(155deg,#0A1F17 0%,#030C08 80%)',
  'linear-gradient(135deg,#06140E 0%,#0E2A1E 65%,#0F4A3A 100%)',
  'radial-gradient(80% 60% at 50% 0%,rgb(139 235 218/.16),transparent 60%),linear-gradient(155deg,#0A1F17 0%,#030C08 80%)',
];
const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
export const tileGradient = (slug: string) => GRADS[slug] ?? FALLBACK[hash(slug) % FALLBACK.length];

/**
 * The owner's game logos (white on transparent, built by `node scripts/build-game-logos.cjs`).
 * `wordmark`: the logo already spells the name, so the tile does not repeat it underneath.
 */
/** `square`: a compact, near-square mark — given more height so it carries the same visual weight as the wide wordmarks */
const LOGO_FILES: Record<string, { src: string; wordmark?: boolean; square?: boolean }> = {
  roblox: { src: '/assets/game-logos/roblox.webp' },
  valorant: { src: '/assets/game-logos/valorant.webp' },
  pubg: { src: '/assets/game-logos/pubg.webp' },
  'call-of-duty': { src: '/assets/game-logos/call-of-duty.webp', wordmark: true },
  'free-fire': { src: '/assets/game-logos/free-fire.webp', wordmark: true },
  'lords-mobile': { src: '/assets/game-logos/lords-mobile.webp', wordmark: true, square: true },
  'mobile-legends': { src: '/assets/game-logos/mobile-legends.webp', wordmark: true },
  'yalla-ludo': { src: '/assets/game-logos/yalla-ludo.webp', wordmark: true, square: true },
};

/**
 * games with a background artwork in public/assets/game-bg/<slug>.webp. Most were replaced by the
 * owner's newer artworks (cropped from their single images; call-of-duty is a 4:5 crop of
 * offers/call-of-duty-scene.webp). apex-legends and genshin-impact still come from
 * `node scripts/build-game-bg.cjs` — rerunning it overwrites the new ones.
 */
const BG_FILES = new Set(['pubg', 'valorant', 'free-fire', 'call-of-duty', 'mobile-legends', 'roblox', 'yalla-ludo', 'apex-legends', 'genshin-impact', 'lords-mobile', 'fortnite', 'hawa', 'masa', 'tawla', 'sila', 'yoho', 'ludo-royal', 'sada-live']);

/** simple white glyph per game; the first Latin letter otherwise */
function Glyph({ slug, letter }: { slug: string; letter: string }) {
  const svg = (children: ReactNode) => (
    <svg viewBox="0 0 48 48" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round">{children}</svg>
  );
  // real brand mark when simple-icons has one
  const logo = LOGOS[slug];
  if (logo) return <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor"><path d={logo} /></svg>;
  switch (slug) {
    case 'roblox': return svg(<rect x="12" y="12" width="24" height="24" rx="2" transform="rotate(45 24 24)" />);
    case 'pubg': return svg(<><rect x="10" y="10" width="28" height="28" rx="2" transform="rotate(45 24 24)" /><rect x="18" y="18" width="12" height="12" transform="rotate(45 24 24)" fill="currentColor" stroke="none" /></>);
    case 'fortnite': return svg(<path d="M27 4 11 27h11l-3 17 18-25H26Z" fill="url(#ff)" stroke="none" />);
    case 'call-of-duty': return svg(<><circle cx="24" cy="24" r="17" /><circle cx="24" cy="24" r="10" fill="currentColor" stroke="none" /></>);
    case 'free-fire': return svg(<path d="M24 4c1.6 11 9 18.4 20 20-11 1.6-18.4 9-20 20-1.6-11-9-18.4-20-20 11-1.6 18.4-9 20-20Z" fill="currentColor" stroke="none" />);
    case 'mobile-legends': return svg(<path d="M24 5v38M7.5 14.5l33 19M7.5 33.5l33-19" strokeLinecap="round" strokeWidth="6" />);
    case 'yalla-ludo': return svg(<><rect x="8" y="8" width="32" height="32" rx="6" fill="currentColor" stroke="none" /><g fill="#4AA7B5"><circle cx="17" cy="17" r="3" /><circle cx="31" cy="17" r="3" /><circle cx="24" cy="24" r="3" /><circle cx="17" cy="31" r="3" /><circle cx="31" cy="31" r="3" /></g></>);
    default: return <span className="block font-display text-[2.6em] font-extrabold leading-none">{letter}</span>;
  }
}

/** matte tile surfaces for the "token" tiles (name kept for existing callers) */
const PASTELS: Record<string, string> = {};
const PASTEL_FALLBACK = [
  'linear-gradient(155deg,#0E2A1E 0%,#06130E 75%)',
  'linear-gradient(155deg,#0A1F17 0%,#030C08 80%)',
  'linear-gradient(155deg,#0A1F17 0%,#030C08 80%)',
  'linear-gradient(155deg,#0A1F17 0%,#030C08 80%)',
];
/** the game's tile surface (banners, pack tiles) */
export const tilePastel = (slug: string) => PASTELS[slug] ?? PASTEL_FALLBACK[hash(slug) % PASTEL_FALLBACK.length];
/** the game's background artwork, when it has one */
export const gameBg = (slug: string) => (BG_FILES.has(slug) ? `/assets/game-bg/${slug}.webp` : undefined);

/** game logos available as simple-icons paths (24×24) — the rest fall back to the game's art as an app icon */
const LOGOS: Record<string, string> = { roblox: siRoblox.path, valorant: siValorant.path, pubg: siPubg.path };

/**
 * "Token" tile, matching the platform cards: a matte surface, a charcoal rounded square in the
 * middle holding the game's logo (or its art cropped like an app icon when no logo is
 * available), and the Latin name as a small label in the corner.
 */
export function TokenTile({ product, className }: { product: Product; className?: string }) {
  const logo = LOGOS[product.slug];
  return (
    <div className={cx('relative grid place-items-center overflow-hidden', className)} style={{ background: PASTELS[product.slug] ?? PASTEL_FALLBACK[hash(product.slug) % PASTEL_FALLBACK.length] }}>
      <span className="token-3d grid aspect-square w-[46%] place-items-center overflow-hidden">
        {logo ? (
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-auto w-[50%] text-[#F2F7F4]"><path d={logo} /></svg>
        ) : (
          <img src={product.image} alt="" loading="lazy" decoding="async" className="h-[84%] w-[84%] rounded-[22%] object-cover object-top shadow-[0_6px_14px_-6px_rgb(0_0_0/.6)]" />
        )}
      </span>
      <span className="eyebrow absolute bottom-4 start-4 !text-fg/60" dir="ltr" aria-hidden="true">{product.nameEn}</span>
    </div>
  );
}

/**
 * Game tile: the game's artwork (or a matte surface), with a matte pill plate holding the logo
 * (and the Latin name when the logo has none) and a small "DIGITAL CARD" line. Sizes follow the
 * tile (cqw).
 */
export function GradientTile({ product, className, tilt }: { product: Product; className?: string; tilt?: boolean }) {
  const glyph = <Glyph slug={product.slug} letter={product.nameEn.charAt(0).toUpperCase()} />;
  const file = LOGO_FILES[product.slug];
  if (tilt) {
    return (
      <div className={cx('relative grid place-items-center overflow-hidden [container-type:inline-size]', className)} style={{ background: tileGradient(product.slug) }}>
        {BG_FILES.has(product.slug) ? (
          <>
            {/* the game's artwork as the card background, with a dark floor so the plate reads */}
            <img src={`/assets/game-bg/${product.slug}.webp`} alt="" loading="lazy" decoding="async" draggable={false} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 [transition-timing-function:var(--ease-std)] group-hover:scale-[1.05]" />
            <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgb(9_10_12/.85),rgb(9_10_12/.15)_55%,transparent)]" aria-hidden="true" />
          </>
        ) : (
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_15%_0%,rgb(255_255_255/.35),transparent_60%)]" aria-hidden="true" />
        )}
        <svg width="0" height="0" className="absolute" aria-hidden="true"><defs><linearGradient id="ff" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFC24A" /><stop offset="1" stopColor="#F2553D" /></linearGradient></defs></svg>
        {/* matte pill plate resting on the art's dark floor — one fixed size for every game; each
            logo is fitted into the same small box (object-contain), so tall and wide marks match */}
        <span className="absolute inset-x-[10cqw] bottom-[7cqw] flex h-[20cqw] items-center justify-center rounded-full border border-white/10 bg-[#010604]/75 px-[6cqw] text-white shadow-[inset_0_1px_0_rgb(255_255_255/.06),0_20px_40px_-20px_rgb(0_0_0/.9)] backdrop-blur-[4px] transition-[transform,border-color] duration-300 [transition-timing-function:var(--ease-std)] group-hover:-translate-y-[1cqw] group-hover:border-[rgb(63_216_192/.45)]">
          {file?.wordmark ? (
            <img src={file.src} alt={product.nameEn} draggable={false} decoding="async" className={cx('object-contain', file.square ? 'h-[15cqw] w-[30cqw]' : 'h-[10cqw] w-[38cqw]')} />
          ) : (
            <span className="flex h-[11cqw] items-center gap-[2.5cqw]" dir="ltr">
              <span className="grid h-[8cqw] w-[8cqw] shrink-0 place-items-center text-[3cqw]">
                {file ? <img src={file.src} alt="" draggable={false} decoding="async" className="h-full w-full object-contain" /> : glyph}
              </span>
              <span className="whitespace-nowrap font-display text-[4.6cqw] font-bold uppercase leading-none tracking-[-0.01em]">{product.nameEn}</span>
            </span>
          )}
        </span>
      </div>
    );
  }
  return (
    <div className={cx('relative grid place-items-center overflow-hidden [container-type:inline-size]', className)} style={{ background: tileGradient(product.slug) }}>
      {BG_FILES.has(product.slug) ? (
        <>
          {/* the game's artwork as the card background, darkened so the plate and logo read */}
          <img src={`/assets/game-bg/${product.slug}.webp`} alt="" loading="lazy" decoding="async" draggable={false} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 [transition-timing-function:var(--ease-std)] group-hover:scale-[1.05]" />
          <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgb(9_10_12/.8),rgb(9_10_12/.3)_60%,rgb(9_10_12/.15))]" aria-hidden="true" />
        </>
      ) : (
        /* soft light from the top corner */
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_15%_0%,rgb(255_255_255/.35),transparent_60%)]" aria-hidden="true" />
      )}
      {/* matte plate behind the logo */}
      <span className="absolute aspect-square w-[58cqw] rounded-full border border-white/[.07] bg-[#010604]/50 shadow-[inset_0_1px_0_rgb(255_255_255/.05),0_20px_40px_-20px_rgb(0_0_0/.9)] backdrop-blur-[2px]" aria-hidden="true" />
      <span className="relative flex flex-col items-center text-center text-white">
        <svg width="0" height="0" className="absolute" aria-hidden="true"><defs><linearGradient id="ff" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFC24A" /><stop offset="1" stopColor="#F2553D" /></linearGradient></defs></svg>
        {file?.wordmark ? (
          <img src={file.src} alt="" draggable={false} decoding="async" className="max-h-[26cqw] w-[46cqw] object-contain drop-shadow-[0_4px_10px_rgb(0_0_0/.2)]" />
        ) : (
          <>
            <span className="grid h-[17cqw] w-[17cqw] place-items-center text-[6cqw] drop-shadow-[0_4px_10px_rgb(0_0_0/.2)]">
              {file ? <img src={file.src} alt="" draggable={false} decoding="async" className="h-full w-full object-contain" /> : glyph}
            </span>
            <span className="mt-[4cqw] px-[6cqw] font-display text-[7.5cqw] font-extrabold uppercase leading-none tracking-[-0.01em] [text-shadow:0_2px_12px_rgb(0_0_0/.25)]" dir="ltr">{product.nameEn}</span>
          </>
        )}
        <span className="mt-[3cqw] text-[3.4cqw] font-semibold uppercase tracking-[.25em] text-white/70" dir="ltr">Digital Card</span>
      </span>
    </div>
  );
}
