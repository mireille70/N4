import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { site } from '@/content/site';
import { saveProfile } from '@/demo/api';
import { useStore, type Profile } from '@/store/StoreProvider';
import { PhoneField, SelectField, TextField, validatePhone } from '@/components/ui/fields';
import { Icon } from '@/components/ui/Icon';
import { Spinner } from '@/components/ui/primitives';
import { cx } from '@/lib/format';
import { pointsOf, tierState } from '@/content/loyalty';
import { usePageTitle } from '@/lib/usePageTitle';
import { Avatar, avatarTints } from './AccountShell';

/** one line of the security panel: tinted icon, title + note, action */
function Row({ icon, tint, title, note, children }: { icon: string; tint: string; title: string; note: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-fg" style={{ background: tint }}><Icon name={icon} size={18} /></span>
        <div className="min-w-0">
          <p className="font-semibold text-fg">{title}</p>
          <p className="mt-0.5 text-sm text-muted">{note}</p>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/**
 * Profile — three separate panels in the homepage's pastel language:
 *  1. identity on a lavender field (avatar, name, tier on lime) with the avatar picker folding out;
 *  2. the details form on white;
 *  3. password / logout / delete as rows on white.
 */
export default function ProfilePage() {
  const t = site.account.profile;
  usePageTitle(site.account.tabs[0].label);
  const { profile, user, loyaltyPoints, dispatch, notify } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState<Profile>(profile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dateMode, setDateMode] = useState(false);
  const [picking, setPicking] = useState(false);

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: '' })); };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'البريد الإلكتروني غير صحيح';
    if (form.phone && !validatePhone(form.countryCode, form.phone)) next.phone = 'رقم الهاتف غير صحيح';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    await saveProfile(form);
    dispatch({ type: 'profile/save', profile: form });
    setBusy(false);
    notify('تم حفظ البيانات');
  };

  const pickAvatar = (i: number) => {
    set('avatar', i);
    dispatch({ type: 'profile/save', profile: { ...profile, avatar: i } });
  };

  const logout = () => { dispatch({ type: 'auth/logout' }); notify('تم تسجيل الخروج', 'info'); navigate('/'); };
  const deleteAccount = () => { dispatch({ type: 'account/delete' }); notify('تم حذف بيانات الحساب التجريبي', 'info'); navigate('/'); };

  const name = profile.name || user?.name || 'حسابي';
  const email = profile.email || user?.email;
  const { current } = tierState(pointsOf(loyaltyPoints));

  return (
    <div className="grid gap-5">
      {/* ——— 1. identity ——— */}
      <section aria-labelledby="me-title" className="acct-dark overflow-hidden rounded-[24px] border border-line [--c-raised:21_53_42] [--c-surface:14_42_30]">
        <div className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:p-7 sm:text-start">
          <Avatar index={form.avatar} size="lg" className="!h-20 !w-20 shrink-0 ring-2 ring-line" />
          <div className="min-w-0 flex-1">
            <h1 id="me-title" className="truncate font-display text-2xl font-bold text-fg">{name}</h1>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#8BEBDA] px-3 py-1 text-xs font-bold text-[#06241B]">
                <Icon name={current.icon} size={12} />عضو {current.name}
              </span>
              {email && <span className="text-sm text-fg/60" dir="ltr">{email}</span>}
            </div>
          </div>
          <button type="button" onClick={() => setPicking((v) => !v)} aria-expanded={picking} aria-controls="avatar-picker" className="btn btn-ghost btn-sm !h-11 !px-5">
            <Icon name={picking ? 'x' : 'edit'} size={16} />{picking ? 'إغلاق' : 'تغيير الصورة'}
          </button>
        </div>

        {picking && (
          <div id="avatar-picker" className="border-t border-line bg-raised/50 px-6 py-5 sm:px-7">
            <div role="radiogroup" aria-label="اختر الصورة الرمزية" className="flex flex-wrap justify-center gap-3 sm:justify-start">
              {avatarTints.map((_, i) => {
                const on = form.avatar === i;
                return (
                  <button
                    key={i}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={`الصورة ${i + 1}`}
                    onClick={() => pickAvatar(i)}
                    className={cx('rounded-full transition-all duration-200', on ? 'scale-105 ring-[3px] ring-accent ring-offset-2 ring-offset-[#0A1F17]' : 'opacity-70 hover:scale-105 hover:opacity-100')}
                  >
                    <Avatar index={i} size="sm" className="!h-12 !w-12" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ——— 2. details ——— */}
      <form onSubmit={submit} noValidate aria-labelledby="pd-title" className="form-tint solid-panel rounded-[24px] border border-line bg-surface p-6 sm:p-8">
        <h2 id="pd-title" className="font-display text-xl font-bold text-fg">{t.title}</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <TextField label={t.fields.name.label} placeholder={t.fields.name.placeholder} value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" />
          <PhoneField label={t.fields.phone.label} placeholder={t.fields.phone.placeholder} value={form.phone} onChange={(v) => set('phone', v)} country={form.countryCode} onCountry={(c) => set('countryCode', c)} error={errors.phone} />
          <TextField label={t.fields.email.label} placeholder={t.fields.email.placeholder} type="email" dir="ltr" className="[&_input]:text-end" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} autoComplete="email" />
          <TextField
            label={t.fields.birthday.label}
            placeholder={t.fields.birthday.placeholder}
            type={dateMode || form.birthday ? 'date' : 'text'}
            onFocus={() => setDateMode(true)}
            onBlur={() => setDateMode(false)}
            value={form.birthday}
            onChange={(e) => set('birthday', e.target.value)}
            className="[&_.field]:relative"
            max={new Date().toISOString().slice(0, 10)}
            end={<Icon name="calendar" size={18} className="pointer-events-none shrink-0 text-muted" />}
          />
          <SelectField label={t.fields.country.label} placeholder={t.fields.country.placeholder} options={site.account.countries} value={form.country} onChange={(e) => set('country', e.target.value)} />
          <SelectField label={t.fields.gender.label} placeholder={t.fields.gender.placeholder} options={site.account.genders} value={form.gender} onChange={(e) => set('gender', e.target.value)} />
        </div>
        <div className="mt-8 flex justify-end">
          <button className="btn btn-primary !h-12 !px-10 max-sm:w-full" disabled={busy}>
            {busy ? <Spinner /> : <><Icon name="check" size={18} />{t.save}</>}
          </button>
        </div>
      </form>

      {/* ——— 3. security ——— */}
      <section aria-labelledby="sec-title" className="acct-dark rounded-[24px] border border-line p-6 sm:p-8 [--c-raised:21_53_42] [--c-surface:14_42_30] [--tint-lavender:#15352A] [--tint-sky:#15352A] [--tint-pink:#15352A]">
        <h2 id="sec-title" className="font-display text-xl font-bold text-fg">الأمان والحساب</h2>
        <div className="mt-6 divide-y divide-line">
          <Row icon="lock" tint="var(--tint-lavender)" title="كلمة السر" note="غيّرها من وقت لآخر عشان حسابك يبقى آمن.">
            <Link to="/reset-password" className="btn btn-ghost btn-sm !h-10 !px-5">{t.changePassword}</Link>
          </Row>
          <Row icon="logout" tint="var(--tint-sky)" title={t.logout} note="تسجيل الخروج من هذا الجهاز.">
            <button type="button" onClick={logout} className="btn btn-ghost btn-sm !h-10 !px-5">{t.logout}</button>
          </Row>
          <Row icon="trash" tint="var(--tint-pink)" title={t.disable.title} note={t.disable.body}>
            {confirmDelete ? (
              <div className="flex gap-2">
                <button type="button" onClick={deleteAccount} className="btn btn-sm btn-danger-solid !h-10">تأكيد الحذف</button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="btn btn-sm btn-ghost !h-10">إلغاء</button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="btn btn-sm btn-danger !h-10 !px-5">{t.disable.action}</button>
            )}
          </Row>
        </div>
      </section>
    </div>
  );
}
