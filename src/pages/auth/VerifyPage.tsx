import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { site } from '@/content/site';
import { verifyOtp, requestLoginOtp } from '@/demo/api';
import { useStore } from '@/store/StoreProvider';
import { OtpInput } from '@/components/ui/fields';
import { Icon } from '@/components/ui/Icon';
import { DemoNote, Spinner } from '@/components/ui/primitives';
import { usePageTitle } from '@/lib/usePageTitle';
import { AuthShell } from './AuthShell';

const RESEND_SECONDS = 59;

export default function VerifyPage() {
  const t = site.auth.verify;
  usePageTitle(t.title);
  const { pending, profile, dispatch, notify } = useStore();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (code.length !== 6) return setError('أدخل الرمز المكوّن من 6 أرقام');
    setBusy(true);
    const res = await verifyOtp(code);
    setBusy(false);
    if (!res.ok) return setError('الرمز غير صحيح');
    const flow = pending?.flow ?? 'login';
    if (flow === 'reset') {
      navigate('/reset-password');
      return;
    }
    const user = pending?.user ?? { name: profile.name, phone: pending?.phone ?? profile.phone, email: profile.email };
    dispatch({ type: 'auth/login', user });
    notify(flow === 'register' ? 'تم إنشاء الحساب (تجريبي)' : 'تم تسجيل الدخول (تجريبي)');
    navigate('/account');
  };

  const resend = async () => {
    await requestLoginOtp(pending?.phone ?? '');
    setSeconds(RESEND_SECONDS);
    notify('تمت إعادة إرسال الرمز (تجريبي)', 'info');
  };

  const mm = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <AuthShell step={1} state="verify" filled={code.length} title={t.title} subtitle={t.subtitle}>
      <form onSubmit={submit} noValidate className="grid gap-7">
        <div>
          <OtpInput value={code} onChange={(v) => { setCode(v); setError(''); }} invalid={Boolean(error)} />
          {error && <p role="alert" className="mt-3 text-center text-sm text-danger">{error}</p>}
        </div>
        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? <Spinner /> : <>{t.submit}<Icon name="arrow-next" size={20} /></>}
        </button>
      </form>
      <div className="mt-7 text-center text-sm">
        <p className="text-ink/60">{t.notReceived}</p>
        {seconds > 0 ? (
          <p className="mt-1.5 font-semibold text-ink/80" aria-live="polite">{t.resendIn} <span className="num">{mm}</span></p>
        ) : (
          <button type="button" onClick={resend} className="mt-1.5 font-semibold text-ink underline decoration-accent decoration-[3px] underline-offset-4">{t.resend}</button>
        )}
      </div>
      <DemoNote tone="light" className="mt-8" />
    </AuthShell>
  );
}
