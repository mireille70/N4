import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { site } from '@/content/site';
import { requestLoginOtp } from '@/demo/api';
import { useStore } from '@/store/StoreProvider';
import { PhoneField, validatePhone } from '@/components/ui/fields';
import { Icon } from '@/components/ui/Icon';
import { DemoNote, Spinner } from '@/components/ui/primitives';
import { usePageTitle } from '@/lib/usePageTitle';
import { AuthShell, OrDivider } from './AuthShell';
import { SocialButtons } from './SocialButtons';

export default function LoginPage() {
  const t = site.auth.login;
  usePageTitle(t.title);
  const { dispatch } = useStore();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState(site.locale.defaultCountry);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validatePhone(country, phone)) return setError('رقم الهاتف غير صحيح');
    setBusy(true);
    await requestLoginOtp(phone);
    dispatch({ type: 'auth/pending', pending: { flow: 'login', phone } });
    navigate('/verify');
  };

  return (
    <AuthShell step={0} state="login" title={t.title}>
      <form onSubmit={submit} noValidate className="grid gap-6">
        <PhoneField label={t.phoneLabel} placeholder={t.phonePlaceholder} value={phone} onChange={(v) => { setPhone(v); setError(''); }} country={country} onCountry={setCountry} error={error} autoFocus />
        <div className="-mt-3 text-end">
          <Link to="/forgot-password" className="text-sm font-medium text-ink/70 underline-offset-4 hover:text-ink hover:underline">{site.auth.forgot.title}</Link>
        </div>
        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? <Spinner /> : <>{t.submit}<Icon name="arrow-next" size={20} /></>}
        </button>
      </form>
      <OrDivider label={t.divider} />
      <SocialButtons />
      <p className="mt-8 text-center text-[.95rem] text-ink/70">
        {t.switchPrompt} <Link to="/register" className="font-semibold text-ink underline decoration-accent decoration-[3px] underline-offset-4">{t.switchLink}</Link>
      </p>
      <DemoNote tone="light" className="mt-8">{site.auth.demoNote}</DemoNote>
    </AuthShell>
  );
}
