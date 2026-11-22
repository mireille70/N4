import { siApple, siEpicgames, siGoogleplay, siItunes, siPlaystation, siSteam } from 'simple-icons';

// Xbox is not distributed by simple-icons; this is a simplified sphere mark.
const xboxPath =
  'M12 2a10 10 0 0 1 6.1 2.1C16.3 3.6 14 4.9 12 6.6 10 4.9 7.7 3.6 5.9 4.1A10 10 0 0 1 12 2Zm-7.6 3.5c1.7-.3 4.3 1.6 6.3 3.6-2.7 2.6-6 6.7-6.4 9.6A10 10 0 0 1 4.4 5.5Zm15.2 0a10 10 0 0 1 .1 13.2c-.4-2.9-3.7-7-6.4-9.6 2-2 4.6-3.9 6.3-3.6ZM12 11.2c2.3 2 5.3 5.5 5.9 8.5A10 10 0 0 1 12 22a10 10 0 0 1-5.9-2.3c.6-3 3.6-6.5 5.9-8.5Z';

const glyphs: Record<string, string> = {
  xbox: xboxPath,
  playstation: siPlaystation.path,
  steam: siSteam.path,
  googleplay: siGoogleplay.path,
  epicgames: siEpicgames.path,
  itunes: siItunes.path,
  apple: siApple.path,
};

export function BrandGlyph({ id, size = 32, className }: { id: string; size?: number; className?: string }) {
  const d = glyphs[id];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d={d} />
    </svg>
  );
}
