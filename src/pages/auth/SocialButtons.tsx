import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socialSignIn } from '@/demo/api';
import { useStore } from '@/store/StoreProvider';
import { GoogleMark } from '@/components/ui/Icon';
import { BrandGlyph } from '@/components/ui/BrandGlyph';
import { Spinner } from '@/components/ui/primitives';

/** Google / Apple sign-in (simulated in the demo layer). */
export function SocialButtons() {
  const { dispatch, notify } = useStore();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<'google' | 'apple' | null>(null);

  const go = async (provider: 'google' | 'apple') => {
    setBusy(provider);
    const res = await socialSignIn(provider);
    dispatch({ type: 'auth/login', user: res.user });
    notify('تم تسجيل الدخول (تجريبي)');
    navigate('/account');
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <button type="button" onClick={() => go('google')} disabled={!!busy} className="btn btn-ghost">
        {busy === 'google' ? <Spinner /> : <><GoogleMark size={20} /> Google</>}
      </button>
      <button type="button" onClick={() => go('apple')} disabled={!!busy} className="btn btn-ghost">
        {busy === 'apple' ? <Spinner /> : <><BrandGlyph id="apple" size={20} /> Apple</>}
      </button>
    </div>
  );
}
