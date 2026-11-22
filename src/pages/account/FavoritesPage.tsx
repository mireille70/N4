import { bySlugs } from '@/content/catalog';
import { site } from '@/content/site';
import { useStore } from '@/store/StoreProvider';
import { ProductCard } from '@/components/product/ProductCard';
import { EmptyState } from '@/components/ui/primitives';
import { usePageTitle } from '@/lib/usePageTitle';

export default function FavoritesPage() {
  const title = site.account.tabs[3].label;
  usePageTitle(title);
  const { favorites } = useStore();
  const list = bySlugs(favorites);

  if (!list.length) return <EmptyState icon="heart" title="لا توجد منتجات في المفضلة" action={{ label: 'الفئات', to: '/categories' }} />;

  return (
    <section aria-label={title} className="grid-products gap-y-10">
      {list.map((p) => <ProductCard key={p.slug} product={p} />)}
    </section>
  );
}
