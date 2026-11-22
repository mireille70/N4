import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { site } from '@/content/site';
import { register } from '@/demo/api';
import { useStore } from '@/store/StoreProvider';
import { PasswordField, PhoneField, TextField, validatePhone } from '@/components/ui/fields';
import { Icon } from '@/components/ui/Icon';
import { DemoNote, Spinner } from '@/components/ui/primitives';
import { usePageTitle } from '@/lib/usePageTitle';
import { AuthShell, OrDivider } from './AuthShell';
import { SocialButtons } from './SocialButtons';

export default function RegisterPage() {
  const t = site.auth.register;
  usePageTitle(t.title);
  const { dispatch } = useStore();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [country, setCountry] = useState(site.locale.defaultCountry);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => { setF((s) => ({ ...s, [k]: v })); setErrors((e) => ({ ...e, [k]: '' })); };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (f.name.trim().length < 2) next.name = 'يرجى إدخال الاسم الكامل';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) next.email = 'البريد الإلكتروني غير صحيح';
    if (!validatePhone(country, f.phone)) next.phone = 'رقم الجوال غير صحيح';
    if (f.password.length < 8) next.password = '8 أحرف على الأقل';
    if (f.confirm !== f.password) next.confirm = 'كلمتا المرور غير متطابقتين';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    const res = await register({ name: f.name, email: f.email, phone: f.phone, password: f.password });
    dispatch({ type: 'auth/pending', pending: { flow: 'register', phone: f.phone, user: res.user } });
    navigate('/verify');
  };

  return (
    <AuthShell step={0} state="register" title={t.title}>
      <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
        <TextField label={t.nameLabel} placeholder={t.namePlaceholder} value={f.name} onChange={(e) => set('name')(e.target.value)} error={errors.name} autoComplete="name" autoFocus />
        <TextField label={t.emailLabel} placeholder={t.emailPlaceholder} type="email" dir="ltr" className="[&_input]:text-end" value={f.email} onChange={(e) => set('email')(e.target.value)} error={errors.email} autoComplete="email" />
        <PhoneField className="sm:col-span-2" label={t.phoneLabel} placeholder={t.phonePlaceholder} value={f.phone} onChange={set('phone')} country={country} onCountry={setCountry} error={errors.phone} />
        <PasswordField label={t.passwordLabel} placeholder="••••••••" value={f.password} onChange={(e) => set('password')(e.target.value)} error={errors.password} autoComplete="new-password" />
        <PasswordField label={t.confirmLabel} placeholder="••••••••" value={f.confirm} onChange={(e) => set('confirm')(e.target.value)} error={errors.confirm} autoComplete="new-password" />
        <button className="btn btn-primary mt-1 w-full sm:col-span-2" disabled={busy}>
          {busy ? <Spinner /> : <>{t.submit}<Icon name="arrow-next" size={20} /></>}
        </button>
      </form>
      <OrDivider label={t.divider} />
      <SocialButtons />
      <p className="mt-8 text-center text-[.95rem] text-ink/70">
        {t.switchPrompt} <Link to="/login" className="font-semibold text-ink underline decoration-accent decoration-[3px] underline-offset-4">{t.switchLink}</Link>
      </p>
      <DemoNote tone="light" className="mt-8">{site.auth.demoNote}</DemoNote>
    </AuthShell>
  );
}
