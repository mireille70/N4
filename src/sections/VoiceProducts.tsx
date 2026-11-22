import { Link } from 'react-router-dom';
import type { VoiceApp } from '@/content/home';
import { Icon } from '@/components/ui/Icon';
import { Reveal, SectionHead } from '@/components/ui/primitives';

/**
 * Voice apps — one compact dark-green card per app: the app icon on a glow in its own colour, the
 * Arabic name, the Latin name, and a small "اشحن الان" chip (tablet and up). Four across on
 * tablet and desktop, three on phones.
 */
export function VoiceProducts({ id, title, items, index }: { id: string; title: string; items: VoiceApp[]; index?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 pb-section pt-8 lg:pt-12">
      <div className="container-x">
        <SectionHead id={`${id}-title`} index={index} title={title} eyebrow="Voice" note="اشحن رصيد تطبيقاتك المفضلة بسهولة" />
        <ul className="compact-grid grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-4 lg:gap-5">
          {items.map((a, i) => (
            <Reveal as="li" key={a.slug} delay={(i % 4) * 70} className="compact-cell min-w-0">
              <Link
                to={a.to}
                aria-label={a.name}
                className="group relative flex h-full flex-col items-center overflow-hidden rounded-[20px] px-2 pb-3 pt-4 text-center text-white transition-[transform,box-shadow] duration-300 hover:-translate-y-1 sm:rounded-[28px] sm:px-4 sm:pb-5 sm:pt-7"
                style={{ background: 'linear-gradient(165deg,#0E2A1E 0%,#08170F 70%)', boxShadow: 'inset 0 0 0 1px #1D4232, 0 16px 32px -22px rgb(0 0 0 / .9)' }}
              >
                {/* glow in the app's own colour */}
                <span className="pointer-events-none absolute left-1/2 top-0 h-24 w-24 -translate-x-1/2 rounded-full opacity-35 blur-2xl transition-opacity duration-500 group-hover:opacity-70 sm:h-40 sm:w-40" style={{ background: a.color }} aria-hidden="true" />
                <img
                  src={`/assets/hero/apps/icons/${a.slug}.webp`}
                  alt=""
                  width={96}
                  height={96}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="relative h-16 w-16 rounded-[23.5%] shadow-[0_14px_24px_-10px_rgb(0_0_0/.8)] transition-transform duration-500 [transition-timing-function:var(--ease-std)] group-hover:scale-110 sm:h-24 sm:w-24"
                />
                <span className="relative mt-2.5 block w-full truncate text-[11px] font-bold sm:mt-4 sm:text-base">{a.name}</span>
                <span className="relative block w-full truncate text-[9px] text-white/50 sm:text-xs" dir="ltr">{a.nameEn}</span>
                <span className="btn-cta !hidden !h-11 !gap-3 !pe-5 !text-sm sm:!inline-flex relative mt-4">
                  اشحن الان
                  <span className="btn-cta-dot !h-9 !w-9"><Icon name="arrow-next" size={15} /></span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
