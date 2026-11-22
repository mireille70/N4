import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useStore } from '@/store/StoreProvider';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/format';
import { jumpTo } from '@/components/ui/primitives';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileTabBar } from './MobileTabBar';
import { BackgroundFX } from './BackgroundFX';
import { ScrollFX } from './ScrollFX';
/** Scroll to top on route change; honour #hash anchors. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }));
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [pathname, hash]);
  return null;
}

export function Toaster() {
  const { toasts, dismiss } = useStore();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-8 [:root[data-bottom-nav='false']_&]:bottom-6 lg:[:root[data-bottom-nav='false']_&]:bottom-8">
      {toasts.map((t) => (
        <div key={t.id} className="anim-rise pointer-events-auto flex min-h-12 w-full max-w-sm items-center gap-3 rounded-full border border-line bg-ink py-2 pe-2 ps-4 text-fg shadow-lift" role="status">
          <span className={cx('grid h-7 w-7 shrink-0 place-items-center rounded-lg', t.tone === 'error' ? 'bg-danger text-white' : t.tone === 'info' ? 'bg-bg text-fg' : 'bg-accent text-onaccent')}>
            <Icon name={t.tone === 'success' ? 'check' : 'info'} size={16} strokeWidth={2.4} />
          </span>
          <span className="flex-1 text-sm font-medium">{t.message}</span>
          <button type="button" onClick={() => dismiss(t.id)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-fg/5" aria-label="إغلاق">
            <Icon name="x" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function Layout() {
  return (
    <>
      <a href="#main" onClick={jumpTo('main')} className="skip-link">تخطي إلى المحتوى</a>
      <ScrollManager />
      <ScrollFX />
      <BackgroundFX />
      <Header />
      {/* full-bleed matte page; sections carry their own containers */}
      <main id="main" className="min-h-[60vh] pb-8">
        <Outlet />
      </main>
      <Footer />
      <MobileTabBar />
    </>
  );
}
