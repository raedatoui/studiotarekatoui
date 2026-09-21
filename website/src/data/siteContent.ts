import { type SiteContent, siteContentSchema, type Theme } from './schema';
import rawSiteContent from './site-content.json';

export const siteContent: SiteContent = siteContentSchema.parse(rawSiteContent);

export function getTheme(id: string): Theme | undefined {
    return siteContent.themes.find((theme) => theme.id === id);
}
