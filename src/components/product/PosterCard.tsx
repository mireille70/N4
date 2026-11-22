import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '@/content/catalog';
import { Price } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/format';
import { ProductArt } from './ProductArt';

/**
 * Retail card: a charcoal card (soft 28px corners, the ember swoosh along the bottom of its end
 * side — see .game-frame); the artwork sits in an inset window (natural colours, dark floor at its
 * foot), and an info panel underneath holds the name, the category line, a labelled price and a
 * round ember action. Discount / badge and the favourite button sit on the art's top corners.
 * Hover: the card lifts, the swoosh rises and the art scales slightly (no light sweep over the art).
 */
export function PosterCard({
  href, product, eager, className, title, subtitle, badge, price, compareAt, discount, fav, onFav, onAction, actionLabel, actionIcon = 'arrow-next', photo,
}: {
  href: string; product: Product; eager?: boolean; className?: string; photo?: boolean;
  title: string; subtitle?: string; badge?: ReactNode;
  price: number; compareAt?: number; discount?: number;
  fav?: boolean; onFav?: () => void;
  onAction?: () => void; actionLabel: string; actionIcon?: string;
}) {
  const btnCls = 'grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[linear-gradient(145deg,#1B5A44_0%,#0E2A1E_55%,#06130E_100%)] sm:h-11 sm:w-11 text-[#6FE8D5] shadow-[0_8px_16px_-8px_rgb(0_0_0/.6)] transition-transform duration-200 hover:scale-105';

  return (
    <article className={cx('game-frame card-mint group flex h-full flex-col p-2 hover:-translate-y-1', className)}>
      <div className="card-art relative overflow-hidden rounded-[22px] bg-container">
        <Link to={href} className="relative block outline-none" aria-label={title} tabIndex={-1}>
          <ProductArt
            product={product}
            photo={photo}
            eager={eager}
            sizes="(min-width:1024px) 25vw, 50vw"
            className="aspect-square [&_img]:transition-transform [&_img]:duration-500 [&_img]:[transition-timing-function:var(--ease-std)] group-hover:[&_img]:scale-[1.04]"
          />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,rgb(9_10_12/.7),transparent)]" aria-hidden="true" />
        </Link>

        <div className="card-badges pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between">
          <span className="flex flex-col items-start gap-1.5">
            {discount ? <span className="num rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-semibold text-onaccent" dir="ltr">-{discount}%</span> : null}
            {badge}
          </span>
          {onFav && (
            <button
              type="button"
              onClick={onFav}
              aria-pressed={fav}
              aria-label={fav ? `إزالة ${title} من المفضلة` : `إضافة ${title} إلى المفضلة`}
              className={cx(
                'pointer-events-auto grid h-9 w-9 place-items-center rounded-full border border-line bg-bg/70 text-fg backdrop-blur-sm transition duration-200 hover:border-fg/25',
                fav ? '!text-accent' : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-lg:opacity-100',
              )}
            >
              <Icon name="heart" size={16} fill={fav ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
      </div>

      <div className="card-info flex flex-1 flex-col px-1.5 pb-1.5 pt-3 sm:px-3 sm:pb-3 sm:pt-4">
        <h3 className="truncate font-display text-sm font-semibold leading-5 sm:text-base sm:leading-6">
          <Link to={href} className="outline-none transition-colors duration-200 hover:text-accent focus-visible:text-accent">{title}</Link>
        </h3>
        {subtitle && <p className="card-sub mt-0.5 truncate text-[11px] text-muted sm:text-xs">{subtitle}</p>}
        <div className="card-buy mt-3 flex items-end justify-between gap-2 sm:mt-4 sm:gap-3">
          <div className="min-w-0">
            <span className="card-label block text-[11px] text-muted">السعر</span>
            <Price value={price} compareAt={compareAt} size="sm" className="mt-0.5" />
          </div>
          {onAction ? (
            <button type="button" onClick={onAction} aria-label={`${actionLabel}: ${title}`} className={btnCls}><Icon name={actionIcon} size={18} /></button>
          ) : (
            <Link to={href} aria-label={`${actionLabel}: ${title}`} className={btnCls}><Icon name={actionIcon} size={18} /></Link>
          )}
        </div>
      </div>
    </article>
  );
}
