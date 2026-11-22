import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { getCategory, type Product } from '@/content/catalog';
import { useTheme } from '@/theme/ThemeProvider';
import { useStore } from '@/store/StoreProvider';
import { BrandGlyph } from '@/components/ui/BrandGlyph';
import { useAddToCart } from './useAddToCart';
import { hasPacks } from '@/content/packs';
import { PosterCard } from './PosterCard';
import { TiltCard } from './TiltCard';

/**
 * Product card. Full retail cards use <PosterCard>; `bare` shows a lighter game tile — the
 * art in a rounded window, the name, the Latin brand line and a small arrow chip.
 */
/** `photo` shows the game's key art instead of the gradient tile (used by the home "المنتجات" slider) */
export function ProductCard({ product, className, eager, bare, photo, badge }: { product: Product; className?: string; eager?: boolean; bare?: boolean; photo?: boolean; badge?: ReactNode }) {
  const { productCard } = useTheme();
  const { isFavorite, dispatch } = useStore();
  const add = useAddToCart();
  const fav = isFavorite(product.slug);
  // popular-game tiles open the game's packs page first; everything else goes straight to details
  const href = bare && hasPacks(product.slug) ? `/game/${product.slug}` : `/product/${product.slug}`;

  if (!bare) {
    return (
      <PosterCard
        href={href}
        product={product}
        photo={photo}
        badge={badge}
        eager={eager}
        className={className}
        title={product.name}
        subtitle={getCategory(product.categories.find((c) => c !== 'best-sellers' && c !== 'all') ?? '')?.name ?? (productCard.showEnglishName ? product.nameEn : undefined)}
        price={product.price}
        compareAt={product.compareAt}
        discount={product.discount}
        fav={fav}
        onFav={() => dispatch({ type: 'fav/toggle', slug: product.slug })}
        onAction={productCard.quickAdd ? () => add(product) : undefined}
        actionLabel={product.requiresPlayerId ? 'اشتري الآن' : 'أضف للسلة'}
        actionIcon={product.requiresPlayerId ? 'arrow-next' : 'plus'}
      />
    );
  }

  // game tiles in the popular grid use the same card as "وصل حديثًا"
  if (product.kind === 'topup') return <div className={className}><TiltCard product={product} plain /></div>;

  // platforms / shopping brands: the same frame and size as the game tiles (TiltCard plain) —
  // the mark large in the middle, and the same pill plate with the name at the foot
  return (
    <div className={className}>
      <article className="game-frame card-mint card-grad group overflow-hidden p-2 hover:-translate-y-1">
        <Link to={href} aria-label={product.name} className="relative block aspect-[4/5] overflow-hidden rounded-[22px] [container-type:inline-size]">
          {product.kind === 'shopping' ? (
            <span className="absolute inset-0" style={{ background: product.tile }}>
              <img src={product.image} srcSet={product.imageSet} sizes="(min-width:1024px) 25vw, 50vw" alt="" loading={eager ? 'eager' : 'lazy'} decoding="async" className="h-full w-full object-contain pb-[20cqw] transition-transform duration-700 group-hover:scale-[1.05]" />
            </span>
          ) : (
            <span className="grad-matte absolute inset-0 grid place-items-center pb-[18cqw]">
              <span className="spotlight absolute left-1/2 top-[40%] h-[60%] w-[70%] -translate-x-1/2 -translate-y-1/2 opacity-70 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true" />
              <BrandGlyph id={product.glyph!} size={96} className="relative h-auto w-[30cqw] text-[#F2F7F4] transition-transform duration-700 [transition-timing-function:var(--ease-std)] group-hover:scale-110" />
            </span>
          )}
          <span className="absolute inset-x-[10cqw] bottom-[7cqw] flex h-[20cqw] items-center justify-center rounded-full border border-white/10 bg-[#010604]/75 px-[6cqw] text-white shadow-[inset_0_1px_0_rgb(255_255_255/.06),0_20px_40px_-20px_rgb(0_0_0/.9)] backdrop-blur-[4px] transition-[transform,border-color] duration-300 group-hover:-translate-y-[1cqw] group-hover:border-[rgb(63_216_192/.45)]">
            <span className="truncate whitespace-nowrap font-display text-[4.6cqw] font-bold uppercase leading-none tracking-[-0.01em]" dir="ltr">{product.nameEn}</span>
          </span>
        </Link>
      </article>
    </div>
  );
}
