import type { MetadataRoute } from 'next';
import { site } from '@/config/site';
import { siteContent } from '@/data/siteContent';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
    return ['/', '/research', '/about', '/contact', ...siteContent.research.map((research) => `/research/${research.slug}`)]
        .map((pathname) => ({ url: `${site.url}${pathname}` }));
}
