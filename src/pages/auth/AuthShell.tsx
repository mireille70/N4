import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { site } from '@/content/site';
import { Logo } from '@/components/ui/Logo';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/format';

export type CardState = 'login' | 'register' | 'forgot' | 'verify' | 'reset';

/**
 * Authentication concept — "card activation".
 * The art stage holds one membership card whose face changes with each step
 * (identity → verification → protection), so the whole flow reads as
 * activating your card. The form sits on a light paper surface.
 */
export function AuthShell({ step, state, filled = 0, strength = 0, title, subtitle, children }: {
  step: number; state: CardState; filled?: number; strength?: number; title: string; subtitle?: string; children: ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-bg lg:grid lg:grid-cols-2">
      {/* ——— Stage ——— */}
      <aside className="scope-dark grad-hero relative overflow-hidden lg:order-2 lg:min-h-[100dvh]">
        <PosterWall />

        <div className="relative flex h-full flex-col px-5 pb-10 pt-5 lg:p-12">
          <div className="flex items-center justify-between">
            <Logo />
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg">
              <Icon name="arrow-prev" size={18} />
              <span className="max-sm:sr-only">الرئيسية</span>
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center py-6 lg:py-0">
            <StatusPanel state={state} filled={filled} strength={strength} />
          </div>

          {/* step tracker */}
          <ol className="mx-auto grid w-full max-w-md grid-cols-3 gap-3 max-lg:hidden" aria-label="خطوات الحساب">
            {site.auth.steps.map((s, i) => (
              <li key={s} aria-current={i === step ? 'step' : undefined}>
                <span className={cx('block h-[3px] rounded-full transition-colors duration-slow', i <= step ? 'bg-accent' : 'bg-line')} />
                <span className={cx('mt-3 flex items-center gap-2 text-sm', i === step ? 'text-fg' : 'text-muted')}>
                  <span className="num font-mono text-[.7rem]">{String(i + 1).padStart(2, '0')}</span>{s}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </aside>

      {/* ——— Paper form side ——— */}
      <main id="main" className="on-paper scope-paper relative z-10 -mt-6 rounded-t-[28px] bg-paper text-ink lg:order-1 lg:mt-0 lg:flex lg:min-h-[100dvh] lg:items-center lg:rounded-none">
        <div className="mx-auto w-full max-w-[460px] px-5 pb-14 pt-9 sm:px-8 lg:py-16">
          <p className="num font-mono text-[.7rem] tracking-[.14em] text-ink/65" dir="ltr">
            STEP {String(step + 1).padStart(2, '0')} / {String(site.auth.steps.length).padStart(2, '0')}
          </p>
          <h1 className="mt-3 text-[2rem] font-bold leading-tight md:text-[2.6rem]">{title}</h1>
          {subtitle && <p className="mt-3 text-[.95rem] leading-7 text-ink/60">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}

const POSTERS = ['valorant', 'pubg', 'free-fire', 'call-of-duty', 'fortnite', 'genshin-impact', 'roblox', 'mobile-legends', 'lords-mobile', 'yalla-ludo'];
const COLUMNS = [POSTERS.slice(0, 4), POSTERS.slice(4, 7).concat(POSTERS[0]), POSTERS.slice(7).concat(POSTERS.slice(1, 3))];

/**
 * Backdrop: three tilted columns of game posters drifting up / down, dimmed and vignetted
 * so the status panel on top stays the focus. Each column is its list twice, so -50% loops seamlessly.
 */
function PosterWall() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute left-1/2 top-1/2 grid w-[130%] -translate-x-1/2 -translate-y-1/2 -rotate-[8deg] grid-cols-3 gap-4 opacity-[.35]">
        {COLUMNS.map((col, c) => (
          <div key={c} className="h-[150vh] overflow-hidden">
            <div className={cx('flex flex-col gap-4', c === 1 ? 'wall-down' : 'wall-up')} style={{ animationDuration: `${60 + c * 12}s` }}>
              {[...col, ...col].map((slug, i) => (
                <img key={i} src={`/assets/products/${slug}.webp`} alt="" draggable={false} loading="lazy" className="aspect-[4/5] w-full rounded-2xl object-cover object-top" />
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* dim + vignette + ember glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(12_13_16/.55),#010604_75%)]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#010604] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#010604] to-transparent" />
      <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[.10] blur-[110px]" />
    </div>
  );
}

const PANEL: Record<CardState, { icon: string; kicker: string; title: string }> = {
  login: { icon: 'user', kicker: 'مرحبًا بعودتك', title: 'ادخل وكمّل شحنك' },
  register: { icon: 'sparkle', kicker: 'حساب جديد', title: 'انضم لمجتمع اللاعبين' },
  verify: { icon: 'shield', kicker: 'التحقق', title: 'أدخل الرمز المرسل لجوالك' },
  forgot: { icon: 'key', kicker: 'استعادة الوصول', title: 'نرجّع لك حسابك بخطوة' },
  reset: { icon: 'lock', kicker: 'الحماية', title: 'اختر كلمة مرور قوية' },
};

/** Glass panel over the poster wall — its icon, copy and live widget follow the current step */
function StatusPanel({ state, filled, strength }: { state: CardState; filled: number; strength: number }) {
  const p = PANEL[state];
  return (
    <div className="relative w-[min(86vw,360px)] rounded-[28px] border border-white/10 bg-[#030C08]/70 p-6 shadow-[0_40px_80px_-30px_rgb(0_0_0/.9)] backdrop-blur-xl lg:w-[min(34vw,400px)] lg:p-7" aria-hidden="true">
      <span className="absolute inset-x-10 -top-px h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
      <span key={state} className="grid h-12 w-12 place-items-center rounded-2xl border border-accent/25 bg-accent/10 text-accent [animation:rise_.5s_var(--ease-enter)_both]">
        <Icon name={p.icon} size={22} />
      </span>
      <p className="mt-5 text-xs font-semibold text-accent">{p.kicker}</p>
      <p className="mt-1.5 text-xl font-bold leading-8 text-fg">{p.title}</p>

      <div className="mt-6 rounded-2xl border border-white/[.06] bg-black/30 p-4" dir="ltr">
        {state === 'login' && (
          <p className="num flex items-center gap-3 font-mono text-base tracking-[.18em] text-fg/80">
            <Icon name="phone" size={16} className="text-accent" />+966 •• ••• ••••
          </p>
        )}
        {state === 'register' && (
          <div className="space-y-2.5"><span className="block h-2 w-3/5 rounded-full bg-fg/25" /><span className="block h-2 w-2/5 rounded-full bg-fg/15" /></div>
        )}
        {state === 'verify' && (
          <div className="flex justify-between gap-2">
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i} className={cx('aspect-[3/4] flex-1 rounded-lg transition-colors duration-slow', i < filled ? 'bg-accent' : 'bg-fg/10 ring-1 ring-inset ring-fg/15')} />
            ))}
          </div>
        )}
        {state === 'forgot' && (
          <div className="flex items-center gap-3 text-sm text-fg/60"><Icon name="key" size={18} className="text-accent" /><span className="h-2 flex-1 rounded-full bg-fg/15" /></div>
        )}
        {state === 'reset' && (
          <div className="flex items-center gap-3">
            <Icon name={strength >= 3 ? 'shield' : 'lock'} size={20} className={strength >= 3 ? 'text-accent' : 'text-fg/60'} />
            <div className="flex flex-1 gap-1.5">
              {[0, 1, 2, 3].map((i) => <span key={i} className={cx('h-1.5 flex-1 rounded-full transition-colors duration-slow', i < strength ? 'bg-accent' : 'bg-fg/15')} />)}
            </div>
          </div>
        )}
      </div>

      <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-fg/55">
        {['تسليم فوري', 'دفع آمن', '+50 لعبة ومنصة'].map((t) => (
          <li key={t} className="flex items-center gap-1.5"><Icon name="check" size={13} className="text-accent" />{t}</li>
        ))}
      </ul>
    </div>
  );
}

/** Shared bits used by the auth forms */
export function OrDivider({ label }: { label: string }) {
  return (
    <div className="my-7 flex items-center gap-4 text-sm text-ink/65">
      <span className="h-px flex-1 bg-ink/15" />{label}<span className="h-px flex-1 bg-ink/15" />
    </div>
  );
}
