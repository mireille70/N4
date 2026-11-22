import { Link } from 'react-router-dom';
import { getProduct } from '@/content/catalog';
import { useStore } from '@/store/StoreProvider';
import { ProductArt } from '@/components/product/ProductArt';
import { Icon } from '@/components/ui/Icon';
import { DemoNote, EmptyState, Price } from '@/components/ui/primitives';
import { usePageTitle } from '@/lib/usePageTitle';

export default function CartPage() {
  usePageTitle('السلة');
  const { cart, cartTotal, cartCount, dispatch } = useStore();

  return (
    <section className="container-x pb-section pt-10 md:pt-16">
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-2xl font-bold sm:text-4xl md:text-5xl">السلة</h1>
        {cartCount > 0 && <span className="pb-1.5 text-sm text-muted"><span className="num font-semibold text-fg">{cartCount}</span> منتج</span>}
      </div>

      {cart.length === 0 ? (
        <div className="mt-10"><EmptyState icon="cart" title="السلة فارغة" action={{ label: 'الفئات', to: '/categories' }} /></div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          <ul className="divide-y divide-line border-y border-line lg:col-span-8">
            {cart.map((line) => {
              const product = getProduct(line.slug);
              return (
                <li key={line.key} className="flex gap-4 py-5 md:gap-6">
                  {product && (
                    <Link to={`/product/${line.slug}`} className="shrink-0" aria-label={line.name} tabIndex={-1}>
                      <ProductArt product={product} className="notch-sm h-24 w-20 rounded-full md:h-28 md:w-24" />
                    </Link>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link to={`/product/${line.slug}`} className="font-display text-lg font-semibold hover:text-accent">{line.name}</Link>
                        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                          {line.playerId && <span>معرف اللاعب: <span className="num text-fg/80">{line.playerId}</span></span>}
                          {line.options?.length ? <span>{line.options.join(' · ')}</span> : null}
                        </div>
                      </div>
                      <button type="button" onClick={() => dispatch({ type: 'cart/remove', key: line.key })} className="icon-btn -me-2 -mt-2 text-muted hover:text-danger" aria-label={`حذف ${line.name}`}>
                        <Icon name="trash" size={20} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="notch-sm flex h-11 items-center bg-fg/[.05]">
                        <button type="button" className="grid h-11 w-11 place-items-center disabled:opacity-30" onClick={() => dispatch({ type: 'cart/qty', key: line.key, qty: line.qty + 1 })} disabled={line.qty >= 10} aria-label="زيادة الكمية"><Icon name="plus" size={18} /></button>
                        <span className="num w-8 text-center font-semibold" aria-live="polite">{line.qty}</span>
                        <button type="button" className="grid h-11 w-11 place-items-center disabled:opacity-30" onClick={() => dispatch({ type: 'cart/qty', key: line.key, qty: line.qty - 1 })} disabled={line.qty <= 1} aria-label="تقليل الكمية"><Icon name="minus" size={18} /></button>
                      </div>
                      <Price value={line.price * line.qty} size="md" />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <section aria-label="ملخص الطلب" className="lg:col-span-4">
            <div className="game-frame p-6 lg:sticky lg:top-28 md:p-7">
              <h2 className="font-display text-lg font-semibold">ملخص الطلب</h2>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-muted">عدد المنتجات</dt><dd className="num">{cartCount}</dd></div>
              </dl>
              <div className="my-5 h-px bg-line" />
              <div className="flex items-baseline justify-between">
                <span className="font-semibold">الإجمالي</span>
                <Price value={cartTotal} size="lg" />
              </div>
              <Link to="/checkout" className="btn btn-primary mt-6 w-full">
                إتمام الطلب<Icon name="arrow-next" size={20} />
              </Link>
              <DemoNote className="mt-4">عرض تجريبي: لا توجد بوابة دفع مفعّلة ولن يتم تحصيل أي مبلغ.</DemoNote>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
