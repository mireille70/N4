import { useLayoutEffect, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { notifActions, useNotifications } from '@/lib/useNotifications';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/format';
import { NotificationItem } from './NotificationItem';

const WIDTH = 380;

/**
 * Bell dropdown. Rendered in a portal at fixed coordinates under the bell, because the
 * header bar is clipped (HUD cut corners) and would hide anything hanging below it.
 */
export function NotificationsPopover({ anchor, panelRef, onClose }: { anchor: RefObject<HTMLElement>; panelRef: RefObject<HTMLDivElement>; onClose: () => void }) {
  const { items, unread } = useNotifications();
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    const place = () => {
      const r = anchor.current?.getBoundingClientRect();
      if (!r) return;
      setPos({ top: r.bottom + 14, left: Math.max(16, Math.min(r.left, window.innerWidth - WIDTH - 16)) });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, { passive: true });
    return () => { window.removeEventListener('resize', place); window.removeEventListener('scroll', place); };
  }, [anchor]);

  if (!pos) return null;
  const list = (tab === 'unread' ? items.filter((n) => !n.read) : items).slice(0, 5);

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-label="الإشعارات"
      dir="rtl"
      className="popup-in fixed z-[60] overflow-hidden rounded-2xl bg-surface shadow-[0_30px_60px_-20px_rgb(0_0_0/.9)] ring-1 ring-inset ring-white/[.08]"
      style={{ top: pos.top, left: pos.left, width: WIDTH }}
    >
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <p className="font-display text-base font-bold text-fg">الإشعارات</p>
        {unread > 0 && (
          <button type="button" onClick={notifActions.markAllRead} className="inline-flex items-center gap-1 text-xs font-semibold text-fg/70 hover:text-fg">
            <Icon name="check" size={14} />تحديد الكل كمقروء
          </button>
        )}
      </div>
      <div className="flex gap-1 px-4" role="tablist">
        {(['all', 'unread'] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cx('flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors', tab === t ? 'bg-fg text-bg' : 'text-muted hover:text-fg')}
          >
            {t === 'all' ? 'الكل' : 'غير مقروءة'}
            {t === 'unread' && unread > 0 && <span className={cx('num rounded-full px-1.5 text-[10px]', tab === t ? 'bg-bg/10' : 'bg-fg/10 text-fg')}>{unread}</span>}
          </button>
        ))}
      </div>

      <div className="mt-2 max-h-[min(420px,60vh)] overflow-y-auto px-2 pb-2">
        {list.length === 0 ? (
          <div className="grid place-items-center gap-3 px-4 py-10 text-center text-sm text-muted">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-fg/[.05]"><Icon name="bell" size={22} /></span>
            لا توجد إشعارات جديدة
          </div>
        ) : (
          <ul className="grid gap-0.5">
            {list.map((n, i) => (
              <li key={n.id} className="anim-rise" style={{ animationDelay: `${i * 45}ms` }}><NotificationItem n={n} compact onNavigate={onClose} /></li>
            ))}
          </ul>
        )}
      </div>

      <Link to="/notifications" onClick={onClose} className="flex items-center justify-center gap-1.5 border-t border-line py-3.5 text-sm font-semibold text-fg/85 transition-colors hover:bg-fg/[.04] hover:text-fg">
        عرض كل الإشعارات<Icon name="arrow-next" size={16} />
      </Link>
    </div>,
    document.body,
  );
}
