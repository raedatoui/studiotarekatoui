import {
    normalizeAbout,
    normalizeContact,
    normalizeNavigation,
    normalizeNews,
    normalizeResearch,
    normalizeResearchPage,
    SCHEMA_VERSION,
} from '@tarek/content';
import type { About, Contact, Navigation, News, Research, ResearchPage } from '../payload-types';

export function serializeResearch(doc: Research) {
    return { ...normalizeResearch(doc), id: doc.id, yearStart: doc.yearStart };
}

export function serializeContent(
    research: Research[],
    researchPage: ResearchPage,
    about: About,
    contact: Contact,
    navigation: Navigation,
    news: News
) {
    return {
        schemaVersion: SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        navigation: normalizeNavigation(navigation),
        news: normalizeNews(news),
        research: [...research]
            .sort((a, b) => {
                const aOrder = a._order ?? '';
                const bOrder = b._order ?? '';
                // Fractional keys are case-sensitive; localeCompare would change their order.
                if (aOrder !== bOrder) return aOrder < bOrder ? -1 : 1;
                return (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.slug.localeCompare(b.slug, 'en');
            })
            .map((doc, sortOrder) => ({ ...serializeResearch(doc), sortOrder })),
        researchPage: normalizeResearchPage(researchPage),
        about: normalizeAbout(about),
        contact: normalizeContact(contact),
    };
}
