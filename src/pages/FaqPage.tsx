import { useState } from 'react';
import { Link } from 'react-router-dom';
import { faq } from '@/content/pages';
import { GlossTile, PageHero } from '@/components/layout/PageHero';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/format';
import { usePageTitle } from '@/lib/usePageTitle';

export default function FaqPage() {
  usePageTitle('الأسئلة الشائعة');
  const [group, setGroup] = useState(0);
  const [open, setOpen] = useState<number | null>(0);
  const [query, setQuery] = useState('');

  const q = query.trim();
  const items = q
    ? faq.flatMap((g) => g.items).filter((it) => it.q.includes(q) || it.a.includes(q))
    : faq[group].items;

  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="الأسئلة الشائعة"
        highlight="الشائعة"
        subtitle="إجابات سريعة لأكثر الأسئلة اللي توصلنا عن الطلبات والدفع والحساب."
        crumbs={[{ label: 'الرئيسية', to: '/' }, { label: 'الأسئلة الشائعة' }]}
      >
        <div className="field mt-6 max-w-md">
          <Icon name="search" size={18} className="shrink-0 text-muted" />
          <input value={query} onChange={(e) => { setQuery(e.target.value); setOpen(0); }} placeholder="ابحث عن سؤال…" aria-label="ابحث في الأسئلة" />
        </div>
      </PageHero>

      <section className="container-x grid grid-cols-1 gap-6 pb-section pt-10 lg:grid-cols-12 lg:gap-10 lg:pt-14">
        <nav aria-label="أقسام الأسئلة" className="lg:col-span-4">
          <ul className="no-scrollbar -mx-gutter flex gap-2 overflow-x-auto px-gutter lg:sticky lg:top-28 lg:mx-0 lg:grid lg:px-0">
            {faq.map((g, i) => {
              const on = !q && group === i;
              return (
                <li key={g.title} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => { setGroup(i); setOpen(0); setQuery(''); }}
                    aria-current={on ? 'true' : undefined}
                    className={cx('hud-deco flex w-full items-center gap-3 p-2.5 pe-5 text-start ring-1 ring-inset transition-colors', on ? 'bg-accent/10 ring-accent/60' : 'bg-surface ring-fg/[.07] hover:ring-accent/30')}
                  >
                    <GlossTile icon={g.icon} size={40} />
                    <span className="font-semibold">{g.title}</span>
                    <span className="num ms-auto hidden text-xs text-muted lg:inline">{g.items.length}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="lg:col-span-8">
          {items.length === 0 ? (
            <p className="game-frame p-8 text-center text-muted">ما لقينا سؤال يطابق «{q}» — <Link to="/contact" className="font-semibold text-accent">اسألنا مباشرة</Link></p>
          ) : (
            <ul className="grid gap-3">
              {items.map((it, i) => {
                const isOpen = open === i;
                return (
                  <li key={it.q} className={cx('game-frame', isOpen && '[--frame-open:1] ring-1 ring-inset ring-accent/30')}>
                    <h3>
                      <button type="button" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} aria-controls={`faq-${i}`} className="flex w-full items-center gap-4 p-5 text-start sm:px-6">
                        <span className="num font-display text-sm font-bold text-accent">{String(i + 1).padStart(2, '0')}</span>
                        <span className="flex-1 font-display text-base font-bold md:text-lg">{it.q}</span>
                        <span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-full transition-all', isOpen ? 'rotate-45 bg-accent text-white' : 'bg-fg/[.06]')}>
                          <Icon name="plus" size={16} strokeWidth={2.4} />
                        </span>
                      </button>
                    </h3>
                    <div id={`faq-${i}`} hidden={!isOpen} className="px-5 pb-5 sm:px-6">
                      <p className="border-t border-line pt-4 text-[.95rem] leading-7 text-muted">{it.a}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-xl border border-dashed border-accent/40 p-5 sm:flex-row sm:items-center">
            <div>
              <p className="font-display font-bold">ما لقيت إجابتك؟</p>
              <p className="mt-1 text-sm text-muted">فريق الدعم جاهز يساعدك.</p>
            </div>
            <Link to="/contact" className="btn btn-primary btn-sm">تواصل معنا<Icon name="arrow-next" size={18} /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
