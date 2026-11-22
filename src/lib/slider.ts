/**
 * Home rows that swipe sideways (snap) on phones and tablets and settle into a plain grid on
 * desktop. Add the column count yourself, e.g. cx(SLIDER, 'lg:grid-cols-6'), and SLIDE on each item.
 * The vertical padding keeps hover lifts and glows from being clipped by the scroll container.
 */
export const SLIDER =
  'no-scrollbar -mx-gutter flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-gutter px-gutter py-3 ' +
  'lg:mx-0 lg:grid lg:gap-4 lg:overflow-visible lg:px-0 lg:py-0';

/** 200px = one of six columns on desktop ((1280 − 5 × 16) / 6), so tiles keep their desktop size */
export const SLIDE = 'w-[200px] shrink-0 snap-start lg:w-auto';
