import { parseContentSnapshot, type Research as SnapshotResearch } from '@tarek/content';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { parseArgs } from 'node:util';
import type { Payload } from 'payload';
import type { Research } from '../src/payload-types';
import { localPayload } from './local-payload';

async function readResearch(payload: Payload, draft: boolean) {
    const docs: Research[] = [];
    let page = 1;
    while (true) {
        const result = await payload.find({ collection: 'research', draft, depth: 0, overrideAccess: true, limit: 100, page, sort: 'id' });
        docs.push(...result.docs);
        if (!result.hasNextPage) return docs;
        page += 1;
    }
}

function researchData(doc: SnapshotResearch) {
    return {
        title: doc.title, slug: doc.slug, subtitle: doc.subtitle ?? null, summary: doc.summary,
        description: doc.description.map((text) => ({ text })),
        yearStart: doc.yearStart, yearEnd: doc.yearEnd ?? null, ongoing: doc.ongoing, yearsDisplay: doc.yearsDisplay,
        sortOrder: doc.sortOrder, heroImageURL: doc.heroImageURL ?? null,
        collaborators: doc.collaborators, organizations: doc.organizations, materials: doc.materials,
        instances: doc.instances.map((item) => ({
            ...item, slug: item.slug ?? null, title: item.title ?? null, city: item.city ?? null, country: item.country ?? null,
            dateStart: item.dateStart ?? null, status: item.status ?? null, url: item.url ?? null,
        })),
        gallery: doc.gallery,
        press: doc.press.map((item) => ({ ...item, publisher: item.publisher ?? null })),
        _status: 'draft' as const,
    };
}

async function importContent() {
    const { values, positionals } = parseArgs({ options: { apply: { type: 'boolean', default: false } }, allowPositionals: true });
    if (positionals.length !== 1) throw new Error('Usage: pnpm content:import <file> [--apply]');
    // Validate every document before opening a database connection or making any writes.
    const snapshot = parseContentSnapshot(JSON.parse(await readFile(positionals[0], 'utf8')));
    const payload = await localPayload();
    try {
        const existing = await readResearch(payload, true);
        const byID = new Map(existing.map((doc) => [doc.id, doc]));
        const bySlug = new Map<string, Research>();
        for (const doc of existing) {
            if (bySlug.has(doc.slug)) throw new Error(`Existing research has conflicting slug “${doc.slug}”; resolve it before importing.`);
            bySlug.set(doc.slug, doc);
        }
        const targets = new Set<string>();
        const plan = snapshot.research.map((doc) => {
            const idMatch = byID.get(doc.id);
            const slugMatch = bySlug.get(doc.slug);
            if (idMatch && slugMatch && idMatch.id !== slugMatch.id) throw new Error(`Identity conflict for “${doc.slug}”: ID and slug match different documents.`);
            const target = idMatch ?? slugMatch;
            if (target && targets.has(target.id)) throw new Error(`Multiple input documents target “${target.slug}”.`);
            if (target) targets.add(target.id);
            return { doc, target, match: idMatch ? 'ID' : slugMatch ? 'slug' : 'new' };
        });
        for (const item of plan) console.log(`${item.target ? 'UPDATE' : 'CREATE'} research/${item.doc.slug} (${item.match}) as draft`);
        console.log('UPDATE research-page, about, contact, navigation as drafts. Absent research documents are retained.');
        if (!values.apply) {
            console.log('Dry run: no content was written. Use --apply to import.');
            return;
        }

        // Private recovery data includes both the current published records and latest drafts.
        const globals = {};
        for (const slug of ['research-page', 'about', 'contact', 'navigation'] as const) {
            Object.assign(globals, { [slug]: {
                published: await payload.findGlobal({ slug, draft: false, depth: 0, overrideAccess: true }),
                latest: await payload.findGlobal({ slug, draft: true, depth: 0, overrideAccess: true }),
            } });
        }
        const backupDir = path.join(homedir(), 'tmp', `tarek-content-import-${new Date().toISOString().replace(/[:.]/g, '-')}`);
        await mkdir(backupDir, { recursive: true, mode: 0o700 });
        await writeFile(path.join(backupDir, 'before.json'), JSON.stringify({
            exportedAt: new Date().toISOString(), research: { published: await readResearch(payload, false), latest: existing }, globals,
        }, null, 2), { mode: 0o600, flag: 'wx' });
        const completed: string[] = [];
        const progressFile = path.join(backupDir, 'progress.json');
        async function record(step: string) {
            completed.push(step);
            await writeFile(progressFile, JSON.stringify({ input: path.resolve(positionals[0]), completed }, null, 2), { mode: 0o600 });
            console.log(`Imported ${step}`);
        }
        console.log(`Pre-import backup: ${backupDir}`);
        try {
            for (const { doc, target } of plan) {
                const data = researchData(doc);
                if (target) {
                    await payload.update({ collection: 'research', id: target.id, data, draft: true, overrideAccess: true, overrideLock: false });
                } else {
                    // New target IDs are generated by Payload; subsequent runs match the unique slug.
                    await payload.create({ collection: 'research', data, draft: true, overrideAccess: true });
                }
                await record(`research/${doc.slug}`);
            }
            await payload.updateGlobal({ slug: 'research-page', data: { ...snapshot.researchPage, _status: 'draft' }, draft: true, overrideAccess: true });
            await record('research-page');
            await payload.updateGlobal({ slug: 'about', data: { ...snapshot.about, portraitURL: snapshot.about.portraitURL ?? null, _status: 'draft' }, draft: true, overrideAccess: true });
            await record('about');
            await payload.updateGlobal({ slug: 'contact', data: { ...snapshot.contact, _status: 'draft' }, draft: true, overrideAccess: true });
            await record('contact');
            await payload.updateGlobal({ slug: 'navigation', data: { ...snapshot.navigation, _status: 'draft' }, draft: true, overrideAccess: true });
            await record('navigation');
        } catch (error) {
            throw new Error(`Import stopped after ${completed.length} recorded operations; changes are not rolled back. Backup/progress: ${backupDir}. Resolve the error and rerun; ID/slug matching avoids duplicate records. ${error instanceof Error ? error.message : ''}`);
        }
        console.log('Import complete. Review and publish the drafts in the CMS before exporting.');
    } finally {
        await payload.destroy();
    }
}

try {
    await importContent();
} catch (error) {
    console.error(error instanceof Error ? error.message : 'Content import failed');
    process.exitCode = 1;
}
