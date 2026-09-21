import { newsSchema } from '@tarek/content';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { localPayload } from './local-payload';

/** The old JSON contains literal Unicode escape sequences in editorial strings. */
function decodeLegacyText(value: unknown): unknown {
    if (typeof value === 'string') return value.replace(/\\u([0-9a-f]{4})/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)));
    if (Array.isArray(value)) return value.map(decodeLegacyText);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, decodeLegacyText(item)]));
    return value;
}

// Explicit one-time conversion from the old website; public exports still require the current contract.
const legacyExhibition = newsSchema.shape.solo.element.extend({
    subExhibitions: newsSchema.shape.solo.element.shape.subExhibitions.default([]),
});
const legacyNews = newsSchema.extend({
    soloHeading: newsSchema.shape.soloHeading.default('Exhibitions'),
    groupHeading: newsSchema.shape.groupHeading.default('Group exhibitions'),
    solo: legacyExhibition.array(), group: legacyExhibition.array(),
});

try {
    const { values, positionals } = parseArgs({ options: { apply: { type: 'boolean', default: false } }, allowPositionals: true });
    if (positionals.length !== 1) throw new Error('Usage: pnpm content:import:news <old-site-content.json> [--apply]');
    const source = JSON.parse(await readFile(positionals[0], 'utf8'));
    const news = legacyNews.parse(decodeLegacyText(source.news));
    console.log(`Recovered ${news.solo.length} exhibitions and ${news.group.length} group exhibitions from ${path.resolve(positionals[0])}`);
    if (values.apply) {
        const payload = await localPayload();
        try {
            const [latestNews, publishedNews, navigation, publishedNavigation] = await Promise.all([
                payload.findGlobal({ slug: 'news', draft: true, depth: 0, overrideAccess: true }),
                payload.findGlobal({ slug: 'news', draft: false, depth: 0, overrideAccess: true }),
                payload.findGlobal({ slug: 'navigation', draft: true, depth: 0, overrideAccess: true }),
                payload.findGlobal({ slug: 'navigation', draft: false, depth: 0, overrideAccess: true }),
            ]);
            const backupDir = path.join(homedir(), 'tmp', `tarek-news-recovery-${new Date().toISOString().replace(/[:.]/g, '-')}`);
            await mkdir(backupDir, { recursive: true, mode: 0o700 });
            await writeFile(path.join(backupDir, 'before.json'), JSON.stringify({ latestNews, publishedNews, navigation, publishedNavigation }, null, 2), { mode: 0o600, flag: 'wx' });
            console.log(`Backup: ${backupDir}`);
            if (latestNews.solo?.length || latestNews.group?.length) {
                console.log('Existing News content retained; recovery will not overwrite editor changes.');
            } else {
                await payload.updateGlobal({ slug: 'news', data: { ...news, _status: 'draft' }, draft: true, overrideAccess: true });
                console.log('Saved recovered News content as a draft.');
            }
            const items = navigation.items ?? [];
            if (items.length && !items.some((item) => item.href === '/news')) {
                const nextItems = [...items];
                nextItems.splice(Math.max(0, items.findIndex((item) => item.href === '/research') + 1), 0, { label: 'News', href: '/news', external: false });
                await payload.updateGlobal({ slug: 'navigation', data: { items: nextItems, _status: 'draft' }, draft: true, overrideAccess: true });
                console.log('Added News to the navigation draft, preserving the other links.');
            }
            console.log('Review and publish News and Navigation in the CMS, then export a new snapshot. No pages were deployed.');
        } finally {
            await payload.destroy();
        }
    } else {
        console.log('Dry run: use --apply to save News and the missing navigation link as drafts.');
    }
} catch (error) {
    console.error(error instanceof Error ? error.message : 'News recovery failed');
    console.error('Any completed writes remain drafts; rerunning retains existing News content and avoids duplicate navigation links.');
    process.exitCode = 1;
}

// All writes and Payload teardown are awaited above; end any remaining framework timers.
process.exit(process.exitCode ?? 0);
