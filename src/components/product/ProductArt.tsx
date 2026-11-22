import type { Product } from '@/content/catalog';
import { BrandGlyph } from '@/components/ui/BrandGlyph';
import { cx } from '@/lib/format';
import { GradientTile, TokenTile } from './GradientTile';

/**
 * Renders a product's visual regardless of kind:
 *  - topup     → key art photograph
 *  - platform  → monochrome brand glyph on a dark card stock
 *  - shopping  → brand logo on its own brand color
 */
export function ProductArt({ product, className, hd, eager, sizes, photo, token }: { product: Product; className?: string; hd?: boolean; eager?: boolean; sizes?: string; photo?: boolean; token?: boolean }) {
  if (product.kind === 'platform') {
    return (
      <div className={cx('grad-matte relative grid place-items-center overflow-hidden', className)}>
        {/* warm studio light behind a matte token holding the platform glyph */}
        <span className="spotlight absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 opacity-80" aria-hidden="true" />
        <span className="token-3d grid aspect-square w-[46%] place-items-center">
          <BrandGlyph id={product.glyph!} size={88} className="h-auto w-[52%] text-[#F2F7F4]" />
        </span>
        <span className="eyebrow absolute bottom-4 start-4 !text-[#F2F7F4]/60" aria-hidden="true">{product.nameEn}</span>
      </div>
    );
  }
  if (product.kind === 'shopping') {
    return (
      <div className={cx('relative grid place-items-center overflow-hidden', className)} style={{ background: product.tile }}>
        <img src={product.image} srcSet={product.imageSet} sizes={sizes ?? '(min-width:1024px) 220px, 45vw'} alt="" loading={eager ? 'eager' : 'lazy'} decoding="async" width={360} height={276} className="h-full w-full object-contain" />
      </div>
    );
  }
  // game cards: gradient tile, except the large detail view (hd) and places asking for the photo
  if (token) return <TokenTile product={product} className={className} />;
  if (!hd && !photo) return <GradientTile product={product} className={className} />;
  return (
    <div className={cx('relative overflow-hidden bg-surface', className)}>
      <img
        src={hd && product.imageHd && !product.imageSet ? product.imageHd : product.image}
        srcSet={product.imageSet}
        alt=""
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        sizes={sizes ?? (hd ? '(min-width:1024px) 50vw, 100vw' : '(min-width:1024px) 25vw, 50vw')}
        width={556}
        height={640}
        className="h-full w-full object-cover object-top"
      />
    </div>
  );
}
