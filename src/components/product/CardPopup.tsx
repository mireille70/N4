import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import type { Product } from '@/content/catalog';
import { useAddToCart } from '@/components/product/useAddToCart';
import { DiscountBadge, Price } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/Icon';

/**
 * Card popup — the clicked game card enlarged (it flips in) beside the
 * product's name, price and buy / details actions. Rendered in a portal so no
 * transformed ancestor traps it. Closes on Esc, the close button or a click on
 * the backdrop; focus moves into the dialog and returns to the opener.
 */
export function CardPopup({ art, product, to, label, onClose }: { art: string; product?: Product; to: string; label: string; onClose: () => void }) {
  const add = useAddToCart();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); opener?.focus(); };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto p-4" role="dialog" aria-modal="true" aria-labelledby="card-popup-title">
      <button type="button" className="anim-fade absolute inset-0 cursor-default bg-black/75 backdrop-blur-md" onClick={onClose} aria-label="إغلاق" tabIndex={-1} />

      <div className="popup-in game-frame game-frame-lg relative grid w-full max-w-3xl items-center gap-6 p-5 sm:p-8 md:grid-cols-[minmax(0,.85fr)_minmax(0,1fr)] md:gap-10">
        <button ref={closeRef} type="button" onClick={onClose} aria-label="إغلاق" className="notch-sm absolute end-3 top-3 z-10 grid h-10 w-10 place-items-center bg-fg/[.07] transition-colors hover:bg-accent hover:text-white">
          <Icon name="x" size={18} />
        </button>

        {/* card */}
        <div className="relative mx-auto w-[min(70vw,300px)] [perspective:1000px] md:w-full">
          <div className="pointer-events-none absolute inset-[10%] rounded-full bg-accent/30 blur-3xl" aria-hidden="true" />
          <img src={art} alt="" className="popup-card relative w-full [filter:drop-shadow(0_0_26px_rgb(var(--c-accent)/.45))]" />
        </div>

        {/* details */}
        <div className="text-center md:text-start">
          <p className="text-xs font-semibold text-accent">بطاقة شحن</p>
          <h2 id="card-popup-title" className="mt-2 font-display text-3xl font-extrabold leading-snug sm:text-4xl">{product?.name ?? label}</h2>
          {product && <p className="mt-2 font-mono text-xs uppercase tracking-[.14em] text-muted"><span dir="ltr">{product.nameEn}</span></p>}

          {product && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <Price value={product.price} compareAt={product.compareAt} size="lg" />
              {product.discount ? <DiscountBadge percent={product.discount} /> : null}
            </div>
          )}

          <div className="mt-7 flex flex-wrap justify-center gap-3 md:justify-start">
            {product && (
              <button type="button" onClick={() => { add(product); onClose(); }} className="btn btn-primary">
                {product.requiresPlayerId ? 'اشتري الان' : 'أضف للسلة'} <Icon name="arrow-next" size={19} />
              </button>
            )}
            <Link to={to} onClick={onClose} className="btn btn-ghost">تفاصيل المنتج</Link>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
