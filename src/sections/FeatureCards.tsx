import type { FeatureItem } from '@/content/home';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/primitives';

/**
 * Three quiet feature cards right under the hero: monochrome icon and a small
 * index on top, title and one line below; a faint warm light wakes on hover.
 */
export function FeatureCards({ items }: { items: FeatureItem[] }) {
  return (
    <section aria-labelledby="features-title" className="pb-section">
      <div className="container-x">
        <h2 id="features-title" className="sr-only">لماذا KOON</h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {items.map((f, i) => (
            <Reveal as="li" key={f.title} delay={i * 80}>
              <div className="game-frame is-interactive group relative h-full overflow-hidden p-6 lg:p-8">
                <span className="pointer-events-none absolute -top-20 start-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-accent/0 blur-3xl transition-colors duration-slow group-hover:bg-accent/15" aria-hidden="true" />
                <div className="relative flex items-start justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-[12px] text-fg/85 ring-1 ring-inset ring-line transition-colors group-hover:text-accent">
                    <Icon name={f.icon} size={19} />
                  </span>
                  <span className="num font-mono text-xs text-muted/70">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="relative mt-10 text-lg font-semibold">{f.title}</h3>
                <p className="relative mt-1.5 text-sm leading-6 text-muted">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
