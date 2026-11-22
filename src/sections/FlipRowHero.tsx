import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { HeroSlide } from '@/content/home';
import { getProduct, products, type Product } from '@/content/catalog';
import { site } from '@/content/site';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/theme/ThemeProvider';
import { cx, formatAmount } from '@/lib/format';

/** extra games to fill the row after the featured ones */
const EXTRA = ['roblox', 'fortnite', 'yalla-ludo', 'lords-mobile', 'genshin-impact'];
const COUNT = 8; // panels in the row (the last three hide on phones)
const TURNED = 78; // degrees a panel is turned while "closed" (almost edge-on)
const STAGGER = 0.16; // s between one panel and the next
const FLIP = 0.9; // s for one panel to turn
const HOLD_OPEN = 2.6; // s the whole row stays flat
const HOLD_CLOSED = 0.9; // s the whole row stays turned
/** one full cycle: open wave → hold → close wave → hold */
const CYCLE = 2 * (FLIP + STAGGER * (COUNT - 1)) + HOLD_OPEN + HOLD_CLOSED;

const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** 0 = turned, 1 = flat, for panel i at time t */
function openness(t: number, i: number) {
  const span = FLIP + STAGGER * (COUNT - 1); // length of one wave
  const c = ((t % CYCLE) + CYCLE) % CYCLE;
  const d = i * STAGGER;
  if (c < span) return ease((c - d) / FLIP); // opening wave
  if (c < span + HOLD_OPEN) return 1;
  if (c < 2 * span + HOLD_OPEN) return 1 - ease((c - span - HOLD_OPEN - d) / FLIP); // closing wave, same direction
  return 0;
}

/**
 * Hero — a solid lavender block at the top of the page sheet. Centred headline, a short line
 * and the white CTA pill.
 *
 * Below the copy, a row of tall game panels in shared perspective. They start turned almost
 * edge-on; a wave runs along the row and flips them flat one after another until they form one
 * wall, holds, then folds them back in the same order, and repeats. Hovering pauses the wave and
 * lifts that panel with its name and price.
 */
export function FlipRowHero({ slides }: { slides: HeroSlide[]; promos?: { offers: string; arrivals: string; shopping: string } }) {
  const head = slides[0];
  const { motion } = useTheme();
  const slugs = [...slides.map((s) => s.to.split('/').pop() ?? ''), ...EXTRA];
  const pool = Array.from(new Set([...slugs.map((s) => getProduct(s)).filter((p): p is Product => !!p), ...products.filter((p) => p.image)]));
  const cards = Array.from({ length: COUNT }, (_, i) => ({ key: `${i}`, p: pool[i % pool.length] }));

  const [open, setOpen] = useState<string | null>(null);
  const refs = useRef<Array<HTMLSpanElement | null>>([]);
  const paused = useRef(false);

  useEffect(() => {
    const place = (t: number) => {
      refs.current.forEach((el, i) => {
        if (!el) return;
        const o = openness(t, i);
        el.style.transform = `rotateY(${((1 - o) * TURNED).toFixed(2)}deg)`;
        el.style.filter = `brightness(${(0.7 + o * 0.3).toFixed(3)})`;
      });
    };
    if (motion === 'off') { place(FLIP + STAGGER * COUNT + 0.5); return; } // shown flat
    let raf = 0;
    let last = 0;
    let t = 0;
    const tick = (now: number) => {
      if (last && !paused.current) t += (now - last) / 1000;
      last = now;
      place(t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [motion]);

  return (
    <section aria-label="العروض الرئيسية" className="bg-lavender relative isolate overflow-hidden">
      <div className="relative z-20 mx-auto max-w-3xl px-6 pt-6 text-center sm:pt-8 lg:pt-10">
        <h1 className="anim-rise font-display text-[2.25rem] leading-[2.75rem] tracking-[-0.03em] sm:text-[3rem] sm:leading-[3.5rem] lg:text-[3.75rem] lg:leading-[4.25rem]">
          {head.lines.join(' ')}
        </h1>
        <p className="anim-rise mx-auto mt-4 max-w-md text-base leading-7 text-fg/70 [animation-delay:80ms]">
          بطاقات الألعاب والمنصات والمتاجر — اختار لعبتك واشحن رصيدك بسهولة.
        </p>
        <div className="anim-rise mt-5 flex items-center justify-center gap-6 [animation-delay:160ms]">
          <Link to={head.cta.to} className="btn-cta">
            {head.cta.label}
            <span className="btn-cta-dot"><Icon name="arrow-next" size={16} /></span>
          </Link>
          {head.secondary && (
            <Link to={head.secondary.to} className="border-b border-fg/30 pb-0.5 text-sm font-medium text-fg transition-colors hover:border-fg">{head.secondary.label}</Link>
          )}
        </div>
      </div>

      {/* ——— flipping panel row ——— */}
      <div
        dir="ltr"
        className="anim-fade relative z-10 mx-auto mb-14 mt-8 flex max-w-[1280px] gap-2 px-4 [animation-delay:240ms] [perspective:1400px] sm:mb-24 sm:gap-3 lg:mb-28 lg:mt-10"
        onMouseEnter={() => { paused.current = true; }}
        onMouseLeave={() => { paused.current = false; setOpen(null); }}
      >
        {cards.map(({ key, p }, i) => {
          const isOpen = open === key;
          return (
            <Link
              key={key}
              to={`/product/${p.slug}`}
              aria-label={p.name}
              onMouseEnter={() => setOpen(key)}
              onFocus={() => setOpen(key)}
              onBlur={() => setOpen(null)}
              className={cx('relative z-0 block aspect-[2/3] min-w-0 flex-1 outline-none [transform-style:preserve-3d]', i >= 5 && 'hidden sm:block', isOpen && 'z-10')}
            >
              {/* the turning face (rotation set by the wave) */}
              <span ref={(el) => { refs.current[i] = el; }} className="block h-full w-full [transform-style:preserve-3d] will-change-transform">
                <span
                  className={cx(
                    'block h-full w-full overflow-hidden rounded-[18px] bg-surface p-1.5 transition-[transform,box-shadow] duration-500 [transition-timing-function:var(--ease-std)]',
                    isOpen ? 'scale-[1.06] shadow-[0_40px_80px_-24px_rgb(40_30_90/.5)]' : 'shadow-[0_16px_32px_-16px_rgb(40_30_90/.3)]',
                  )}
                >
                  <span className="relative block h-full overflow-hidden rounded-[13px]">
                    <img src={p.image} srcSet={p.imageSet} sizes="200px" alt="" draggable={false} decoding="async" className="h-full w-full object-cover object-top" />
                    {/* name + price slide up on hover */}
                    <span dir="rtl" className={cx('absolute inset-x-1.5 bottom-1.5 flex items-center justify-between gap-2 rounded-[10px] bg-raised/95 px-3 py-2 text-start transition-[opacity,transform] duration-500', isOpen ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0')}>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-medium text-fg">{p.name}</span>
                        <span className="num block text-xs text-muted">{formatAmount(p.price)} {site.locale.currency.symbol}</span>
                      </span>
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-white"><Icon name="arrow-next" size={13} /></span>
                    </span>
                    {p.discount ? <span className="num absolute end-2 top-2 rounded-full bg-lime px-2 py-0.5 text-[11px] font-semibold text-fg" dir="ltr">-{p.discount}%</span> : null}
                  </span>
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
