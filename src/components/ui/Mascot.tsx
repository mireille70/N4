import { cx } from '@/lib/format';

/**
 * KOON mascot — a glossy yellow round critter holding a game controller.
 * Pure SVG so it stays crisp at any size and costs no image download: layered
 * radial gradients give the 3D body, an edge-darkening overlay adds ambient
 * occlusion, and soft white ellipses give the specular highlights. Colours come
 * from the theme where it matters (accent / gold); the shading tones are fixed.
 */
export function Mascot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 420" className={cx('block h-auto w-full overflow-visible', className)} role="img" aria-label="تميمة KOON تحمل يد تحكم">
      <defs>
        {/* body: warm highlight top-left rolling to deep amber at the rim */}
        <radialGradient id="mk-body" cx="38%" cy="28%" r="78%">
          <stop offset="0" stopColor="#FFF6C2" />
          <stop offset=".28" style={{ stopColor: 'rgb(var(--c-accent))' }} />
          <stop offset=".72" style={{ stopColor: 'rgb(var(--c-gold))' }} />
          <stop offset="1" stopColor="#A86B00" />
        </radialGradient>
        {/* ambient occlusion: darkens the lower rim */}
        <radialGradient id="mk-ao" cx="50%" cy="22%" r="85%">
          <stop offset=".62" stopColor="#7A4A00" stopOpacity="0" />
          <stop offset="1" stopColor="#5C3600" stopOpacity=".55" />
        </radialGradient>
        <radialGradient id="mk-limb" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#FFF1A6" />
          <stop offset=".45" style={{ stopColor: 'rgb(var(--c-accent))' }} />
          <stop offset="1" stopColor="#B87A05" />
        </radialGradient>
        <linearGradient id="mk-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".95" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="mk-eye" cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#2A2A2A" />
          <stop offset="1" stopColor="#020202" />
        </radialGradient>
        <linearGradient id="mk-pad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#333" />
          <stop offset=".55" stopColor="#151515" />
          <stop offset="1" stopColor="#070707" />
        </linearGradient>
        <linearGradient id="mk-pad-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".28" />
          <stop offset=".4" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="mk-cheek" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#E88A0C" stopOpacity=".55" />
          <stop offset="1" stopColor="#E88A0C" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ears */}
      <g>
        <circle cx="116" cy="112" r="34" fill="url(#mk-limb)" />
        <circle cx="284" cy="112" r="34" fill="url(#mk-limb)" />
        <circle cx="116" cy="112" r="15" fill="#1A1A1A" opacity=".9" />
        <circle cx="284" cy="112" r="15" fill="#1A1A1A" opacity=".9" />
        <ellipse cx="106" cy="100" rx="9" ry="5" fill="#fff" opacity=".55" transform="rotate(-30 106 100)" />
        <ellipse cx="274" cy="100" rx="9" ry="5" fill="#fff" opacity=".45" transform="rotate(-30 274 100)" />
      </g>

      {/* feet */}
      <ellipse cx="150" cy="352" rx="40" ry="22" fill="url(#mk-limb)" />
      <ellipse cx="250" cy="352" rx="40" ry="22" fill="url(#mk-limb)" />

      {/* body */}
      <ellipse cx="200" cy="222" rx="140" ry="134" fill="url(#mk-body)" />
      <ellipse cx="200" cy="222" rx="140" ry="134" fill="url(#mk-ao)" />
      {/* rim light along the lower right edge */}
      <path d="M318 270c-18 44-62 76-118 82" fill="none" stroke="#FFE98A" strokeOpacity=".55" strokeWidth="3" strokeLinecap="round" />
      {/* specular highlights */}
      <ellipse cx="146" cy="138" rx="52" ry="30" fill="url(#mk-shine)" opacity=".85" transform="rotate(-28 146 138)" />
      <circle cx="232" cy="118" r="7" fill="#fff" opacity=".7" />

      {/* face */}
      <ellipse cx="128" cy="236" rx="22" ry="13" fill="url(#mk-cheek)" />
      <ellipse cx="272" cy="236" rx="22" ry="13" fill="url(#mk-cheek)" />
      <ellipse cx="166" cy="200" rx="16" ry="23" fill="url(#mk-eye)" />
      <ellipse cx="234" cy="200" rx="16" ry="23" fill="url(#mk-eye)" />
      <circle cx="160" cy="191" r="5.5" fill="#fff" />
      <circle cx="228" cy="191" r="5.5" fill="#fff" />
      <circle cx="171" cy="210" r="2.2" fill="#fff" opacity=".8" />
      <circle cx="239" cy="210" r="2.2" fill="#fff" opacity=".8" />
      <path d="M186 236q14 14 28 0" fill="none" stroke="#1A1A1A" strokeWidth="5.5" strokeLinecap="round" />

      {/* controller */}
      <g>
        <path
          d="M118 286c0-16 13-26 29-26h106c16 0 29 10 29 26l13 46c5 19-8 34-25 32-12-1-19-9-27-20h-86c-8 11-15 19-27 20-17 2-30-13-25-32Z"
          fill="url(#mk-pad)"
        />
        <path
          d="M118 286c0-16 13-26 29-26h106c16 0 29 10 29 26l13 46c5 19-8 34-25 32-12-1-19-9-27-20h-86c-8 11-15 19-27 20-17 2-30-13-25-32Z"
          fill="url(#mk-pad-edge)"
        />
        {/* d-pad */}
        <rect x="140" y="292" width="30" height="9" rx="2.5" fill="#3B3B3B" />
        <rect x="150.5" y="281.5" width="9" height="30" rx="2.5" fill="#3B3B3B" />
        {/* face buttons — one picks up the accent */}
        <circle cx="250" cy="284" r="6" fill="#3B3B3B" />
        <circle cx="263" cy="297" r="6" style={{ fill: 'rgb(var(--c-accent))' }} />
        <circle cx="237" cy="297" r="6" fill="#3B3B3B" />
        <circle cx="250" cy="310" r="6" fill="#3B3B3B" />
        {/* sticks */}
        <circle cx="181" cy="322" r="11" fill="#0C0C0C" stroke="#3B3B3B" strokeWidth="3" />
        <circle cx="219" cy="322" r="11" fill="#0C0C0C" stroke="#3B3B3B" strokeWidth="3" />
        <path d="M160 268h80" stroke="#fff" strokeOpacity=".16" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* hands gripping the controller */}
      <circle cx="118" cy="304" r="25" fill="url(#mk-limb)" />
      <circle cx="282" cy="304" r="25" fill="url(#mk-limb)" />
      <ellipse cx="110" cy="294" rx="8" ry="5" fill="#fff" opacity=".5" transform="rotate(-30 110 294)" />
      <ellipse cx="274" cy="294" rx="8" ry="5" fill="#fff" opacity=".4" transform="rotate(-30 274 294)" />
    </svg>
  );
}
