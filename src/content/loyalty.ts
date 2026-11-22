/**
 * LOYALTY PROGRAMME — demo content. Tiers, ways to earn and rewards are placeholders:
 * replace them with the store's real programme when it is connected to a backend.
 */

/** demo welcome balance added to the points earned from demo orders (1 point per riyal) */
export const DEMO_WELCOME_POINTS = 2450;

export const pointsOf = (earned: number) => earned + DEMO_WELCOME_POINTS;

export interface Tier { id: string; name: string; en: string; min: number; icon: string; perks: string[] }

export const TIERS: Tier[] = [
  { id: 'bronze', name: 'برونز', en: 'BRONZE', min: 0, icon: 'shield', perks: ['نقطة لكل ريال'] },
  { id: 'silver', name: 'فضي', en: 'SILVER', min: 1000, icon: 'star', perks: ['نقاط ×1.25', 'عروض حصرية'] },
  { id: 'gold', name: 'ذهبي', en: 'GOLD', min: 2000, icon: 'crown', perks: ['نقاط ×1.5', 'دعم بأولوية'] },
  { id: 'platinum', name: 'بلاتيني', en: 'PLATINUM', min: 3000, icon: 'sparkle', perks: ['نقاط ×2', 'خصم 5% دائم'] },
  { id: 'elite', name: 'النخبة', en: 'ELITE', min: 5000, icon: 'bolt', perks: ['نقاط ×3', 'هدايا شهرية'] },
];

export function tierState(points: number) {
  let idx = 0;
  TIERS.forEach((t, i) => { if (points >= t.min) idx = i; });
  const current = TIERS[idx];
  const next = TIERS[idx + 1];
  const toNext = next ? (points - current.min) / (next.min - current.min) : 1;
  /** 0…1 position along the whole tier track */
  const track = next ? (idx + toNext) / (TIERS.length - 1) : 1;
  return { idx, current, next, toNext, track, remaining: next ? next.min - points : 0 };
}

export interface EarnWay { id: string; icon: string; title: string; body: string; points: number; cta: string }

export const EARN_WAYS: EarnWay[] = [
  { id: 'daily', icon: 'calendar', title: 'تسجيل الدخول اليومي', body: 'ادخل كل يوم وحافظ على سلسلتك — اليوم السابع مضاعف.', points: 10, cta: 'استلم نقاط اليوم' },
  { id: 'order', icon: 'cart', title: 'اشحن لعبتك', body: 'نقطة على كل ريال تدفعه في أي بطاقة أو شحن.', points: 1, cta: 'اشترِ مرة أخرى' },
  { id: 'invite', icon: 'user', title: 'ادعُ صديقك', body: 'لما صديقك يكمل أول طلب، تاخذ نقاط وهو كمان.', points: 200, cta: 'انسخ رابط الدعوة' },
  { id: 'review', icon: 'edit', title: 'قيّم مشترياتك', body: 'رأيك يساعد اللاعبين — تقييم واحد لكل طلب.', points: 20, cta: 'قيّم الآن' },
];

/** rewards: `slug` points at a catalog product for its artwork */
export interface Reward { slug: string; title: string; body: string; cost: number }

export const REWARDS: Reward[] = [
  { slug: 'pubg', title: 'شحن PUBG UC', body: '60 شدة تنضاف مباشرة على معرفك داخل اللعبة.', cost: 900 },
  { slug: 'free-fire', title: 'شحن Free Fire', body: '100 جوهرة للسكنات والشخصيات والأسلحة.', cost: 1100 },
  { slug: 'valorant', title: 'Valorant Points', body: '475 VP لفتح الأسلحة وباتل باس الموسم.', cost: 2000 },
  { slug: 'playstation', title: 'بطاقات PlayStation', body: 'رصيد PlayStation Store لأحدث الألعاب والإضافات.', cost: 2400 },
  { slug: 'xbox', title: 'بطاقات Xbox', body: 'رصيد لشراء الألعاب والاشتراكات والمحتوى الرقمي.', cost: 2400 },
  { slug: 'steam', title: 'Steam Wallet', body: 'رصيد Steam لآلاف الألعاب والعروض الحصرية.', cost: 3200 },
];
