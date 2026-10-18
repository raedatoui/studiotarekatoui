import type { MetadataRoute } from 'next';
import { site } from '@/config/site';
import { siteContent } from '@/data/siteContent';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
    const researchPaths = ['/research', ...siteContent.research.map((research) => `/research/${research.slug}`)];
    return ['/', '/news', '/about', '/publications', '/contact', ...researchPaths]
        .map((pathname) => ({ url: `${site.url}${pathname}` }));
}
