import { useNavigate } from 'react-router-dom';
import type { Product } from '@/content/catalog';
import { useStore } from '@/store/StoreProvider';

/** Quick-add from cards. Top-up products need a player ID, so they open the product page instead. */
export function useAddToCart() {
  const { dispatch, notify } = useStore();
  const navigate = useNavigate();

  return (product: Product, opts: { playerId?: string; options?: string[]; qty?: number } = {}) => {
    if (product.requiresPlayerId && !opts.playerId) {
      navigate(`/product/${product.slug}`);
      return false;
    }
    const key = [product.slug, opts.playerId ?? '', ...(opts.options ?? [])].join('|');
    dispatch({
      type: 'cart/add',
      line: { key, slug: product.slug, name: product.name, price: product.price, qty: opts.qty ?? 1, playerId: opts.playerId, options: opts.options, image: product.image },
    });
    notify(`تمت إضافة ${product.name} إلى السلة`);
    return true;
  };
}
