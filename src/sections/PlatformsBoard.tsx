import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { bySlugs } from '@/content/catalog';
import { BrandGlyph } from '@/components/ui/BrandGlyph';
import { SectionHead } from '@/components/ui/primitives';
import { useTheme } from '@/theme/ThemeProvider';
import { cx } from '@/lib/format';
import { SLIDE, SLIDER } from '@/lib/slider';

const LIT_MS = 2600;

/**
 * Platforms — six quiet tiles in one row (a sideways swipe slider on smaller screens).
 * Motion: when the row scrolls into view the tiles flip up into place one after another; a beam of
 * ember light runs round the border of the hovered tile and of one featured tile that moves along
 * the row on its own (stops while the pointer is over the row, off with reduced motion).
 */
export function PlatformsBoard({ id, title, products: slugs, index = '03' }: { id: string; title: string; products: string[]; index?: string }) {
  const list = bySlugs(slugs);
  const n = list.length;
  const { motion } = useTheme();
  const rowRef = useRef<HTMLUListElement>(null);
  const [inView, setInView] = useState(false);
  const [lit, setLit] = useState(0);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const el = rowRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return setInView(true);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || hovering || motion === 'off' || n < 2) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setTimeout(() => setLit((a) => (a + 1) % n), LIT_MS);
    return () => window.clearTimeout(t);
  }, [lit, inView, hovering, motion, n]);

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 pb-section">
      <div className="container-x">
        <SectionHead id={`${id}-title`} index={index} title={title} eyebrow="Platforms" />
        <ul
          ref={rowRef}
          className={cx(SLIDER, 'plat-row lg:grid-cols-6', inView && 'is-in')}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          {list.map((p, i) => (
            <li key={p.slug} className={cx(SLIDE, 'plat-card')} style={{ '--i': i } as CSSProperties}>
              <Link
                to={`/product/${p.slug}`}
                className={cx('plat-mint beam group flex h-[124px] flex-col items-center justify-between rounded-[20px] sm:h-[200px] sm:rounded-[28px] bg-[#06130E] p-3 text-center sm:p-5 shadow-[inset_0_0_0_1px_rgb(var(--c-line))]', !hovering && i === lit && 'is-lit')}
              >
                <span />
                <span className="plat-ico grid h-11 w-11 place-items-center rounded-full sm:h-16 sm:w-16 bg-[#0A1F17] text-fg/90">
                  <BrandGlyph id={p.glyph!} size={28} />
                </span>
                <span className="block w-full">
                  <span className="block truncate text-xs font-semibold text-fg sm:text-sm">{p.name}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
