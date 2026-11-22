import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { categories, productsIn, type CategoryIcon } from '@/content/catalog';
import { CategoryGlyph } from '@/components/ui/CategoryGlyph';
import { Icon } from '@/components/ui/Icon';
import { cx, formatInt } from '@/lib/format';

const hrefOf = (slug: string) => (slug === 'all' ? '/categories' : `/categories/${slug}`);

/** The owner's 3D category icons (graphite renditions, `node scripts/build-ember-icons.cjs`) — still used by the loyalty illustration. */
const ICON_V = 5;
export const ART: Partial<Record<CategoryIcon, string>> = {
  all: `/assets/categories/ember/all.webp?v=${ICON_V}`,
  best: `/assets/categories/ember/best.webp?v=${ICON_V}`,
  games: `/assets/categories/ember/games.webp?v=${ICON_V}`,
  gifts: `/assets/categories/ember/gifts.webp?v=${ICON_V}`,
  stores: `/assets/categories/ember/stores.webp?v=${ICON_V}`,
};

/** pill order */
const ORDER: CategoryIcon[] = ['all', 'games', 'voice', 'gifts', 'best', 'stores', 'delivery', 'entertainment'];

/** each category's circle icon and its warm swoosh colour (all inside the ember family) */
const STYLE: Record<CategoryIcon, { icon: string; color: string }> = {
  all: { icon: 'grid', color: 'linear-gradient(135deg,#5EE4CF,#1FA891)' },
  games: { icon: 'gamepad', color: 'linear-gradient(135deg,#8BEBDA,#2BB9A1)' },
  gifts: { icon: 'gift', color: 'linear-gradient(135deg,#6FE8D5,#1FA891)' },
  best: { icon: 'trophy', color: 'linear-gradient(135deg,#A8F2E4,#3FD8C0)' },
  stores: { icon: 'store', color: 'linear-gradient(135deg,#5EE4CF,#17806F)' },
  delivery: { icon: 'truck', color: 'linear-gradient(135deg,#7FEBDA,#25B09A)' },
  entertainment: { icon: 'tv', color: 'linear-gradient(135deg,#8BEBDA,#1FA891)' },
  voice: { icon: 'mic', color: 'linear-gradient(135deg,#7FEBDA,#1FA891)' },
};

/**
 * Categories.
 *  - Homepage: a grid of swoosh pills — dark capsule, the category icon in a warm circle at the
 *    start, name + product count, and a curve of the same colour sweeping up along the bottom of
 *    the end side (it grows on hover and on the selected pill). With `onSelect` the pills act as
 *    tabs for the grid beneath them.
 *  - Catalog pages (`compact`): a slim row of chips used as a filter.
 */
export function CategoryRail({ title, activeSlug, compact, hideTitle, onSelect, className }: { title?: string; activeSlug?: string; compact?: boolean; hideTitle?: boolean; /** links become tabs (buttons) */ onSelect?: (slug: string) => void; className?: string }) {
  if (compact) return <CategoryPills activeSlug={activeSlug ?? 'all'} />;

  const list = ORDER.map((icon) => categories.find((c) => c.icon === icon)).filter(
    (c): c is (typeof categories)[number] => !!c && productsIn(c.slug).length > 0,
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag: any = onSelect ? 'button' : Link;
  const props = (slug: string, active: boolean) =>
    onSelect
      ? { type: 'button' as const, onClick: () => onSelect(slug), 'aria-pressed': active }
      : { to: hrefOf(slug), 'aria-current': active ? ('page' as const) : undefined };

  return (
    <section aria-labelledby="cat-title" className={className ?? 'pb-section pt-section'}>
      <div className="container-x">
        {hideTitle ? (
          <h2 id="cat-title" className="sr-only">{title ?? 'الفئات'}</h2>
        ) : (
          <div className="mb-5 flex items-end justify-between gap-3 sm:mb-8 sm:gap-4 md:mb-10">
            <h2 id="cat-title" className="font-display text-xl leading-8 sm:text-[1.75rem] sm:leading-9 md:text-[2.25rem] md:leading-[2.75rem]">{title ?? 'الأقسام'}</h2>
          </div>
        )}
        <SegmentBar list={list} activeSlug={activeSlug} Tag={Tag} props={props} />
      </div>
    </section>
  );
}

/**
 * One wide capsule holding every category; an ember pill slides behind the selected one (measured
 * from the button, so it follows on resize). Each segment: icon, name, count. Scrolls sideways on
 * phones (the selected segment is brought into view).
 */
function SegmentBar({ list, activeSlug, Tag, props }: {
  list: typeof categories;
  activeSlug?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Tag: any;
  props: (slug: string, active: boolean) => Record<string, unknown>;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLElement | null>>({});
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const el = activeSlug ? itemRefs.current[activeSlug] : null;
      if (!el) return setPill(null);
      setPill({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    const el = activeSlug ? itemRefs.current[activeSlug] : null;
    el?.scrollIntoView?.({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [activeSlug]);

  return (
    <div ref={barRef} className="cat-scroll no-scrollbar -mx-gutter overflow-x-auto px-gutter sm:mx-0 sm:rounded-full sm:border sm:border-line sm:bg-[#06130E] sm:p-1.5 sm:shadow-[0_20px_40px_-24px_rgb(0_0_0/.9)]">
      <div className="cat-bar relative flex w-full min-w-max gap-1">
        {/* the sliding ember pill */}
        <span
          className={cx('cat-pill pointer-events-none absolute inset-y-0 rounded-full bg-[image:var(--grad-ember)] shadow-[inset_0_1px_0_rgb(255_255_255/.3),0_10px_24px_-10px_rgb(63_216_192/.7)] transition-[left,width,opacity] duration-500 [transition-timing-function:cubic-bezier(.65,0,.25,1)]', pill ? 'opacity-100' : 'opacity-0')}
          style={{ left: pill?.left ?? 0, width: pill?.width ?? 0 }}
          aria-hidden="true"
        />
        {list.map((c) => {
          const active = c.slug === activeSlug;
          const s = STYLE[c.icon];
          return (
            <Tag
              key={c.slug}
              ref={(el: HTMLElement | null) => { itemRefs.current[c.slug] = el; }}
              {...props(c.slug, active)}
              data-active={active ? 'true' : undefined}
              className={cx('cat-seg group relative z-10 flex h-14 flex-1 items-center justify-center gap-2.5 rounded-full px-4 transition-colors xl:gap-3 xl:px-5 duration-300', active ? 'text-onaccent' : 'text-fg/75 hover:bg-white/[.04] hover:text-fg')}
            >
              <span className={cx('cat-ico grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors duration-300', active ? 'bg-black/15' : 'bg-raised text-accent')}>
                <Icon name={s.icon} size={18} strokeWidth={1.9} />
              </span>
              <span className="cat-name whitespace-nowrap text-sm font-semibold">{c.name}</span>
              <span className={cx('cat-count num rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors duration-300', active ? 'bg-black/15' : 'bg-raised text-muted')}>{formatInt(productsIn(c.slug).length)}</span>
            </Tag>
          );
        })}
      </div>
    </div>
  );
}

/** Filter pills for catalog pages */
function CategoryPills({ activeSlug }: { activeSlug: string }) {
  return (
    <nav aria-label="تصفح الفئات" className="py-6">
      <div className="container-x">
        <ul className="no-scrollbar -mx-gutter flex gap-2 overflow-x-auto px-gutter lg:mx-0 lg:flex-wrap lg:px-0">
          {categories.map((c) => {
            const active = c.slug === activeSlug;
            return (
              <li key={c.slug} className="shrink-0">
                <Link
                  to={hrefOf(c.slug)}
                  aria-current={active ? 'page' : undefined}
                  className={cx('flex h-11 items-center gap-2 rounded-xl border pe-4 ps-1.5 text-sm font-medium transition-colors duration-200', active ? 'border-accent/60 bg-accent/10 text-fg' : 'border-line bg-surface text-fg/80 hover:border-fg/20 hover:text-fg')}
                >
                  <span className={cx('grid h-8 w-8 place-items-center rounded-lg', active ? 'bg-accent/15 text-accent' : 'bg-raised')}>
                    <CategoryGlyph icon={c.icon} className="h-4 w-4" />
                  </span>
                  {c.name}
                  <span className="num text-xs text-muted">{formatInt(productsIn(c.slug).length)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
