import { useRef } from 'react';
import { bySlugs } from '@/content/catalog';
import { ProductCard } from '@/components/product/ProductCard';
import { Icon } from '@/components/ui/Icon';
import { SectionHead } from '@/components/ui/primitives';

/**
 * Products — one row of full retail cards that scrolls sideways (snap), with
 * previous / next arrows; four cards show on desktop, fewer on smaller screens.
 */
export function ProductSlider({ id, title, products: slugs, viewAll, index }: { id: string; title: string; products: string[]; viewAll?: { label: string; to: string }; index?: string }) {
  const list = bySlugs(slugs);
  const track = useRef<HTMLUListElement>(null);

  // one card width per click; in RTL the reading end lies toward negative scrollLeft
  const go = (step: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const by = (card?.offsetWidth ?? 300) + 24;
    const rtl = getComputedStyle(el).direction === 'rtl';
    el.scrollBy({ left: by * step * (rtl ? -1 : 1), behavior: 'smooth' });
  };

  return (
    <section aria-labelledby={`${id}-title`} className="pb-section">
      <div className="container-x">
        {/* items-end + the same bottom margin as SectionHead → arrows line up with the "الكل" button */}
        <div className="flex items-end justify-between gap-4">
          <SectionHead id={`${id}-title`} index={index} title={title} action={viewAll} eyebrow="Products" className="flex-1" />
          {/* arrows on larger screens; phones swipe */}
          <div className="mb-8 hidden h-10 items-center gap-2 border-s border-line ps-4 sm:flex md:mb-10">
            <button type="button" onClick={() => go(-1)} aria-label="السابق" className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-fg transition-colors hover:border-fg/25">
              <Icon name="arrow-next" size={18} className="flip-x" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="التالي" className="grid h-10 w-10 place-items-center rounded-full bg-accent text-onaccent transition-transform hover:-translate-y-px">
              <Icon name="arrow-next" size={18} />
            </button>
          </div>
        </div>
        <ul ref={track} className="mini-rail no-scrollbar -mx-gutter flex snap-x snap-mandatory gap-3 overflow-x-auto sm:gap-6 scroll-px-gutter px-gutter pb-4 pt-1">
          {list.map((p) => (
            <li key={p.slug} className="w-[172px] shrink-0 snap-start sm:w-[302px] lg:w-[calc((100%-72px)/4)]">
              <ProductCard product={p} photo />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
