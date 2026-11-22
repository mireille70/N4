import { useEffect, useState, type FormEvent } from 'react';
import { site } from '@/content/site';
import { useStore } from '@/store/StoreProvider';
import { TextField } from '@/components/ui/fields';
import { Icon } from '@/components/ui/Icon';
import { DemoNote, Reveal } from '@/components/ui/primitives';
import { cx } from '@/lib/format';
import { usePageTitle } from '@/lib/usePageTitle';

type Brand = 'mada' | 'visa' | 'master';

/** only what a real gateway would hand back after tokenising: never the full number or CVV */
interface SavedCard { id: string; brand: Brand; last4: string; holder: string; expiry: string; isDefault: boolean }

const STORAGE_KEY = 'koon.savedCards';
const SEED: SavedCard[] = [
  { id: 'c1', brand: 'mada', last4: '4821', holder: 'KOON PLAYER', expiry: '08/28', isDefault: true },
  { id: 'c2', brand: 'visa', last4: '1093', holder: 'KOON PLAYER', expiry: '03/27', isDefault: false },
];

function load(): SavedCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedCard[]) : SEED;
  } catch { return SEED; }
}
function save(cards: SavedCard[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cards)); } catch { /* storage unavailable: keep in memory */ }
}

// a few common mada BIN prefixes (demo — a real integration asks the gateway)
const MADA_BINS = ['440647', '440795', '446404', '457865', '968208', '588845', '636120', '417633', '468540', '483010', '589005', '604906', '521076', '529415', '535825', '543085', '524130', '554180', '549760', '539931', '558848', '557606'];
const detectBrand = (digits: string): Brand | null => {
  if (MADA_BINS.some((b) => digits.startsWith(b))) return 'mada';
  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'master';
  return null;
};
const luhn = (d: string) => {
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i]);
    if (i % 2) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
  }
  return sum % 10 === 0;
};
const groups4 = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
const expiryFmt = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; };
const expiryOk = (v: string) => {
  const m = /^(\d{2})\/(\d{2})$/.exec(v);
  if (!m) return false;
  const month = Number(m[1]); const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
};

function BrandMark({ brand, className }: { brand: Brand | null; className?: string }) {
  if (brand === 'master') {
    return (
      <span className={cx('relative inline-flex h-6 w-10', className)} aria-label="Mastercard">
        <span className="absolute start-0 top-0 h-6 w-6 rounded-full bg-[#EB001B]" />
        <span className="absolute end-0 top-0 h-6 w-6 rounded-full bg-[#F79E1B] mix-blend-screen" />
      </span>
    );
  }
  if (brand === 'visa') return <span className={cx('font-display text-xl font-extrabold italic tracking-tight', className)}>VISA</span>;
  if (brand === 'mada') return <span className={cx('font-display text-xl font-extrabold tracking-tight', className)}>mada</span>;
  return <Icon name="id-card" size={22} className={cx('opacity-50', className)} />;
}

function CardFace({ brand, number, holder, expiry, isDefault, className }: { brand: Brand | null; number: string; holder: string; expiry: string; isDefault?: boolean; className?: string }) {
  return (
    <div dir="ltr" className={cx('relative aspect-[1.586] w-full overflow-hidden rounded-2xl bg-[linear-gradient(140deg,#2c2c2c,#161616_45%,#070707)] p-5 text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/.08),0_30px_50px_-24px_rgb(0_0_0/.95)]', className)}>
      <span className="pointer-events-none absolute inset-0 bg-dots opacity-30" aria-hidden="true" />
      <span className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border-[22px] border-white/[.04]" aria-hidden="true" />
      <span className="loy-shine pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <span className="h-8 w-11 rounded-md bg-gradient-to-br from-[#e9e9e9] to-[#8d8d8d] shadow-inner" aria-hidden="true" />
          {isDefault && <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white" dir="rtl">الافتراضية</span>}
        </div>
        <p className="num font-mono text-lg font-semibold tracking-[.14em] sm:text-xl">{number}</p>
        <div className="flex items-end justify-between gap-3 text-[10px] uppercase">
          <div className="min-w-0">
            <p className="text-white/50">Card holder</p>
            <p className="truncate text-sm font-semibold normal-case">{holder || 'NAME SURNAME'}</p>
          </div>
          <div className="text-end">
            <p className="text-white/50">Expires</p>
            <p className="num text-sm font-semibold">{expiry || 'MM/YY'}</p>
          </div>
          <BrandMark brand={brand} />
        </div>
      </div>
    </div>
  );
}

export default function CardsPage() {
  const title = site.account.tabs[4].label;
  usePageTitle(title);
  const { notify } = useStore();
  const [cards, setCards] = useState<SavedCard[]>(load);
  const [adding, setAdding] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [num, setNum] = useState('');
  const [holder, setHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [makeDefault, setMakeDefault] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => save(cards), [cards]);

  const digits = num.replace(/\s/g, '');
  const brand = detectBrand(digits);
  const preview = (num + '•••• •••• •••• ••••'.slice(num.length)).slice(0, 19);

  const resetForm = () => { setNum(''); setHolder(''); setExpiry(''); setCvv(''); setMakeDefault(false); setErrors({}); };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (digits.length !== 16 || !luhn(digits)) next.num = 'رقم البطاقة غير صحيح';
    else if (!brand) next.num = 'نقبل مدى و Visa و Mastercard فقط';
    if (holder.trim().length < 2) next.holder = 'أدخل الاسم كما هو على البطاقة';
    if (!expiryOk(expiry)) next.expiry = 'تاريخ غير صالح';
    if (!/^\d{3,4}$/.test(cvv)) next.cvv = 'رمز غير صالح';
    setErrors(next);
    if (Object.keys(next).length) return;
    const card: SavedCard = { id: `c${Date.now()}`, brand: brand!, last4: digits.slice(-4), holder: holder.trim().toUpperCase(), expiry, isDefault: makeDefault || cards.length === 0 };
    setCards((cs) => [...(card.isDefault ? cs.map((c) => ({ ...c, isDefault: false })) : cs), card]);
    resetForm();
    setAdding(false);
    notify('تمت إضافة البطاقة (تجريبي)');
  };

  const setDefault = (id: string) => { setCards((cs) => cs.map((c) => ({ ...c, isDefault: c.id === id }))); notify('تم تعيين البطاقة الافتراضية'); };
  const remove = (id: string) => {
    setCards((cs) => {
      const rest = cs.filter((c) => c.id !== id);
      if (rest.length && !rest.some((c) => c.isDefault)) rest[0] = { ...rest[0], isDefault: true };
      return rest;
    });
    setConfirmId(null);
    notify('تم حذف البطاقة');
  };

  return (
    <section aria-labelledby="cards-title" className="game-frame game-frame-lg acct-sage p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="cards-title" className="font-display text-2xl font-extrabold text-fg md:text-3xl">{title}</h2>
          <p className="mt-1 text-sm text-muted">بطاقاتك المحفوظة للدفع السريع — نحفظ آخر 4 أرقام فقط.</p>
        </div>
        {!adding && <button type="button" onClick={() => setAdding(true)} className="btn btn-primary btn-sm"><Icon name="plus" size={16} />أضف بطاقة</button>}
      </div>

      {/* ——— saved cards ——— */}
      <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => (
          <Reveal as="li" key={c.id} delay={i * 80} className="group">
            <CardFace brand={c.brand} number={`•••• •••• •••• ${c.last4}`} holder={c.holder} expiry={c.expiry} isDefault={c.isDefault} className="transition-transform duration-300 group-hover:-translate-y-1" />
            <div className="mt-3 flex items-center justify-between gap-2 text-sm">
              {confirmId === c.id ? (
                <>
                  <span className="text-muted">حذف البطاقة؟</span>
                  <span className="flex gap-2">
                    <button type="button" onClick={() => remove(c.id)} className="rounded-lg bg-danger/15 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger/25">حذف</button>
                    <button type="button" onClick={() => setConfirmId(null)} className="rounded-lg bg-fg/[.06] px-3 py-1.5 text-xs font-semibold text-fg hover:bg-fg/10">إلغاء</button>
                  </span>
                </>
              ) : (
                <>
                  {c.isDefault
                    ? <span className="inline-flex items-center gap-1.5 text-xs text-muted"><Icon name="check" size={14} className="text-accent" />تُستخدم تلقائيًا عند الدفع</span>
                    : <button type="button" onClick={() => setDefault(c.id)} className="text-xs font-semibold text-fg/80 hover:text-fg">تعيين كافتراضية</button>}
                  <button type="button" onClick={() => setConfirmId(c.id)} aria-label={`حذف البطاقة المنتهية بـ ${c.last4}`} className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger">
                    <Icon name="trash" size={16} />
                  </button>
                </>
              )}
            </div>
          </Reveal>
        ))}

        {!adding && (
          <li>
            <button type="button" onClick={() => setAdding(true)} className="grid aspect-[1.586] w-full place-items-center rounded-2xl border-2 border-dashed border-line text-muted transition-colors hover:border-fg/30 hover:text-fg">
              <span className="flex flex-col items-center gap-2 text-sm font-semibold">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-fg/[.05]"><Icon name="plus" size={22} /></span>
                أضف بطاقة جديدة
              </span>
            </button>
          </li>
        )}
      </ul>

      {/* ——— add form ——— */}
      {adding && (
        <form onSubmit={submit} noValidate className="anim-rise mt-8 grid items-center gap-8 rounded-2xl bg-fg/[.025] p-5 ring-1 ring-inset ring-line md:grid-cols-[1fr_1.15fr] md:p-7">
          <CardFace brand={brand} number={preview} holder={holder} expiry={expiry} className="mx-auto max-w-[360px]" />
          <div className="grid gap-4">
            <h3 className="text-lg font-bold text-fg">بطاقة جديدة</h3>
            <TextField label="رقم البطاقة" placeholder="0000 0000 0000 0000" inputMode="numeric" dir="ltr" className="[&_input]:num [&_input]:tracking-wider" value={num} onChange={(e) => setNum(groups4(e.target.value))} error={errors.num} autoComplete="cc-number" end={<BrandMark brand={brand} className="shrink-0 scale-75" />} />
            <TextField label="الاسم على البطاقة" placeholder="NAME SURNAME" dir="ltr" value={holder} onChange={(e) => setHolder(e.target.value)} error={errors.holder} autoComplete="cc-name" />
            <div className="grid grid-cols-2 gap-4">
              <TextField label="تاريخ الانتهاء" placeholder="MM/YY" inputMode="numeric" dir="ltr" value={expiry} onChange={(e) => setExpiry(expiryFmt(e.target.value))} error={errors.expiry} autoComplete="cc-exp" />
              <TextField label="CVV" placeholder="•••" inputMode="numeric" type="password" dir="ltr" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} error={errors.cvv} autoComplete="cc-csc" hint="للتحقق فقط — لا يُحفظ" />
            </div>
            <label className="flex cursor-pointer items-center gap-3 text-sm text-fg/85">
              <input type="checkbox" checked={makeDefault} onChange={(e) => setMakeDefault(e.target.checked)} className="h-5 w-5 cursor-pointer accent-[rgb(var(--c-accent))]" />
              اجعلها البطاقة الافتراضية
            </label>
            <div className="mt-1 flex flex-wrap gap-3">
              <button className="btn btn-primary btn-sm"><Icon name="lock" size={16} />حفظ البطاقة</button>
              <button type="button" onClick={() => { resetForm(); setAdding(false); }} className="btn btn-ghost btn-sm">إلغاء</button>
            </div>
          </div>
        </form>
      )}

      <DemoNote className="mt-8">عرض تجريبي: لا تُدخل بيانات بطاقة حقيقية. يتم حفظ آخر 4 أرقام وتاريخ الانتهاء فقط في هذا المتصفح، ولا يُحفظ رقم البطاقة الكامل أو CVV.</DemoNote>
    </section>
  );
}
