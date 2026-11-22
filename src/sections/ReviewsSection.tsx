import type { Review } from '@/content/home';
import { getProduct } from '@/content/catalog';
import { Icon } from '@/components/ui/Icon';
import { BrandGlyph } from '@/components/ui/BrandGlyph';
import { cx } from '@/lib/format';

function Stars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${value} من 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Icon key={i} name="star" size={size} fill="currentColor" strokeWidth={0} className={i < value ? 'text-accent' : 'text-fg/15'} />
      ))}
    </span>
  );
}

/** one review: the bought product's art as a header strip (with the pack), the words, then who and when */
function ReviewCard({ r }: { r: Review }) {
  const p = getProduct(r.slug);
  return (
    <figure className="review-card overflow-hidden rounded-[24px] border border-line bg-[#06130E]">
      <div className="rv-strip relative h-24 overflow-hidden bg-raised">
        {p?.image ? (
          <img src={p.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover object-[50%_42%]" />
        ) : p?.glyph ? (
          <span className="grid h-full w-full place-items-center bg-[radial-gradient(60%_80%_at_50%_0%,rgb(63_216_192/.18),transparent_70%)] text-fg/80"><BrandGlyph id={p.glyph} size={34} /></span>
        ) : null}
        <span className="review-fade absolute inset-0 bg-[linear-gradient(to_top,#06130E,rgb(19_21_24/.2)_70%)]" aria-hidden="true" />
        {p && (
          <span className="absolute bottom-2.5 start-4 flex items-center gap-2 text-xs">
            <span className="font-semibold text-fg">{p.name}</span>
            {r.pack && <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] text-amber">{r.pack}</span>}
          </span>
        )}
      </div>
      <blockquote className="rv-text px-5 pt-4 text-[.95rem] leading-7 text-fg/90">{r.text}</blockquote>
      <figcaption className="rv-cap flex items-center gap-3 px-5 pb-5 pt-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[image:var(--grad-ember)] text-sm font-semibold text-onaccent">{r.name.charAt(0)}</span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-fg">
            {r.name}
            <Icon name="check" size={12} strokeWidth={3} className="rounded-full bg-accent/20 p-0.5 text-accent" />
            <span className="sr-only">مشتري موثّق</span>
          </span>
          <span className="block text-xs text-muted">{r.when}</span>
        </span>
        <Stars value={r.rating} />
      </figcaption>
    </figure>
  );
}

/** a column of cards scrolling endlessly (the list is repeated so -50% loops seamlessly) */
function Column({ items, dir, duration, className }: { items: Review[]; dir: 'up' | 'down'; duration: number; className?: string }) {
  let list = items;
  while (list.length < 4) list = [...list, ...items];
  return (
    <div className={cx('min-w-0', className)}>
      <div className={cx('flex flex-col gap-4 group-hover/wall:[animation-play-state:paused]', dir === 'up' ? 'wall-up' : 'wall-down')} style={{ animationDuration: `${duration}s` }}>
        {[...list, ...list].map((r, i) => (
          <div key={i} aria-hidden={i >= list.length || undefined}><ReviewCard r={r} /></div>
        ))}
      </div>
    </div>
  );
}

/** phones: one row of cards drifting sideways (list rendered twice so half the width loops seamlessly) */
function Row({ items, duration, className }: { items: Review[]; duration: number; className?: string }) {
  return (
    <div className={cx('min-w-0', className)}>
      <div className="reviews-track flex w-max items-stretch gap-3 pe-3 group-hover/wall:[animation-play-state:paused]" style={{ animationDuration: `${duration}s` }}>
        {[...items, ...items].map((r, i) => (
          <div key={i} className="w-[270px] shrink-0 [&>figure]:flex [&>figure]:h-full [&>figure]:flex-col [&_figcaption]:mt-auto" aria-hidden={i >= items.length || undefined}><ReviewCard r={r} /></div>
        ))}
      </div>
    </div>
  );
}

/**
 * Customer reviews — "wall".
 * Heading row: title on the reading side, the overall score as one compact line on the other.
 * Below: three columns of review cards drifting endlessly (two up, one down) inside a window that
 * fades out at top and bottom; hover pauses them. One column on phones, two on tablets.
 */
export function ReviewsSection({ id = 'reviews', title, items, index, score, count }: { id?: string; title: string; score?: number; count?: string; items: Review[]; index?: string }) {
  const cols: Review[][] = [[], [], []];
  items.forEach((r, i) => cols[i % 3].push(r));

  return (
    <section aria-labelledby={`${id}-title`} className="pb-section">
      <div className="container-x">
        {/* the frame: on hover a line of ember light runs round its border (.beam) */}
        <div className="review-panel beam beam-soft swoosh relative overflow-hidden rounded-[32px] bg-[#030C08] px-5 pb-6 pt-10 shadow-[inset_0_0_0_1px_rgb(var(--c-line))] sm:px-8 lg:px-12 lg:pb-8 lg:pt-12">
        <span className="spotlight pointer-events-none absolute -top-28 start-[8%] h-64 w-[460px] opacity-40" aria-hidden="true" />
        <div className="relative mb-8 flex flex-wrap items-end justify-between gap-6" data-index={index}>
          <div>
            <p className="mb-4 flex items-center gap-3" aria-hidden="true">
              {index && <span className="idx">{index}</span>}
              <span className="h-px w-8 bg-line" />
              <span className="eyebrow">Reviews</span>
            </p>
            <h2 id={`${id}-title`} className="font-display text-[1.75rem] leading-9 md:text-[2.25rem] md:leading-[2.75rem]">{title}</h2>
          </div>
          {score !== undefined && (
            <div className="flex items-center gap-4">
              <span className="rv-score num font-display text-5xl font-semibold leading-none text-fg">{score}</span>
              <span>
                <Stars value={Math.round(score)} size={16} />
                {count && <span className="mt-1.5 block text-xs text-muted">من <span className="num text-fg/85">{count}</span> تقييم</span>}
              </span>
            </div>
          )}
        </div>

        {/* screen readers get the plain list; the moving wall is decorative duplication */}
        <ul className="sr-only">
          {items.map((r, i) => <li key={i}>{r.name}: {r.text}</li>)}
        </ul>
        <div
          className="rv-wall group/wall relative grid h-[400px] grid-cols-1 gap-4 overflow-hidden sm:grid-cols-2 lg:h-[420px] lg:grid-cols-3 [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)] sm:[mask-image:linear-gradient(to_bottom,transparent,#000_16%,#000_84%,transparent)]"
          aria-hidden="true"
        >
          <Row items={items} duration={60} className="sm:hidden" />
          <Column items={cols[0]} dir="up" duration={46} className="hidden sm:block" />
          <Column items={cols[1]} dir="down" duration={54} className="hidden sm:block" />
          <Column items={cols[2]} dir="up" duration={50} className="hidden lg:block" />
        </div>
        </div>
      </div>
    </section>
  );
}
