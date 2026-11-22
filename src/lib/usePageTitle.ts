import { useEffect } from 'react';
import { site } from '@/content/site';

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${site.brand.name}` : `${site.brand.name} — ${site.brand.tagline}`;
  }, [title]);
}
