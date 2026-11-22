import { useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { getProduct } from '@/content/catalog';
import { useStore } from '@/store/StoreProvider';
import { placeOrder, type Order } from '@/demo/api';
import { ProductArt } from '@/components/product/ProductArt';
import { PhoneField, TextField, validatePhone } from '@/components/ui/fields';
import { Icon } from '@/components/ui/Icon';
import { DemoNote, EmptyState, Price, Spinner } from '@/components/ui/primitives';
import { cx, formatAmount } from '@/lib/format';
import { site } from '@/content/site';
import { usePageTitle } from '@/lib/usePageTitle';

type Method = 'mada' | 'visa' | 'apple' | 'master' | 'stc';

const AppleGlyph = () => (
  <svg viewBox="0 0 24 24" className="h-[1.05em] w-[1.05em]" fill="currentColor" aria-hidden="true">
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
  </svg>
);

/** the supplied Visa / mada logos, each on a small white plate so their own colours read on the dark tile */
const LogoPlate = ({ src, alt, h }: { src: string; alt: string; h: string }) => (
  <span className="grid place-items-center rounded-lg bg-white px-2.5 py-1.5">
    <img src={src} alt={alt} draggable={false} decoding="async" className={`${h} w-auto object-contain`} />
  </span>
);
/** payment methods — marks (Visa and mada from the supplied logo files). DOM order = reading order in RTL. */
const METHODS: Array<{ id: Method; label: string; mark: ReactNode }> = [
  { id: 'mada', label: 'مدى', mark: <LogoPlate src="/assets/payments/mada.webp" alt="mada" h="h-5" /> },
  { id: 'visa', label: 'Visa', mark: <LogoPlate src="/assets/payments/visa.webp" alt="Visa" h="h-4" /> },
  { id: 'apple', label: 'Apple Pay', mark: <span className="inline-flex items-center gap-1 font-display text-xl font-bold"><AppleGlyph />Pay</span> },
  {
    id: 'master', label: 'Mastercard', mark: (
      <span className="relative inline-flex h-6 w-10" aria-hidden="true">
        <span className="absolute start-0 top-0 h-6 w-6 rounded-full bg-[#EB001B]" />
        <span className="absolute end-0 top-0 h-6 w-6 rounded-full bg-[#F79E1B] mix-blend-screen" />
      </span>
    ),
  },
  { id: 'stc', label: 'STC Pay', mark: <span className="font-display text-xl font-extrabold">stc<span className="text-[#A855F7]">pay</span></span> },
];

/** copies `text` to the clipboard; the icon turns into a check for a moment */
function CopyButton({ text }: { text: string }) {
  const { notify } = useStore();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // older browsers / insecure origins: fall back to a hidden textarea
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } finally { ta.remove(); }
    }
    setCopied(true);
    notify('تم نسخ رقم الطلب');
    window.setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'تم النسخ' : 'نسخ رقم الطلب'}
      title={copied ? 'تم النسخ' : 'نسخ'}
      className={cx('grid h-9 w-9 place-items-center rounded-lg ring-1 ring-inset transition-colors', copied ? 'bg-accent/15 text-accent ring-accent/40' : 'text-muted ring-line hover:bg-fg/[.06] hover:text-fg')}
    >
      <Icon name={copied ? 'check' : 'copy'} size={17} strokeWidth={copied ? 2.6 : 1.9} />
    </button>
  );
}

function Steps({ at }: { at: 1 | 2 | 3 }) {
  const steps = ['السلة', 'الدفع', 'التأكيد'];
  return (
    <ol className="mt-6 flex w-full max-w-md items-center gap-1.5 sm:gap-2" aria-label="خطوات الطلب">
      {steps.map((s, i) => {
        const n = i + 1;
        const state = n < at ? 'done' : n === at ? 'now' : 'next';
        return (
          <li key={s} className="flex min-w-0 flex-1 items-center gap-1.5 last:flex-none sm:gap-2" aria-current={state === 'now' ? 'step' : undefined}>
            <span className={cx('num grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold', state === 'next' ? 'bg-fg/[.06] text-muted ring-1 ring-inset ring-line' : 'bg-accent text-white', state === 'now' && 'shadow-[0_0_0_4px_rgb(var(--c-accent)/.2)]')}>
              {state === 'done' ? <Icon name="check" size={15} strokeWidth={2.8} /> : n}
            </span>
            <span className={cx('shrink-0 whitespace-nowrap text-[13px] font-semibold sm:text-sm', state === 'next' ? 'text-muted' : 'text-fg')}>{s}</span>
            {n < steps.length && <span className={cx('h-px min-w-2 flex-1',n < at ? 'bg-accent' : 'bg-line')} />}
          </li>
        );
      })}
    </ol>
  );
}

export default function CheckoutPage() {
  usePageTitle('إتمام الطلب');
  const { cart, cartTotal, dispatch, notify, user, profile } = useStore();

  const [name, setName] = useState(profile.name || user?.name || '');
  const [email, setEmail] = useState(profile.email || user?.email || '');
  const [phone, setPhone] = useState(profile.phone || user?.phone || '');
  const [country, setCountry] = useState(profile.countryCode || 'SA');
  const [method, setMethod] = useState<Method>('mada');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState<Order | null>(null);

  // prices are VAT-inclusive (see FAQ / terms): split the total into subtotal + 15% VAT
  const total = cartTotal;
  const subtotal = Math.round((total / 1.15) * 100) / 100;
  const vat = Math.round((total - subtotal) * 100) / 100;
  const cur = site.locale.currency.symbol;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = 'يرجى إدخال الاسم';
    if (!validatePhone(country, phone)) next.phone = 'رقم الهاتف غير صحيح';
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'سنرسل الأكواد إلى بريدك — أدخل بريدًا صحيحًا';
    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"] input')?.focus());
      return;
    }
    setPlacing(true);
    const order = await placeOrder(cart.map(({ key: _k, image: _i, ...line }) => line));
    const final = { ...order, total };
    dispatch({ type: 'orders/add', order: final });
    dispatch({ type: 'cart/clear' });
    setPlacing(false);
    setDone(final);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    notify('تم الدفع وإنشاء الطلب (تجريبي)');
  };

  // ——— confirmation ———
  if (done) {
    return (
      <section className="container-x pb-section pt-10 lg:pt-14">
        {/* success header */}
        <div className="mx-auto max-w-xl text-center">
          <span className="relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-[var(--tint-sage)]">
            <span className="absolute inset-0 animate-ping rounded-full bg-[var(--tint-sage)] [animation-iteration-count:2]" aria-hidden="true" />
            <span className="relative grid h-14 w-14 place-items-center rounded-full bg-[#3DD68C] text-[#06210F] shadow-[0_12px_24px_-10px_rgb(61_214_140/.5)]">
              <Icon name="check" size={28} strokeWidth={2.8} />
            </span>
          </span>
          <h1 className="mt-6 font-display text-3xl font-bold text-fg md:text-4xl">تم الطلب بنجاح</h1>
          <p className="mx-auto mt-3 max-w-md text-base leading-7 text-muted">الأكواد بتوصلك على بريدك خلال دقائق، وتلاقيها كمان في عمليات الشراء.</p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-raised py-1.5 pe-1.5 ps-5">
            <span className="text-sm text-muted">رقم الطلب</span>
            <span className="num font-display text-lg font-bold text-fg">{done.id}</span>
            <CopyButton text={done.id} />
          </div>
        </div>

        {/* receipt */}
        <div className="mx-auto mt-10 max-w-xl overflow-hidden rounded-[28px] border border-line bg-surface">
          <div className="flex items-center justify-between px-5 pt-5 sm:px-7 sm:pt-6">
            <h2 className="font-bold text-fg">تفاصيل الطلب</h2>
            <span className="text-sm text-muted"><span className="num">{done.lines.reduce((n, l) => n + l.qty, 0)}</span> منتج</span>
          </div>
          <ul className="mt-2 divide-y divide-line px-5 sm:px-7">
            {done.lines.map((l, i) => {
              const product = getProduct(l.slug);
              return (
                <li key={i} className="flex items-center gap-4 py-4">
                  {product
                    ? <ProductArt product={product} sizes="48px" className="h-14 w-11 shrink-0 rounded-lg ring-1 ring-line" />
                    : <span className="grid h-14 w-11 shrink-0 place-items-center rounded-lg bg-raised text-muted"><Icon name="gift" size={18} /></span>}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-fg">{l.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span className="num">× {l.qty}</span>
                      {l.playerId && <span className="rounded-full bg-raised px-2 py-0.5">معرف اللاعب <span className="num text-fg/80">{l.playerId}</span></span>}
                    </div>
                  </div>
                  <Price value={l.price * l.qty} size="sm" />
                </li>
              );
            })}
          </ul>
          {/* perforation */}
          <div className="relative mx-5 sm:mx-7" aria-hidden="true">
            <span className="block border-t-2 border-dashed border-line" />
            <span className="absolute -start-8 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-line bg-surface sm:-start-10" />
            <span className="absolute -end-8 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-line bg-surface sm:-end-10" />
          </div>
          <div className="flex items-baseline justify-between px-5 py-5 sm:px-7 sm:py-6">
            <span className="font-semibold text-fg">الإجمالي المدفوع</span>
            <Price value={done.total} size="lg" />
          </div>
        </div>

        <DemoNote className="mx-auto mt-4 max-w-xl justify-center">عرض تجريبي: لم يتم تحصيل أي مبلغ ولن يتم إرسال أكواد فعلية.</DemoNote>
        <div className="mx-auto mt-6 flex max-w-xl flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/account/orders" className="btn btn-primary">عمليات الشراء<Icon name="arrow-next" size={18} /></Link>
          <Link to="/categories" className="btn btn-ghost">متابعة التسوق</Link>
        </div>
      </section>
    );
  }

  if (cart.length === 0) {
    return (
      <section className="container-x pb-section pt-10">
        <EmptyState icon="cart" title="السلة فارغة — أضف منتجات قبل الدفع" action={{ label: 'الفئات', to: '/categories' }} />
      </section>
    );
  }

  return (
    <>
      <div className="container-x pt-8 lg:pt-10">
        <h1 className="sr-only">إتمام الطلب</h1>
        <Steps at={2} />
      </div>

      <form onSubmit={submit} noValidate className="container-x pb-section pt-8 lg:pt-10">
        {/* ——— payment methods ——— */}
        <p id="pay-label" className="mb-3 text-sm font-semibold text-fg">طريقة الدفع</p>
        <div role="radiogroup" aria-labelledby="pay-label" className="no-scrollbar -mx-[var(--gutter,1rem)] flex snap-x snap-mandatory flex-nowrap justify-start gap-2.5 overflow-x-auto overscroll-x-contain px-[var(--gutter,1rem)] pb-2 pt-2 [scroll-padding-inline:var(--gutter,1rem)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
          {METHODS.map((m) => {
            const on = method === m.id;
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={m.label}
                onClick={() => setMethod(m.id)}
                className={cx(
                  'relative grid h-11 w-[88px] shrink-0 snap-start place-items-center sm:h-12 rounded-lg text-fg ring-1 ring-inset transition-all sm:w-[104px]',
                  on ? 'bg-fg/[.07] ring-accent/70' : 'bg-fg/[.025] ring-line opacity-75 hover:opacity-100 hover:ring-fg/25',
                )}
              >
                <span dir="ltr" className="inline-flex scale-[.8] items-center">{m.mark}</span>
                {on && (
                  <span className="absolute -end-1.5 -top-1.5 grid h-[18px] w-[18px] place-items-center rounded-full bg-accent text-onaccent ring-2 ring-bg" aria-hidden="true">
                    <Icon name="check" size={10} strokeWidth={3.4} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* ——— customer data ——— */}
          <section aria-labelledby="customer-title" className="game-frame game-frame-lg p-6 sm:p-10 lg:col-span-7">
            <h2 id="customer-title" className="font-display text-2xl font-extrabold text-fg md:text-[2rem]">بيانات العميل</h2>
            <div className="mt-8 grid gap-6">
              <TextField label="الاسم" placeholder="أدخل الاسم" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} autoComplete="name" />
              <PhoneField label="رقم الهاتف" value={phone} onChange={setPhone} country={country} onCountry={setCountry} error={errors.phone} />
              <TextField label="البريد الإلكتروني" placeholder="name@example.com" type="email" dir="ltr" className="[&_input]:text-end" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} autoComplete="email" />
            </div>
          </section>

          {/* ——— order summary ——— */}
          <aside aria-labelledby="summary-title" className="lg:col-span-5">
            <div className="game-frame game-frame-lg p-6 sm:p-10 lg:sticky lg:top-28">
              <h2 id="summary-title" className="font-display text-2xl font-extrabold text-fg md:text-[2rem]">ملخص الطلب</h2>
              <ul className="mt-8 grid gap-5">
                {cart.map((line) => {
                  const product = getProduct(line.slug);
                  const detail = line.options?.length ? line.options.join(' · ') : line.name;
                  return (
                    <li key={line.key} className="flex items-center gap-4">
                      {product && <ProductArt product={product} className="h-[70px] w-14 shrink-0 rounded-lg ring-1 ring-line" />}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-sm font-extrabold uppercase text-fg">{product?.nameEn ?? line.name}</span>
                        <span className="mt-1 block truncate text-xs text-muted">{detail} <span className="num">× {line.qty}</span></span>
                        {line.playerId && <span className="block text-xs text-muted">معرف اللاعب: <span className="num">{line.playerId}</span></span>}
                      </span>
                      <span className="num shrink-0 font-display text-sm font-bold text-fg">{formatAmount(line.price * line.qty)} {cur}</span>
                    </li>
                  );
                })}
              </ul>

              <dl className="mt-8 text-sm">
                <div className="flex items-center justify-between border-b border-line py-4">
                  <dt className="text-muted">المجموع الفرعي</dt>
                  <dd className="num font-bold text-fg">{formatAmount(subtotal)} {cur}</dd>
                </div>
                <div className="flex items-center justify-between border-b border-line py-4">
                  <dt className="text-muted">ضريبة القيمة المضافة (<span className="num">15%</span>)</dt>
                  <dd className="num font-bold text-fg">{formatAmount(vat)} {cur}</dd>
                </div>
                <div className="flex items-center justify-between pt-5">
                  <dt className="text-lg font-extrabold text-fg">المجموع</dt>
                  <dd className="num font-display text-xl font-extrabold text-accent">{formatAmount(total)} {cur}</dd>
                </div>
              </dl>

              {/* pay — under the total (the whole page is one form, so this submits it) */}
              <button className="btn btn-primary mt-7 h-14 w-full text-base" disabled={placing}>
                {placing ? <Spinner /> : <>دفع <span className="num">{formatAmount(total)}</span> {cur}<Icon name="arrow-next" size={18} /></>}
              </button>
              <p className="mt-4 text-center text-xs leading-6 text-muted">
                بالضغط على دفع أنت توافق على <Link to="/terms" className="font-semibold text-fg hover:text-accent">الشروط والأحكام</Link> و<Link to="/refund" className="font-semibold text-fg hover:text-accent">سياسة الاسترجاع</Link>
              </p>
              <DemoNote className="mt-3 justify-center">عرض تجريبي: لا يتم تحصيل أي مبلغ.</DemoNote>
            </div>
          </aside>
        </div>
      </form>
    </>
  );
}
