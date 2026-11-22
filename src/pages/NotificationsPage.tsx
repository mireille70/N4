import { useState } from 'react';
import { NOTIF_KINDS, dayGroup, type NotifKind } from '@/content/notifications';
import { notifActions, useNotifications } from '@/lib/useNotifications';
import { NotificationItem } from '@/components/layout/NotificationItem';
import { PageHero } from '@/components/layout/PageHero';
import { Icon } from '@/components/ui/Icon';
import { DemoNote } from '@/components/ui/primitives';
import { cx, formatInt } from '@/lib/format';
import { usePageTitle } from '@/lib/usePageTitle';

type Filter = 'all' | 'unread' | NotifKind;

export default function NotificationsPage() {
  usePageTitle('الإشعارات');
  const { items, unread } = useNotifications();
  const [filter, setFilter] = useState<Filter>('all');

  const filters: Array<{ id: Filter; label: string; count?: number }> = [
    { id: 'all', label: 'الكل', count: items.length },
    { id: 'unread', label: 'غير مقروءة', count: unread },
    ...(Object.keys(NOTIF_KINDS) as NotifKind[]).map((k) => ({ id: k as Filter, label: NOTIF_KINDS[k].label })),
  ];
  const list = items.filter((n) => (filter === 'all' ? true : filter === 'unread' ? !n.read : n.kind === filter));
  const groups = ['اليوم', 'أمس', 'أقدم'].map((g) => ({ g, rows: list.filter((n) => dayGroup(n.minutesAgo) === g) })).filter((x) => x.rows.length);

  return (
    <>
      <PageHero
        eyebrow="NOTIFICATIONS"
        title="الإشعارات"
        subtitle={unread ? <>عندك <span className="num font-semibold text-fg">{formatInt(unread)}</span> إشعارات جديدة — طلباتك، العروض، ونقاطك في مكان واحد.</> : 'كل شي مقروء — بنبلغك أول ما يوصل جديد.'}
        crumbs={[{ label: 'الرئيسية', to: '/' }, { label: 'الإشعارات' }]}
      />

      <section aria-labelledby="notif-list" className="container-x max-w-4xl pb-section pt-8 lg:pt-10">
        <h2 id="notif-list" className="sr-only">قائمة الإشعارات</h2>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="tablist" aria-label="تصفية الإشعارات" className="no-scrollbar -mx-gutter flex gap-2 overflow-x-auto px-gutter sm:mx-0 sm:px-0">
            {filters.map((f) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={cx('flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium ring-1 ring-inset transition-colors', filter === f.id ? 'bg-fg text-bg ring-transparent' : 'text-muted ring-line hover:text-fg')}
              >
                {f.label}
                {f.count !== undefined && f.count > 0 && <span className={cx('num rounded-full px-1.5 text-[11px] font-bold', filter === f.id ? 'bg-bg/10' : 'bg-fg/[.08] text-fg')}>{f.count}</span>}
              </button>
            ))}
          </div>
          {unread > 0 && (
            <button type="button" onClick={notifActions.markAllRead} className="inline-flex items-center gap-1.5 text-sm font-semibold text-fg/80 hover:text-fg">
              <Icon name="check" size={16} />تحديد الكل كمقروء
            </button>
          )}
        </div>

        {groups.length === 0 ? (
          <div className="game-frame mt-6 grid place-items-center gap-4 px-6 py-16 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-fg/[.05] text-muted"><Icon name="bell" size={28} /></span>
            <p className="font-medium text-fg/85">لا توجد إشعارات هنا</p>
            {items.length === 0 && <button type="button" onClick={notifActions.restoreDemo} className="btn btn-ghost btn-sm">استرجاع الإشعارات التجريبية</button>}
          </div>
        ) : (
          groups.map(({ g, rows }) => (
            <div key={g} className="mt-8">
              <h3 className="mb-3 text-xs font-semibold tracking-wide text-muted">{g}</h3>
              <ul className="game-frame divide-y divide-line overflow-hidden">
                {rows.map((n, i) => (
                  <li key={n.id} className="anim-rise group/row flex items-start" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="min-w-0 flex-1"><NotificationItem n={n} /></div>
                    <button type="button" onClick={() => notifActions.remove(n.id)} aria-label={`حذف: ${n.title}`} className="me-2 mt-4 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted opacity-0 transition hover:bg-fg/[.06] hover:text-fg focus-visible:opacity-100 group-hover/row:opacity-100 max-lg:opacity-60 sm:mt-5">
                      <Icon name="x" size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
        <DemoNote className="mt-8">عرض تجريبي: الإشعارات أمثلة ثابتة، وحالة القراءة محفوظة في هذا المتصفح فقط.</DemoNote>
      </section>
    </>
  );
}
