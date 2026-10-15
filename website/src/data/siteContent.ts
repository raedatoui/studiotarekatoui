import { parseContentSnapshot, type Research } from '@tarek/content';
import { showChronology } from '@/config/site';
import rawSiteContent from './generated/content.json';

const snapshot = parseContentSnapshot(rawSiteContent);
// Exclude staging editorial content from the production client provider as well as its route.
export const siteContent = { ...snapshot, chronology: showChronology ? snapshot.chronology : undefined };

export function getResearch(slug: string): Research | undefined {
    return siteContent.research.find((research) => research.slug === slug);
}
