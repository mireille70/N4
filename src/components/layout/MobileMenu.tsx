import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { site } from '@/content/site';
import { pointsOf, tierState } from '@/content/loyalty';
import { useStore } from '@/store/StoreProvider';
import { useNotifications } from '@/lib/useNotifications';
import { Avatar } from '@/components/ui/Avatar';
import { Logo } from '@/components/ui/Logo';
import { Icon } from '@/components/ui/Icon';
import { cx, formatInt } from '@/lib/format';

const NAV_ICON: Record<string, string> = { '/': 'home', '/categories': 'grid', '/contact': 'mail', '/offers': 'bolt', '/apps': 'phone' };

const row = (active: boolean) =>
  cx('flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-[.95rem] transition-colors', active ? 'bg-raised font-semibold text-fg shadow-[inset_0_0_0_1px_rgb(var(--c-line))]' : 'text-fg/85 hover:bg-raised/60');

function Badge({ n }: { n: number }) {
  if (n <= 0) return null;
  return <span className="num grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-onaccent">{n}</span>;
}

/**
 * Phones and tablets (< lg): everything the desktop header offers, in one side drawer —
 * search, the account card (or sign-in), the main tabs, cart, notifications, the account pages,
 * language and sign-out. Closes on Escape or a tap on the scrim (the Header closes it on route change).
 */
export function MobileMenu({ onClose, onSearch, onLanguage }: { onClose: () => void; onSearch: () => void; onLanguage: () => void }) {
  const { user, profile, cartCount, loyaltyPoints, dispatch, notify } = useStore();
  const { unread } = useNotifications();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = prev; };
  }, [onClose]);

  const points = pointsOf(loyaltyPoints);
  const { current } = tierState(points);
  const name = profile.name || user?.name || 'حسابي';
  const logout = () => { dispatch({ type: 'auth/logout' }); notify('تم تسجيل الخروج'); onClose(); navigate('/'); };

  return createPortal(
    <div className="fixed inset-0 z-[70] lg:hidden" dir="rtl">
      <button type="button" aria-label="إغلاق القائمة" onClick={onClose} className="anim-fade absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        ref={panelRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="القائمة"
        tabIndex={-1}
        className="drawer-in absolute inset-y-0 end-0 flex w-[min(88vw,360px)] flex-col border-s border-line bg-bg shadow-[0_0_60px_rgb(0_0_0/.7)] outline-none"
      >
        {/* top: brand + close */}
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line px-4">
          <Logo />
          <button type="button" className="icon-btn -me-2" aria-label="إغلاق القائمة" onClick={onClose}><Icon name="x" /></button>
        </div>

        <div
          className="no-scrollbar flex-1 overflow-y-auto px-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4"
          onClick={(e) => { if ((e.target as HTMLElement).closest('a')) onClose(); }}
        >
          {/* search */}
          <button
            type="button"
            onClick={() => { onClose(); onSearch(); }}
            className="flex h-12 w-full items-center gap-3 rounded-full border border-line bg-surface px-4 text-start text-sm text-muted transition-colors hover:border-fg/20"
          >
            <Icon name="search" size={18} />ابحث عن لعبة أو بطاقة...
          </button>

          {/* account */}
          {user ? (
            <Link to="/account" className="acct-dark mt-4 flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 transition-colors hover:bg-raised/60">
              <Avatar index={profile.avatar} size="sm" className="!h-11 !w-11" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-fg">{name}</span>
                <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                  <Icon name={current.icon} size={12} className="text-accent" />{current.name}
                  <span aria-hidden="true">·</span>
                  <span className="num">{formatInt(points)}</span> نقطة
                </span>
              </span>
              <Icon name="arrow-next" size={18} className="text-muted" />
            </Link>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link to="/login" className="btn btn-primary btn-sm">تسجيل الدخول</Link>
              <Link to="/register" className="btn btn-ghost btn-sm">حساب جديد</Link>
            </div>
          )}

          {/* main tabs */}
          <nav aria-label="التنقل الرئيسي" className="mt-5">
            <ul className="grid gap-1">
              {site.nav.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.to === '/'} className={({ isActive }) => row(isActive)}>
                    {({ isActive }) => (
                      <>
                        <Icon name={NAV_ICON[item.to] ?? 'grid'} size={19} className={isActive ? 'text-accent' : 'text-fg/50'} />
                        <span className="flex-1">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
              <li>
                <NavLink to="/cart" className={({ isActive }) => row(isActive)}>
                  <Icon name="cart" size={19} className="text-fg/50" />
                  <span className="flex-1">السلة</span>
                  <Badge n={cartCount} />
                </NavLink>
              </li>
              <li>
                <NavLink to="/notifications" className={({ isActive }) => row(isActive)}>
                  <Icon name="bell" size={19} className="text-fg/50" />
                  <span className="flex-1">الإشعارات</span>
                  <Badge n={unread} />
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* account pages */}
          {user && (
            <nav aria-label="حسابي" className="mt-5 border-t border-line pt-4">
              <p className="mb-2 px-3 text-xs font-medium text-muted">حسابي</p>
              <ul className="grid gap-1">
                {site.account.tabs.map((t) => (
                  <li key={t.to}>
                    <NavLink to={t.to} end className={({ isActive }) => row(isActive)}>
                      <Icon name={t.icon} size={19} className="text-fg/50" />
                      <span className="flex-1">{t.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* settings */}
          <div className="mt-5 grid gap-1 border-t border-line pt-4">
            <button type="button" onClick={onLanguage} className={row(false)}>
              <Icon name="globe" size={19} className="text-fg/50" />
              <span className="flex-1 text-start">اللغة</span>
              <span className="text-xs text-muted">العربية</span>
            </button>
            {user && (
              <button type="button" onClick={logout} className="flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-[.95rem] text-danger transition-colors hover:bg-danger/10">
                <Icon name="logout" size={19} />تسجيل الخروج
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
