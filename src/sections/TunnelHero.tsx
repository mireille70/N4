import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { HeroSlide } from '@/content/home';
import { getProduct } from '@/content/catalog';
import { CardPopup } from '@/components/product/CardPopup';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/theme/ThemeProvider';

const COUNT = 14; // cards in flight
const LIFE = 9; // seconds for a card to travel from the portal past the viewer
const Z_FAR = -2600; // depth where cards leave the portal (px)
const Z_NEAR = 260; // depth where they fade out, just in front of the screen
const PERSPECTIVE = 900;
const SPIRAL = 110; // degrees a card turns around the axis during its flight

/** Split the headline into two balanced lines by word count */
const headlineHalves = (s: HeroSlide) => {
  const words = s.lines.join(' ').split(/\s+/).filter(Boolean);
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid), words.slice(mid)];
};

/**
 * Hero — "warp tunnel".
 * A glowing portal sits in the middle of the stage, pulsing rings outward.
 * Game cards emerge from it far away and fly toward the viewer along a slow
 * spiral, growing and turning in 3D as they come close, then fade at the edge
 * while new ones keep coming. Moving the pointer tilts the tunnel; hovering
 * pauses it; clicking a card opens its popup. Every card is projected on its
 * own (perspective in its transform) and stacked by depth, so none intersect.
 */
export function TunnelHero({ slides }: { slides: HeroSlide[]; promos?: { offers: string; arrivals: string; shopping: string } }) {
  const { motion } = useTheme();
  const head = slides[0];
  const [open, setOpen] = useState<HeroSlide | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const stageRef = useRef<HTMLDivElement>(null);
  const refs = useRef<Array<HTMLDivElement | null>>([]);
  const paused = useRef(false);
  const pointer = useRef({ x: 0, y: 0 }); // target tilt, −1…1
  const fleet = useMemo(() => Array.from({ length: COUNT }, (_, i) => slides[i % slides.length]), [slides]);
  const stars = useMemo(() => Array.from({ length: 80 }, (_, i) => ({ x: (i * 53) % 100, y: (i * 37 + (i % 7) * 11) % 100, s: i % 6 === 0 ? 2.5 : 1.5, d: (i % 9) * 0.6 })), []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const tilt = { x: 0, y: 0 };
    const place = (time: number) => {
      const w = stage.clientWidth;
      const radius = Math.min(w * 0.3, 420);
      tilt.x += (pointer.current.x - tilt.x) * 0.06;
      tilt.y += (pointer.current.y - tilt.y) * 0.06;
      refs.current.forEach((el, i) => {
        if (!el) return;
        const phase = ((time / LIFE + i / COUNT) % 1 + 1) % 1; // 0 = at the portal, 1 = past the viewer
        const z = Z_FAR + (Z_NEAR - Z_FAR) * phase * phase; // eases out of the portal, rushes at the end
        const a = ((i * 137.5 + phase * SPIRAL) * Math.PI) / 180; // golden-angle spread so cards never stack up
        const near = phase; // 0 far … 1 near
        const x = Math.cos(a) * radius * 1.2 + tilt.x * 90 * near;
        const y = Math.sin(a) * radius * 0.62 + tilt.y * 60 * near;
        const fade = Math.min(1, phase / 0.12, (1 - phase) / 0.18);
        el.style.transform = `translate(-50%,-50%) perspective(${PERSPECTIVE}px) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${(-Math.cos(a) * 28 + tilt.x * 10).toFixed(1)}deg) rotateX(${(Math.sin(a) * 18 - tilt.y * 8).toFixed(1)}deg) rotateZ(${(Math.cos(a) * 6).toFixed(1)}deg)`;
        el.style.opacity = Math.max(0, fade).toFixed(3);
        el.style.zIndex = String(Math.round(z + 3000));
        el.style.pointerEvents = fade < 0.4 ? 'none' : '';
      });
    };
    if (motion === 'off') { place(LIFE * 0.35); return; }
    let raf = 0;
    let last = 0;
    let time = LIFE * 0.35;
    const tick = (now: number) => {
      if (last && !paused.current) time += (now - last) / 1000;
      last = now;
      place(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [motion]);

  return (
    // The section slides up under the floating header so the backdrop fills the whole top of the page
    <section aria-label="العروض الرئيسية" className="relative -mt-[68px] overflow-hidden bg-[color-mix(in_srgb,rgb(var(--c-bg))_65%,black)] pb-10 pt-[calc(68px+2.5rem)] lg:-mt-[80px] lg:pb-14 lg:pt-[calc(80px+3.5rem)]">
      {/* starfield */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {stars.map((s, i) => (
          <span key={i} className="star absolute rounded-full bg-surface" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${-s.d}s` }} />
        ))}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-bg to-transparent" />
      </div>

      {/* headline */}
      <div className="container-x relative z-20 flex flex-col items-center text-center">
        <h1 className="anim-rise mx-auto max-w-4xl font-display text-[2rem] font-extrabold leading-[1.35] [text-shadow:0_4px_30px_rgb(0_0_0/.8)] sm:text-5xl lg:text-[3.3rem] lg:leading-[1.25]">
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

      {/* tunnel */}
      <div
        ref={stageRef}
        // isolate: cards stack by depth inside the stage only, so they always pass under the headline
        className="anim-fade relative isolate z-10 mx-auto -mt-2 h-[380px] w-full [animation-delay:200ms] sm:h-[480px] lg:h-[560px]"
        onMouseEnter={() => { paused.current = true; }}
        onMouseLeave={() => { paused.current = false; pointer.current = { x: 0, y: 0 }; }}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          pointer.current = { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: ((e.clientY - r.top) / r.height) * 2 - 1 };
        }}
      >
        {/* portal */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 sm:h-[160px] sm:w-[160px]" aria-hidden="true">
          <span className="absolute inset-[-140%] rounded-full bg-[radial-gradient(closest-side,rgb(var(--c-accent)/.28),transparent)]" />
          {[0, 1, 2].map((r) => (
            <span key={r} className="portal-pulse absolute inset-0 rounded-full border border-accent/60" style={{ animationDelay: `${r * 1.1}s` }} />
          ))}
          <span className="absolute inset-[30%] rounded-full bg-accent/80 blur-xl" />
          <span className="absolute inset-[42%] rounded-full bg-surface blur-[6px]" />
        </div>

        {fleet.map((s, i) => (
          <div key={i} ref={(el) => { refs.current[i] = el; }} className="absolute left-1/2 top-1/2 w-[96px] will-change-transform sm:w-[130px] lg:w-[150px]">
            <button
              type="button"
              onClick={() => setOpen(s)}
              aria-label={s.label}
              aria-haspopup="dialog"
              tabIndex={i < slides.length ? 0 : -1}
              className="group block w-full"
            >
              <img
                src={s.artSmall ?? s.art}
                alt=""
                draggable={false}
                decoding="async"
                className="aspect-[3/4] w-full object-cover transition-[filter] duration-300 [filter:drop-shadow(0_20px_26px_rgb(0_0_0/.8))] group-hover:[filter:drop-shadow(0_0_22px_rgb(var(--c-accent)/.7))]"
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
