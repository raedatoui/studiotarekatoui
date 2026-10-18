import { normalizeChronology, normalizePublication, parseContentSnapshot } from '@tarek/content';
import type { Payload } from 'payload';
import type { Research } from '../payload-types';
import { serializeContent } from './serialize';

export class ContentExportError extends Error {}

/** Server-only entry point. Callers authenticate editors or hold local CMS credentials. */
export async function exportContent(payload: Payload) {
    const research: Research[] = [];
    let page = 1;
    while (true) {
        const result = await payload.find({
            collection: 'research',
            draft: false,
            where: { _status: { equals: 'published' } },
            overrideAccess: true,
            depth: 0,
            limit: 100,
            page,
            sort: 'id',
        });
        research.push(...result.docs);
        if (!result.hasNextPage) break;
        page += 1;
    }
    const [researchPage, about, contact, navigation, news, publications] = await Promise.all([
        payload.findGlobal({ slug: 'research-page', draft: false, depth: 0, overrideAccess: true }),
        payload.findGlobal({ slug: 'about', draft: false, depth: 0, overrideAccess: true }),
        payload.findGlobal({ slug: 'contact', draft: false, depth: 0, overrideAccess: true }),
        payload.findGlobal({ slug: 'navigation', draft: false, depth: 0, overrideAccess: true }),
        payload.findGlobal({ slug: 'news', draft: false, depth: 0, overrideAccess: true }),
        payload.find({
            collection: 'publications',
            draft: false,
            where: { _status: { equals: 'published' } },
            overrideAccess: true,
            depth: 0,
            pagination: false,
            sort: ['-year', 'title'],
        }),
    ]);
    for (const [name, doc] of Object.entries({ 'Research page': researchPage, About: about, Contact: contact, Navigation: navigation, News: news })) {
        if (doc._status !== 'published') throw new ContentExportError(`${name} has no published content. Publish it in the CMS before exporting.`);
    }
    try {
        const chronology = await payload.findGlobal({ slug: 'chronology', draft: false, depth: 0, overrideAccess: true });
        return parseContentSnapshot({
            ...serializeContent(research, researchPage, about, contact, navigation, news),
            publications: publications.docs.map(normalizePublication),
            ...(chronology._status === 'published' ? { chronology: normalizeChronology(chronology) } : {}),
        });
    } catch (error) {
        throw new ContentExportError(error instanceof Error ? error.message : 'Invalid content snapshot');
    }
}
