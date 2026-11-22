import { Link } from 'react-router-dom';
import { getProduct } from '@/content/catalog';
import { NOTIF_KINDS, timeAgo } from '@/content/notifications';
import { notifActions, type NotifItem } from '@/lib/useNotifications';
import { ProductArt } from '@/components/product/ProductArt';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/format';

/** one notification row — used by the header popover (compact) and the page */
export function NotificationItem({ n, compact, onNavigate }: { n: NotifItem; compact?: boolean; onNavigate?: () => void }) {
  const product = n.slug ? getProduct(n.slug) : undefined;
  const kind = NOTIF_KINDS[n.kind];
  const open = () => { notifActions.markRead(n.id); onNavigate?.(); };

  const thumb = product ? (
    <ProductArt product={product} sizes="48px" className={cx('shrink-0 rounded-xl ring-1 ring-line', compact ? 'h-11 w-11' : 'h-14 w-14')} />
  ) : (
    <span className={cx('grid shrink-0 place-items-center rounded-xl bg-[radial-gradient(circle_at_35%_30%,#1E4638,#06130E)] text-fg shadow-[inset_0_0_0_1px_rgb(255_255_255/.08)]', compact ? 'h-11 w-11' : 'h-14 w-14')}>
      <Icon name={kind.icon} size={compact ? 18 : 22} />
    </span>
  );

  const body = (
    <>
      <span className="relative">
        {thumb}
        {product && (
          <span className="absolute -bottom-1 -end-1 grid h-5 w-5 place-items-center rounded-full bg-[#0A1F17] text-fg ring-2 ring-surface"><Icon name={kind.icon} size={10} /></span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className={cx('font-semibold leading-snug', compact ? 'text-[13px]' : 'text-sm', n.read ? 'text-fg/75' : 'text-fg')}>{n.title}</span>
          {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="غير مقروء" />}
        </span>
        <span className={cx('mt-0.5 block text-muted', compact ? 'line-clamp-1 text-xs' : 'text-[13px] leading-6')}>{n.body}</span>
        <span className="mt-1 flex items-center gap-2 text-[11px] text-fg/45">
          <span>{timeAgo(n.minutesAgo)}</span>
          {!compact && <><span aria-hidden="true">·</span><span>{kind.label}</span></>}
          {!compact && n.cta && <span className="ms-auto inline-flex items-center gap-1 font-semibold text-fg/80 group-hover:text-fg">{n.cta}<Icon name="arrow-next" size={13} /></span>}
        </span>
      </span>
    </>
  );

  const cls = cx('group flex w-full items-start gap-3 text-start transition-colors', compact ? 'rounded-xl p-2.5 hover:bg-fg/[.05]' : 'p-4 hover:bg-fg/[.03] sm:p-5', !n.read && !compact && 'bg-fg/[.02]');
  return n.to ? <Link to={n.to} onClick={open} className={cls}>{body}</Link> : <button type="button" onClick={open} className={cls}>{body}</button>;
}
