import { Link } from 'react-router-dom';
import type { Product } from '@/content/catalog';
import { hasPacks } from '@/content/packs';
import { Icon } from '@/components/ui/Icon';
import { Price } from '@/components/ui/primitives';
import { GradientTile } from './GradientTile';
import { useAddToCart } from './useAddToCart';

/**
 * Game card used by "وصل حديثًا" and "الالعاب الشائعه": the top window is the game's artwork with
 * a matte logo plate resting on its dark floor; an info panel underneath with the name, the price
 * and the buy button. `n` adds the "new" pill and drop number; `plain` drops the info panel (the
 * whole card is then the tile, linking to the game).
 */
export function TiltCard({ product, n, plain }: { product: Product; n?: number; plain?: boolean }) {
  const add = useAddToCart();
  const href = hasPacks(product.slug) ? `/game/${product.slug}` : `/product/${product.slug}`;
  return (
    <article className={`game-frame card-mint group overflow-hidden p-2 hover:-translate-y-1${plain ? ' card-grad' : ''}`}>
      <Link to={href} aria-label={product.name} className="card-art relative block overflow-hidden rounded-[22px]">
        <GradientTile product={product} tilt className="aspect-[4/5] w-full" />
        {n !== undefined && (
          <span className="absolute inset-x-3 top-3 flex items-center justify-between text-xs font-bold" aria-hidden="true">
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-line bg-bg/75 px-2.5 text-fg"><span className="h-1.5 w-1.5 rounded-full bg-accent" />جديد</span>
            <span className="num font-mono text-white/70">{String(n).padStart(2, '0')}</span>
          </span>
        )}
      </Link>

      {!plain && (
        <div className="px-2 pb-2 pt-4">
          <h3 className="truncate font-display text-base font-semibold">{product.name}</h3>
          <div className="mt-3 flex items-center justify-between gap-2">
            <Price value={product.price} compareAt={product.compareAt} size="sm" />
            <button type="button" onClick={() => add(product)} className="btn btn-primary btn-sm">
              اشحن الآن<Icon name="arrow-next" size={16} />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
