import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { products, offersEndDaily } from '@/content/catalog';
import { ProductCard } from '@/components/product/ProductCard';
import { Reveal } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/format';

/** Milliseconds until the next local midnight (offers roll over daily) */
const msToMidnight = () => {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
};

/** countdown pills for the sale band (dark on ember) */
export function Countdown({ label }: { label: string }) {
  const [ms, setMs] = useState(msToMidnight);
  useEffect(() => {
    const t = setInterval(() => setMs(msToMidnight()), 1000);
    return () => clearInterval(t);
  }, []);
  const s = Math.floor(ms / 1000);
  const parts = [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, '0'));
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-fg/60">{label}</span>
      <span className="flex items-center gap-1" dir="ltr" role="timer" aria-label={`${parts[0]} ساعة ${parts[1]} دقيقة ${parts[2]} ثانية`}>
        {parts.map((p, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className="num grid h-8 min-w-8 place-items-center rounded-lg border border-line bg-white/5 px-1.5 font-mono text-sm sm:h-10 sm:min-w-10 sm:rounded-xl sm:px-2 sm:text-base font-semibold text-[#6FE8D5]">{p}</span>
            {i < 2 && <span className="font-bold text-fg/40">:</span>}
          </span>
        ))}
      </span>
    </div>
  );
}

/**
 * Offers — "today's deals": a framed block led by an ember sale band (title, one line, the daily
 * countdown and "الكل"), then the deals as four vertical cards, each with a diagonal discount ribbon,
 * the new and struck old price, the saving and a buy button. Data: catalog.ts → offers.
 */
export function OffersSection({ id, title, endsLabel, viewAll, index, asHero }: { id: string; title: string; endsLabel: string; viewAll?: { label: string; to: string }; index?: string; /** top-of-page block (offers page) */ asHero?: boolean }) {
  void index;
  const deals = products.filter((p) => p.discount).sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0));
  if (!deals.length) return null;
  const Heading = asHero ? 'h1' : 'h2';

  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cx('scroll-mt-24', asHero ? 'pt-4 lg:pt-6' : 'pb-section')}>
      <div className="container-x">
        <div className="offers-panel overflow-hidden rounded-[32px] border border-line bg-[#030C08]">
          {/* sale band */}
          <div className="offers-band relative flex flex-col gap-5 overflow-hidden border-b border-line bg-[#06130E] bg-[radial-gradient(ellipse_at_100%_0%,rgb(63_216_192/.14),transparent_60%)] px-4 py-4 text-fg sm:px-8 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex items-center gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#6FE8D5]/25 sm:h-14 sm:w-14 bg-[#6FE8D5]/10 text-[#6FE8D5]"><Icon name="bolt" size={26} /></span>
              <div>
                <Heading id={`${id}-title`} className="text-xl font-bold leading-tight text-fg sm:text-2xl md:text-[1.75rem]">{title === 'العروض' ? 'عروض اليوم' : title}</Heading>
                <p className="mt-1 text-sm font-medium text-fg/60">خصومات لفترة محدودة — تتجدد يوميًا</p>
              </div>
            </div>
            <div className="relative flex flex-wrap items-center gap-4">
              {offersEndDaily && <Countdown label={endsLabel} />}
              {viewAll && (
                <Link to={viewAll.to} className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-white/5 pe-4 ps-1.5 text-xs sm:h-11 sm:pe-5 sm:ps-2 sm:text-sm font-semibold text-fg transition-transform hover:-translate-y-0.5">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[image:var(--grad-ember)] text-onaccent"><Icon name="arrow-next" size={14} /></span>
                  {viewAll.label}
                </Link>
              )}
            </div>
          </div>

          {/* deals */}
          {/* swipes sideways below desktop; padding sits inside the scroller so cards snap to the frame's inner edge */}
          <ul className="mini-rail no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-3 p-3 sm:scroll-px-6 sm:gap-4 sm:p-6 lg:grid lg:grid-cols-4 lg:overflow-visible">
            {deals.map((p, i) => (
              <Reveal as="li" key={p.slug} delay={(i % 4) * 70} className="w-[172px] shrink-0 snap-start sm:w-[302px] lg:w-auto lg:max-w-none">
                <ProductCard product={p} photo />
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
