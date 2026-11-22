import { bySlugs } from '@/content/catalog';
import { ProductCard } from '@/components/product/ProductCard';
import { Reveal, SectionHead } from '@/components/ui/primitives';

/**
 * Uniform product grid — columns come from themeConfig.grid.products.
 * `bare` shows just art + name (popular games); otherwise full retail cards
 * with price, discount and add button (products). `id` keeps headings unique
 * when the section appears more than once on a page.
 */
export function PopularGrid({ id = 'popular', title, products: slugs, viewAll, index = '02', bare }: { id?: string; title: string; products: string[]; viewAll?: { label: string; to: string }; index?: string; bare?: boolean }) {
  const list = bySlugs(slugs);

  return (
    <section aria-labelledby={`${id}-title`} className="pb-section">
      <div className="container-x">
        <SectionHead id={`${id}-title`} index={index} title={title} action={viewAll} />
        <div className={bare ? 'grid-products compact-grid gap-y-8 lg:gap-y-10' : 'grid-products gap-y-8 lg:gap-y-10'}>
          {list.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 4) * 70}>
              <ProductCard product={p} bare={bare} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
