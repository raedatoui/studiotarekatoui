import {
    normalizeAbout, normalizeContact, normalizeNavigation, normalizeNews, normalizeResearch, normalizeResearchPage, SCHEMA_VERSION,
} from '@tarek/content';
import type { About, Contact, Navigation, News, Research, ResearchPage } from '../payload-types';

export function serializeResearch(doc: Research) {
    return { ...normalizeResearch(doc), id: doc.id, yearStart: doc.yearStart };
}

export function serializeContent(research: Research[], researchPage: ResearchPage, about: About, contact: Contact, navigation: Navigation, news: News) {
    return {
        schemaVersion: SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        navigation: normalizeNavigation(navigation),
        news: normalizeNews(news),
        research: research.map(serializeResearch).sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug, 'en')),
        researchPage: normalizeResearchPage(researchPage),
        about: normalizeAbout(about),
        contact: normalizeContact(contact),
    };
}
