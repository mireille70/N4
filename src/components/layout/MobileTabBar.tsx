import { NavLink } from 'react-router-dom';
import { site } from '@/content/site';
import { useStore } from '@/store/StoreProvider';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/format';

/** App-style bottom navigation under 1024px (toggle: themeConfig.mobile.bottomNav). */
export function MobileTabBar() {
  const { cartCount } = useStore();
  return (
    <nav aria-label="التنقل السفلي" className="premium-glass fixed inset-x-3 bottom-3 z-40 rounded-full pb-[env(safe-area-inset-bottom)] lg:hidden [:root[data-bottom-nav='false']_&]:hidden">
      <ul className="mx-auto grid h-14 max-w-md grid-cols-4">
        {site.tabBar.map((t) => (
          <li key={t.to}>
            <NavLink
              to={t.to}
              end={t.to === '/'}
              className={({ isActive }) => cx('relative flex h-full flex-col items-center justify-center gap-1 text-[.65rem] font-medium transition-colors', isActive ? 'text-fg' : 'text-muted')}
            >
              {({ isActive }) => (
                <>
                  {/* ember tick on the top edge of the active tab */}
                  <span className={cx('absolute top-0 h-0.5 w-8 rounded-full bg-accent transition-transform duration-200', isActive ? 'scale-x-100' : 'scale-x-0')} aria-hidden="true" />
                  <span className="relative">
                    <Icon name={t.icon} size={22} strokeWidth={isActive ? 2 : 1.75} className={isActive ? 'text-accent' : undefined} />
                    {t.icon === 'cart' && cartCount > 0 && (
                      <span className="absolute -end-2.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[.65rem] font-semibold text-onaccent"><span className="num">{cartCount}</span></span>
                    )}
                  </span>
                  {t.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
