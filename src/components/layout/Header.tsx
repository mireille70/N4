import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { site } from '@/content/site';
import { useStore } from '@/store/StoreProvider';
import { Logo } from '@/components/ui/Logo';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/format';
import { SearchOverlay } from './SearchOverlay';
import { NotificationsPopover } from './NotificationsPopover';
import { ProfileMenu } from './ProfileMenu';
import { MobileMenu } from './MobileMenu';
import { useNotifications } from '@/lib/useNotifications';
import { useThemeMode } from '@/theme/ThemeProvider';

const NAV_ICON: Record<string, string> = { '/': 'home', '/categories': 'grid', '/contact': 'mail', '/offers': 'bolt', '/apps': 'phone' };

export function Header() {
  const { cartCount, user, notify } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const bellPanelRef = useRef<HTMLDivElement>(null);
  const { unread } = useNotifications();
  const { mode, toggle: toggleMode } = useThemeMode();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setBellOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!bellOpen) return;
    const close = (e: MouseEvent) => { const t = e.target as Node; if (!bellRef.current?.contains(t) && !bellPanelRef.current?.contains(t)) setBellOpen(false); };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setBellOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [bellOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !(e.target as HTMLElement).closest('input,textarea'))) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const language = () => notify('النسخة الإنجليزية غير متاحة في العرض التجريبي', 'info');
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const openSearch = useCallback(() => setSearchOpen(true), []);

  return (
    <>
      {/* matte top bar: brand + live status on the reading side, nav in the middle, action cluster at the end */}
      <header className={cx('sticky top-0 z-40 border-b transition-colors duration-slow', scrolled || menuOpen ? 'border-line bg-bg/85 backdrop-blur-md' : 'border-transparent')}>
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="hud-bar grid h-14 grid-cols-[1fr_auto] items-center gap-4 sm:h-16 lg:h-[72px] lg:grid-cols-[1fr_auto_1fr]">
          {/* phones: logo on the right (start), burger on the left (end) */}
          <div className="flex items-center gap-2">
            <Logo />
          </div>
          <div className="-me-2 flex items-center gap-1 justify-self-end lg:hidden">
            <button type="button" className="icon-btn" aria-label={mode === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'} onClick={toggleMode}>
              <Icon name={mode === 'dark' ? 'sun' : 'moon'} />
            </button>
            <button type="button" className="icon-btn" aria-label="القائمة" aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen((o) => !o)}>
              <Icon name="menu" />
            </button>
          </div>

          <nav aria-label="التنقل الرئيسي" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {site.nav.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.to === '/'} className={({ isActive }) => cx('nav-tab', isActive && 'active')}>
                    <Icon name={NAV_ICON[item.to] ?? 'grid'} size={17} />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* below lg all of this lives in the burger drawer (MobileMenu) */}
          <div className="hidden items-center justify-end gap-2 lg:flex">
            <div className="hdr-cluster flex items-center gap-0.5 rounded-full border border-line bg-surface/70 p-1">
              <button type="button" className="icon-btn" aria-label="بحث" onClick={() => setSearchOpen(true)}>
                <Icon name="search" size={20} />
              </button>
              <button type="button" className="icon-btn" aria-label={mode === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'} onClick={toggleMode}>
                <Icon name={mode === 'dark' ? 'sun' : 'moon'} size={20} />
              </button>
              <button type="button" className="icon-btn" aria-label="اللغة" onClick={language}>
                <Icon name="globe" size={20} />
              </button>
              <div ref={bellRef} className="relative">
                <button type="button" className="icon-btn relative" aria-label={unread ? `الإشعارات (${unread} جديدة)` : 'الإشعارات'} aria-expanded={bellOpen} onClick={() => setBellOpen((o) => !o)}>
                  <Icon name="bell" size={20} className={cx(unread > 0 && 'bell-ring')} />
                  {unread > 0 && (
                    <span className="num absolute end-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-onaccent ring-2 ring-surface">{unread}</span>
                  )}
                </button>
                {bellOpen && <NotificationsPopover anchor={bellRef} panelRef={bellPanelRef} onClose={() => setBellOpen(false)} />}
              </div>
              <Link to="/cart" className="icon-btn relative" aria-label={`السلة، ${cartCount} منتجات`}>
                <Icon name="cart" size={20} />
                {cartCount > 0 && (
                  <span className="absolute end-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-onaccent"><span className="num">{cartCount}</span></span>
                )}
              </Link>
            </div>
            {user ? (
              <ProfileMenu />
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">
                تسجيل الدخول
              </Link>
            )}
          </div>
        </div>
        </div>

      </header>
      {menuOpen && <MobileMenu onClose={closeMenu} onSearch={openSearch} onLanguage={language} />}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}
