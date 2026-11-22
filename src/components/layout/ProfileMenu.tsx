import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { site } from '@/content/site';
import { pointsOf, tierState } from '@/content/loyalty';
import { useStore } from '@/store/StoreProvider';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { cx, formatInt } from '@/lib/format';

const WIDTH = 288;

/**
 * Signed-in header control: the player's avatar (with a level ring) that opens a small
 * account menu. Rendered in a portal because the header bar is clipped.
 */
export function ProfileMenu() {
  const { user, profile, loyaltyPoints, dispatch, notify } = useStore();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const points = pointsOf(loyaltyPoints);
  const { current, toNext } = tierState(points);
  const name = profile.name || user?.name || 'حسابي';

  useEffect(() => setOpen(false), [location.pathname]);

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const r = btnRef.current?.getBoundingClientRect();
      if (r) setPos({ top: r.bottom + 14, left: Math.max(16, Math.min(r.left, window.innerWidth - WIDTH - 16)) });
    };
    place();
    const close = (e: MouseEvent) => { const t = e.target as Node; if (!btnRef.current?.contains(t) && !panelRef.current?.contains(t)) setOpen(false); };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, { passive: true });
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place);
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const logout = () => { dispatch({ type: 'auth/logout' }); setOpen(false); notify('تم تسجيل الخروج'); navigate('/'); };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`حسابي: ${name}`}
        className="group relative ms-1 grid h-10 w-10 place-items-center rounded-full transition-transform hover:scale-105"
        style={{ background: `conic-gradient(rgb(var(--c-accent)) ${toNext * 360}deg, rgb(var(--c-fg) / .14) 0)` }}
      >
        <span className="grid h-[36px] w-[36px] place-items-center rounded-full bg-[#06130E]">
          <Avatar index={profile.avatar} size="xs" className="!h-[32px] !w-[32px]" />
        </span>
        <span className="absolute -bottom-0.5 -end-0.5 h-3 w-3 rounded-full bg-accent ring-2 ring-surface" aria-hidden="true" />
      </button>

      {open && pos && createPortal(
        <div ref={panelRef} role="menu" aria-label="حسابي" dir="rtl" className="popup-in fixed z-[60] overflow-hidden rounded-2xl bg-surface shadow-[0_30px_60px_-20px_rgb(0_0_0/.9)] ring-1 ring-inset ring-white/[.08]" style={{ top: pos.top, left: pos.left, width: WIDTH }}>
          <Link to="/account" role="menuitem" className="flex items-center gap-3 border-b border-line p-4 transition-colors hover:bg-fg/[.03]">
            <Avatar index={profile.avatar} size="sm" className="!h-11 !w-11" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-fg">{name}</span>
              <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                <Icon name={current.icon} size={12} className="text-accent" />{current.name}
                <span aria-hidden="true">·</span>
                <span className="num">{formatInt(points)}</span> نقطة
              </span>
            </span>
          </Link>
          <ul className="p-2">
            {site.account.tabs.map((t) => (
              <li key={t.to}>
                <Link to={t.to} role="menuitem" className={cx('flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors', location.pathname === t.to ? 'bg-fg/[.07] font-semibold text-fg' : 'text-fg/80 hover:bg-fg/[.05] hover:text-fg')}>
                  <Icon name={t.icon} size={17} className="text-fg/50" />{t.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t border-line p-2">
            <button type="button" role="menuitem" onClick={logout} className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-danger transition-colors hover:bg-danger/10">
              <Icon name="logout" size={17} />تسجيل الخروج
            </button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
