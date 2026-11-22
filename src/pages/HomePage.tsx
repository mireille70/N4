import { homeSections } from '@/content/home';
import { SectionRenderer } from '@/sections/registry';
import { usePageTitle } from '@/lib/usePageTitle';

/** The homepage is a straight run of section blocks on the matte page (see content/home.ts). */
export default function HomePage() {
  usePageTitle();
  return <SectionRenderer blocks={homeSections} />;
}
