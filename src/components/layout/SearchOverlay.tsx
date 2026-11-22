import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { products, categories } from '@/content/catalog';
import { Icon } from '@/components/ui/Icon';
import { Price } from '@/components/ui/primitives';
import { ProductArt } from '@/components/product/ProductArt';

export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', esc); };
  }, [onClose]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return products.slice(0, 6);
    return products.filter((p) => p.name.includes(term) || p.nameEn.toLowerCase().includes(term));
  }, [q]);

  return (
    <div role="dialog" aria-modal="true" aria-label="بحث" className="fixed inset-0 z-50 overflow-y-auto bg-bg/[.98] anim-fade">
      <div className="container-x max-w-narrow pb-16 pt-5 md:pt-14">
        <div className="flex items-center gap-3">
          <label className="field h-16 flex-1 !rounded-xl !bg-surface md:h-[72px]">
            <Icon name="search" className="text-accent" />
            <span className="sr-only">ابحث عن منتج</span>
            <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن لعبة أو بطاقة" className="font-display text-lg md:text-xl" type="search" />
          </label>
          <button type="button" onClick={onClose} className="icon-btn h-14 w-14 shrink-0" aria-label="إغلاق البحث"><Icon name="x" /></button>
        </div>

        <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto">
          {categories.map((c) => (
            <Link key={c.slug} to={c.slug === 'all' ? '/categories' : `/categories/${c.slug}`} onClick={onClose} className="chip shrink-0">{c.name}</Link>
          ))}
        </div>

        <p className="eyebrow mt-10" aria-live="polite">{q ? `${results.length} RESULTS` : 'SUGGESTED'}</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {results.map((p) => (
            <li key={p.slug}>
              <Link to={`/product/${p.slug}`} onClick={onClose} className="group flex items-center gap-4 rounded-lg p-2.5 transition-colors hover:bg-surface">
                <ProductArt product={p} className="h-16 w-16 shrink-0 rounded-full notch-sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display font-semibold group-hover:text-accent">{p.name}</span>
                  <span className="eyebrow mt-0.5 block truncate text-start !text-[.65rem]">{p.nameEn}</span>
                </span>
                <Price value={p.price} size="sm" />
              </Link>
            </li>
          ))}
        </ul>
        {results.length === 0 && <p className="mt-6 text-muted">لا توجد نتائج مطابقة</p>}
      </div>
    </div>
  );
}
