import type { Product } from './catalog';

/**
 * TOP-UP PACKS per game — demo denominations. The first amount costs the product's
 * base price; bigger packs scale with the amount and get a small bulk saving.
 * Replace with the store's real price list when connected to a backend.
 */
/** voice apps: coin packs (demo denominations) */
const COINS = { unit: 'عملة', amounts: [1000, 5000, 10000, 25000, 50000, 100000] };

const PACKS: Record<string, { unit: string; amounts: number[] }> = {
  hawa: COINS,
  masa: COINS,
  tawla: COINS,
  sila: COINS,
  yoho: COINS,
  'ludo-royal': COINS,
  'sada-live': COINS,
  pubg: { unit: 'شدة', amounts: [60, 325, 660, 1800, 3850, 8100] },
  'free-fire': { unit: 'جوهرة', amounts: [100, 310, 520, 1060, 2180, 5600] },
  valorant: { unit: 'نقطة', amounts: [475, 1000, 2050, 3650, 5350, 11000] },
  'call-of-duty': { unit: 'نقطة', amounts: [80, 420, 880, 2400, 5000, 10800] },
  'mobile-legends': { unit: 'ماسة', amounts: [86, 172, 257, 706, 2195, 3688] },
  roblox: { unit: 'روبوكس', amounts: [400, 800, 1700, 4500, 10000, 22500] },
  'yalla-ludo': { unit: 'جوهرة', amounts: [50, 260, 550, 1150, 2400, 6000] },
  'lords-mobile': { unit: 'جوهرة', amounts: [60, 300, 700, 1400, 3500, 7000] },
  fortnite: { unit: 'فيبكس', amounts: [1000, 2800, 5000, 13500] },
  'genshin-impact': { unit: 'كريستالة', amounts: [60, 330, 1090, 2240, 3880, 8080] },
};

export interface Pack { id: string; amount: number; unit: string; label: string; price: number; compareAt?: number; discount?: number; popular?: boolean }

const round2 = (n: number) => Math.round(n * 100) / 100;

export function packsFor(product: Product): Pack[] {
  const def = PACKS[product.slug];
  if (!def) return [];
  const base = def.amounts[0];
  return def.amounts.map((amount, i) => {
    const k = (amount / base) * Math.pow(0.97, i); // bulk saving
    return {
      id: String(amount),
      amount,
      unit: def.unit,
      label: `${amount.toLocaleString('en-US')} ${def.unit}`,
      price: round2(product.price * k),
      compareAt: product.compareAt ? round2(product.compareAt * k) : undefined,
      discount: product.discount,
      popular: i === 1,
    };
  });
}

export const hasPacks = (slug: string) => slug in PACKS;
