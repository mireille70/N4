import { useEffect, useRef } from 'react';
import { useTheme } from '@/theme/ThemeProvider';

const GAP = 30;          // px between dots
const RADIUS = 150;      // mouse influence radius
const PUSH = 18;         // max push away from the cursor (px)

/**
 * Interactive dot field for the hero background (canvas, behind the content).
 *  - idle: still dots — nothing moves and nothing is redrawn
 *  - hover (mouse only): a slow wave eases in, and dots near the pointer glow ember and are pushed
 *    away from it; on leave the wave eases back out and the field settles still
 * Pauses when off screen or the tab is hidden; reduced motion / motion 'off' draws it still.
 */
export function DotField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { motion } = useTheme();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const still = motion === 'off' || !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let w = 0, h = 0, dpr = 1, raf = 0, visible = true, t = 0;
    const mouse = { x: -9999, y: -9999, sx: -9999, sy: -9999 };
    let hovering = false;
    let energy = 0; // eases 0 → 1 on hover and back to 0 on leave
    let settled = true;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5); // dots are tiny: a 2x canvas only costs fill-rate
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const light = document.documentElement.dataset.mode === 'light';
      // smooth the pointer so the glow trails it a little
      mouse.sx += (mouse.x - mouse.sx) * 0.33;
      mouse.sy += (mouse.y - mouse.sy) * 0.33;
      const amp = 3 * energy;
      for (let y = -GAP; y < h + GAP; y += GAP) {
        for (let x = GAP / 2; x < w + GAP; x += GAP) {
          let px = x;
          let py = y + (still ? 0 : Math.sin(t * 0.0012 + x * 0.012 + y * 0.008) * amp);
          const dx = px - mouse.sx, dy = py - mouse.sy;
          const d = Math.hypot(dx, dy);
          let k = 0;
          if (d < RADIUS) {
            k = 1 - d / RADIUS;
            const f = (k * k * PUSH) / (d || 1);
            px += dx * f; py += dy * f;
          }
          const size = 1.1 + k * 2.2;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fillStyle = light
            ? (k > 0.02 ? `rgba(8,74,56,${0.3 + k * 0.7})` : 'rgba(8,74,56,0.28)') // dark green dots on white
            : (k > 0.02 ? `rgba(63,${Math.round(216 + 20 * (1 - k))},192,${0.25 + k * 0.75})` : 'rgba(242,247,244,0.13)');
          ctx.fill();
        }
      }
    };

    let last = 0;
    const loop = (now: number) => {
      t = now;
      energy += ((hovering ? 1 : 0) - energy) * 0.06;
      if (!hovering && energy < 0.01) energy = 0;
      const glow = mouse.sx > -999; // pointer glow still easing out
      const active = hovering || energy > 0 || glow;
      // 30fps is plenty for a slow wave of small dots, and halves the per-frame canvas upload / mask work
      if (active && visible && !document.hidden && now - last >= 32) { last = now; settled = false; draw(); }
      else if (!active && !settled) { settled = true; draw(); } // one last still frame
      raf = requestAnimationFrame(loop);
    };

    const onEnter = (e: PointerEvent) => { if (e.pointerType === 'mouse') hovering = true; };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      hovering = true;
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      if (mouse.sx < -999) { mouse.sx = mouse.x; mouse.sy = mouse.y; }
      if (still) { mouse.sx = mouse.x; mouse.sy = mouse.y; draw(); }
    };
    const onLeave = () => {
      hovering = false;
      mouse.x = -9999; mouse.y = -9999;
      // the loop draws one last still frame once the wave has eased out
      if (still) { mouse.sx = mouse.sy = -9999; draw(); } else { mouse.sx = mouse.sy = -9999; }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(canvas);
    const host = canvas.parentElement ?? window;
    host.addEventListener('pointerenter', onEnter as EventListener);
    host.addEventListener('pointermove', onMove as EventListener);
    host.addEventListener('pointerleave', onLeave);
    if (!still) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      host.removeEventListener('pointerenter', onEnter as EventListener);
      host.removeEventListener('pointermove', onMove as EventListener);
      host.removeEventListener('pointerleave', onLeave);
    };
  }, [motion]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
