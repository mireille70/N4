import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { voiceApps, type HeroSlide } from '@/content/home';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';
import { DotField } from '@/components/layout/DotField';

const AUTO_MS = 6000;

/** hero panel art (public/assets/hero/<slug>.webp, 900px portrait — built by scripts/build-hero-art.cjs) */
/** the hero panels use the first five (the others have no hero art) */
const HERO_GAMES = voiceApps.slice(0, 5);


/** Headline copy that follows the active panel (keyed by voice-app slug) */
interface PanelCopy { lines: string[]; highlight: string; text: string; cta: string }
const PANEL_COPY: Record<string, PanelCopy> = {
  hawa: {
    lines: ['اشحن عملات هوا', 'وخلّ صوتك يوصل للكل'],
    highlight: 'هوا',
    text: 'غرف صوتية، أصدقاء جدد وهدايا — عبّي رصيدك بثواني وادخل الجلسة.',
    cta: 'اشحن هوا الان',
  },
  'yalla-ludo': {
    lines: ['جهّز جواهر يلا لودو', 'وخذ الدور قبل الكل'],
    highlight: 'لودو',
    text: 'العب مع ربعك وتحدّى اللاعبين — شحن فوري للجواهر والعملات.',
    cta: 'اشحن يلا لودو',
  },
  masa: {
    lines: ['شحن ماسا بدون انتظار', 'والسهرة تبدأ الحين'],
    highlight: 'ماسا',
    text: 'دردشة وألعاب جماعية وغرف حيّة — اشحن عملاتك واستلمها فورًا.',
    cta: 'اشحن ماسا الان',
  },
  tawla: {
    lines: ['حلّ تحدّيك في طاولة', 'واكسب الجولة بذكاء'],
    highlight: 'طاولة',
    text: 'العب النرد مع خصوم حقيقيين — زوّد رصيدك وابدأ المباراة.',
    cta: 'اشحن طاولة الان',
  },
  sila: {
    lines: ['سيلا شات يجمعك', 'بأصحابك في أي وقت'],
    highlight: 'سيلا',
    text: 'محادثات صوتية وغرف مفتوحة — اشحن عملاتك وخلّك دايم بالواجهة.',
    cta: 'اشحن سيلا شات',
  },
};

const useReducedMotion = () => {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const on = () => setReduce(mq.matches);
    on();
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return reduce;
};

/**
 * Hero — editorial split.
 * Reading side: a large solid headline (one word in ember), one line, two buttons and a quiet
 * trust line. Other side: a row of tall character panels in the games' own colours; the active
 * panel expands and shows the name, starting price and a buy arrow, the others stay as narrow
 * slivers. Hover or click a sliver to open it; it also advances on its own (paused on hover,
 * off with reduced motion). Underneath: three plain numbered steps.
 */
export function Hero({ slides }: { slides: HeroSlide[]; promos?: { offers: string; arrivals: string; shopping: string } }) {
  const head = slides[0];
  const { motion } = useTheme();
  const reduce = useReducedMotion();
  const games = HERO_GAMES;
  const n = games.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    // with the OS "reduce motion" setting the carousel still turns over (more slowly, short .3s expand — see .hero-panels in index.css);
    // normal-motion devices behave exactly as before. Hover / focus still pauses it; theme motion 'off' still stops it.
    if (motion === 'off' || paused || n < 2) return;
    const t = window.setTimeout(() => setActive((a) => (a + 1) % n), reduce ? AUTO_MS + 2000 : AUTO_MS);
    return () => window.clearTimeout(t);
  }, [active, paused, motion, reduce, n]);

  const strip = voiceApps.map((a) => a.name);
  const cur = games[active];
  const copy = PANEL_COPY[cur.slug];
  const lines = copy?.lines ?? head.lines;
  const highlight = copy?.highlight ?? head.highlight;
  const bodyText = copy?.text ?? 'بطاقات الألعاب والمنصات والمتاجر — اختار لعبتك واشحن رصيدك بسهولة.';
  const ctaLabel = copy?.cta ?? head.cta.label;
  const ctaTo = copy ? cur.to : head.cta.to;

  return (
    // full-bleed: the calm warm gradient runs edge to edge and up under the transparent header
    <section aria-label="العروض الرئيسية" className="hero-calm relative isolate -mt-14 overflow-hidden pt-14 sm:-mt-16 sm:pt-16 lg:-mt-[73px] lg:pt-[73px]">
      <DotField className="absolute inset-0 -z-10 h-full w-full [mask-image:radial-gradient(ellipse_90%_80%_at_50%_40%,#000_40%,transparent_100%)]" />
      <span className="spotlight spot-drift absolute -bottom-48 end-[-4%] -z-10 h-[620px] w-[820px] opacity-50" aria-hidden="true" />
      {/* the gradient melts into the page colour at the foot — no hard edge */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[45%] bg-[linear-gradient(to_bottom,transparent,rgb(var(--c-bg))_85%)]" aria-hidden="true" />

      <div className="container-x grid items-center gap-3 pb-4 pt-3 sm:gap-5 sm:pb-12 sm:pt-6 lg:grid-cols-12 lg:gap-12 lg:pb-16 lg:pt-10">
        {/* copy — below lg its parts flow into the grid; order: headline, text, button, trust line, then the panels */}
        <div className="contents min-w-0 lg:block lg:col-span-6">
          {/* two lines; each line stays on one row from tablet up. Re-keyed per panel so the copy animates in */}
          <h1 key={cur.slug} className="anim-rise max-lg:order-1 font-display text-[clamp(1.25rem,6.9vw,3rem)] font-semibold leading-[1.3] tracking-[-0.03em] lg:text-[2.6rem] xl:text-[3.3rem]">
            {lines.map((line, i) => (
              <span key={i} className="block whitespace-nowrap">
                {highlight && line.includes(highlight) ? (
                  <>{line.split(highlight)[0]}<span className="text-accent">{highlight}</span>{line.split(highlight)[1]}</>
                ) : line}
              </span>
            ))}
          </h1>
          <p key={`t-${cur.slug}`} className="anim-rise max-lg:order-2 max-lg:mt-0 mt-3 h-12 overflow-hidden max-w-sm text-sm leading-6 text-muted sm:mt-6 sm:h-24 lg:h-auto lg:min-h-[6rem] lg:overflow-visible sm:text-lg sm:leading-8 [animation-delay:80ms]">
            {bodyText}
          </p>
          <div className="flex flex-wrap items-center gap-3 max-lg:order-3 max-lg:mt-2 lg:mt-10">
            <Link key={`c-${cur.slug}`} to={ctaTo} className="anim-rise btn-cta !h-12 min-w-[200px] !gap-4 !pe-8 !text-sm sm:!h-16 sm:min-w-[260px] sm:!gap-5 sm:!pe-12 sm:!text-base [animation-delay:140ms]">
              {ctaLabel}
              <span className="btn-cta-dot !h-10 !w-10 sm:!h-[52px] sm:!w-[52px]"><Icon name="arrow-next" size={20} /></span>
            </Link>
          </div>
          <p className="anim-rise text-xs text-fg/60 max-lg:order-4 max-lg:mt-0 mt-4 sm:text-sm lg:mt-10 [animation-delay:200ms]">
            تسليم فوري <span className="mx-2 text-accent">•</span> دفع آمن <span className="mx-2 text-accent">•</span> +50 لعبة ومنصة
          </p>
        </div>

        {/* expanding character panels */}
        <div
          className="relative min-w-0 max-lg:order-5 max-lg:mt-4 lg:col-span-6"
          onPointerEnter={(e) => { if (e.pointerType === 'mouse') setPaused(true); }}
          onPointerLeave={(e) => { if (e.pointerType === 'mouse') setPaused(false); }}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {/* ember glow behind the characters */}
          <span className="spotlight absolute inset-[10%] -z-10 opacity-90" aria-hidden="true" />
          {/* --hero-img-w: the image keeps one fixed size (the expanded panel's width) so panels only
              crop it while they grow — no per-frame resampling */}
          <ul className="hero-panels flex h-[220px] gap-2 [--hero-img-w:68cqw] [container-type:inline-size] sm:h-[440px] lg:h-[480px] lg:gap-3" aria-label="ألعاب مميزة">
            {games.map((g, i) => {
              const on = i === active;
              return (
                <li
                  key={g.slug}
                  className="relative min-w-0 transform-gpu overflow-hidden rounded-[20px] bg-container transition-[flex-grow] will-change-[flex-grow] [backface-visibility:hidden] [contain:layout_paint] sm:rounded-[28px] duration-700 [transition-timing-function:cubic-bezier(.65,0,.25,1)]"
                  style={{ flexGrow: on ? 6 : 1, flexBasis: 0 }}
                  onPointerEnter={(e) => { if (e.pointerType === 'mouse') setActive(i); }}
                >
                  <img
                    src={`/assets/hero/apps/${g.slug}.webp?v=2`}
                    alt=""
                    draggable={false}
                    decoding="async"
                    loading={i < 2 ? 'eager' : 'lazy'}
                    className={cx('absolute inset-y-0 left-1/2 h-full w-[var(--hero-img-w)] max-w-none -translate-x-1/2 transform-gpu object-cover object-[50%_15%] transition-[filter] duration-700', on ? '' : 'brightness-[.55] saturate-[.8]')}
                  />
                  <span className={cx('pointer-events-none absolute inset-0 transition-opacity duration-700', on ? 'bg-[linear-gradient(to_top,rgb(9_10_12/.92)_0%,rgb(9_10_12/.2)_45%,transparent_70%)]' : 'bg-[linear-gradient(to_top,rgb(9_10_12/.7),transparent_60%)]')} aria-hidden="true" />

                  {/* collapsed: whole sliver is a button */}
                  {!on && (
                    <button type="button" onClick={() => setActive(i)} aria-label={`عرض ${g.name}`} className="absolute inset-0 z-10">
                      <span className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-xs font-medium tracking-wide text-fg/70 [writing-mode:vertical-rl] sm:block" dir="ltr">{g.nameEn}</span>
                    </button>
                  )}

                  {/* expanded: name, price, buy */}
                  <div className={cx('absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 transition-all duration-500 sm:gap-4 sm:p-7', on ? 'translate-y-0 opacity-100 delay-200' : 'pointer-events-none translate-y-3 opacity-0')}>
                    <p className="min-w-0 truncate text-lg font-semibold text-white sm:text-3xl">{g.name}</p>
                    <Link
                      to={g.to}
                      tabIndex={on ? 0 : -1}
                      aria-label={`اشحن ${g.name}`}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white sm:h-12 sm:w-12 text-[#06140E] transition-transform duration-200 hover:scale-105"
                    >
                      <Icon name="arrow-next" size={20} />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* two crossing ribbons at the foot: a faint charcoal one behind, the ember one in front,
          both wider than the screen and tilted, scrolling game & platform names endlessly */}
      <div className="relative h-[84px] sm:h-[150px]" aria-hidden="true">
        <div className="marquee absolute left-[-5%] top-1/2 w-[110%] -translate-y-1/2 rotate-[2.5deg] border-y border-white/[.06] bg-[#040F0A] py-3">
          <div className="marquee-track marquee-rev flex w-max items-center gap-6 pe-6">
            {[...strip, ...strip, ...strip, ...strip].map((name, i) => (
              <span key={i} className="flex items-center gap-6">
                <span className="whitespace-nowrap font-display text-base font-bold text-white/85 sm:text-xl lg:text-2xl">{name}</span>
                <Icon name="sparkle" size={12} className="shrink-0 text-fg/30" />
              </span>
            ))}
          </div>
        </div>
        <div className="marquee absolute left-[-5%] top-1/2 w-[110%] -translate-y-1/2 -rotate-[3deg] bg-[image:var(--grad-ember)] py-2.5 shadow sm:py-3.5-[0_20px_40px_-16px_rgb(0_0_0/.9)]">
          <div className="marquee-track flex w-max items-center gap-6 pe-6">
            {[...strip, ...strip, ...strip, ...strip].map((name, i) => (
              <span key={i} className="flex items-center gap-6">
                <span className="whitespace-nowrap font-display text-base font-bold text-[#04140F] sm:text-xl lg:text-2xl">{name}</span>
                <Icon name="sparkle" size={16} className="shrink-0 text-[#04140F]" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
