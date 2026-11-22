import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type { HeroSlide } from '@/content/home';
import { getProduct, products, type Product } from '@/content/catalog';
import { site } from '@/content/site';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/theme/ThemeProvider';
import { cx, formatAmount } from '@/lib/format';

/** extra games to fill the pile after the featured ones */
const EXTRA = ['roblox', 'fortnite', 'yalla-ludo', 'lords-mobile', 'genshin-impact'];
const COUNT = 16;

/**
 * Where each card lands: two loose elliptical rings around the centre panel (outer / inner,
 * alternating), each card a little off its spot and tilted, so the pile looks thrown, not drawn.
 * x / y are % of the stage from its centre; r is the tilt.
 */
const SPOTS = Array.from({ length: COUNT }, (_, i) => {
  const outer = i % 2 === 0;
  const a = (i / COUNT) * Math.PI * 2 - Math.PI / 2 + (outer ? 0 : 0.18);
  const jitter = ((i * 37) % 11) / 10 - 0.5; // stable −0.5…0.5
  const rx = outer ? 38 : 25;
  const ry = outer ? 27 : 19;
  return {
    x: Math.cos(a) * (rx + jitter * 3),
    y: Math.sin(a) * (ry + jitter * 2),
    r: Math.round(Math.cos(a) * 9 + jitter * 10),
    z: outer ? 1 : 2, // inner ring sits over the outer one, under the centre panel
  };
});

/**
 * Hero — a solid lavender block at the top of the page sheet.
 *
 * A pile of game cards thrown in a loose ring around a dark centre panel that holds the headline,
 * the short line and the CTA. On load the cards burst out from behind the panel one after another
 * and settle, tilted, then keep drifting gently. Hovering a card straightens it, lifts it above
 * everything (the panel too) and shows its name and price.
 */
export function PileHero({ slides }: { slides: HeroSlide[]; promos?: { offers: string; arrivals: string; shopping: string } }) {
  const head = slides[0];
  const { motion } = useTheme();
  const slugs = [...slides.map((s) => s.to.split('/').pop() ?? ''), ...EXTRA];
  const pool = Array.from(new Set([...slugs.map((s) => getProduct(s)).filter((p): p is Product => !!p), ...products.filter((p) => p.image)]));
  const cards = SPOTS.map((spot, i) => ({ key: `${i}`, p: pool[i % pool.length], spot }));

  const [open, setOpen] = useState<string | null>(null);
  // false on the first frame (cards stacked behind the panel), then true so they fly out
  const [spread, setSpread] = useState(motion === 'off');
  const [settled, setSettled] = useState(motion === 'off');
  useEffect(() => {
    if (motion === 'off') { setSpread(true); return; }
    const t = window.setTimeout(() => setSpread(true), 250);
    const s = window.setTimeout(() => setSettled(true), 250 + 900 + COUNT * 55);
    return () => { window.clearTimeout(t); window.clearTimeout(s); };
  }, [motion]);

  return (
    <section aria-label="العروض الرئيسية" className="bg-lavender relative isolate overflow-hidden">
      <div
        className="relative mx-auto mb-14 mt-2 h-[420px] max-w-[1200px] [--card-w:74px] sm:mb-24 sm:h-[480px] sm:[--card-w:110px] lg:mb-28 lg:mt-4 lg:h-[540px] lg:[--card-w:138px]"
        onMouseLeave={() => setOpen(null)}
      >
        {/* soft light behind the pile */}
        <span className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-raised/50 blur-3xl" aria-hidden="true" />

        {cards.map(({ key, p, spot }, i) => {
          const isOpen = open === key;
          const style: CSSProperties = {
            left: `${50 + (spread ? spot.x : 0)}%`,
            top: `${50 + (spread ? spot.y : 0)}%`,
            transform: `translate(-50%,-50%) rotate(${isOpen ? 0 : spread ? spot.r : 0}deg) scale(${isOpen ? 1.18 : spread ? 1 : 0.6})`,
            opacity: spread ? 1 : 0,
            zIndex: isOpen ? 40 : spot.z,
            transitionDelay: settled ? '0ms' : `${i * 55}ms`, // staggered only for the opening burst
          };
          return (
            <Link
              key={key}
              to={`/product/${p.slug}`}
              aria-label={p.name}
              onMouseEnter={() => setOpen(key)}
              onFocus={() => setOpen(key)}
              onBlur={() => setOpen(null)}
              className="absolute block aspect-[2/3] w-[var(--card-w)] outline-none transition-[left,top,transform,opacity] duration-[900ms] [transition-timing-function:cubic-bezier(.2,.8,.2,1)]"
              style={style}
            >
              {/* gentle drift once settled (uses `translate`, so it never fights the transform above) */}
              <span
                className="block h-full w-full"
                style={motion === 'off' || isOpen ? undefined : { animation: `chip-bob ${4.5 + (i % 4) * 0.7}s ease-in-out ${-(i * 0.6)}s infinite` }}
              >
                <span
                  className={cx(
                    'block h-full w-full overflow-hidden rounded-[14px] bg-surface p-1 transition-shadow duration-500 sm:rounded-[16px] sm:p-1.5',
                    isOpen ? 'shadow-[0_40px_80px_-20px_rgb(40_30_90/.55)]' : 'shadow-[0_18px_36px_-14px_rgb(40_30_90/.4)]',
                  )}
                >
                  <span className="relative block h-full overflow-hidden rounded-[10px] sm:rounded-[11px]">
                    <img src={p.image} srcSet={p.imageSet} sizes="160px" alt="" draggable={false} decoding="async" className="h-full w-full object-cover object-top" />
                    {/* name + price slide up on hover */}
                    <span className={cx('absolute inset-x-1 bottom-1 hidden items-center justify-between gap-1.5 rounded-[9px] bg-raised/95 px-2 py-1.5 text-start transition-[opacity,transform] duration-500 sm:flex', isOpen ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0')}>
                      <span className="min-w-0">
                        <span className="block truncate text-[11px] font-medium text-fg">{p.name}</span>
                        <span className="num block text-[11px] text-muted">{formatAmount(p.price)} {site.locale.currency.symbol}</span>
                      </span>
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-white"><Icon name="arrow-next" size={12} /></span>
                    </span>
                    {p.discount ? <span className="num absolute end-1.5 top-1.5 rounded-full bg-lime px-1.5 py-0.5 text-[10px] font-semibold text-fg" dir="ltr">-{p.discount}%</span> : null}
                  </span>
                </span>
              </span>
            </Link>
          );
        })}

        {/* centre panel with the copy */}
        <div className="anim-rise absolute left-1/2 top-1/2 z-30 flex w-[230px] -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-[24px] bg-ink px-5 py-7 text-center text-white shadow-[0_40px_80px_-24px_rgb(20_10_60/.6)] sm:w-[320px] sm:px-7 sm:py-9 lg:w-[380px] lg:rounded-[28px] lg:py-11">
          <h1 className="font-display text-[1.45rem] leading-[1.9rem] tracking-[-0.02em] sm:text-[1.9rem] sm:leading-[2.4rem] lg:text-[2.2rem] lg:leading-[2.8rem]">
            {head.lines.join(' ')}
          </h1>
          <p className="mx-auto mt-3 max-w-[18rem] text-xs leading-6 text-white/65 sm:text-sm">
            بطاقات الألعاب والمنصات والمتاجر — اختار لعبتك واشحن رصيدك بسهولة.
          </p>
          <div className="mt-5 flex items-center justify-center gap-5">
            <Link to={head.cta.to} className="btn-cta">
              {head.cta.label}
              <span className="btn-cta-dot"><Icon name="arrow-next" size={16} /></span>
            </Link>
            {head.secondary && (
              <Link to={head.secondary.to} className="hidden border-b border-line pb-0.5 text-sm font-medium text-white transition-colors hover:border-white sm:inline">{head.secondary.label}</Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
