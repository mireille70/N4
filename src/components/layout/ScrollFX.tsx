import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const motionAllowed = () =>
  typeof window !== 'undefined' &&
  !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches &&
  document.documentElement.dataset.motion !== 'off';

/**
 * Site-wide scroll animation (works in every browser):
 *  - every top-level <section> in <main> rises and fades in as it scrolls into view, its
 *    HUD heading slides in after it, and its grid/list items cascade in one by one;
 *  - a thin progress line along the top of the page tracks how far you have scrolled.
 * New sections (lazy pages, route changes) are picked up automatically.
 */
export function ScrollFX() {
  const { pathname } = useLocation();
  const barRef = useRef<HTMLDivElement>(null);

  // reveal-on-scroll
  useEffect(() => {
    const main = document.getElementById('main');
    if (!main || !motionAllowed() || typeof IntersectionObserver === 'undefined') return;

    // plays every time, in both scroll directions:
    //  - enter: once the section is 10% into the viewport it animates in;
    //  - leave: only when it is fully off screen it resets, remembering which edge it left by,
    //    so scrolling back up makes it drop in from the top instead of rising from below.
    const enter = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('sfx-in'); }),
      { rootMargin: '0px 0px -10% 0px', threshold: 0 },
    );
    const leave = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) return;
        (e.target as HTMLElement).dataset.sfxFrom = e.boundingClientRect.top < 0 ? 'top' : 'bottom';
        e.target.classList.remove('sfx-in');
      }),
      { threshold: 0 },
    );
    const io = { observe: (el: Element) => { enter.observe(el); leave.observe(el); }, disconnect: () => { enter.disconnect(); leave.disconnect(); } };

    // observe every outermost section once per effect run. (Don't skip already-marked ones:
    // a re-run — React StrictMode, route change — must re-attach the new observers or the
    // sections would stay hidden.)
    const seen = new WeakSet<Element>();
    const scan = () => {
      main.querySelectorAll<HTMLElement>('section').forEach((el) => {
        if (seen.has(el) || el.parentElement?.closest('section')) return; // only outermost sections
        seen.add(el);
        el.setAttribute('data-sfx', '');
        // cascade the items of the section's grids / lists
        el.querySelectorAll<HTMLElement>('.grid-products > *, ul.grid > li, ol.grid > li').forEach((item, i) => {
          if (!item.classList.contains('reveal')) item.style.setProperty('--sfx-i', String(Math.min(i, 8)));
          item.setAttribute('data-sfx-item', '');
        });
        io.observe(el);
      });
    };
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(main, { childList: true, subtree: true });
    return () => { mo.disconnect(); io.disconnect(); };
  }, [pathname]);

  // scroll progress line
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      barRef.current?.style.setProperty('transform', `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, [pathname]);

  return <div ref={barRef} className="sfx-progress pointer-events-none fixed inset-x-0 top-0 z-[70] h-[2px] origin-right bg-accent ltr:origin-left" style={{ transform: 'scaleX(0)' }} aria-hidden="true" />;
}
