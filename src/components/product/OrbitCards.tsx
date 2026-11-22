import { useEffect, useRef } from 'react';
import { bySlugs } from '@/content/catalog';
import { useTheme } from '@/theme/ThemeProvider';
import { ProductArt } from './ProductArt';

const SPEED = 12; // degrees per second — one lap every 30 s
const RX = 46; // ellipse half-width, % of the stage width (cqw)
const RY = 9; // ellipse half-height, cqw — a flat ring seen from slightly above
const CY = -6; // ring centre, cqw above the stage centre

/**
 * Game cards orbiting the hero mascot on a flat 3D ring. The stage this sits
 * in is a size container, so positions are in cqw and scale with it. Depth
 * comes from the angle: cards at the back of the ring are smaller and dimmer,
 * cards swinging round the front grow and brighten. The whole ring sits behind
 * the mascot (lower z-index), so a card never covers its face. Decorative only.
 */
export function OrbitCards({ slugs }: { slugs: string[] }) {
  const { motion } = useTheme();
  const list = bySlugs(slugs);
  const refs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const n = refs.current.length;
    const place = (t: number) => {
      refs.current.forEach((el, i) => {
        if (!el) return;
        const a = ((t * SPEED + (360 / n) * i) * Math.PI) / 180;
        const s = Math.sin(a);
        const c = Math.cos(a);
        const depth = (s + 1) / 2; // 0 = back, 1 = front
        el.style.transform = `translate(-50%,-50%) translate(${(c * RX).toFixed(2)}cqw, ${(CY + s * RY).toFixed(2)}cqw) scale(${(0.6 + depth * 0.4).toFixed(3)}) rotate(${(c * -10).toFixed(1)}deg)`;
        el.style.opacity = (0.35 + depth * 0.65).toFixed(3);
        el.style.zIndex = String(Math.round(depth * 10));
      });
    };
    if (motion === 'off') { place(0); return; }
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      place((now - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [motion, list.length]);

  return (
    <div className="pointer-events-none absolute inset-0 [container-type:inline-size]" aria-hidden="true">
      {list.map((p, i) => (
        <div
          key={p.slug}
          ref={(el) => { refs.current[i] = el; }}
          className="absolute left-1/2 top-1/2 w-[15cqw] will-change-transform"
        >
          <div className="overflow-hidden rounded-[10px] shadow-[0_24px_40px_-16px_rgb(0_0_0/.95)] ring-1 ring-white/10">
            <ProductArt product={p} className="aspect-[3/4] [&_.eyebrow]:hidden" sizes="120px" />
          </div>
        </div>
      ))}
    </div>
  );
}
