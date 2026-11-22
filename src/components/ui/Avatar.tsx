import imageManifest from '@/content/image-manifest.json';
import { cx } from '@/lib/format';

// First avatar produced by `npm run images` (assets-src/avatars), else the bundled one
const avatarSrc = Object.values(imageManifest.avatars as Record<string, string>)[0] ?? '/assets/avatars/fox.webp';

/** avatar rings: ember · amber · copper · burnt · graphite · bone */
export const avatarTints = ['#3FD8C0', '#8BEBDA', '#17806F', '#2BB9A1', '#1E4638', '#E8E2DA'];

export function Avatar({ index, size = 'md', className }: { index: number; size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const dims = { xs: 'h-8 w-8', sm: 'h-12 w-12', md: 'h-16 w-16', lg: 'h-24 w-24', xl: 'h-40 w-40 md:h-48 md:w-48' }[size];
  return (
    <span className={cx('relative inline-block shrink-0 overflow-hidden rounded-full', dims, className)} style={{ background: avatarTints[index % avatarTints.length] }}>
      <img src={avatarSrc} alt="" className="absolute inset-[8%] h-[84%] w-[84%] rounded-full object-cover" />
    </span>
  );
}
