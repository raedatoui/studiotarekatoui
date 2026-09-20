import rawSiteContent from './site-content.json';
import { type SiteContent, siteContentSchema, type Theme } from './schema';

export const siteContent: SiteContent = siteContentSchema.parse(rawSiteContent);

export function getTheme(id: string): Theme | undefined {
    return siteContent.themes.find((theme) => theme.id === id);
}
