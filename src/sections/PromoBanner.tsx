import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from '@/components/ui/primitives';
import { cx } from '@/lib/format';

const AUTO_MS = 5000;
const arrowCls = 'absolute top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-[#11231A]/75 text-white shadow-[0_6px_16px_-6px_rgb(0_0_0/.6)] backdrop-blur-sm transition-colors hover:bg-[#11231A] sm:h-11 sm:w-11';

interface PromoSlide { image: string; alt: string; to: string }

/**
 * Promo banner slider — full-width image banners (between the voice apps and the categories), each
 * linking to its own page. The artwork is shown as supplied (never cropped or recoloured); only the
 * frame (rounded corners, hairline border) belongs to the theme. Swipe / scroll sideways on phones,
 * dots underneath, advances on its own (paused on hover / touch and with reduced motion).
 */
export function PromoBanner({ id, slides }: { id: string; slides: PromoSlide[] }) {
  const track = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;

  const go = useCallback((i: number) => {
    const el = track.current;
    if (!el) return;
    const k = (i + n) % n;
    const child = el.children[k] as HTMLElement | undefined;
    // direction-safe (the page is RTL): measure against the track's own box instead of using offsets
    if (child) {
      const t = el.getBoundingClientRect();
      const c = child.getBoundingClientRect();
      el.scrollBy({ left: c.left - t.left, behavior: 'smooth' });
    }
    setActive(k);
  }, [n]);

  // follow manual swipes
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const t = el.getBoundingClientRect();
        let best = 0;
        let bestD = Infinity;
        Array.from(el.children).forEach((c, i) => {
          const d = Math.abs((c as HTMLElement).getBoundingClientRect().left - t.left);
          if (d < bestD) { bestD = d; best = i; }
        });
        setActive(best);
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { el.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  // autoplay
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'off';
    if (reduce || paused || n < 2) return;
    const t = window.setTimeout(() => go(active + 1), AUTO_MS);
    return () => window.clearTimeout(t);
  }, [active, paused, n, go]);

  return (
    <section id={id} aria-roledescription="carousel" aria-label="العروض" className="-mt-3 pb-4 sm:-mt-4 sm:pb-8">
      <div className="container-x">
        <Reveal>
          <div
            onPointerEnter={(e) => { if (e.pointerType === 'mouse') setPaused(true); }}
            onPointerLeave={(e) => { if (e.pointerType === 'mouse') setPaused(false); }}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
          >
            <div className="relative">
            <ul
              ref={track}
              className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-[18px] [-ms-overflow-style:none] [scrollbar-width:none] sm:rounded-[28px] [&::-webkit-scrollbar]:hidden"
              style={{ boxShadow: 'inset 0 0 0 1px #15352A, 0 24px 48px -28px rgb(0 0 0 / .9)' }}
            >
              {slides.map((s, i) => (
                <li key={s.image} aria-roledescription="slide" aria-label={`${i + 1} / ${n}`} className="w-full shrink-0 snap-start">
                  <Link to={s.to} className="block" tabIndex={i === active ? 0 : -1}>
                    <img src={s.image} alt={s.alt} width={1800} height={600} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" draggable={false} className="block h-auto w-full" />
                  </Link>
                </li>
              ))}
            </ul>

            {n > 1 && (
              <>
                {/* physical sides (the track is RTL: slide 1 is on the right, "next" is to the left) */}
                <button type="button" onClick={() => go(active + 1)} aria-label="الشريحة التالية" className={arrowCls + ' left-2 sm:left-4'}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
                </button>
                <button type="button" onClick={() => go(active - 1)} aria-label="الشريحة السابقة" className={arrowCls + ' right-2 sm:right-4'}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
                </button>
              </>
            )}
            </div>

            {n > 1 && (
              <div className="mt-3 flex justify-center gap-2" role="group" aria-label="اختيار الشريحة">
                {slides.map((s, i) => (
                  <button
                    key={s.image}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`الشريحة ${i + 1}`}
                    aria-current={i === active}
                    className={cx('h-2 rounded-full transition-all duration-300', i === active ? 'w-6 bg-[#11231A]' : 'w-2 bg-[#11231A]/25 hover:bg-[#11231A]/45')}
                  />
                ))}
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
