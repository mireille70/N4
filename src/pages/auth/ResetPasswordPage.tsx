import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { site } from '@/content/site';
import { resetPassword } from '@/demo/api';
import { useStore } from '@/store/StoreProvider';
import { PasswordField } from '@/components/ui/fields';
import { Icon } from '@/components/ui/Icon';
import { DemoNote, Spinner } from '@/components/ui/primitives';
import { usePageTitle } from '@/lib/usePageTitle';
import { cx } from '@/lib/format';
import { AuthShell } from './AuthShell';

const scorePassword = (p: string) =>
  [p.length >= 8, /[A-Z]/.test(p) && /[a-z]/.test(p), /\d/.test(p), /[^A-Za-z0-9]/.test(p)].filter(Boolean).length;

const strengthLabel = ['', 'ضعيفة', 'متوسطة', 'جيدة', 'قوية'];

export default function ResetPasswordPage() {
  const t = site.auth.reset;
  usePageTitle(t.title);
  const { user, dispatch, notify } = useStore();
  const navigate = useNavigate();
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const strength = pw ? scorePassword(pw) : 0;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (pw.length < 8) next.pw = '8 أحرف على الأقل';
    if (confirm !== pw) next.confirm = 'كلمتا المرور غير متطابقتين';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    await resetPassword(pw);
    dispatch({ type: 'auth/pending', pending: null });
    notify('تم تحديث كلمة المرور (تجريبي)');
    navigate(user ? '/account' : '/login');
  };

  return (
    <AuthShell step={2} state="reset" strength={strength} title={t.title} subtitle={t.subtitle}>
      <form onSubmit={submit} noValidate className="grid gap-5">
        <div>
          <PasswordField label={t.newLabel} placeholder="••••••••" value={pw} onChange={(e) => { setPw(e.target.value); setErrors({}); }} error={errors.pw} autoComplete="new-password" autoFocus />
          <div className="mt-3 flex items-center gap-3" aria-live="polite">
            <div className="flex flex-1 gap-1.5" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => <span key={i} className={cx('h-1 flex-1 rounded-full transition-colors', i < strength ? 'bg-ink' : 'bg-ink/10')} />)}
            </div>
            <span className="w-14 text-end text-xs text-ink/60">{strengthLabel[strength]}</span>
          </div>
        </div>
        <PasswordField label={t.confirmLabel} placeholder="••••••••" value={confirm} onChange={(e) => { setConfirm(e.target.value); setErrors({}); }} error={errors.confirm} autoComplete="new-password" />
        <button className="btn btn-primary mt-2 w-full" disabled={busy}>
          {busy ? <Spinner /> : <>{t.submit}<Icon name="arrow-next" size={20} /></>}
        </button>
      </form>
      <DemoNote tone="light" className="mt-8">عرض تجريبي: لا يتم حفظ كلمة المرور على أي خادم.</DemoNote>
    </AuthShell>
  );
}
