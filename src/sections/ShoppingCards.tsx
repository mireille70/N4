import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { bySlugs, type Product } from '@/content/catalog';
import { Icon } from '@/components/ui/Icon';
import { Reveal, SectionHead } from '@/components/ui/primitives';
import { cx, formatAmount } from '@/lib/format';
import { SLIDE, SLIDER } from '@/lib/slider';
import { site } from '@/content/site';

/**
 * One shopping brand as a gift ticket: a dark card with half-circle notches on both sides and a
 * dashed tear line between them. Top: the brand logo in a circle on its own colour, with that
 * colour glowing behind it on hover. Bottom (the stub): the name, "بطاقة هدية" and the price.
 * Hover: the ticket lifts, the glow rises and the stub's arrow turns ember. (Also used on the
 * categories page.)
 */
export function ShoppingTile({ product: p }: { product: Product; index: number }) {
  return (
    <Link to={`/product/${p.slug}`} aria-label={p.name} className="group block transition-transform duration-300 [transition-timing-function:cubic-bezier(.2,.8,.2,1)] hover:-translate-y-1.5" style={{ '--brand': p.tile } as CSSProperties}>
      <span className="ticket relative flex h-[196px] flex-col sm:h-[230px] overflow-hidden rounded-[24px] bg-[#06130E]">
        {/* top: logo */}
        <span className="relative grid flex-[0_0_64%] place-items-center">
          <span className="absolute inset-x-6 top-6 bottom-2 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-50" style={{ background: 'var(--brand)' }} aria-hidden="true" />
          <span className="relative grid h-16 w-16 place-items-center overflow-hidden rounded-full sm:h-20 sm:w-20 shadow-[0_14px_28px_-12px_rgb(0_0_0/.95),inset_0_0_0_1px_rgb(255_255_255/.1)] transition-transform duration-500 [transition-timing-function:cubic-bezier(.2,.8,.2,1)] group-hover:scale-110" style={{ background: 'var(--brand)' }}>
            <img src={p.image} srcSet={p.imageSet} sizes="96px" alt="" loading="lazy" decoding="async" className="h-full w-full scale-[1.15] object-contain p-2" />
          </span>
        </span>
        {/* tear line */}
        <span className="mx-5 border-t-2 border-dashed border-line" aria-hidden="true" />
        {/* stub */}
        <span className="flex flex-1 items-center justify-between gap-2 px-4 sm:px-5">
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-fg">{p.name}</span>
            <span className="mt-0.5 block whitespace-nowrap text-[11px] text-muted sm:text-xs">يبدأ من <span className="num text-fg/80">{formatAmount(p.price)}</span> {site.locale.currency.symbol}</span>
          </span>
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-raised sm:h-8 sm:w-8 text-fg/70 transition-colors duration-300 group-hover:bg-accent group-hover:text-onaccent">
            <Icon name="arrow-next" size={14} />
          </span>
        </span>
      </span>
    </Link>
  );
}

/** Shopping cards — a row of gift tickets (six across on desktop; a sideways swipe slider on tablets and phones). */
export function ShoppingCards({ id, title, products: slugs, viewAll, index = '06' }: { id: string; title: string; products: string[]; viewAll?: { label: string; to: string }; index?: string }) {
  const list = bySlugs(slugs);
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 pb-section" data-index={index}>
      <div className="container-x">
        <SectionHead id={`${id}-title`} index={index} title={title} eyebrow="Shopping" action={viewAll} />
        <ul className={cx(SLIDER, 'lg:grid-cols-6')}>
          {list.map((p, i) => (
            <Reveal as="li" key={p.slug} delay={(i % 6) * 70} className={cx(SLIDE, 'max-sm:w-[176px]')}>
              <ShoppingTile product={p} index={i} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
