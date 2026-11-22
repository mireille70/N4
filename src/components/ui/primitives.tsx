import { useEffect, useRef, useState, type ReactNode, type ElementType } from 'react';
import { Link } from 'react-router-dom';
import { formatAmount, cx } from '@/lib/format';
import { site } from '@/content/site';
import { Icon } from './Icon';

/** Price: Latin digits + riyal label; the label sits after the amount (to its left in RTL). */
export function Price({ value, size = 'md', className, from, compareAt }: { value: number; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string; from?: string; compareAt?: number }) {
  const num = { sm: 'text-base', md: 'text-lg', lg: 'text-2xl', xl: 'text-4xl md:text-5xl' }[size];
  const cur = { sm: 'text-[.7rem]', md: 'text-xs', lg: 'text-sm', xl: 'text-base' }[size];
  const old = { sm: 'text-xs', md: 'text-sm', lg: 'text-base', xl: 'text-xl' }[size];
  return (
    <span className={cx('inline-flex flex-wrap items-baseline gap-x-1.5', className)}>
      {from && <span className="text-xs text-muted">{from}</span>}
      <span className={cx('num font-display font-semibold', num)}>{formatAmount(value)}</span>
      <span className={cx('price-cur font-medium text-fg/60', cur)}>{site.locale.currency.symbol}</span>
      {compareAt !== undefined && compareAt > value && (
        <s className={cx('num ms-1 font-medium opacity-55', old)} aria-label={`بدلاً من ${formatAmount(compareAt)}`}>{formatAmount(compareAt)}</s>
      )}
    </span>
  );
}

export function DiscountBadge({ percent, className }: { percent?: number; className?: string }) {
  if (!percent) return null;
  return <span className={cx('num inline-flex h-7 items-center rounded-full bg-gold px-2 font-display text-xs font-semibold text-onaccent', className)}>-{percent}%</span>;
}

/** Scroll-reveal wrapper (disabled automatically by motion: 'off' / reduced motion). */
export function Reveal({ as: Tag = 'div', className, delay = 0, children, ...rest }: { as?: ElementType; className?: string; delay?: number; children: ReactNode; [k: string]: unknown }) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return setInView(true);
    // replays every time it scrolls into view (either direction); resets only once fully off screen
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={cx('reveal', inView && 'is-in', className)} style={{ transitionDelay: `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

/** Technical label above a title: ember index, a hairline and a Latin mono word. */
function SectionLabel({ index, eyebrow, center }: { index?: string; eyebrow?: string | false; center?: boolean }) {
  if (!index && !eyebrow) return null;
  return (
    <p className={cx('mb-4 hidden items-center gap-3 sm:flex', center && 'justify-center')} aria-hidden="true">
      {index && <span className="idx">{index}</span>}
      {index && eyebrow && <span className="h-px w-8 bg-line" />}
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
    </p>
  );
}

/** Section header: indexed technical label, title, optional note and a quiet bordered action. */
export function SectionHead({ index, title, action, tone = 'dark', id, className, eyebrow, center, note }: { index?: string; title: string; action?: { label: string; to: string }; tone?: 'dark' | 'light'; id?: string; className?: string; /** Latin mono label beside the index */ eyebrow?: string | false; /** centred title (e.g. a showcase row) */ center?: boolean; /** one short line under the title */ note?: string }) {
  const link = action && (
    <Link to={action.to} className="swoosh-pill is-plain inline-flex h-9 shrink-0 items-center gap-2 pe-4 ps-1 text-xs font-medium text-fg sm:h-11 sm:gap-3 sm:pe-5 sm:ps-1.5 sm:text-sm">
      <span className="swoosh-dot h-7 w-7 sm:h-8 sm:w-8"><Icon name="arrow-next" size={15} /></span>
      {action.label}
    </Link>
  );
  if (center) {
    return (
      <div className={cx('mb-10 text-center md:mb-12', className)} data-index={index}>
        <SectionLabel index={index} eyebrow={eyebrow} center />
        <h2 id={id} className="hud-title font-display text-[2rem] leading-[2.5rem] md:text-[2.5rem] md:leading-[3rem]">{title}</h2>
        {note && <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted">{note}</p>}
        {link && <div className="mt-6">{link}</div>}
      </div>
    );
  }
  return (
    <div className={cx('mb-5 flex items-end justify-between gap-3 sm:mb-8 sm:gap-4 md:mb-10', className)} data-index={index}>
      <div className="min-w-0">
        <SectionLabel index={index} eyebrow={eyebrow} />
        <h2 id={id} className={cx('hud-title font-display text-xl leading-8 sm:text-[1.75rem] sm:leading-9 md:text-[2.25rem] md:leading-[2.75rem]', tone === 'light' ? 'text-ink' : 'text-fg')}>
          {title}
        </h2>
        {note && <p className="mt-2 max-w-md text-sm leading-6 text-muted">{note}</p>}
      </div>
      {link}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <span className={cx('inline-block h-5 w-5 rounded-full border-2 border-current border-t-transparent spin', className)} aria-hidden="true" />;
}

export function DemoNote({ children, className, tone = 'dark' }: { children?: ReactNode; className?: string; tone?: 'dark' | 'light' }) {
  return (
    <p className={cx('flex items-start gap-2 text-xs leading-relaxed', tone === 'light' ? 'text-ink/60' : 'text-muted', className)}>
      <Icon name="info" size={16} className="mt-px shrink-0" />
      <span>{children ?? site.auth.demoNote}</span>
    </p>
  );
}

export function EmptyState({ icon, title, action }: { icon: string; title: string; action?: { label: string; to: string } }) {
  return (
    <div className="matte relative grid place-items-center gap-6 overflow-hidden rounded-[24px] px-6 py-16 text-center">
      <span className="spotlight absolute left-1/2 top-8 h-40 w-64 -translate-x-1/2 opacity-60" aria-hidden="true" />
      <span className="token-3d relative grid h-16 w-16 place-items-center text-accent">
        <Icon name={icon} size={28} />
      </span>
      <p className="relative text-lg font-medium text-fg/90">{title}</p>
      {action && <Link to={action.to} className="btn btn-primary btn-sm">{action.label}</Link>}
    </div>
  );
}

/**
 * onClick for in-page "#id" links: scrolls (and focuses) without touching the URL hash,
 * so they also work in the single-file build, where the hash holds the page route.
 */
export const jumpTo = (id: string) => (e: { preventDefault: () => void }) => {
  e.preventDefault();
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
};

export const scrollToTop =() => window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
