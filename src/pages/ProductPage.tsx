import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getProduct, getCategory, products, usageSteps } from '@/content/catalog';
import { packsFor } from '@/content/packs';
import { useTheme } from '@/theme/ThemeProvider';
import { useStore } from '@/store/StoreProvider';
import { useAddToCart } from '@/components/product/useAddToCart';
import { ProductArt } from '@/components/product/ProductArt';
import { ProductCard } from '@/components/product/ProductCard';
import { Icon } from '@/components/ui/Icon';
import { DiscountBadge, Price, SectionHead } from '@/components/ui/primitives';
import { cx, formatInt } from '@/lib/format';
import { usePageTitle } from '@/lib/usePageTitle';
import NotFoundPage from './NotFoundPage';

export default function ProductPage() {
  const { slug = '' } = useParams();
  const product = getProduct(slug);
  usePageTitle(product?.name);
  if (!product) return <NotFoundPage />;
  return <ProductView key={product.slug} slug={product.slug} />;
}

function Disclosure({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group border-t border-line">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
        <h2 className="font-body text-base font-semibold">{title}</h2>
        <Icon name="chevron-down" size={18} className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="pb-4">{children}</div>
    </details>
  );
}

function ProductView({ slug }: { slug: string }) {
  const product = getProduct(slug)!;
  const { features, mobile } = useTheme();
  const { isFavorite, dispatch } = useStore();
  const add = useAddToCart();
  const navigate = useNavigate();
  const fav = isFavorite(product.slug);
  const category = getCategory(product.categories[0]);

  // top-up packs: chosen on the game page (?pack=325); the pack picker and region options are not shown here
  const packs = packsFor(product);
  const [params] = useSearchParams();
  const pack = packs.find((p) => p.id === params.get('pack')) ?? packs[0];
  const price = pack?.price ?? product.price;
  const compareAt = pack ? pack.compareAt : product.compareAt;
  const lineProduct = pack ? { ...product, price, name: `${product.name} — ${pack.label}` } : product;
  const [playerInput, setPlayerInput] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [playerError, setPlayerError] = useState('');

  const related = products.filter((p) => p.kind === product.kind && p.slug !== product.slug).slice(0, 4);

  const confirmPlayer = () => {
    if (!/^\d{6,12}$/.test(playerInput)) {
      setPlayerError('أدخل معرف لاعب صحيح (6–12 رقمًا)');
      return false;
    }
    setPlayerError('');
    setPlayerId(playerInput);
    return true;
  };

  const ensurePlayer = () => {
    if (!product.requiresPlayerId) return true;
    if (playerId && playerId === playerInput) return true;
    const ok = confirmPlayer();
    if (!ok) document.getElementById('player-id')?.focus();
    return ok;
  };

  const addToCart = () => {
    if (!ensurePlayer()) return false;
    return add(lineProduct, { playerId: product.requiresPlayerId ? playerInput : undefined, options: pack ? [pack.label] : [] });
  };
  const buyNow = () => { if (addToCart()) navigate('/checkout'); };

  return (
    <>
      <div className="container-x pt-4 lg:pt-8">
        <nav aria-label="مسار التنقل" className="text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link to="/" className="hover:text-fg">الرئيسية</Link></li>
            <li aria-hidden="true"><Icon name="chevron-next" size={14} /></li>
            <li><Link to={category ? `/categories/${category.slug}` : '/categories'} className="hover:text-fg">{category?.name ?? 'الفئات'}</Link></li>
            <li aria-hidden="true"><Icon name="chevron-next" size={14} /></li>
            <li aria-current="page" className="text-fg">{product.name}</li>
          </ol>
        </nav>
      </div>

      <section className="container-x grid grid-cols-1 gap-8 pb-section pt-4 lg:grid-cols-12 lg:gap-12 lg:pt-6">
        {/* ——— Art column ——— */}
        <div className="mx-auto w-full max-w-md lg:col-span-4 lg:order-2 lg:max-w-none">
          <div className="lg:sticky lg:top-28">
            <div className="relative">
              <div className="absolute -inset-3 rounded-[calc(var(--radius-xl)+12px)] border border-gold/20 max-md:hidden" aria-hidden="true" />
              <ProductArt
                product={product}
                hd
                eager
                className={cx('notch-both relative w-full rounded-xl shadow-stage', product.kind === 'topup' ? 'aspect-[1/.95] lg:aspect-[4/5] [&_img]:object-center lg:[&_img]:object-top' : 'aspect-[1.586]')}
              />
            </div>
          </div>
        </div>

        {/* ——— Purchase column ——— */}
        <div className="lg:col-span-8 lg:order-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow text-start">{product.nameEn}</p>
              <h1 className="mt-1 text-3xl font-bold md:text-4xl">{product.name}</h1>
              {features.showRatings && product.rating && (
                <p className="mt-4 flex items-center gap-2 text-sm">
                  <span className="num font-semibold">{product.rating.score}</span>
                  <span className="flex text-gold" aria-hidden="true">
                    {Array.from({ length: 5 }, (_, i) => <Icon key={i} name="star" size={16} fill="currentColor" strokeWidth={0} />)}
                  </span>
                  <span className="sr-only">التقييم {product.rating.score} من 5</span>
                  <span className="num text-muted">({formatInt(product.rating.count)})</span>
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: 'fav/toggle', slug: product.slug })}
              aria-pressed={fav}
              aria-label={fav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
              className={cx('icon-btn h-12 w-12 shrink-0 shadow-[inset_0_0_0_1px_rgb(var(--c-line))]', fav && 'text-accent')}
            >
              <Icon name="heart" fill={fav ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="mt-5">
            {product.description && (
              <section className="border-t border-line pb-4">
                <h2 className="py-4 font-body text-base font-semibold">الوصف</h2>
                <p className="text-[.95rem] leading-7 text-muted">{product.description}</p>
              </section>
            )}
            <Disclosure title="طريقة الاستخدام">
              <ol className="list-decimal space-y-1.5 ps-5 text-[.95rem] leading-7 text-muted marker:text-accent">
                {usageSteps(product).map((step) => <li key={step}>{step}</li>)}
              </ol>
            </Disclosure>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-4">
            <Price value={price} compareAt={compareAt} size="xl" />
            <DiscountBadge percent={product.discount} className="!h-9 !px-3 !text-sm" />
          </div>

          {product.requiresPlayerId && (
            <div className="mt-4 rounded-lg bg-raised p-4 shadow-[inset_0_0_0_1px_rgb(var(--c-line))]">
              <label htmlFor="player-id" className="flex items-center gap-2 text-sm font-medium">
                <Icon name="id-card" size={18} className="text-accent" />معرف اللاعب
              </label>
              <div className={cx('field mt-3 !h-14 !pe-1.5', 'bg-bg')} data-invalid={Boolean(playerError)}>
                <input
                  id="player-id"
                  inputMode="numeric"
                  dir="ltr"
                  className="text-end tracking-wider"
                  placeholder="2937474373"
                  value={playerInput}
                  aria-invalid={Boolean(playerError)}
                  aria-describedby="player-msg"
                  onChange={(e) => { setPlayerInput(e.target.value.replace(/\D/g, '').slice(0, 12)); setPlayerError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && confirmPlayer()}
                />
                <button type="button" onClick={confirmPlayer} className="btn btn-sm !h-11 shrink-0 bg-fg/10 hover:bg-fg/15">
                  {playerId && playerId === playerInput ? <><Icon name="check" size={16} className="text-accent" />تم</> : 'اضافه'}
                </button>
              </div>
              <p id="player-msg" role={playerError ? 'alert' : undefined} className={cx('mt-2 text-xs', playerError ? 'text-danger' : 'text-muted')}>
                {playerError || (playerId && playerId === playerInput ? `سيتم الشحن إلى المعرف ${playerId}` : '')}
              </p>
            </div>
          )}

          <div className="mt-4 hidden grid-cols-2 gap-3 sm:grid">
            <button type="button" onClick={buyNow} className="btn btn-primary">اشتري الان<Icon name="arrow-next" size={20} /></button>
            <button type="button" onClick={addToCart} className="btn btn-ghost"><Icon name="cart" size={20} />اضافه الي السله</button>
          </div>
          {!mobile.stickyBuyBar && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:hidden">
              <button type="button" onClick={buyNow} className="btn btn-primary">اشتري الان</button>
              <button type="button" onClick={addToCart} className="btn btn-ghost">اضافه الي السله</button>
            </div>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-x pb-section" aria-labelledby="related-title">
          <SectionHead id="related-title" title={product.kind === 'topup' ? 'الالعاب الشائعه' : category?.name ?? ''} />
          {/* same cards as the home "الالعاب الشائعه" section: art + name only, framed in the brand green */}
          <div className="grid-products compact-grid gap-y-8 lg:gap-y-10">
            {related.map((p) => <ProductCard key={p.slug} product={p} bare />)}
          </div>
        </section>
      )}

      {/* Mobile sticky purchase bar */}
      {mobile.stickyBuyBar && (
        <div data-sticky-buy className="fixed inset-x-0 bottom-16 z-30 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur-md sm:hidden [:root[data-bottom-nav='false']_&]:bottom-0">
          <div className="flex items-center gap-2">
            <Price value={price} size="md" className="me-1 shrink-0" />
            <button type="button" onClick={addToCart} className="btn btn-ghost btn-sm !h-12 !px-3.5" aria-label="اضافه الي السله"><Icon name="cart" size={20} /></button>
            <button type="button" onClick={buyNow} className="btn btn-primary btn-sm !h-12 flex-1">اشتري الان</button>
          </div>
        </div>
      )}
    </>
  );
}
