import { parseContentSnapshot, type Research } from '@tarek/content';
import rawSiteContent from './generated/content.json';

export const siteContent = parseContentSnapshot(rawSiteContent);

export function getResearch(slug: string): Research | undefined {
    return siteContent.research.find((research) => research.slug === slug);
}
