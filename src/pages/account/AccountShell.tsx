import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { site } from '@/content/site';
import { useStore } from '@/store/StoreProvider';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/format';

export { Avatar, avatarTints } from '@/components/ui/Avatar';

/**
 * Account area — the section tabs as one pill group (same language as the header nav), then
 * the section's content. Each page owns its own panels below.
 */
export default function AccountShell() {
  const { user } = useStore();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return (
    <div className="container-x pb-section pt-8 lg:pt-10">
      {/* the frame keeps the content width (full width below lg); the tabs scroll inside it */}
      <nav aria-label="أقسام الحساب" className="overflow-hidden rounded-full bg-raised p-1.5 lg:w-fit">
        <ul className="no-scrollbar flex gap-1 overflow-x-auto rounded-full">
          {site.account.tabs.map((t) => (
            <li key={t.to} className="shrink-0">
              <NavLink
                to={t.to}
                end
                ref={(el) => { if (el && location.pathname === t.to) el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }}
                className={({ isActive }) => cx(
                  'flex h-11 items-center gap-2 whitespace-nowrap rounded-full px-5 text-[.95rem] transition-all duration-200',
                  isActive ? 'acct-tab-active font-semibold' : 'text-muted hover:text-fg',
                )}
              >
                <Icon name={t.icon} size={17} />
                {t.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="pt-8">
        <Outlet />
      </div>
    </div>
  );
}
