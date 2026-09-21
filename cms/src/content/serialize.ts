import {
    normalizeAbout, normalizeContact, normalizeNavigation, normalizeResearch, normalizeResearchPage, SCHEMA_VERSION,
} from '@tarek/content';
import type { About, Contact, Navigation, Research, ResearchPage } from '../payload-types';

export function serializeResearch(doc: Research) {
    return { ...normalizeResearch(doc), id: doc.id, yearStart: doc.yearStart };
}

export function serializeContent(research: Research[], researchPage: ResearchPage, about: About, contact: Contact, navigation: Navigation) {
    return {
        schemaVersion: SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        navigation: normalizeNavigation(navigation),
        research: research.map(serializeResearch).sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug, 'en')),
        researchPage: normalizeResearchPage(researchPage),
        about: normalizeAbout(about),
        contact: normalizeContact(contact),
    };
}
