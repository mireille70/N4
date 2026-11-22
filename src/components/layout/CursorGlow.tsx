import { useEffect, useRef } from 'react';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * A soft accent glow that follows the pointer anywhere on the page, behind the
 * content. It fades in while the pointer moves and fades out when it rests or
 * leaves the window. Skipped on touch-only devices and when motion is off.
 */
export function CursorGlow() {
  const { motion } = useTheme();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || motion === 'off' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const cur = { ...target };
    let raf = 0;
    let idle = 0;
    const tick = () => {
      cur.x += (target.x - cur.x) * 0.14;
      cur.y += (target.y - cur.y) * 0.14;
      el.style.transform = `translate(${cur.x.toFixed(1)}px, ${cur.y.toFixed(1)}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      el.style.opacity = '1';
      window.clearTimeout(idle);
      idle = window.setTimeout(() => { el.style.opacity = '0'; }, 1600);
    };
    const onLeave = () => { el.style.opacity = '0'; };
    raf = requestAnimationFrame(tick);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(idle);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [motion]);

  return (
    <div
      ref={ref}
      // only rendered on pointer devices: a fixed box this size would otherwise widen the page on phones
      className="pointer-events-none fixed left-0 top-0 -z-10 hidden h-[620px] w-[620px] [@media(hover:hover)_and_(pointer:fine)]:block rounded-full bg-[radial-gradient(closest-side,rgb(var(--pastel-lavender)/.45),rgb(var(--pastel-peach)/.18)_55%,transparent)] opacity-0 transition-opacity duration-700"
      aria-hidden="true"
    />
  );
}
