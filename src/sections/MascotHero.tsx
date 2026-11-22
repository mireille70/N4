import { useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { HeroContent } from '@/content/home';
import { products } from '@/content/catalog';
import { ProductArt } from '@/components/product/ProductArt';
import { Mascot } from '@/components/ui/Mascot';
import { OrbitCards } from '@/components/product/OrbitCards';

/** games whose cards orbit the mascot */
const ORBIT = ['free-fire', 'valorant', 'pubg', 'call-of-duty', 'mobile-legends', 'roblox'];
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/format';

/**
 * Hero — minimal 3D mascot.
 * Large centred headline and one line of support text; under them the KOON
 * mascot floats on a soft yellow glow over a barely-visible grid, with game
 * cards slowly orbiting behind it on a flat 3D ring, and a translucent search
 * field sits across its lower part. Typing shows matching
 * games right under the field; Enter opens the first match.
 */
export function MascotHero({ content }: { content: HeroContent }) {
  return (
    // slides up under the transparent header so the grid and glow fill the very top of the page
    <section aria-label="الرئيسية" className="relative -mt-16 overflow-hidden pb-14 pt-[calc(64px+3.5rem)] lg:-mt-[72px] lg:pb-20 lg:pt-[calc(72px+5rem)]">
      {/* background: faint grid + warm light behind the mascot */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="grid-bg absolute inset-0" />
        {/* the wrapper centres the glow; the breathing animation (transform) lives on the child */}
        <div className="absolute left-1/2 top-[62%] h-[560px] w-[min(900px,120vw)] -translate-x-1/2 -translate-y-1/2">
          <div className="glow-breathe h-full w-full rounded-full bg-[radial-gradient(closest-side,rgb(var(--c-accent)/.22),rgb(var(--c-gold)/.07)_55%,transparent)]" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg to-transparent" />
      </div>

      <div className="container-x relative text-center">
        <h1 className="anim-rise mx-auto max-w-4xl font-display text-[2.3rem] font-bold leading-[1.2] sm:text-[3.4rem] lg:text-[4.4rem] lg:leading-[1.12]">
          {/* on phones the line breaks after the comma */}
          {content.title.split('، ').map((part, i, all) => (
            <span key={i} className="block sm:inline">{part}{i < all.length - 1 && '، '}</span>
          ))}
        </h1>
        <p className="anim-rise mx-auto mt-4 max-w-xl text-base text-muted [animation-delay:80ms] sm:mt-5 sm:text-lg">{content.subtitle}</p>

        {/* stage: mascot + floating search */}
        <div className="relative mx-auto mt-6 w-full max-w-[600px] sm:mt-8">
          <div className="anim-fade relative mx-auto w-[min(76vw,340px)] [animation-delay:160ms] sm:w-[400px] lg:w-[430px]">
            {/* contact shadow that shrinks as the mascot floats up */}
            <div className="mascot-shadow absolute inset-x-[18%] bottom-[1%] h-[7%] rounded-[50%] bg-black/80 blur-xl" aria-hidden="true" />
            <div className="absolute inset-x-[10%] bottom-[-4%] h-[22%] rounded-[50%] bg-accent/25 blur-3xl" aria-hidden="true" />
            {/* cards orbiting behind the mascot */}
            <div className="absolute inset-x-[-12%] inset-y-0 sm:inset-x-[-55%]">
              <OrbitCards slugs={ORBIT} />
            </div>
            <div className="mascot-float relative z-20">
              <Mascot />
            </div>
          </div>

          <HeroSearch placeholder={content.searchPlaceholder} />
        </div>
      </div>
    </section>
  );
}

function HeroSearch({ placeholder }: { placeholder: string }) {
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const term = q.trim().toLowerCase();
  const results = useMemo(
    () => (term ? products.filter((p) => p.name.includes(q.trim()) || p.nameEn.toLowerCase().includes(term)).slice(0, 5) : []),
    [q, term],
  );
  const open = focused && term.length > 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (results[0]) navigate(`/product/${results[0].slug}`);
    else navigate('/categories');
  };

  return (
    <form
      role="search"
      onSubmit={submit}
      className="anim-rise relative z-10 mx-auto -mt-[14%] w-[min(100%,560px)] [animation-delay:260ms] sm:-mt-[11%]"
      onFocus={() => setFocused(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false); }}
    >
      <label htmlFor="hero-search" className="sr-only">ابحث عن لعبة</label>
      <div className="glass flex h-14 items-center gap-3 rounded-full pe-2 ps-5 transition-shadow duration-slow focus-within:shadow-[inset_0_0_0_1px_rgb(var(--c-accent)/.55),0_0_0_4px_rgb(var(--c-accent)/.12),0_20px_50px_-20px_rgb(0_0_0/.8)] sm:h-16">
        <Icon name="search" size={20} className="shrink-0 text-muted" />
        <input
          ref={inputRef}
          id="hero-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          className="h-full w-0 min-w-0 flex-1 bg-transparent text-[.95rem] text-fg outline-none placeholder:text-muted/80 sm:text-base [&::-webkit-search-cancel-button]:hidden"
        />
        <button type="submit" aria-label="عرض النتائج" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-white transition-transform hover:scale-105 sm:h-11 sm:w-11">
          <Icon name="arrow-next" size={18} />
        </button>
      </div>

      {open && (
        <div id={listId} role="listbox" aria-label="نتائج البحث" className="glass anim-fade absolute inset-x-0 top-[calc(100%+8px)] overflow-hidden rounded-[22px] p-1.5 text-start">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted">لا توجد نتائج — جرّب اسمًا آخر</p>
          ) : (
            results.map((p) => (
              <Link
                key={p.slug}
                to={`/product/${p.slug}`}
                role="option"
                aria-selected={false}
                className={cx('flex items-center gap-3 rounded-[16px] px-3 py-2 transition-colors hover:bg-fg/[.06] focus-visible:bg-fg/[.06]')}
              >
                <span className="block h-10 w-10 shrink-0 overflow-hidden rounded-[10px]">
                  <ProductArt product={p} className="h-full w-full [&_.eyebrow]:hidden" sizes="40px" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{p.name}</span>
                  <span className="block truncate text-xs text-muted"><span dir="ltr">{p.nameEn}</span></span>
                </span>
                <Icon name="arrow-next" size={16} className="text-muted" />
              </Link>
            ))
          )}
        </div>
      )}
    </form>
  );
}
