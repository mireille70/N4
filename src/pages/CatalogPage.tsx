import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCategory, productsIn } from '@/content/catalog';
import { voiceApps } from '@/content/home';
import { VoiceProducts } from '@/sections/VoiceProducts';
import { ProductCard } from '@/components/product/ProductCard';
import { CategoryRail } from '@/sections/CategoryRail';
import { OffersSection } from '@/sections/OffersSection';
import { ShoppingTile } from '@/sections/ShoppingCards';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, Reveal, SectionHead } from '@/components/ui/primitives';
import { usePageTitle } from '@/lib/usePageTitle';
import NotFoundPage from './NotFoundPage';

/** search field: filters the cards below by Arabic or Latin name */
function SearchBar({ value, onChange, count }: { value: string; onChange: (v: string) => void; count: number }) {
  return (
    <div className="container-x pt-6 lg:pt-10">
      <label className="relative mx-auto flex h-14 max-w-2xl items-center gap-3 rounded-full bg-surface pe-2 ps-5 shadow-[var(--elev-1)] ring-1 ring-inset ring-line transition-shadow focus-within:ring-2 focus-within:ring-accent">
        <Icon name="search" size={20} className="shrink-0 text-muted" />
        <span className="sr-only">ابحث عن لعبة أو بطاقة</span>
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="ابحث عن لعبة أو بطاقة…"
          className="h-full min-w-0 flex-1 bg-transparent text-[.95rem] outline-none placeholder:text-muted"
        />
        {value ? (
          <button type="button" onClick={() => onChange('')} aria-label="مسح البحث" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-raised text-fg transition-colors hover:bg-[var(--accent-soft)]">
            <Icon name="x" size={16} />
          </button>
        ) : (
          <span className="num shrink-0 rounded-full bg-raised px-3 py-1.5 text-xs text-muted">{count} منتج</span>
        )}
      </label>
    </div>
  );
}

/**
 * /categories, /categories/:slug, /offers and /apps share this view: a search field, the category
 * icons, and one grid of brand cards (the same cards as the home "الالعاب الشائعه" section).
 * /offers keeps the offers slider on top.
 */
export default function CatalogPage({ fixedSlug, title, offersOnly }: { fixedSlug?: string; title?: string; offersOnly?: boolean }) {
  const params = useParams();
  const slug = fixedSlug ?? params.slug ?? 'all';
  const category = getCategory(slug);
  const heading = title ?? (slug === 'all' ? 'الفئات' : category?.name);
  usePageTitle(heading);
  const [q, setQ] = useState('');
  if (!category) return <NotFoundPage />;

  const base = offersOnly ? productsIn(slug).filter((p) => p.discount) : productsIn(slug);
  const needle = q.trim().toLowerCase();
  const list = needle ? base.filter((p) => p.name.toLowerCase().includes(needle) || p.nameEn.toLowerCase().includes(needle)) : base;
  // three groups, each under its own heading. Shopping tiles need a logo image — anything without one
  // falls back to the usual brand card in the platforms group.
  const isTile = (p: (typeof list)[number]) => p.kind !== 'topup' && p.kind !== 'platform' && Boolean(p.image);
  const isVoice = (p: (typeof list)[number]) => p.kind === 'topup' && p.categories.includes('voice-apps');
  const games = list.filter((p) => p.kind === 'topup' && !isVoice(p));
  const voices = list.filter(isVoice);
  const platforms = list.filter((p) => p.kind !== 'topup' && !isTile(p));
  const shops = list.filter(isTile);

  return (
    <>
      <h1 className="sr-only">{heading}</h1>
      {offersOnly && <OffersSection id="cat-hero" title={heading ?? ''} endsLabel="تنتهي خلال" asHero />}

      <SearchBar value={q} onChange={setQ} count={base.length} />

      <CategoryRail title="تصفح حسب الفئة" activeSlug={slug} hideTitle className="pb-12 pt-10 lg:pb-14 lg:pt-12" />

      {list.length === 0 ? (
        <section className="container-x pb-section" aria-label={heading}>
          {needle
            ? <EmptyState icon="search" title={`لا توجد نتائج لـ "${q.trim()}"`} />
            : <EmptyState icon="grid" title="لا توجد منتجات في هذه الفئة حالياً" action={{ label: 'الكل', to: '/categories' }} />}
        </section>
      ) : (
        <div key={`${slug}-${needle}`}>
          {/* each group is its own section, with the same card style as the home page */}
          {games.length > 0 && (
            <section aria-labelledby="cat-games-title" className="container-x pb-section">
              <SectionHead id="cat-games-title" title="الالعاب" />
              <div className="grid-products compact-grid gap-y-8 lg:grid-cols-4 lg:gap-5 lg:gap-y-10">
                {games.map((p, i) => (
                  <Reveal key={p.slug} delay={(i % 4) * 60}>
                    <ProductCard product={p} bare eager={i < 4} />
                  </Reveal>
                ))}
              </div>
            </section>
          )}
          {voices.length > 0 && (
            <VoiceProducts id="cat-voice" title="البرامج الصوتية" items={voiceApps.filter((a) => voices.some((v) => v.slug === a.slug))} />
          )}
          {platforms.length > 0 && (
            <section aria-labelledby="cat-platforms-title" className="container-x pb-section">
              <SectionHead id="cat-platforms-title" title="منصات الالعاب" />
              <div className="grid-products compact-grid gap-y-8 lg:grid-cols-4 lg:gap-5 lg:gap-y-10">
                {platforms.map((p, i) => (
                  <Reveal key={p.slug} delay={(i % 4) * 60}>
                    <ProductCard product={p} bare />
                  </Reveal>
                ))}
              </div>
            </section>
          )}
          {shops.length > 0 && (
            <section aria-labelledby="cat-shops-title" className="container-x pb-section">
              <SectionHead id="cat-shops-title" title="بطاقات التسوق" />
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
                {shops.map((p, i) => (
                  <Reveal as="li" key={p.slug} delay={(i % 6) * 50}>
                    <ShoppingTile product={p} index={i} />
                  </Reveal>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}    </>
  );
}
