import { bySlugs } from '@/content/catalog';
import { ProductCard } from '@/components/product/ProductCard';
import { SectionHead } from '@/components/ui/primitives';

/** Homepage: the curated popular games grid (the category pills row was removed). */
export function CategoryShowcase({ id, title, products, viewAll, index }: { id: string; title: string; products: string[]; viewAll: { label: string; to: string }; index?: string }) {
  const list = bySlugs(products);
  const link = viewAll;

  return (
    <>
      <section aria-labelledby={`${id}-title`} className="pb-section pt-4 sm:pt-8 lg:pt-12">
        <div className="container-x">
          <SectionHead id={`${id}-title`} index={index} title={title} action={link} eyebrow="Discover" />
          <div className="compact-grid compact-2 no-scrollbar -mx-gutter flex snap-x gap-4 overflow-x-auto px-gutter pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-5 lg:gap-y-6 lg:overflow-visible lg:px-0">
            {list.map((p, i) => (
              <div key={p.slug} className="compact-cell anim-rise w-[305px] max-w-[85vw] shrink-0 snap-start lg:w-auto" style={{ animationDelay: `${Math.min(i, 7) * 60}ms` }}>
                <ProductCard product={p} bare />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
