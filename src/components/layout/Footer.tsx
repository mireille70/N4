import { useState } from 'react';
import { Link } from 'react-router-dom';
import { site } from '@/content/site';
import { Logo } from '@/components/ui/Logo';
import { Icon } from '@/components/ui/Icon';
import { IS_DEMO } from '@/demo/api';

const ASSURANCES = [
  { icon: 'bolt', label: 'تسليم فوري' },
  { icon: 'shield', label: 'دفع آمن' },
  { icon: 'send', label: 'دعم بالعربي' },
];

/** one link column: a dropdown on phones, always open from sm up */
function FooterColumn({ index, title, links }: { index: number; title: string; links: { label: string; to: string }[] }) {
  const [open, setOpen] = useState(false);
  const panel = `footer-col-${index}`;
  return (
    <div>
      <h2 className="text-sm font-semibold text-fg">
        <button type="button" aria-expanded={open} aria-controls={panel} onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2 py-4 sm:pointer-events-none sm:cursor-default sm:py-0">
          <span className="idx">{String(index + 1).padStart(2, '0')}</span>
          <span className="flex-1 text-start">{title}</span>
          <Icon name="chevron-down" size={18} className={"text-muted transition-transform duration-200 sm:hidden " + (open ? 'rotate-180' : '')} />
        </button>
      </h2>
      <ul id={panel} className={`${open ? 'grid' : 'hidden'} gap-4 pb-4 sm:mt-6 sm:grid sm:pb-0`}>
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="text-sm text-muted transition-colors duration-200 hover:text-fg">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Footer: a matte panel — brand + about + assurances on the reading side, link columns beside it, status bar at the foot. */
export function Footer() {
  return (
    <footer className="relative mt-8 border-t border-line pb-24 lg:pb-0 [:root[data-bottom-nav='false']_&]:pb-0">
      {/* a thin ember line fading out from the centre of the top edge */}
      <span className="pointer-events-none absolute inset-x-0 -top-px mx-auto h-px max-w-3xl bg-gradient-to-l from-transparent via-accent/50 to-transparent" aria-hidden="true" />
      <div className="container-x grid gap-8 py-10 sm:gap-12 sm:py-16 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <Logo size="lg" />
          <p className="mt-6 max-w-sm text-[.95rem] leading-7 text-muted">{site.footer.about}</p>
          <ul className="mt-8 flex flex-nowrap gap-1.5 sm:flex-wrap sm:gap-2">
            {ASSURANCES.map((a) => (
              <li key={a.label} className="swoosh-pill is-plain inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap pe-3 ps-1 text-[11px] text-fg/90 sm:h-11 sm:gap-2.5 sm:pe-5 sm:ps-1.5 sm:text-sm">
                <span className="swoosh-dot h-7 w-7 sm:h-8 sm:w-8"><Icon name={a.icon} size={14} /></span>
                {a.label}
              </li>
            ))}
          </ul>
        </div>

        {/* phones: stacked dropdowns; sm and up: the plain columns */}
        <div className="grid divide-y divide-line border-y border-line sm:grid-cols-3 sm:gap-x-8 sm:gap-y-10 sm:divide-y-0 sm:border-y-0 lg:col-span-7">
          {site.footer.columns.map((col, i) => (
            <FooterColumn key={i} index={i} title={col.title} links={col.links} />
          ))}
        </div>
            </div>

      <div className="border-t border-line">
        <div className="container-x flex flex-col items-center justify-between gap-4 py-6 text-xs text-muted md:flex-row">
          <p>{site.footer.copyright(site.brand.name)}</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2"><span className="status-dot" aria-hidden="true" />جميع الأنظمة تعمل</span>
            {IS_DEMO && <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-1 font-mono text-[11px] text-amber" dir="ltr">Demo mode — no real payments</span>}
          </div>
        </div>
      </div>
    </footer>
  );
}
