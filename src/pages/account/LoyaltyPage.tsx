import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { site } from '@/content/site';
import { getProduct } from '@/content/catalog';
import { EARN_WAYS, REWARDS, TIERS, pointsOf, tierState } from '@/content/loyalty';
import { useStore } from '@/store/StoreProvider';
import { Icon } from '@/components/ui/Icon';
import { DemoNote, Reveal, SectionHead, jumpTo } from '@/components/ui/primitives';
import { ProductArt } from '@/components/product/ProductArt';
import { cx, formatInt } from '@/lib/format';
import { usePageTitle } from '@/lib/usePageTitle';

const motionOff = () =>
  typeof window === 'undefined' ||
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ||
  document.documentElement.dataset.motion === 'off';

/** counts up from 0 to `to` once it scrolls into view */
function CountUp({ to, className, duration = 1400 }: { to: number; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || motionOff()) return setV(to);
    let raf = 0;
    const run = () => {
      const t0 = performance.now();
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / duration);
        setV(Math.round(to * (1 - Math.pow(1 - k, 3))));
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { run(); io.disconnect(); } });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, duration]);
  return <span ref={ref} className={cx('num', className)}>{formatInt(v)}</span>;
}

/** true once the element is on screen — drives bar fills */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return setOn(true);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { rootMargin: '0px 0px -10% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, on] as const;
}

/* ——————————————————————————— hero ——————————————————————————— */

/**
 * Hero visual: a 270° gauge. The arc fills with progress toward the next tier; the centre holds the
 * tier icon, the live balance and the tier name; the two ends of the gap are labelled current → next.
 * The SVG is mirrored in RTL so the arc fills from the reading start.
 */
function TierGauge({ points, tier, next, toNext }: { points: number; tier: (typeof TIERS)[number]; next?: (typeof TIERS)[number]; toNext: number }) {
  const [ref, on] = useInView<HTMLDivElement>();
  const R = 120;
  const C = 2 * Math.PI * R;
  const ARC = C * 0.75;
  const fill = next ? Math.max(0.03, toNext) : 1;
  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[230px] sm:max-w-[320px]">
      <span className="pointer-events-none absolute inset-8 rounded-full bg-[radial-gradient(closest-side,rgb(63_216_192/.18),transparent)]" aria-hidden="true" />
      <svg viewBox="0 0 280 280" className="relative block w-full rtl:-scale-x-100" aria-hidden="true">
        <defs>
          <linearGradient id="loy-arc" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#17806F" />
            <stop offset=".55" stopColor="#3FD8C0" />
            <stop offset="1" stopColor="#A8F2E4" />
          </linearGradient>
        </defs>
        {/* fine ticks */}
        <g transform="rotate(135 140 140)">
          {Array.from({ length: 28 }, (_, i) => {
            const a = (i / 27) * 270 * (Math.PI / 180);
            return <line key={i} x1={140 + 134 * Math.cos(a)} y1={140 + 134 * Math.sin(a)} x2={140 + 139 * Math.cos(a)} y2={140 + 139 * Math.sin(a)} stroke="currentColor" strokeWidth="1.5" className="text-fg/15" strokeLinecap="round" />;
          })}
          <circle cx="140" cy="140" r={R} fill="none" strokeWidth="14" strokeLinecap="round" className="stroke-white/[.06]" strokeDasharray={`${ARC} ${C}`} />
          <circle
            cx="140" cy="140" r={R} fill="none" stroke="url(#loy-arc)" strokeWidth="14" strokeLinecap="round"
            strokeDasharray={`${ARC} ${C}`}
            strokeDashoffset={on ? ARC * (1 - fill) : ARC}
            style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(.2,.7,.2,1)' }}
          />
        </g>
      </svg>

      {/* centre */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="grid h-9 w-9 sm:h-11 sm:w-11 place-items-center rounded-full border border-[#6FE8D5]/25 bg-[#6FE8D5]/10 text-[#6FE8D5]"><Icon name={tier.icon} size={20} /></span>
        <CountUp to={points} className="mt-2 font-display text-[2.25rem] font-bold leading-none text-fg sm:mt-3 sm:text-[2.75rem]" />
        <span className="mt-1.5 text-xs text-fg/50">نقطة</span>
      </div>

      {/* ends of the gap: current → next */}
      <div className="absolute inset-x-[14%] bottom-[4%] flex items-center justify-between text-xs font-semibold">
        <span className="text-[#6FE8D5]">{tier.name}</span>
        <span className="text-fg/40">{next ? next.name : '—'}</span>
      </div>
    </div>
  );
}

/* ——————————————————————————— earn ——————————————————————————— */

/** pastel palette — every tile takes the next colour in the family */
const LAV = { bg: 'rgb(63 216 192 / .12)', fg: '#3FD8C0' };
const PINK = { bg: 'rgb(139 235 218 / .12)', fg: '#8BEBDA' };
const LAV_PINK = 'linear-gradient(90deg, #17806F, #3FD8C0, #8BEBDA)';

/** earn tiles cycle through the pastel family: lavender · mint · peach · sky */
const EARN_PALETTE = [
  { bg: 'linear-gradient(155deg, #0E2A1E, #06130E 75%)', fg: '#3FD8C0' },
  { bg: 'linear-gradient(155deg, #0A1F17, #06130E 80%)', fg: '#8BEBDA' },
  { bg: 'linear-gradient(155deg, #0A1F17, #030C08 80%)', fg: '#3FD8C0' },
  { bg: 'linear-gradient(155deg, #0A1F17, #030C08 80%)', fg: '#8BEBDA' },
];

function DailyStreak({ claimed }: { claimed: boolean }) {
  const done = claimed ? 5 : 4; // demo: four days in a row so far
  return (
    <ol className="mt-2 flex gap-[3px] sm:mt-3 sm:gap-1.5" aria-label={`سلسلة الدخول: ${done} من 7 أيام`}>
      {Array.from({ length: 7 }, (_, i) => {
        const on = i < done;
        const today = i === 4;
        return (
          <li key={i}>
            <span
              className={cx('grid h-[17px] w-[17px] place-items-center rounded-full text-[8px] font-bold transition-all duration-500 sm:h-6 sm:w-6 sm:text-[10px]', !on && 'bg-raised/80 text-muted', today && !on && 'ring-2 ring-accent/60 loy-pulse')}
              style={on ? { background: LAV.fg, color: '#fff' } : undefined}
            >
              {on ? <Icon name="check" size={11} strokeWidth={3} /> : i === 6 ? '×2' : <span className="num">{i + 1}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function EarnRow({ way, index }: { way: (typeof EARN_WAYS)[number]; index: number }) {
  const { notify } = useStore();
  const [claimed, setClaimed] = useState(false);
  const action = () => {
    if (way.id === 'daily') { if (!claimed) { setClaimed(true); notify(`+${way.points} نقاط — رجعت بكرة عشان تكمل السلسلة (تجريبي)`); } return; }
    if (way.id === 'invite') { navigator.clipboard?.writeText(`${location.origin}/register?ref=KOON`).catch(() => {}); notify('تم نسخ رابط الدعوة (تجريبي)'); return; }
    notify('عرض تجريبي');
  };
  const pal = EARN_PALETTE[index % EARN_PALETTE.length];
  const tone = { bg: '#fff', fg: pal.fg };
  const bg = pal.bg;
  const isLink = way.id === 'order' || way.id === 'review';
  const btnCls = cx('earn-btn flex h-9 w-full items-center justify-center gap-1 rounded-full bg-surface px-2 text-[11px] sm:gap-1.5 sm:px-0 sm:text-[13px] sm:h-10 font-semibold shadow-[var(--elev-1)] transition-transform hover:-translate-y-0.5', claimed && 'pointer-events-none opacity-70');
  return (
    <Reveal as="li" delay={index * 70} className="h-full">
      {/* compact tile: soft mint / baby-blue field, white icon chip, the points as the headline */}
      <article className="earn-tile group relative flex h-full flex-col overflow-hidden rounded-[20px] p-3 sm:rounded-[24px] sm:p-5" style={{ background: bg }}>
        <div className="relative flex items-start justify-between gap-2 sm:gap-3">
          <span className="grid h-9 w-9 sm:h-11 sm:w-11 place-items-center rounded-2xl bg-surface shadow-[var(--elev-1)]" style={{ color: tone.fg }}>
            <Icon name={way.icon} size={20} />
          </span>
          <p className="text-end leading-none">
            <span className="num block font-display text-xl font-extrabold sm:text-2xl" style={{ color: tone.fg }}>+{way.points}</span>
            <span className="mt-1 block text-[11px] text-fg/55">{way.id === 'order' ? 'لكل ريال' : 'نقطة'}</span>
          </p>
        </div>
        <h3 className="relative mt-2 text-sm font-bold text-fg sm:mt-4 sm:text-base">{way.title}</h3>
        <p className="relative mt-0.5 line-clamp-2 text-[11px] leading-4 text-fg/60 sm:mt-1 sm:text-[12.5px] sm:leading-5">{way.body}</p>
        {way.id === 'daily' && <DailyStreak claimed={claimed} />}
        <div className="relative mt-auto pt-2.5 sm:pt-4">
          {isLink ? (
            <Link to={way.id === 'order' ? '/categories' : '/account/orders'} className={btnCls} style={{ color: tone.fg }}>{way.cta}<Icon name="arrow-next" size={14} /></Link>
          ) : (
            <button type="button" onClick={action} className={btnCls} style={{ color: tone.fg }}>{claimed ? <><Icon name="check" size={14} />تم الاستلام</> : <>{way.cta}<Icon name="arrow-next" size={14} /></>}</button>
          )}
        </div>
      </article>
    </Reveal>
  );
}

/* ——————————————————————————— tiers ——————————————————————————— */

function TierPath({ points }: { points: number }) {
  const { idx, current, next, toNext, remaining } = tierState(points);
  const [ref, on] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className="tier-path rounded-[28px] border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold" style={{ background: LAV.bg, color: LAV.fg }}>
          <Icon name={current.icon} size={15} />مستواك: {current.name}
        </span>
        <p className="text-sm text-muted">
          {next
            ? <>باقي <span className="num font-bold text-fg">{formatInt(remaining)}</span> نقطة لمستوى <span className="font-bold" style={{ color: PINK.fg }}>{next.name}</span></>
            : 'وصلت أعلى مستوى'}
        </p>
      </div>

      {/* stepper: one node per level on a track that fills up to where you are */}
      <div className="relative mt-6">
        {/* track runs between the first and last node centres (10% → 90% of a 5-column grid) */}
        <div className="absolute inset-x-[10%] top-[44px] h-1 -translate-y-1/2 overflow-hidden rounded-full bg-white/[.06]" aria-hidden="true">
          <div
            className="h-full origin-right rounded-full transition-transform duration-[1400ms] ease-out ltr:origin-left"
            style={{ background: LAV_PINK, transform: `scaleX(${on ? (idx + (next ? toNext : 0)) / (TIERS.length - 1) : 0})` }}
          />
        </div>

        <ol className="relative grid grid-cols-5">
          {TIERS.map((t, i) => {
            const now = i === idx;
            const done = i < idx;
            const locked = i > idx;
            return (
              <li key={t.id} aria-current={now ? 'step' : undefined} className={cx('flex min-w-0 flex-col items-center rounded-2xl px-1 py-4 text-center sm:px-3', now && 'bg-white/[.03] ring-1 ring-line')}>
                <span className="grid h-14 place-items-center">
                  <span
                    className={cx(
                      'grid place-items-center rounded-full transition-colors',
                      now && 'h-14 w-14 bg-[image:var(--grad-ember)] text-[#04140F] ring-4 ring-accent/20 shadow-[0_10px_30px_-8px_rgb(63_216_192/.6)]',
                      done && 'h-10 w-10 border border-accent/40 bg-[#1A140F] text-accent',
                      locked && 'h-10 w-10 border border-line bg-surface text-fg/35',
                    )}
                  >
                    <Icon name={done ? 'check' : locked ? 'lock' : t.icon} size={now ? 22 : 16} strokeWidth={done ? 3 : undefined} />
                  </span>
                </span>
                <p className={cx('mt-3 w-full truncate text-xs font-bold sm:text-sm', locked ? 'text-fg/45' : 'text-fg')}>{t.name}</p>
                <p className="mt-0.5 text-[11px] text-muted"><span className="num">{formatInt(t.min)}</span><span className="hidden sm:inline"> نقطة</span></p>
                <p className={cx('mt-2 hidden max-w-full truncate rounded-full px-2.5 py-1 text-[11px] sm:block', now ? 'bg-accent/10 font-semibold text-accent' : 'text-fg/40')}>{t.perks[t.perks.length - 1]}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/* ——————————————————————————— rewards ——————————————————————————— */

/** a clearly visible sage-green field (same family as the earn tiles) */
const REWARD_TINTS = [
  'linear-gradient(160deg, #9DBBA3 0%, #7FA487 100%)',
  'linear-gradient(160deg, #98B9AA 0%, #78A18F 100%)',
  'linear-gradient(160deg, #A2BC9B 0%, #82A57C 100%)',
];

function RewardCard({ reward, points, index }: { reward: (typeof REWARDS)[number]; points: number; index: number }) {
  const { notify } = useStore();
  const product = getProduct(reward.slug);
  const enough = points >= reward.cost;
  const [ref, on] = useInView<HTMLElement>();
  return (
    <Reveal as="li" delay={(index % 3) * 90} className="h-full">
      {/* voucher: tinted ticket, poster art on the side, perforation, then price + action */}
      <article ref={ref} className="group relative flex h-full flex-col overflow-hidden rounded-[20px] p-3 transition-transform duration-300 hover:-translate-y-1 sm:rounded-[28px] sm:p-6" style={{ background: REWARD_TINTS[index % REWARD_TINTS.length] }}>
        <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-start">
          {product && (
            <ProductArt
              product={product}
              sizes="88px"
              className="h-[68px] w-[52px] sm:h-[112px] sm:w-[84px] shrink-0 -rotate-[5deg] rounded-2xl shadow-[var(--elev-4)] ring-4 ring-bg transition-transform duration-500 group-hover:rotate-0 group-hover:scale-105"
            />
          )}
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="font-display text-sm font-bold leading-5 text-fg sm:text-lg sm:leading-7">{reward.title}</h3>
            <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-fg/60 sm:mt-1.5 sm:line-clamp-none sm:text-[13px] sm:leading-6">{reward.body}</p>
          </div>
        </div>

        {/* perforation with side notches cut into the page background */}
        <div className="relative my-3 sm:my-5" aria-hidden="true">
          <span className="block border-t-2 border-dashed border-[#11231A]/30" />
          <span className="absolute -start-[22px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-bg sm:-start-9 sm:h-6 sm:w-6" />
          <span className="absolute -end-[22px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-bg sm:-end-9 sm:h-6 sm:w-6" />
        </div>

        {/* phones: price and a round action on one row (shorter card); sm+: price + labelled button */}
        <div className="mt-auto flex items-center justify-between gap-2 sm:gap-3">
          <p className="leading-tight">
            <span className="flex items-baseline gap-1">
              <span className="num font-display text-lg font-extrabold text-fg sm:text-2xl">{formatInt(reward.cost)}</span>
              <span className="text-xs font-medium text-fg/60 sm:text-sm">نقطة</span>
            </span>
          </p>
          {enough ? (
            <button type="button" aria-label={`استبدل ${reward.title}`} onClick={() => notify(`تم استبدال ${reward.title} (تجريبي)`)} className="btn btn-primary btn-sm !h-9 !w-9 shrink-0 !gap-0 !px-0 sm:!h-11 sm:!w-auto sm:!gap-2 sm:!px-5">
              <span className="hidden sm:inline">استبدل</span><Icon name="arrow-next" size={16} />
            </button>
          ) : (
            <span aria-label={`ينقصك ${reward.cost - points} نقطة`} className="inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-full bg-raised/80 px-2.5 sm:h-11 sm:gap-1.5 sm:px-4 text-[11px] font-semibold text-fg/60 sm:text-xs">
              <Icon name="lock" size={13} /><span className="hidden sm:inline">ينقصك</span> <span className="num text-fg">{formatInt(reward.cost - points)}</span>
            </span>
          )}
        </div>

        {!enough && (
          <div className="mt-3 h-1.5 overflow-hidden sm:mt-4 rounded-full bg-raised/80">
            <div className="h-full origin-right rounded-full bg-[image:var(--grad-accent)] transition-transform duration-1000 ease-out ltr:origin-left" style={{ transform: `scaleX(${on ? points / reward.cost : 0})` }} />
          </div>
        )}
      </article>
    </Reveal>
  );
}

/* ——————————————————————————— page ——————————————————————————— */

export default function LoyaltyPage() {
  usePageTitle(site.account.tabs[2].label);
  const { loyaltyPoints, profile, user } = useStore();
  const points = pointsOf(loyaltyPoints);
  const { current, next, toNext, remaining } = tierState(points);
  const firstName = (profile.name || user?.name || '').split(' ')[0];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-section">
      {/* ——— welcome ——— */}
      <section aria-labelledby="loy-title" className="acct-dark relative overflow-hidden rounded-[24px] border border-line [--c-raised:21_53_42] [--c-surface:14_42_30]">
        <div className="relative grid items-center gap-5 p-4 sm:gap-6 sm:p-10 lg:grid-cols-12 lg:gap-10 lg:p-12">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3.5 py-1.5 text-xs font-semibold text-fg shadow-[var(--elev-1)]">
              <Icon name="gift" size={14} className="text-accent" />برنامج الولاء
            </span>
            <h2 id="loy-title" className="mt-4 font-display text-2xl font-bold leading-9 text-fg sm:mt-5 sm:text-[2rem] sm:leading-[2.75rem] md:text-[2.75rem] md:leading-[3.5rem]">
              مرحبًا بعودتك{firstName && <>، <span className="text-gold-foil">{firstName}</span></>}
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-fg/60 sm:mt-3 sm:text-[15px] sm:leading-7">كل ريال تدفعه يرجع لك نقاط — جمّعها، اصعد المستويات، واستبدلها بشحن مجاني.</p>

            <dl className="mt-5 grid max-w-xl grid-cols-3 sm:mt-7 divide-x divide-x-reverse divide-line overflow-hidden rounded-2xl border border-line bg-white/[.02]">
              {[
                { icon: current.icon, label: 'مستواك', value: current.name },
                { icon: 'arrow-next', label: next ? `لمستوى ${next.name}` : 'المستوى', value: next ? `${formatInt(remaining)} نقطة` : 'الأعلى' },
                { icon: 'bolt', label: 'مضاعف النقاط', value: current.perks[0] },
              ].map((s) => (
                <div key={s.label} className="p-3 sm:p-4">
                  <dt className="flex items-center gap-1.5 text-[11px] text-fg/50"><Icon name={s.icon} size={13} className="text-accent" />{s.label}</dt>
                  <dd className="num mt-1 truncate text-sm font-bold text-fg sm:mt-1.5 sm:text-base">{s.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-8 sm:flex sm:flex-wrap sm:gap-3 max-sm:[&>a]:!px-2 max-sm:[&>a]:!text-[13px]">
              <a href="#earn" onClick={jumpTo('earn')} className="btn btn-primary">اكسب المزيد من النقاط<Icon name="arrow-next" size={18} /></a>
              <a href="#rewards" onClick={jumpTo('rewards')} className="btn btn-ghost">استبدل نقاطك</a>
            </div>
          </div>
          <div className="lg:col-span-5"><TierGauge points={points} tier={current} next={next} toNext={toNext} /></div>
        </div>
      </section>

      {/* ——— earn ——— */}
      <section id="earn" aria-labelledby="earn-title" className="scroll-mt-40">
        <SectionHead id="earn-title" title="اكسب نقاطك" />
        <ul className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          {EARN_WAYS.map((w, i) => <EarnRow key={w.id} way={w} index={i} />)}
        </ul>
      </section>

      {/* ——— tiers ——— */}
      <section aria-labelledby="tiers-title">
        <SectionHead id="tiers-title" title="مسار الصعود" />
        <TierPath points={points} />
      </section>

      {/* ——— rewards ——— */}
      <section id="rewards" aria-labelledby="rewards-title" className="scroll-mt-40">
        <SectionHead id="rewards-title" title="استبدل نقاطك" />
        <ul className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3 lg:gap-5">
          {REWARDS.map((r, i) => <RewardCard key={r.slug} reward={r} points={points} index={i} />)}
        </ul>
        <DemoNote className="mt-8">عرض تجريبي: الرصيد = رصيد ترحيبي + نقطة لكل ريال من الطلبات التجريبية. لا يتم استبدال أي مكافأة فعليًا.</DemoNote>
      </section>
    </div>
  );
}
