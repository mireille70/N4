import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/format';

/**
 * Inner-page banner: a framed HUD panel with the page title at the reading start and an
 * illustration on the other side, lit by an emerald glow. Used by categories, contact,
 * checkout, FAQ and the policy pages so they share one look with the homepage.
 */
export function PageHero({ eyebrow, title, highlight, subtitle, crumbs, art, children, className }: {
  eyebrow?: string;
  title: string;
  /** a word of the title to colour with the accent */
  highlight?: string;
  subtitle?: ReactNode;
  crumbs?: Array<{ label: string; to?: string }>;
  art?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const words = title.split(' ');
  return (
    <section className={cx('container-x pt-4 lg:pt-6', className)}>
      <div className="grad-hero relative overflow-hidden rounded-[24px] border border-line">
        {/* backdrop: technical grid fading out, warm spotlight behind the art, an ember hairline at the foot */}
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-80" aria-hidden="true" />
        <div className="spotlight absolute -left-16 top-1/2 h-[140%] w-[55%] -translate-y-1/2 opacity-60" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-l from-transparent via-accent/40 to-transparent" aria-hidden="true" />

        <div className="relative grid items-center gap-6 px-6 py-8 sm:px-10 md:min-h-[240px] lg:grid-cols-12 lg:px-12 lg:py-10">
          <div className={cx(art ? 'lg:col-span-7' : 'lg:col-span-12')}>
            {crumbs && (
              <nav aria-label="مسار التنقل" className="mb-6">
                <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
                  {crumbs.map((c, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      {i > 0 && <Icon name="chevron-next" size={14} className="opacity-60" />}
                      {c.to ? <Link to={c.to} className="hover:text-accent">{c.label}</Link> : <span aria-current="page" className="text-fg/85">{c.label}</span>}
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            {eyebrow && <p className="eyebrow mb-4 flex items-center justify-end gap-3 !text-accent">{eyebrow}<span className="h-px w-8 bg-line" /></p>}
            <h1 className="font-display text-4xl font-semibold leading-[1.35] md:text-5xl lg:text-[3.25rem]">
              {words.map((w, i) => (
                <span key={i}>{i > 0 && ' '}<span className={w === highlight ? 'text-accent' : undefined}>{w}</span></span>
              ))}
            </h1>
            {subtitle && <p className="mt-5 max-w-xl text-[.95rem] leading-8 text-muted md:text-base">{subtitle}</p>}
            {children}
          </div>
          {art && <div className="relative hidden h-full min-h-[220px] lg:col-span-5 lg:block" aria-hidden="true">{art}</div>}
        </div>
      </div>
    </section>
  );
}

/** A matte charcoal token holding an ember icon, lit from below — the building block of the banner illustrations. */
export function GlossTile({ icon, size = 64, className, style }: { icon: string; size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <span
      className={cx('token-3d relative grid place-items-center text-accent', className)}
      style={{ width: size, height: size, ...style }}
    >
      <Icon name={icon} size={Math.round(size * 0.42)} strokeWidth={1.75} className="relative" />
    </span>
  );
}

/** Three floating tiles over a glowing podium — illustration for FAQ / policy banners. */
export function TileStack({ icons }: { icons: [string, string, string] }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <span className="absolute bottom-[12%] left-1/2 h-10 w-64 -translate-x-1/2 rounded-[50%] bg-accent/15 blur-2xl" />
      <span className="cat-podium absolute bottom-[16%] left-1/2 h-8 w-56 -translate-x-1/2 rounded-[50%] ring-1 ring-accent/30" />
      <div className="relative h-52 w-72">
        <span className="cat-float absolute left-1/2 top-2 -translate-x-1/2"><GlossTile icon={icons[0]} size={104} /></span>
        <span className="cat-float absolute bottom-6 left-2 [animation-delay:-1.4s]"><GlossTile icon={icons[1]} size={64} className="-rotate-12" /></span>
        <span className="cat-float absolute bottom-10 right-2 [animation-delay:-2.6s]"><GlossTile icon={icons[2]} size={56} className="rotate-12" /></span>
      </div>
    </div>
  );
}
