import { useEffect } from 'react';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Thin neon reading-progress bar along the top of every page. Scroll drives
 * two custom properties on <html>: --sy (px scrolled) and --sp (0 → 1).
 * With motion off the bar stays empty.
 */
export function BackgroundFX() {
  const { motion } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    if (motion === 'off') { root.style.setProperty('--sy', '0'); root.style.setProperty('--sp', '0'); return; }
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = Math.max(1, root.scrollHeight - window.innerHeight);
      root.style.setProperty('--sy', String(window.scrollY));
      root.style.setProperty('--sp', String(Math.min(1, window.scrollY / max)));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, [motion]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[2px] origin-right bg-accent shadow-[0_0_12px_rgb(var(--c-accent)/.8)] ltr:origin-left" style={{ transform: 'scaleX(var(--sp, 0))' }} aria-hidden="true" />
  );
}
