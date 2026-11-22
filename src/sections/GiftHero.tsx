import { useEffect, useRef, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type { HeroSlide } from '@/content/home';
import { bySlugs } from '@/content/catalog';
import { site } from '@/content/site';
import { BrandGlyph } from '@/components/ui/BrandGlyph';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/theme/ThemeProvider';

const CARD_DEPTH = 12; // px — thickness of the gift card
const COIN_DEPTH = 10; // px — thickness of a coin

/** Coins around the card: [x, y, z] in px (scene units), spin seconds, bob delay */
const COINS: Array<{ slug: string; at: [number, number, number]; spin: number; delay: number }> = [
  { slug: 'playstation', at: [-245, -120, -40], spin: 7, delay: 0 },
  { slug: 'xbox', at: [240, -140, 60], spin: 9, delay: -1.6 },
  { slug: 'steam', at: [-265, 90, 90], spin: 8, delay: -3.1 },
  { slug: 'google-play', at: [255, 110, -70], spin: 10, delay: -0.8 },
  { slug: 'epic', at: [-100, 185, 150], spin: 7.5, delay: -2.2 },
  { slug: 'itunes', at: [110, -200, -130], spin: 8.5, delay: -4 },
];

/** Split the headline into two balanced lines by word count */
const headlineHalves = (s: HeroSlide) => {
  const words = s.lines.join(' ').split(/\s+/).filter(Boolean);
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid), words.slice(mid)];
};

/**
 * Hero — "gift card in 3D".
 * Copy on the reading-start side; on the other side a small 3D scene: a KOON
 * gift card with real thickness slowly spinning (front, edge, back) and floating
 * over a glow, ringed by platform coins — each a thick disc spinning and bobbing
 * on its own timing. The pointer tilts the whole scene. Everything sits in one
 * preserve-3d space; coins are placed outside the card's sweep so nothing ever
 * intersects.
 */
export function GiftHero({ slides }: { slides: HeroSlide[]; promos?: { offers: string; arrivals: string; shopping: string } }) {
  const { motion } = useTheme();
  const head = slides[0];
  const sceneRef = useRef<HTMLDivElement>(null);
  const coins = bySlugs(COINS.map((c) => c.slug));

  // pointer tilt, eased
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || motion === 'off') return;
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const tick = () => {
      cur.x += (target.x - cur.x) * 0.05;
      cur.y += (target.y - cur.y) * 0.05;
      scene.style.setProperty('--tx', `${(cur.x * 12).toFixed(2)}deg`);
      scene.style.setProperty('--ty', `${(-cur.y * 9).toFixed(2)}deg`);
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener('pointermove', onMove); cancelAnimationFrame(raf); };
  }, [motion]);

  return (
    // The section slides up under the floating header so the backdrop fills the whole top of the page
    <section aria-label="العروض الرئيسية" className="relative -mt-[68px] overflow-hidden bg-[color-mix(in_srgb,rgb(var(--c-bg))_65%,black)] pb-12 pt-[calc(68px+2rem)] lg:-mt-[80px] lg:pb-16 lg:pt-[calc(80px+2rem)]">
      {/* faint grid + glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="grid-bg absolute inset-0 opacity-70" />
        <div className="absolute end-[-10%] top-[15%] h-[700px] w-[700px] rounded-full bg-accent/[.10] blur-[140px] max-lg:end-[-40%]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-bg to-transparent" />
      </div>

      <div className="container-x relative grid items-center gap-6 lg:min-h-[calc(100svh-80px)] lg:grid-cols-[1fr_1.1fr] lg:gap-10">
        {/* copy */}
        <div className="relative z-20 text-center lg:text-start">
          <p className="anim-rise inline-flex items-center gap-2 rounded-full bg-accent/10 px-3.5 py-1.5 text-xs font-semibold text-accent ring-1 ring-inset ring-accent/25">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />بطاقات الألعاب والهدايا الرقمية
          </p>
          <h1 className="anim-rise mt-5 font-display text-[2.1rem] font-extrabold leading-[1.3] [animation-delay:60ms] sm:text-5xl lg:text-[3.6rem] lg:leading-[1.2]">
            {headlineHalves(head).map((half, h) => (
              <span key={h} className="block">
                {half.map((w, i) => (
                  <span key={i}>{i > 0 && ' '}<span className={w === head.highlight ? 'text-accent' : undefined}>{w}</span></span>
                ))}
              </span>
            ))}
          </h1>
          <p className="anim-rise mx-auto mt-5 max-w-md text-base leading-7 text-muted [animation-delay:120ms] lg:mx-0 lg:text-lg">
            اشحن ألعابك واشترِ بطاقات المنصات والمتاجر من مكان واحد.
          </p>
          <div className="anim-rise mt-8 flex flex-wrap justify-center gap-3 [animation-delay:180ms] lg:justify-start">
            <Link to={head.cta.to} className="btn btn-primary">{head.cta.label} <Icon name="arrow-next" size={19} /></Link>
            {head.secondary && <Link to={head.secondary.to} className="btn btn-ghost">{head.secondary.label}</Link>}
          </div>
        </div>

        {/* 3D scene */}
        <div className="anim-fade relative isolate z-10 mx-auto h-[340px] w-full max-w-[640px] [animation-delay:150ms] sm:h-[460px] lg:h-[560px]" aria-hidden="true">
          {/* floor glow + contact shadow */}
          <div className="absolute bottom-[8%] left-1/2 h-[18%] w-[70%] -translate-x-1/2 rounded-[50%] bg-accent/25 blur-3xl" />
          <div className="card-shadow absolute bottom-[14%] left-1/2 h-[5%] w-[40%] -translate-x-1/2 rounded-[50%] bg-black/80 blur-xl" />

          {/* size steps live on this wrapper: the inner scene's inline transform would override a scale class */}
          <div className="absolute left-1/2 top-1/2 scale-[.6] [perspective:1400px] sm:scale-[.82] lg:scale-100">
            <div
              ref={sceneRef}
              className="[transform-style:preserve-3d]"
              style={{ transform: 'rotateX(calc(-10deg + var(--ty, 0deg))) rotateY(var(--tx, 0deg))' } as CSSProperties}
            >
              {/* gift card */}
              <div className="card-float [transform-style:preserve-3d]">
                {/* anchored at left/top: in RTL a box wider than its zero-width parent would otherwise hang off its right edge */}
                <div className="card-spin absolute left-0 top-0 h-[214px] w-[340px] [transform-style:preserve-3d]">
                  {/* edge: stacked slices give the card real thickness */}
                  {Array.from({ length: 8 }, (_, i) => (
                    <span key={i} className="absolute inset-0 rounded-[18px] bg-[color-mix(in_srgb,rgb(var(--c-accent))_45%,black)]" style={{ transform: `translateZ(${(-CARD_DEPTH / 2 + (i + 0.5) * (CARD_DEPTH / 8)).toFixed(1)}px)` }} />
                  ))}
                  <CardFront />
                  <CardBack />
                </div>
              </div>

              {/* coins */}
              {COINS.map((c, i) => {
                const p = coins.find((x) => x.slug === c.slug);
                if (!p) return null;
                return (
                  <div key={c.slug} className="absolute [transform-style:preserve-3d]" style={{ transform: `translate3d(${c.at[0]}px, ${c.at[1]}px, ${c.at[2]}px)` }}>
                    <div className="coin-bob [transform-style:preserve-3d]" style={{ animationDelay: `${c.delay}s` }}>
                      <div className="coin-spin absolute left-0 top-0 h-[78px] w-[78px] [transform-style:preserve-3d]" style={{ animationDuration: `${c.spin}s`, animationDelay: `${-i * 0.7}s` }}>
                        {Array.from({ length: 6 }, (_, k) => (
                          <span key={k} className="absolute inset-0 rounded-full bg-[#030C08] ring-1 ring-accent/30" style={{ transform: `translateZ(${(-COIN_DEPTH / 2 + (k + 0.5) * (COIN_DEPTH / 6)).toFixed(1)}px)` }} />
                        ))}
                        {[0, 180].map((rot) => (
                          <span key={rot} className="coin-face absolute inset-0 grid place-items-center rounded-full [backface-visibility:hidden]" style={{ transform: `rotateY(${rot}deg) translateZ(${COIN_DEPTH / 2}px)` }}>
                            <BrandGlyph id={p.glyph!} size={64} className="h-auto w-[44%] text-white" />
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CardFront() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[18px] p-6 text-ink [backface-visibility:hidden]" style={{ transform: `translateZ(${CARD_DEPTH / 2}px)`, background: 'linear-gradient(135deg, color-mix(in srgb, rgb(var(--c-accent)) 55%, white) 0%, rgb(var(--c-accent)) 42%, color-mix(in srgb, rgb(var(--c-accent)) 60%, black) 100%)' }}>
      {/* fine diagonal lines + a soft sheen */}
      <span className="absolute inset-0 opacity-[.12] [background:repeating-linear-gradient(135deg,rgb(var(--c-ink))_0_1px,transparent_1px_10px)]" />
      <span className="absolute -start-1/3 -top-1/2 h-[200%] w-1/3 rotate-[25deg] bg-raised/25 blur-xl" />
      <div className="relative flex h-full flex-col justify-between" dir="ltr">
        <div className="flex items-start justify-between">
          <span className="font-display text-2xl font-extrabold tracking-[.18em]">{site.brand.name}</span>
          <span className="font-mono text-[10px] font-semibold tracking-[.2em] opacity-70">GIFT CARD</span>
        </div>
        {/* chip */}
        <span className="block h-9 w-12 rounded-md bg-gradient-to-br from-white/80 to-white/30 ring-1 ring-ink/20 [background-image:linear-gradient(90deg,transparent_45%,rgb(var(--c-ink)/.25)_45%_55%,transparent_55%),linear-gradient(135deg,rgb(255_255_255/.85),rgb(255_255_255/.35))]" />
        <div className="flex items-end justify-between">
          <span className="font-mono text-sm tracking-[.24em] opacity-80">•••• •••• ••••</span>
          <span className="text-sm font-bold" dir="rtl">بطاقة هدايا</span>
        </div>
      </div>
    </div>
  );
}

function CardBack() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[18px] bg-[#06130E] text-fg [backface-visibility:hidden]" style={{ transform: `rotateY(180deg) translateZ(${CARD_DEPTH / 2}px)` }}>
      <span className="absolute inset-x-0 top-7 h-10 bg-black" />
      <div className="absolute inset-x-6 bottom-6 flex items-end justify-between" dir="ltr">
        <span className="rounded-md bg-fg/10 px-3 py-2 font-mono text-xs tracking-[.2em] text-fg/80">XXXX-XXXX-XXXX</span>
        <span className="font-display text-lg font-extrabold tracking-[.18em] text-accent">{site.brand.name}</span>
      </div>
      <span className="absolute inset-0 rounded-[18px] ring-1 ring-inset ring-accent/30" />
    </div>
  );
}
