import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { HeroSlide } from '@/content/home';
import { getProduct } from '@/content/catalog';
import { CardPopup } from '@/components/product/CardPopup';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/theme/ThemeProvider';
import { cx } from '@/lib/format';

const COLUMNS = 6; // columns on desktop (fewer show on small screens)
const PER_COLUMN = 5; // cards per column before the loop repeats

/** Split the headline into two balanced lines by word count */
const headlineHalves = (s: HeroSlide) => {
  const words = s.lines.join(' ').split(/\s+/).filter(Boolean);
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid), words.slice(mid)];
};

/**
 * Hero — "card wall".
 * Headline and button centred on top; underneath, a wide wall of the game cards
 * leaning back in 3D. Its columns scroll endlessly, alternating up / down at
 * different speeds. Scrolling the page tilts the wall upright and brings it
 * closer while the headline lifts away (driven by --p, 0 → 1). Hovering a
 * column pauses it and lifts the card under the pointer; clicking a card opens
 * it in a popup with the game's price and buy / details actions.
 */
export function WallHero({ slides }: { slides: HeroSlide[]; promos?: { offers: string; arrivals: string; shopping: string } }) {
  const { motion } = useTheme();
  const head = slides[0];
  const sectionRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<HeroSlide | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const stars = useMemo(() => Array.from({ length: 80 }, (_, i) => ({ x: (i * 53) % 100, y: (i * 37 + (i % 7) * 11) % 100, s: i % 6 === 0 ? 2.5 : 1.5, d: (i % 9) * 0.6 })), []);

  // each column starts at a different card so rows never line up
  const columns = useMemo(
    () => Array.from({ length: COLUMNS }, (_, c) => Array.from({ length: PER_COLUMN }, (_, k) => slides[(c * 2 + k) % slides.length])),
    [slides],
  );

  // how far the hero has scrolled out of view → --p
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--p', String(Math.min(1, Math.max(0, -r.top / Math.max(1, r.height * 0.8)))));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    // The section slides up under the floating header so the backdrop fills the whole top of the page
    <section ref={sectionRef} aria-label="العروض الرئيسية" className="relative -mt-[68px] overflow-hidden bg-[color-mix(in_srgb,rgb(var(--c-bg))_65%,black)] pt-[calc(68px+2rem)] [--p:0] lg:-mt-[80px] lg:pt-[calc(80px+2.5rem)]">
      {/* starfield + one accent glow behind the wall */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {stars.map((s, i) => (
          <span key={i} className="star absolute rounded-full bg-surface" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${-s.d}s` }} />
        ))}
        <div className="absolute bottom-[-20%] left-1/2 h-[70%] w-[90%] -translate-x-1/2 rounded-[50%] bg-accent/[.12] blur-[120px]" />
      </div>

      {/* headline */}
      <div className="container-x relative z-10 flex flex-col items-center text-center" style={{ transform: 'translateY(calc(var(--p) * -60px))', opacity: 'calc(1 - var(--p) * 1.4)' }}>
        <h1 className="anim-rise mx-auto max-w-4xl font-display text-[2rem] font-extrabold leading-[1.35] sm:text-5xl lg:text-[3.3rem] lg:leading-[1.25]">
          {headlineHalves(head).map((half, h) => (
            <span key={h} className="block">
              {half.map((w, i) => (
                <span key={i}>{i > 0 && ' '}<span className={w === head.highlight ? 'text-accent' : undefined}>{w}</span></span>
              ))}
            </span>
          ))}
        </h1>
        <Link to={head.cta.to} className="btn btn-primary anim-rise mt-6 [animation-delay:120ms]">
          {head.cta.label} <Icon name="arrow-next" size={19} />
        </Link>
      </div>

      {/* card wall */}
      <div
        className="relative mt-6 h-[380px] [perspective:1300px] [mask-image:linear-gradient(to_bottom,transparent,#000_10%,#000_72%,transparent),linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)] [mask-composite:intersect] sm:h-[480px] lg:mt-8 lg:h-[560px]"
      >
        <div
          className="absolute left-1/2 top-0 grid w-[max(640px,120%)] origin-top grid-cols-4 gap-3 sm:w-[max(860px,104%)] sm:grid-cols-5 sm:gap-4 lg:w-[max(1100px,74%)] lg:grid-cols-6 lg:gap-5"
          style={{ transform: 'translateX(-50%) rotateX(calc(28deg - var(--p) * 20deg)) scale(calc(1 + var(--p) * .1))' }}
        >
          {columns.map((col, c) => (
            <div key={c} className={cx('group/col anim-rise', c >= 4 && 'max-sm:hidden', c >= 5 && 'max-lg:hidden')} style={{ animationDelay: `${150 + Math.abs(c - (COLUMNS - 1) / 2) * 90}ms` }}>
              <div
                className={cx('flex flex-col group-hover/col:[animation-play-state:paused]', motion !== 'off' && (c % 2 ? 'wall-down' : 'wall-up'))}
                style={{ animationDuration: `${38 + (c % 3) * 9}s` }}
              >
                {/* the list twice, so translating by -50% loops seamlessly */}
                {[...col, ...col].map((s, k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setOpen(s)}
                    aria-label={s.label}
                    aria-haspopup="dialog"
                    tabIndex={k < PER_COLUMN && c < 4 ? 0 : -1}
                    aria-hidden={k >= PER_COLUMN || undefined}
                    // the card art carries its own frame on a transparent surround, so the glow follows its shape (drop-shadow), no box
                    className="mb-3 block w-full transition-[transform,filter] duration-500 hover:z-10 hover:-translate-y-2 hover:scale-[1.04] hover:[filter:drop-shadow(0_0_22px_rgb(var(--c-accent)/.55))] sm:mb-4 lg:mb-5"
                  >
                    <img src={s.artSmall ?? s.art} alt="" draggable={false} loading={k < 2 ? 'eager' : 'lazy'} decoding="async" className="aspect-[3/4] w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* melt into the page below */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-bg to-transparent" aria-hidden="true" />

      {open && (
        <CardPopup art={open.art} product={getProduct(open.to.split('/').pop() ?? '')} to={open.to} label={open.label} onClose={close} />
      )}
    </section>
  );
}
