import { Link } from 'react-router-dom';
import { site } from '@/content/site';
import { cx } from '@/lib/format';

/**
 * N4 brand logo, no background: a black mark for light mode and a pale (#E3EBD7) mark for dark
 * mode — both are rendered and index.css shows the one that matches `html[data-mode]`.
 */
export function Logo({ className, size = 'md' }: { className?: string; tone?: 'light' | 'dark'; size?: 'md' | 'lg' }) {
  const lg = size === 'lg';
  const img = cx('w-auto transition-transform duration-200 group-hover:scale-105', lg ? 'h-14' : 'h-9 sm:h-11');
  return (
    <Link to="/" aria-label={`${site.brand.name} — الرئيسية`} className={cx('group inline-flex items-center', className)} dir="ltr">
      <img src="/assets/brand/n4-logo-dark.webp?v=1" alt={site.brand.name} width={531} height={360} className={cx('logo-dark', img)} />
      <img src="/assets/brand/n4-logo-light.webp?v=1" alt="" aria-hidden="true" width={531} height={360} className={cx('logo-light', img)} />
    </Link>
  );
}
