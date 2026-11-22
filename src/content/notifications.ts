/**
 * NOTIFICATIONS — demo feed. Replace with the store's real notifications API.
 * `minutesAgo` keeps the demo times fresh relative to "now".
 */
export type NotifKind = 'order' | 'offer' | 'loyalty' | 'system';

export interface Notif {
  id: string;
  kind: NotifKind;
  title: string;
  body: string;
  minutesAgo: number;
  /** catalog product for the thumbnail */
  slug?: string;
  to?: string;
  cta?: string;
}

export const NOTIF_KINDS: Record<NotifKind, { label: string; icon: string }> = {
  order: { label: 'الطلبات', icon: 'receipt' },
  offer: { label: 'العروض', icon: 'sparkle' },
  loyalty: { label: 'النقاط', icon: 'star' },
  system: { label: 'الحساب', icon: 'shield' },
};

export const DEMO_NOTIFS: Notif[] = [
  { id: 'n1', kind: 'order', title: 'تم شحن طلبك بنجاح', body: 'وصلت 325 UC على حساب PUBG MOBILE — استمتع باللعب!', minutesAgo: 4, slug: 'pubg', to: '/account/orders', cta: 'عرض الطلب' },
  { id: 'n2', kind: 'offer', title: 'خصم 20% على Valorant', body: 'العرض ينتهي الليلة الساعة 12 — لا يفوتك.', minutesAgo: 52, slug: 'valorant', to: '/offers', cta: 'تسوق العرض' },
  { id: 'n3', kind: 'loyalty', title: '+120 نقطة في رصيدك', body: 'كسبت نقاط من آخر طلب. باقي 550 نقطة على مستوى بلاتيني.', minutesAgo: 180, to: '/account/loyalty', cta: 'رصيد النقاط' },
  { id: 'n4', kind: 'offer', title: 'وصل جديد: Call of Duty Mobile', body: 'بطاقات CP متوفرة الآن بتسليم فوري.', minutesAgo: 60 * 20, slug: 'call-of-duty', to: '/product/call-of-duty', cta: 'اشحن الآن' },
  { id: 'n5', kind: 'system', title: 'تسجيل دخول جديد', body: 'تم تسجيل الدخول إلى حسابك من متصفح جديد. لو مو أنت، غيّر بياناتك فورًا.', minutesAgo: 60 * 30, to: '/account' },
  { id: 'n6', kind: 'order', title: 'تم استلام الدفع', body: 'تم الدفع عبر مدى بنجاح لطلب Free Fire.', minutesAgo: 60 * 50, slug: 'free-fire', to: '/account/orders' },
  { id: 'n7', kind: 'loyalty', title: 'سلسلة الدخول: اليوم الرابع 🔥', body: 'ادخل بكرة عشان تحافظ على سلسلتك — اليوم السابع نقاطه مضاعفة.', minutesAgo: 60 * 75, to: '/account/loyalty' },
];

export function timeAgo(min: number) {
  if (min < 1) return 'الآن';
  if (min < 60) return `قبل ${min} دقيقة`;
  const h = Math.floor(min / 60);
  if (h < 24) return h === 1 ? 'قبل ساعة' : `قبل ${h} ساعات`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'أمس' : `قبل ${d} أيام`;
}

export function dayGroup(min: number) {
  if (min < 60 * 24) return 'اليوم';
  if (min < 60 * 48) return 'أمس';
  return 'أقدم';
}
