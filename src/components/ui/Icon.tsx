import type { SVGProps } from 'react';

/** Line icons on a 24px grid, 1.75 stroke. Directional icons are drawn for RTL
 *  ("arrow-next" points left, toward the reading direction). */
const paths: Record<string, JSX.Element> = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.6-3.6" /></>,
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" /></>,
  cart: <><path d="M3 4h2.2l2.1 11.1a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L20.6 8H6.1" /><circle cx="9.5" cy="20" r="1.3" /><circle cx="17" cy="20" r="1.3" /></>,
  bell: <><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15Z" /><path d="M10 20.5a2.2 2.2 0 0 0 4 0" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" /></>,
  heart: <path d="M12 20s-7.5-4.4-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.6 12 20 12 20Z" />,
  'arrow-next': <path d="M19 12H5m6-6-6 6 6 6" />,
  'arrow-prev': <path d="M5 12h14m-6-6 6 6-6 6" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  'chevron-next': <path d="m14 6-6 6 6 6" />,
  'chevron-prev': <path d="m10 6 6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  home: <><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1Z" /></>,
  grid: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></>,
  'eye-off': <><path d="M3 3l18 18M10.6 5.6A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3.1 3.9M6.4 6.5C3.9 8.2 2.5 12 2.5 12S6 18.5 12 18.5c1.8 0 3.3-.5 4.6-1.3" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2.5" /><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8" /></>,
  trash: <><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12.2A2 2 0 0 0 9 21h6a2 2 0 0 0 2-1.8L18 7M9 7V4.5h6V7" /></>,
  history: <><path d="M3.5 12a8.5 8.5 0 1 0 2.5-6L3.5 8.5" /><path d="M3.5 4v4.5H8M12 8v4.5l3 2" /></>,
  gift: <><rect x="3.5" y="8" width="17" height="4" rx="1" /><path d="M5 12v8h14v-8M12 8v12M12 8S10.5 3.5 8 4.2C6 4.8 7 8 12 8Zm0 0s1.5-4.5 4-3.8C18 4.8 17 8 12 8Z" /></>,
  crown: <path d="M3.5 8 8 12l4-6.5 4 6.5 4.5-4-1.8 10.5H5.3Z" />,
  logout: <><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" /><path d="M10 8l-4 4 4 4M6 12h10" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  bolt: <path d="M13 3 5 13.5h6L10 21l8-10.5h-6Z" />,
  shield: <><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6Z" /><path d="m9 12 2.2 2.2L15.5 10" /></>,
  phone: <><rect x="6.5" y="2.5" width="11" height="19" rx="2.5" /><path d="M10.5 18.5h3" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6.5 8.5 6.5 8.5-6.5" /></>,
  lock: <><rect x="4.5" y="10.5" width="15" height="10" rx="2" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>,
  key: <><circle cx="8" cy="15" r="4.5" /><path d="m11.2 11.8 8.3-8.3M16 7l2.5 2.5M18.5 4.5 21 7" /></>,
  sparkle: <path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7Z" />,
  star: <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8Z" />,
  edit: <><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16Z" /><path d="m13.5 6.5 4 4" /></>,
  receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z" /><path d="M9 8h6M9 12h6" /></>,
  send: <path d="M20.5 3.5 3.5 10.5l7 3 3 7Zm0 0-10 10" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.5v.5" /></>,
  gamepad: <><path d="M7.5 7h9a4.5 4.5 0 0 1 4.4 3.6l.9 4.6a2.4 2.4 0 0 1-4.1 2.1L15.6 15H8.4l-2.1 2.3a2.4 2.4 0 0 1-4.1-2.1l.9-4.6A4.5 4.5 0 0 1 7.5 7Z" /><path d="M8 9.5v3.5M6.25 11.25h3.5" /><circle cx="15.5" cy="10.5" r=".6" fill="currentColor" /><circle cx="17.3" cy="12.3" r=".6" fill="currentColor" /></>,
  trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0Z" /><path d="M8 5.5H5c0 3 1.5 4.5 3.2 4.6M16 5.5h3c0 3-1.5 4.5-3.2 4.6M12 13v3.5M8.5 20h7l-.8-3.5H9.3Z" /></>,
  store: <><path d="M4.5 10v9.5a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1V10" /><path d="M3.5 10 5.5 4h13l2 6c0 1.6-1.2 2.6-2.6 2.6S15.5 11.6 15.5 10c0 1.6-1.4 2.6-2.75 2.6h-1.5C9.9 12.6 8.5 11.6 8.5 10c0 1.6-1.2 2.6-2.5 2.6S3.5 11.6 3.5 10Z" /><path d="M10 20.5v-4.5h4v4.5" /></>,
  truck: <><path d="M3 6.5h11v10H3Z" /><path d="M14 9.5h4l3 3.5v3.5h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></>,
  tv: <><rect x="3" y="5" width="18" height="12" rx="2" /><path d="M9 21h6M12 17v4M10.5 9v4l3.5-2Z" /></>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M8.5 21h7" /></>,
  'id-card': <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2.2" /><path d="M5.8 16c.6-1.5 1.8-2.3 3.2-2.3s2.6.8 3.2 2.3M14.5 10h4M14.5 13.5h3" /></>,
};

export type IconName = keyof typeof paths;

export function Icon({ name, size = 22, strokeWidth = 1.75, ...rest }: { name: IconName | string; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...rest}>
      {paths[name] ?? null}
    </svg>
  );
}

export function GoogleMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2-1.9 3.2-4.7 3.2-8Z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.1a11 11 0 0 0 0 9.9Z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4Z" />
    </svg>
  );
}
