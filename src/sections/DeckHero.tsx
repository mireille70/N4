import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { HeroSlide } from '@/content/home';
import { getProduct } from '@/content/catalog';
import { CardPopup } from '@/components/product/CardPopup';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/theme/ThemeProvider';

const SLOTS = 10; // cards in the row
const STEP_X = 0.5; // horizontal gap between neighbours, in card widths
const RISE = 0.12; // each card sits this much higher than the one in front, in card widths
const TURN = 46; // degrees every card is turned away from the viewer
const SPEED = 1 / 2.8; // slots per second the row flows back

/** Split the headline into two balanced lines by word count */
const headlineHalves = (s: HeroSlide) => {
  const words = s.lines.join(' ').split(/\s+/).filter(Boolean);
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid), words.slice(mid)];
};

/**
 * Hero — "card deck".
 * Headline and button on top; below, a row of the game cards turned in 3D and
 * rising diagonally like dominoes, the front card at the bottom (on the
 * reading-start side). The row flows backwards without stopping: cards fade in
 * at the front, travel up the row and fade out at the back. Each card is
 * projected on its own and stacked front-to-back, so neighbours never
 * intersect. Hover pauses the row and lifts a card; click opens its popup.
 */
export function DeckHero({ slides }: { slides: HeroSlide[]; promos?: { offers: string; arrivals: string; shopping: string } }) {
  const { motion } = useTheme();
  const head = slides[0];
  const [open, setOpen] = useState<HeroSlide | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const refs = useRef<Array<HTMLDivElement | null>>([]);
  const paused = useRef(false);
  const deck = useMemo(() => Array.from({ length: SLOTS }, (_, k) => slides[k % slides.length]), [slides]);
  const stars = useMemo(() => Array.from({ length: 80 }, (_, i) => ({ x: (i * 53) % 100, y: (i * 37 + (i % 7) * 11) % 100, s: i % 6 === 0 ? 2.5 : 1.5, d: (i % 9) * 0.6 })), []);

  useEffect(() => {
    // in RTL the row starts at the bottom right and climbs to the left
    const dir = document.documentElement.dir === 'rtl' ? -1 : 1;
    const place = (shift: number) => {
      refs.current.forEach((el, k) => {
        if (!el) return;
        const pos = (k + shift) % SLOTS; // 0 = front … SLOTS = back
        const x = (pos - (SLOTS - 1) / 2) * STEP_X * dir;
        const y = ((SLOTS - 1) / 2 - pos) * RISE;
        const fade = Math.min(1, pos / 0.8, (SLOTS - pos) / 1.4);
        el.style.transform = `translate(-50%,-50%) translate(calc(var(--cw) * ${x.toFixed(3)}), calc(var(--cw) * ${y.toFixed(3)})) scale(${(1 - pos * 0.025).toFixed(3)}) perspective(1100px) rotateY(${TURN * dir}deg)`;
        el.style.opacity = fade.toFixed(3);
        el.style.zIndex = String(1000 - Math.round(pos * 10));
        el.style.pointerEvents = fade < 0.5 ? 'none' : '';
      });
    };
    if (motion === 'off') { place(0.5); return; }
    let raf = 0;
    let last = 0;
    let shift = 0.5;
    const tick = (now: number) => {
      if (last && !paused.current) shift = (shift + ((now - last) / 1000) * SPEED) % SLOTS;
      last = now;
      place(shift);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [motion]);

  return (
    // The section slides up under the floating header so the backdrop fills the whole top of the page
    <section aria-label="العروض الرئيسية" className="relative -mt-[68px] overflow-hidden bg-[color-mix(in_srgb,rgb(var(--c-bg))_65%,black)] pb-10 pt-[calc(68px+2.5rem)] lg:-mt-[80px] lg:pb-16 lg:pt-[calc(80px+3.5rem)]">
      {/* starfield + one accent glow under the row */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {stars.map((s, i) => (
          <span key={i} className="star absolute rounded-full bg-surface" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${-s.d}s` }} />
        ))}
        <div className="absolute bottom-[-10%] left-1/2 h-[60%] w-[80%] -translate-x-1/2 rounded-[50%] bg-accent/[.14] blur-[120px]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-bg to-transparent" />
      </div>

      {/* headline */}
      <div className="container-x relative z-10 flex flex-col items-center text-center">
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

      {/* card deck */}
      <div
        className="anim-fade relative mx-auto mt-4 h-[280px] [--cw:84px] [animation-delay:200ms] sm:h-[400px] sm:[--cw:140px] lg:mt-2 lg:h-[480px] lg:[--cw:190px]"
        onMouseEnter={() => { paused.current = true; }}
        onMouseLeave={() => { paused.current = false; }}
      >
        {deck.map((s, k) => (
          <div key={k} ref={(el) => { refs.current[k] = el; }} className="absolute left-1/2 top-1/2 w-[var(--cw)] will-change-transform">
            <button
              type="button"
              onClick={() => setOpen(s)}
              aria-label={s.label}
              aria-haspopup="dialog"
              tabIndex={k < slides.length ? 0 : -1}
              className="group block w-full transition-transform duration-500 hover:-translate-y-4"
            >
              <img
                src={s.artSmall ?? s.art}
                alt=""
                draggable={false}
                decoding="async"
                className="aspect-[3/4] w-full object-cover [filter:drop-shadow(0_24px_30px_rgb(0_0_0/.75))] transition-[filter] duration-500 group-hover:[filter:drop-shadow(0_0_24px_rgb(var(--c-accent)/.6))]"
              />
            </button>
          </div>
        ))}
      </div>

      {open && (
        <CardPopup art={open.art} product={getProduct(open.to.split('/').pop() ?? '')} to={open.to} label={open.label} onClose={close} />
      )}
    </section>
  );
}
