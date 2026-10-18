import { chronologySchema } from '@tarek/content';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { localPayload } from './local-payload';

try {
    const { values, positionals } = parseArgs({
        options: { apply: { type: 'boolean', default: false }, publish: { type: 'boolean', default: false } },
        allowPositionals: true,
    });
    if (positionals.length !== 1 || (values.publish && !values.apply)) {
        throw new Error('Usage: pnpm content:import:chronology <chronology.json> [--apply [--publish]]');
    }
    const { editorialNotes, ...input } = JSON.parse(await readFile(positionals[0], 'utf8'));
    const chronology = chronologySchema.parse(input);
    console.log(`Import ${chronology.projects.length} chronology entries from ${path.resolve(positionals[0])}`);
    if (values.apply) {
        const payload = await localPayload();
        try {
            const [published, latest] = await Promise.all([
                payload.findGlobal({ slug: 'chronology', draft: false, depth: 0, overrideAccess: true }),
                payload.findGlobal({ slug: 'chronology', draft: true, depth: 0, overrideAccess: true }),
            ]);
            const backupDir = path.join(homedir(), 'tmp', `tarek-chronology-import-${new Date().toISOString().replace(/[:.]/g, '-')}`);
            await mkdir(backupDir, { recursive: true, mode: 0o700 });
            await writeFile(path.join(backupDir, 'before.json'), JSON.stringify({ published, latest }, null, 2), { mode: 0o600, flag: 'wx' });
            console.log(`Pre-import backup: ${backupDir}`);
            const status = values.publish ? 'published' : 'draft';
            const previousIDs = new Map((latest.projects ?? []).map((project) => [project.projectId, project.id]));
            await payload.updateGlobal({
                slug: 'chronology',
                draft: !values.publish,
                overrideAccess: true,
                data: {
                    ...chronology,
                    editorialNotes: typeof editorialNotes === 'string' ? editorialNotes : latest.editorialNotes,
                    projects: chronology.projects.map(({ id, ...project }) => ({ ...project, projectId: id, id: previousIDs.get(id) })),
                    _status: status,
                },
            });
            console.log(`Saved Chronology as ${status} in Firestore. No application was deployed.`);
        } finally {
            await payload.destroy();
        }
    } else {
        console.log('Dry run. Use --apply to save a draft; add --publish to make it available to the staging snapshot.');
    }
} catch (error) {
    console.error(error instanceof Error ? error.message : 'Chronology import failed');
    process.exitCode = 1;
}

process.exit(process.exitCode ?? 0);
