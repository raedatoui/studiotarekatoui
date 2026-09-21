import type { MetadataRoute } from 'next';
import { isStaging, site } from '@/config/site';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: isStaging ? { userAgent: '*', disallow: '/' } : { userAgent: '*', allow: '/' },
        ...(isStaging ? {} : { sitemap: `${site.url}/sitemap.xml` }),
    };
}
