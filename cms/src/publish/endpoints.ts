import type { Endpoint, Payload, PayloadRequest } from 'payload';
import { isAllowedEmail, serverURL } from '../auth/settings';
import { ContentExportError, exportContent } from '../content/export';
import { cmsPages } from '../globals/pages';
import { type BuildSummary, listBuilds, PublishError, readSnapshot, runTrigger, saveSnapshot } from './cloudBuild';
import { type ChangeGroup, diffSnapshots } from './diff';

type Publication = { publishedAt: string; publishedBy: string };

export type PublishStatus = {
    stagingUrl: string;
    builds: BuildSummary[];
    /** The successful build the staging site currently shows. */
    staged: BuildSummary | null;
    /** The successful build the public website currently shows, if it was published through Cloud Build. */
    live: BuildSummary | null;
    /** Published CMS content compared with the staging site, with when each page or document was last published and by whom. */
    changes: (ChangeGroup & Partial<Publication>)[];
    /** Published CMS content is not on staging yet, or could not be compared. */
    pending: boolean;
    /** Production already shows the staged content and code. */
    productionCurrent: boolean;
    /** Saved drafts, which builds leave out. `href` is relative to the admin route. */
    drafts: { label: string; href: string }[];
    exportError: string;
};

const noStore = { 'Cache-Control': 'no-store' };
const globalPages = [{ slug: 'navigation', label: 'Navigation' }, ...cmsPages] as const;
const globalHref = (page: (typeof globalPages)[number]) => ('path' in page ? page.path : `/globals/${page.slug}`);

// The CMS runs as a single instance, so this closes the gap while an export is still running.
let starting = false;

function denied(req: PayloadRequest) {
    if (!req.user || !isAllowedEmail(req.user.email)) {
        return Response.json({ error: 'Sign in with an allowed editor account.' }, { status: 403, headers: noStore });
    }
    const origin = req.headers.get('origin');
    if (origin && origin !== serverURL) return Response.json({ error: 'Invalid request origin.' }, { status: 403, headers: noStore });
    return null;
}

function failure(req: PayloadRequest, error: unknown) {
    if (error instanceof ContentExportError) return Response.json({ error: error.message }, { status: 422, headers: noStore });
    if (error instanceof PublishError) return Response.json({ error: error.message }, { status: error.status, headers: noStore });
    req.payload.logger.error({ err: error, msg: 'Website publishing failed' });
    return Response.json({ error: 'Website publishing failed. Check the CMS cloud access and try again.' }, { status: 500, headers: noStore });
}

async function publishState(payload: Payload) {
    const builds = await listBuilds();
    const staged = builds.find((build) => build.target === 'staging' && build.status === 'SUCCESS' && build.snapshot) ?? null;
    const live = builds.find((build) => build.target === 'prod' && build.status === 'SUCCESS') ?? null;
    let changes: ChangeGroup[] = [];
    let exportError = '';
    try {
        const current = await exportContent(payload);
        if (staged?.snapshot) changes = diffSnapshots(await readSnapshot(staged.snapshot), current);
    } catch (error) {
        if (!(error instanceof ContentExportError)) throw error;
        exportError = error.message;
    }
    return {
        builds: builds.slice(0, 10),
        staged,
        live,
        changes,
        pending: !staged || changes.length > 0 || Boolean(exportError),
        productionCurrent: Boolean(staged && live && live.snapshot === staged.snapshot && live.commit === staged.commit),
        exportError,
    };
}

async function findDrafts(payload: Payload): Promise<PublishStatus['drafts']> {
    const [research, publications, globals] = await Promise.all([
        payload.find({
            collection: 'research',
            draft: true,
            where: { _status: { equals: 'draft' } },
            depth: 0,
            pagination: false,
            overrideAccess: true,
            select: { title: true },
        }),
        payload.find({
            collection: 'publications',
            draft: true,
            where: { _status: { equals: 'draft' } },
            depth: 0,
            pagination: false,
            overrideAccess: true,
            select: { title: true },
        }),
        Promise.all(
            globalPages.map(async (page) => {
                const doc = await payload.findGlobal({ slug: page.slug, draft: true, depth: 0, overrideAccess: true, select: { _status: true } });
                const label = page.slug === 'navigation' ? page.label : `${page.label} page`;
                return doc._status === 'draft' ? [{ label, href: globalHref(page) }] : [];
            })
        ),
    ]);
    return [
        ...research.docs.map((doc) => ({ label: `Research: ${doc.title}`, href: `/collections/research/${doc.id}` })),
        ...publications.docs.map((doc) => ({ label: `Publication: ${doc.title}`, href: `/collections/publications/${doc.id}` })),
        ...globals.flat(),
    ];
}

/** When each published page or document was last published and by whom, keyed like `ChangeGroup.href`. */
async function findPublished(payload: Payload): Promise<Map<string, Publication>> {
    // Drafts live in versions; the main document keeps the last published timestamp.
    const entry = (href: string, doc: { updatedAt?: string | null; publishedBy?: string | null }): [string, Publication] => [
        href,
        { publishedAt: doc.updatedAt ?? '', publishedBy: doc.publishedBy ?? '' },
    ];
    const [research, publications, globals] = await Promise.all([
        payload.find({
            collection: 'research',
            draft: false,
            where: { _status: { equals: 'published' } },
            depth: 0,
            pagination: false,
            overrideAccess: true,
            select: { updatedAt: true, publishedBy: true },
        }),
        payload.find({
            collection: 'publications',
            draft: false,
            where: { _status: { equals: 'published' } },
            depth: 0,
            pagination: false,
            overrideAccess: true,
            select: { updatedAt: true, publishedBy: true },
        }),
        Promise.all(
            globalPages.map(async (page) => {
                const doc = await payload.findGlobal({
                    slug: page.slug,
                    draft: false,
                    depth: 0,
                    overrideAccess: true,
                    select: { _status: true, updatedAt: true, publishedBy: true },
                });
                return doc._status === 'published' ? [entry(globalHref(page), doc)] : [];
            })
        ),
    ]);
    return new Map([
        ...research.docs.map((doc) => entry(`/collections/research/${doc.id}`, doc)),
        ...publications.docs.map((doc) => entry(`/collections/publications/${doc.id}`, doc)),
        ...globals.flat(),
    ]);
}

async function start(req: PayloadRequest, run: (email: string) => Promise<BuildSummary>) {
    const refused = denied(req);
    if (refused) return refused;
    if (starting) return Response.json({ error: 'A website build is already starting.' }, { status: 409, headers: noStore });
    starting = true;
    try {
        return Response.json({ build: await run(req.user?.email ?? '') }, { status: 202, headers: noStore });
    } catch (error) {
        return failure(req, error);
    } finally {
        starting = false;
    }
}

export const publishEndpoints: Endpoint[] = [
    {
        path: '/publish/status',
        method: 'get',
        handler: async (req) => {
            const refused = denied(req);
            if (refused) return refused;
            try {
                const state = await publishState(req.payload);
                // The navigation flag only needs to know whether anything is waiting.
                if (req.query.flag) return Response.json({ pending: state.pending }, { headers: noStore });
                const [drafts, published] = await Promise.all([
                    findDrafts(req.payload),
                    state.changes.length ? findPublished(req.payload) : new Map<string, Publication>(),
                ]);
                const status: PublishStatus = {
                    ...state,
                    changes: state.changes.map((group) => ({ ...group, ...published.get(group.href) })),
                    drafts,
                    stagingUrl: process.env.WEBSITE_PREVIEW_URL || '',
                };
                return Response.json(status, { headers: noStore });
            } catch (error) {
                return failure(req, error);
            }
        },
    },
    {
        path: '/publish/staging',
        method: 'post',
        handler: (req) =>
            start(req, async (email) => {
                if ((await listBuilds()).some((build) => build.active)) throw new PublishError('A website build is already running.', 409);
                const snapshot = await saveSnapshot(await exportContent(req.payload));
                return runTrigger('staging', { _SNAPSHOT: snapshot, _REQUESTED_BY: email });
            }),
    },
    {
        path: '/publish/production',
        method: 'post',
        handler: (req) =>
            start(req, async (email) => {
                const body: { stagingBuildId?: string } = (await req.json?.().catch(() => null)) ?? {};
                const { builds, staged, pending } = await publishState(req.payload);
                const commit = staged?.commit ?? '';
                if (builds.some((build) => build.active)) throw new PublishError('A website build is already running.', 409);
                if (!staged?.snapshot || staged.id !== body.stagingBuildId) {
                    throw new PublishError('Staging has changed since this page loaded. Reload and review it again.', 409);
                }
                if (pending) throw new PublishError('Publish the latest changes to staging before publishing to production.', 409);
                if (!/^[0-9a-f]{40}$/.test(commit)) {
                    throw new PublishError('The staging build has no recorded code version. Publish to staging again.', 409);
                }
                // Production rebuilds exactly what was reviewed: the staged snapshot at the staged commit.
                return runTrigger('prod', { _SNAPSHOT: staged.snapshot, _REQUESTED_BY: email }, commit);
            }),
    },
];
