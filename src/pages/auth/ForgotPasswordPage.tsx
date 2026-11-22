import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { site } from '@/content/site';
import { requestRecovery } from '@/demo/api';
import { useStore } from '@/store/StoreProvider';
import { PhoneField, validatePhone } from '@/components/ui/fields';
import { Icon } from '@/components/ui/Icon';
import { DemoNote, Spinner } from '@/components/ui/primitives';
import { usePageTitle } from '@/lib/usePageTitle';
import { AuthShell } from './AuthShell';

export default function ForgotPasswordPage() {
  const t = site.auth.forgot;
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
    await requestRecovery(phone);
    dispatch({ type: 'auth/pending', pending: { flow: 'reset', phone } });
    navigate('/verify');
  };

  return (
    <AuthShell step={0} state="forgot" title={t.title} subtitle={t.subtitle}>
      <form onSubmit={submit} noValidate className="grid gap-6">
        <PhoneField label={t.phoneLabel} placeholder={t.phonePlaceholder} value={phone} onChange={(v) => { setPhone(v); setError(''); }} country={country} onCountry={setCountry} error={error} autoFocus />
        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? <Spinner /> : <>{t.submit}<Icon name="arrow-next" size={20} /></>}
        </button>
      </form>
      <p className="mt-8 text-center">
        <Link to="/login" className="inline-flex items-center gap-2 text-[.95rem] font-semibold text-ink/75 hover:text-ink">
          <Icon name="arrow-prev" size={18} />{site.auth.login.title}
        </Link>
      </p>
      <DemoNote tone="light" className="mt-8" />
    </AuthShell>
  );
}
