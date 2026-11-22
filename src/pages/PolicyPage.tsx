import { Link } from 'react-router-dom';
import { policies } from '@/content/pages';
import { PageHero } from '@/components/layout/PageHero';
import { Icon } from '@/components/ui/Icon';
import { jumpTo } from '@/components/ui/primitives';
import { usePageTitle } from '@/lib/usePageTitle';

/** /privacy, /terms and /refund — a numbered table of contents beside the sections. */
export default function PolicyPage({ kind }: { kind: keyof typeof policies }) {
  const p = policies[kind];
  usePageTitle(p.title);
  const others = (Object.keys(policies) as Array<keyof typeof policies>).filter((k) => k !== kind);

  return (
    <>
      <PageHero
        eyebrow={p.eyebrow}
        title={p.title}
        highlight={p.highlight}
        subtitle={p.subtitle}
        crumbs={[{ label: 'الرئيسية', to: '/' }, { label: p.title }]}
      >
        <p className="mt-5 inline-flex items-center gap-2 text-xs text-muted"><Icon name="calendar" size={14} className="text-accent" />آخر تحديث: <span className="num">{p.updated}</span></p>
      </PageHero>

      <section className="container-x grid grid-cols-1 gap-8 pb-section pt-10 lg:grid-cols-12 lg:gap-12 lg:pt-14">
        <aside className="hidden lg:col-span-4 lg:block">
          <div className="game-frame sticky top-28 p-5">
            <p className="eyebrow text-start">المحتويات</p>
            <ol className="mt-4 grid gap-1">
              {p.sections.map((s, i) => (
                <li key={s.title}>
                  <a href={`#sec-${i}`} onClick={jumpTo(`sec-${i}`)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-fg/[.05] hover:text-fg">
                    <span className="num font-display text-xs font-bold text-accent">{String(i + 1).padStart(2, '0')}</span>{s.title}
                  </a>
                </li>
              ))}
            </ol>
            <div className="mt-4 grid gap-2 border-t border-line pt-4">
              {others.map((k) => (
                <Link key={k} to={`/${k}`} className="flex items-center justify-between text-sm text-muted hover:text-accent">{policies[k].title}<Icon name="arrow-next" size={16} /></Link>
              ))}
            </div>
          </div>
        </aside>

        <div className="grid gap-4 lg:col-span-8">
          {p.sections.map((s, i) => (
            <article key={s.title} id={`sec-${i}`} className="game-frame scroll-mt-28 p-6 sm:p-7">
              <h2 className="flex items-center gap-3 font-display text-xl font-bold">
                <span className="num notch-sm grid h-9 w-9 place-items-center bg-accent text-sm text-white">{String(i + 1).padStart(2, '0')}</span>
                {s.title}
              </h2>
              <ul className="mt-4 grid gap-2.5">
                {s.body.map((line) => (
                  <li key={line} className="flex gap-3 text-[.95rem] leading-7 text-muted">
                    <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{line}
                  </li>
                ))}
              </ul>
            </article>
          ))}
          <p className="mt-2 text-sm text-muted">عندك سؤال عن هذه السياسة؟ <Link to="/contact" className="font-semibold text-accent">تواصل معنا</Link></p>
        </div>
      </section>
    </>
  );
}
