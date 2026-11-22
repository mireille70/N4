/**
 * CATALOG CONTENT — categories and products.
 *
 * Source: reference screenshots. Only Free Fire's price (5.00), rating,
 * description and options appear in the reference. Every other price is a
 * DEMO placeholder so the cart can be exercised — replace with real data.
 */

import imageManifest from './image-manifest.json';

export type CategoryIcon = 'all' | 'games' | 'gifts' | 'best' | 'entertainment' | 'delivery' | 'stores' | 'voice';

export interface Category {
  slug: string;
  name: string;
  icon: CategoryIcon;
}

export const categories: Category[] = [
  { slug: 'all', name: 'الكل', icon: 'all' },
  { slug: 'game-cards', name: 'بطاقات الالعاب', icon: 'games' },
  { slug: 'voice-apps', name: 'البرامج الصوتية', icon: 'voice' },
  { slug: 'gift-cards', name: 'بطاقات الهدايا', icon: 'gifts' },
  { slug: 'best-sellers', name: 'الاكثر مبيعا', icon: 'best' },
  { slug: 'entertainment', name: 'منصات الترفيه', icon: 'entertainment' },
  { slug: 'delivery-cards', name: 'بطاقات التوصيل', icon: 'delivery' },
  { slug: 'digital-stores', name: 'المتاجر الرقمية', icon: 'stores' },
];

export interface OptionGroup {
  label: string;
  options: string[];
}

export type ProductKind = 'topup' | 'platform' | 'shopping';

export interface Product {
  slug: string;
  /** Arabic display name */
  name: string;
  /** Latin brand name as printed on the artwork */
  nameEn: string;
  kind: ProductKind;
  categories: string[];
  /** SAR, VAT-inclusive display price (the sale price when an offer applies) */
  price: number;
  /** Original price before the offer — shown struck through */
  compareAt?: number;
  /** Offer discount in percent */
  discount?: number;
  image?: string;
  imageHd?: string;
  /** srcset built from the image pipeline (1080w + 2160w) when 4K renditions exist */
  imageSet?: string;
  /** simple-icons slug or custom glyph id for logo-led products */
  glyph?: string;
  /** brand tile background for shopping cards */
  tile?: string;
  description?: string;
  /** "طريقة الاستخدام" steps; falls back to defaults per kind (see usageSteps) */
  usage?: string[];
  rating?: { score: number; count: number };
  optionGroups?: OptionGroup[];
  /** Top-up products need the customer's in-game player ID */
  requiresPlayerId?: boolean;
  isNew?: boolean;
}

// Verbatim from the Free Fire reference page (the second group repeats the
// "المنطقة" label and a duplicate "عالمي" option in the source).
const referenceOptionGroups: OptionGroup[] = [
  { label: 'المنطقة', options: ['الكل', 'عالمي'] },
  { label: 'المنطقة', options: ['الكل', 'عالمي', 'عالمي'] },
];

const referenceDescription =
  'لوريم إيبسوم دولور سيت أميت كونسيكتتور. فيناتيس موريز مربي في كويز ليو نيك كيد. إيد ناستشتر نيسي موريز إيد إت. أك لوريم إيبسوم دولور سيت أميت كونسيكتتور. فيناتيس موريز مربي في كويز ليو نيك كيد. إيد ناستشتر نيسي موريز إيد إت. أك كويز سيت إيتيم كويز أوج كرس بورنتور. كونسيكتتور نيك كونديمنتوم بروين بيبندوم كرس كومودو. سيت إيتيم كويز أوج كرس بورنتور. كونسيكتتور';

const defaultUsage: Record<ProductKind, string[]> = {
  topup: [
    'اختر الباقة المناسبة من صفحة اللعبة.',
    'أدخل معرف اللاعب (ID) واضغط "اضافه" للتأكيد.',
    'أكمل عملية الدفع.',
    'يتم شحن الرصيد إلى حسابك داخل اللعبة خلال دقائق.',
  ],
  platform: [
    'أكمل عملية الشراء لتصلك البطاقة.',
    'انسخ الكود من صفحة الطلب أو من بريدك الإلكتروني.',
    'سجّل الدخول إلى حسابك في المنصة وافتح صفحة استرداد الأكواد.',
    'الصق الكود وأكّد ليُضاف الرصيد إلى محفظتك.',
  ],
  shopping: [
    'أكمل عملية الشراء لتصلك البطاقة.',
    'انسخ الكود من صفحة الطلب أو من بريدك الإلكتروني.',
    'استخدم الكود عند الدفع في المتجر أو أضفه إلى رصيد حسابك.',
  ],
};

export const usageSteps = (p: Product): string[] => p.usage ?? defaultUsage[p.kind];

const game = (p: Omit<Product, 'kind' | 'requiresPlayerId' | 'optionGroups' | 'description'> & Partial<Product>): Product => ({
  kind: 'topup',
  requiresPlayerId: true,
  optionGroups: referenceOptionGroups,
  description: referenceDescription,
  ...p,
});

const baseProducts: Product[] = [
  // ——— Popular games (الالعاب الشائعه) — order follows RTL reading of the reference grid
  game({ slug: 'genshin-impact', name: 'جنشن إمباكت', nameEn: 'Genshin Impact', categories: ['game-cards', 'best-sellers'], price: 4.99, image: '/assets/products/genshin-impact.webp', isNew: true }),
  game({
    slug: 'free-fire', name: 'فري فاير', nameEn: 'Free Fire', categories: ['game-cards', 'best-sellers'], price: 5,
    image: '/assets/products/free-fire.webp',
    rating: { score: 4.8, count: 528275209 }, isNew: true,
  }),
  game({ slug: 'fortnite', name: 'فورتنايت', nameEn: 'Fortnite', categories: ['game-cards', 'best-sellers'], price: 19, image: '/assets/products/fortnite.webp', isNew: true }),
  game({ slug: 'pubg', name: 'ببجي موبايل', nameEn: 'PUBG', categories: ['game-cards', 'best-sellers'], price: 4.5, image: '/assets/products/pubg.webp', isNew: true }),
  game({ slug: 'yalla-ludo', name: 'يلا لودو', nameEn: 'Yalla Ludo', categories: ['game-cards'], price: 4, image: '/assets/products/yalla-ludo.webp' }),
  game({ slug: 'valorant', name: 'فالورانت', nameEn: 'Valorant', categories: ['game-cards', 'best-sellers'], price: 20, image: '/assets/products/valorant.webp' }),
  game({ slug: 'mobile-legends', name: 'موبايل ليجندز', nameEn: 'Mobile Legends', categories: ['game-cards'], price: 3.75, image: '/assets/products/mobile-legends.webp' }),
  game({ slug: 'lords-mobile', name: 'لوردس موبايل', nameEn: 'Lords Mobile', categories: ['game-cards'], price: 4.99, image: '/assets/products/lords-mobile.webp' }),
  // Added with the owner-supplied artwork (not in the reference); prices are demo values.
  game({ slug: 'call-of-duty', name: 'كول أوف ديوتي موبايل', nameEn: 'Call of Duty Mobile', categories: ['game-cards', 'best-sellers'], price: 4.99, image: '/assets/products/call-of-duty.webp', isNew: true }),
  game({ slug: 'roblox', name: 'روبلوكس', nameEn: 'Roblox', categories: ['game-cards'], price: 10, image: '/assets/products/roblox.webp', isNew: true }),

  // ——— Voice apps (البرامج الصوتية) — coin top-ups; prices and packs (content/packs.ts) are demo values.
  // Not part of a catalog category: they are reached from the home "البرامج الصوتية" section.
  game({ slug: 'hawa', name: 'هوا', nameEn: 'Hawa', categories: ['voice-apps'], price: 5, image: '/assets/products/hawa.webp' }),
  game({ slug: 'masa', name: 'ماسا', nameEn: 'Masa', categories: ['voice-apps'], price: 5, image: '/assets/products/masa.webp' }),
  game({ slug: 'tawla', name: 'طاولة', nameEn: 'Tawla Online', categories: ['voice-apps'], price: 4, image: '/assets/products/tawla.webp' }),
  game({ slug: 'sila', name: 'سيلا شات', nameEn: 'Sila Chat', categories: ['voice-apps'], price: 5, image: '/assets/products/sila.webp' }),
  game({ slug: 'yoho', name: 'يوهو', nameEn: 'YoHo', categories: ['voice-apps'], price: 5, image: '/assets/products/yoho.webp' }),
  game({ slug: 'ludo-royal', name: 'لودو رويال', nameEn: 'Ludo Royal', categories: ['voice-apps'], price: 4, image: '/assets/products/ludo-royal.webp' }),
  game({ slug: 'sada-live', name: 'صدى لايف', nameEn: 'Sada Live', categories: ['voice-apps'], price: 5, image: '/assets/products/sada-live.webp' }),

  // ——— Gaming platforms (منصات الالعاب)
  { slug: 'xbox', name: 'إكس بوكس', nameEn: 'XBOX', kind: 'platform', categories: ['game-cards', 'gift-cards'], price: 50, glyph: 'xbox' },
  { slug: 'playstation', name: 'بلايستيشن', nameEn: 'PLAYSTATION', kind: 'platform', categories: ['game-cards', 'gift-cards'], price: 40, glyph: 'playstation' },
  { slug: 'steam', name: 'ستيم', nameEn: 'STEAM', kind: 'platform', categories: ['game-cards', 'gift-cards'], price: 20, glyph: 'steam' },
  { slug: 'google-play', name: 'جوجل بلاي', nameEn: 'GOOGLE PLAY', kind: 'platform', categories: ['digital-stores', 'gift-cards'], price: 25, glyph: 'googleplay' },
  { slug: 'epic', name: 'إبيك', nameEn: 'EPIC', kind: 'platform', categories: ['game-cards', 'gift-cards'], price: 30, glyph: 'epicgames' },
  { slug: 'itunes', name: 'آيتونز', nameEn: 'ITUNES', kind: 'platform', categories: ['digital-stores', 'gift-cards'], price: 25, glyph: 'itunes' },

  // ——— Shopping cards (بطاقات التسوق)
  { slug: 'ebay', name: 'إيباي', nameEn: 'ebay', kind: 'shopping', categories: ['gift-cards'], price: 50, image: '/assets/brands/ebay.webp', tile: '#FEFEFE' },
  { slug: 'hungerstation', name: 'هنقرستيشن', nameEn: 'Hunger Station', kind: 'shopping', categories: ['gift-cards', 'delivery-cards'], price: 50, image: '/assets/brands/hungerstation.webp', tile: '#F7D006' },
  // Reference label under this tile read "Hunger Station" (duplicated label); the artwork is Bath & Body Works.
  { slug: 'bath-body-works', name: 'باث آند بودي ووركس', nameEn: 'Bath & Body Works', kind: 'shopping', categories: ['gift-cards'], price: 100, image: '/assets/brands/bath-body-works.webp', tile: '#FFFFFF' },
  { slug: 'amazon', name: 'أمازون', nameEn: 'Amazon', kind: 'shopping', categories: ['gift-cards'], price: 50, image: '/assets/brands/amazon.webp', tile: '#FFFFFF' },
  { slug: 'shein', name: 'شي إن', nameEn: 'SHEIN', kind: 'shopping', categories: ['gift-cards'], price: 50, image: '/assets/brands/shein.webp', tile: '#000000' },
  { slug: 'noon', name: 'نون', nameEn: 'Noon', kind: 'shopping', categories: ['gift-cards'], price: 50, image: '/assets/brands/noon.webp', tile: '#FFEE02' },
];

// Images produced by `npm run images` (scripts/build-images.cjs) replace the defaults above.
type Rendition = { image: string; imageHd: string; imageSet: string };
const generated: Record<string, Rendition | undefined> = { ...imageManifest.products, ...imageManifest.brands };

/**
 * OFFERS — percent off per product. DEMO values: the reference has no offers,
 * so replace these with the store's real promotions (or empty the list).
 */
export const offers: Array<{ slug: string; percent: number }> = [
  { slug: 'valorant', percent: 20 },
  { slug: 'call-of-duty', percent: 25 },
  { slug: 'pubg', percent: 15 },
  { slug: 'roblox', percent: 10 },
];
/** Offers end at local midnight and roll over daily (demo countdown) */
export const offersEndDaily = true;

const round2 = (n: number) => Math.round(n * 100) / 100;

export const products: Product[] = baseProducts.map((p) => {
  const g = generated[p.slug];
  const withImages = g ? { ...p, image: g.image, imageHd: g.imageHd, imageSet: g.imageSet } : p;
  const offer = offers.find((o) => o.slug === p.slug);
  return offer ? { ...withImages, compareAt: p.price, discount: offer.percent, price: round2(p.price * (1 - offer.percent / 100)) } : withImages;
});

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
export const productsIn = (slug: string) =>
  slug === 'all' ? products : products.filter((p) => p.categories.includes(slug));
export const bySlugs = (slugs: string[]) =>
  slugs.map((s) => getProduct(s)).filter((p): p is Product => Boolean(p));
