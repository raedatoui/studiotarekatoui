import rawSiteContent from './site-content.json';
import { type SiteContent, siteContentSchema } from './schema';

export const siteContent: SiteContent = siteContentSchema.parse(rawSiteContent);
