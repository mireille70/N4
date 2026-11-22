import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { sendContactMessage } from '@/demo/api';
import { site } from '@/content/site';
import { useStore } from '@/store/StoreProvider';
import { PhoneField, TextField, validatePhone } from '@/components/ui/fields';
import { Icon } from '@/components/ui/Icon';
import { DemoNote, Spinner } from '@/components/ui/primitives';
import { cx } from '@/lib/format';
import { usePageTitle } from '@/lib/usePageTitle';

/**
 * Contact — soft pastel layout.
 *  1. Centred opening: live-status pill, large title with the lime highlight, promise line;
 *     two 3D objects float at the far edges on desktop.
 *  2. Three tinted channel cards (WhatsApp first — the fastest).
 *  3. One white panel: the form on the reading side, a lavender support column on the other
 *     (a short chat transcript, working hours, tips, FAQ link).
 */
export default function ContactPage() {
  usePageTitle('تواصل معنا');
  const { notify, user } = useStore();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('SA');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = 'يرجى إدخال الاسم';
    if (email && !/^\S+@\S+\.\S+$/.test(email)) next.email = 'البريد الإلكتروني غير صحيح';
    if (!validatePhone(country, phone)) next.phone = 'رقم الهاتف غير صحيح';
    if (message.trim().length < 5) next.message = 'يرجى كتابة رسالتك';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    await sendContactMessage({ name, phone, message });
    setBusy(false);
    setMessage('');
    notify('تم إرسال رسالتك (تجريبي)');
  };

  const { contact } = site;
  const channels = [
    { icon: 'send', label: 'واتساب', value: 'ابدأ محادثة الآن', href: `https://wa.me/${contact.whatsapp}`, tint: 'bg-[var(--tint-sage)]', badge: 'الأسرع' },
    { icon: 'phone', label: 'اتصل بنا', value: contact.phone, href: `tel:${contact.phone}`, tint: 'bg-[var(--tint-lavender)]', ltr: true },
    { icon: 'mail', label: 'البريد الإلكتروني', value: contact.email, href: `mailto:${contact.email}`, tint: 'bg-[var(--tint-pink)]', ltr: true },
  ];

  return (
    <>
      {/* ——— 1. opening ——— */}
      <section aria-labelledby="contact-title" className="container-x relative pt-4 sm:pt-10 lg:pt-14">
        <nav aria-label="مسار التنقل" className="text-xs text-muted sm:text-sm">
          <Link to="/" className="hover:text-fg">الرئيسية</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-fg" aria-current="page">تواصل معنا</span>
        </nav>

        <div className="relative">
          <div className="mx-auto max-w-2xl pt-5 text-center sm:pt-8 lg:pt-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-xs font-medium sm:px-4 sm:py-2 sm:text-sm text-fg shadow-[var(--elev-3)] ring-1 ring-line">
              <span className="relative flex h-2.5 w-2.5"><span className="absolute inset-0 animate-ping rounded-full bg-[#3DD68C]/50" /><span className="relative h-2.5 w-2.5 rounded-full bg-[#3DD68C]" /></span>
              فريق الدعم متصل الآن
            </span>
            <h1 id="contact-title" className="mt-4 font-display sm:mt-6 text-2xl font-bold leading-9 tracking-[-0.03em] sm:text-[4rem] sm:leading-[4.75rem] lg:text-[5rem] lg:leading-[6rem]">
              تواصل <span className="text-gold-foil">معنا</span>
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-fg/70 sm:mt-5 sm:text-lg sm:leading-8">
              فريق الدعم جاهز يساعدك في أي وقت — مشكلة في طلب، سؤال عن بطاقة، أو أي استفسار عن الدفع.
            </p>
          </div>
        </div>
      </section>

      {/* ——— 2. channels ——— */}
      <section aria-label="طرق التواصل" className="container-x pt-6 sm:pt-12 lg:pt-16">
        <ul className="grid grid-cols-3 gap-2 sm:gap-4">
          {channels.map((c) => (
            <li key={c.label}>
              <a
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className={cx('contact-card lift group relative flex h-full flex-col items-center rounded-2xl border border-line p-3 text-center hover:-translate-y-1 hover:shadow-[var(--elev-4)] sm:items-stretch sm:p-5 sm:text-start', c.tint)}
              >
                <span className="flex items-start justify-between max-sm:justify-center">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface text-accent sm:h-11 sm:w-11 shadow-[var(--elev-2)]">
                    <Icon name={c.icon} size={20} strokeWidth={2} />
                  </span>
                  {c.badge ? (
                    <span className="rounded-full px-3 py-1 text-xs font-bold text-fg max-sm:absolute max-sm:start-1.5 max-sm:top-1.5 max-sm:px-1.5 max-sm:py-0 max-sm:text-[9px]" style={{ background: 'var(--lime)' }}>{c.badge}</span>
                  ) : (
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-raised/70 max-sm:hidden text-fg/60 transition-colors group-hover:bg-surface group-hover:text-fg">
                      <Icon name="arrow-next" size={16} />
                    </span>
                  )}
                </span>
                <span className="mt-2 block text-[11px] text-fg/60 sm:mt-5 sm:text-xs">{c.label}</span>
                <span className={cx('mt-0.5 block max-w-full break-words font-display text-[11px] font-bold leading-4 text-fg sm:truncate sm:break-normal sm:text-base', c.ltr && 'num sm:text-right')} dir={c.ltr ? 'ltr' : undefined}>{c.value.replace('@', '@\u200b')}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* ——— 3. form + support column ——— */}
      <section className="container-x pb-section pt-3 sm:pt-6 lg:pt-8">
        <div className="grid overflow-hidden rounded-[24px] border border-line bg-surface lg:grid-cols-12">
          {/* form */}
          <form onSubmit={submit} noValidate className="p-4 sm:p-10 lg:col-span-7 lg:p-12">
            <h2 className="font-display text-xl font-bold leading-8 sm:text-[2rem] sm:leading-[2.75rem]">أرسل لنا رسالة</h2>

            <div className="mt-5 grid gap-4 sm:mt-8 sm:gap-6 sm:grid-cols-2">
              <TextField label="الاسم *" placeholder="أدخل اسمك" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} autoComplete="name" />
              <TextField label="البريد الإلكتروني" placeholder="name@example.com" type="email" dir="ltr" className="[&_input]:text-end" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} autoComplete="email" />
            </div>
            <PhoneField className="mt-4 sm:mt-6" label="رقم الهاتف *" placeholder="رقم الهاتف" value={phone} onChange={setPhone} country={country} onCountry={setCountry} error={errors.phone} />
            <div className="mt-4 sm:mt-6">
              <label htmlFor="msg" className="field-label">رسالتك *</label>
              <div className="field !h-auto py-3" data-invalid={Boolean(errors.message)}>
                <textarea id="msg" rows={5} value={message} placeholder="اكتب تفاصيل استفسارك… ولو عندك رقم طلب أضفه هنا" onChange={(e) => setMessage(e.target.value)} className="resize-none" aria-invalid={Boolean(errors.message)} />
              </div>
              {errors.message && <p role="alert" className="mt-2 text-xs text-danger">{errors.message}</p>}
            </div>
            <div className="mt-5 flex flex-col items-start gap-3 sm:mt-8 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button className="btn btn-primary !h-12 !rounded-full !px-10 max-sm:w-full sm:!h-14" disabled={busy}>{busy ? <Spinner /> : <>إرسال الرسالة<Icon name="send" size={18} /></>}</button>
              <DemoNote>عرض تجريبي: لا يتم إرسال الرسائل فعلياً.</DemoNote>
            </div>
          </form>

          {/* support column */}
          <aside className="contact-aside border-line bg-container lg:border-s flex flex-col justify-start gap-5 p-4 sm:gap-10 sm:p-10 lg:col-span-5 lg:p-12">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface text-accent shadow-[var(--elev-1)]"><Icon name="calendar" size={18} /></span>
              <span>
                <span className="block font-semibold text-fg">ساعات العمل</span>
                <span className="mt-1 block text-sm leading-6 text-fg/65">{contact.hours}</span>
              </span>
            </div>

            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface text-accent shadow-[var(--elev-1)]"><Icon name="bolt" size={18} /></span>
              <span>
                <span className="block font-semibold text-fg">عشان نخدمك أسرع</span>
                <span className="mt-1 block text-sm leading-6 text-fg/65">اكتب رقم الطلب ومعرف اللاعب، ووصف المشكلة باختصار.</span>
              </span>
            </div>

            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface text-accent shadow-[var(--elev-1)]"><Icon name="shield" size={18} /></span>
              <span>
                <span className="block font-semibold text-fg">بياناتك بأمان</span>
                <span className="mt-1 block text-sm leading-6 text-fg/65">نستخدم معلوماتك فقط للرد على رسالتك.</span>
              </span>
            </div>

            <Link to="/faq" className="group mt-0 flex items-center justify-between gap-4 rounded-2xl bg-surface px-4 py-3 sm:mt-2 sm:px-5 sm:py-4 text-sm shadow-[var(--elev-2)] transition-shadow hover:shadow-[var(--elev-3)]">
              <span>
                <span className="block font-semibold text-fg">عندك سؤال سريع؟</span>
                <span className="mt-0.5 block text-muted">شوف الأسئلة الشائعة</span>
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-raised text-fg transition-transform group-hover:-translate-x-1"><Icon name="arrow-next" size={16} /></span>
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}
