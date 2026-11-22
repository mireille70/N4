import { Link, useParams } from 'react-router-dom';
import { getProduct, type Product } from '@/content/catalog';
import { packsFor, type Pack } from '@/content/packs';
import { PosterCard } from '@/components/product/PosterCard';
import { useStore } from '@/store/StoreProvider';
import { Icon } from '@/components/ui/Icon';
import { Reveal, SectionHead } from '@/components/ui/primitives';
import { usePageTitle } from '@/lib/usePageTitle';
import NotFoundPage from './NotFoundPage';

/** one top-up pack — the same photo card as the home "المنتجات" section; opens details with the pack chosen */
function PackCard({ product, pack, best, eager }: { product: Product; pack: Pack; best: boolean; eager?: boolean }) {
  const { isFavorite, dispatch } = useStore();
  const badge = pack.popular
    ? <span className="rounded-full bg-[image:var(--grad-accent)] px-2.5 py-1 text-[10px] font-semibold text-onaccent">الأكثر طلبًا</span>
    : best ? <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-amber">أفضل قيمة</span> : undefined;
  return (
    <PosterCard
      href={`/product/${product.slug}?pack=${pack.id}`}
      product={product}
      photo
      eager={eager}
      title={pack.label}
      subtitle={product.name}
      price={pack.price}
      compareAt={pack.compareAt}
      discount={pack.discount}
      badge={badge}
      fav={isFavorite(product.slug)}
      onFav={() => dispatch({ type: 'fav/toggle', slug: product.slug })}
      actionLabel="اشتري الآن"
    />
  );
}

/** /game/:slug — a game's top-up packs; picking one opens the product details */
export default function GamePage() {
  const { slug = '' } = useParams();
  const product = getProduct(slug);
  usePageTitle(product?.name);
  if (!product) return <NotFoundPage />;
  const packs = packsFor(product);
  const best = packs.length - 1;

  return (
    <>
      <section aria-labelledby="packs-title" className="container-x pb-section pt-8 lg:pt-10">
        <nav aria-label="مسار التنقل" className="mb-8">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-fg/55">
            <li><Link to="/" className="hover:text-fg">الرئيسية</Link></li>
            <li aria-hidden="true"><Icon name="chevron-next" size={13} /></li>
            <li><Link to="/categories/game-cards" className="hover:text-fg">بطاقات الالعاب</Link></li>
            <li aria-hidden="true"><Icon name="chevron-next" size={13} /></li>
            <li aria-current="page" className="text-fg/80">{product.name}</li>
          </ol>
        </nav>
        <SectionHead id="packs-title" title={`باقات ${product.name}`} note={`${packs.length} باقات متاحة — اختار الباقة، وبعدها أدخل معرف اللاعب وادفع`} />
        <div className="grid-products gap-y-8 lg:gap-6 lg:gap-y-10">
          {packs.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 70}>
              <PackCard product={product} pack={p} best={i === best && packs.length > 2} eager={i < 4} />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
