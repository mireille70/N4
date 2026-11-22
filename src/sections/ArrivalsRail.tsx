import { useEffect, useRef, useState } from 'react';
import { bySlugs } from '@/content/catalog';
import { ProductCard } from '@/components/product/ProductCard';
import { Icon } from '@/components/ui/Icon';
import { SectionHead } from '@/components/ui/primitives';

/**
 * New arrivals — a scrolling rail of the same product cards as the "المنتجات" slider (key art,
 * name, category, price, add button), each with a "new" pill. Arrows + progress scroll the rail.
 */
export function ArrivalsRail({ id, title, products: slugs, index = '05' }: { id: string; title: string; products: string[]; index?: string }) {
  const list = bySlugs(slugs);
  const railRef = useRef<HTMLUListElement>(null);
  const [progress, setProgress] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      const pos = Math.abs(el.scrollLeft);
      setProgress(max > 0 ? pos / max : 1);
      setEdges({ start: pos < 4, end: max - pos < 4 });
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);

  const scroll = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    const card = el.querySelector('li');
    const step = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: -dir * step, behavior: 'smooth' });
  };
  const scrollable = !(edges.start && edges.end);

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 pb-section" data-index={index}>
      <div className="container-x">
        <div className="flex items-end justify-between gap-4">
          <SectionHead id={`${id}-title`} index={index} title={title} eyebrow="New arrivals" className="flex-1" />
          {scrollable && (
            <div className="mb-8 hidden items-center gap-3 sm:flex md:mb-12">
              <div className="h-1 w-24 overflow-hidden rounded-full bg-line" aria-hidden="true">
                <div className="h-full origin-right rounded-full bg-accent transition-transform ltr:origin-left" style={{ transform: `scaleX(${Math.max(progress, 0.15)})` }} />
              </div>
              <button type="button" onClick={() => scroll(-1)} disabled={edges.start} aria-label="السابق" className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-fg transition-colors hover:border-fg/25 disabled:opacity-30">
                <Icon name="arrow-prev" size={18} />
              </button>
              <button type="button" onClick={() => scroll(1)} disabled={edges.end} aria-label="التالي" className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-fg transition-colors hover:border-fg/25 disabled:opacity-30">
                <Icon name="arrow-next" size={18} />
              </button>
            </div>
          )}
        </div>

        <ul ref={railRef} className="mini-rail no-scrollbar -mx-gutter flex snap-x snap-mandatory gap-3 overflow-x-auto sm:gap-6 scroll-px-gutter px-gutter pb-4 pt-1 lg:mx-0 lg:px-0" aria-label={title}>
          {list.map((p) => (
            <li key={p.slug} className="w-[172px] shrink-0 snap-start sm:w-[302px] lg:w-[calc(25%-18px)]">
              {/* same card as the "المنتجات" slider (key art), with a "new" pill */}
              <ProductCard
                product={p}
                photo
                badge={<span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-line bg-bg/75 px-2 text-[11px] font-medium text-fg backdrop-blur-sm"><span className="h-1.5 w-1.5 rounded-full bg-accent" />جديد</span>}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
