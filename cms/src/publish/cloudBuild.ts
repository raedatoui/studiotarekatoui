import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'node:crypto';

const storage = new Storage();
const targets = ['staging', 'prod'] as const;
const activeStatuses = ['PENDING', 'QUEUED', 'WORKING'];

export type Target = (typeof targets)[number];

export type BuildSummary = {
    id: string;
    target: Target;
    status: string;
    active: boolean;
    createdAt?: string;
    requestedBy?: string;
    snapshot?: string;
    commit?: string;
    failure?: string;
};

type CloudBuild = {
    id: string;
    status: string;
    createTime?: string;
    failureInfo?: { detail?: string };
    substitutions?: Record<string, string>;
};

export class PublishError extends Error {
    status: number;

    constructor(message: string, status = 503) {
        super(message);
        this.status = status;
    }
}

function settings() {
    const project = process.env.PUBLISH_PROJECT?.trim();
    const region = process.env.PUBLISH_REGION?.trim();
    const bucket = process.env.PUBLISH_BUCKET?.replace(/^gs:\/\//, '').replace(/\/+$/, '');
    if (!project || !region || !bucket) throw new PublishError('Website publishing is not configured.');
    return { bucket, api: `https://cloudbuild.googleapis.com/v1/projects/${project}/locations/${region}` };
}

function summarize(build: CloudBuild, target: Target): BuildSummary {
    const substitutions = build.substitutions ?? {};
    return {
        id: build.id,
        target,
        status: build.status,
        active: activeStatuses.includes(build.status),
        createdAt: build.createTime,
        requestedBy: substitutions._REQUESTED_BY,
        snapshot: substitutions._SNAPSHOT,
        commit: substitutions.COMMIT_SHA,
        failure: build.failureInfo?.detail,
    };
}

/** Recent website builds, newest first. Cloud Build history is the release log, including command-line publishes. */
export async function listBuilds(): Promise<BuildSummary[]> {
    const { data } = await storage.authClient.request<{ builds?: CloudBuild[] }>({ url: `${settings().api}/builds`, params: { pageSize: 50 } });
    return (data.builds ?? []).flatMap((build) => {
        const target = targets.find((name) => build.substitutions?.TRIGGER_NAME === `website-${name}`);
        return target ? [summarize(build, target)] : [];
    });
}

/** Runs the same trigger as `pnpm publish:web:*`; a commit pins the build to already-reviewed code. */
export async function runTrigger(target: Target, substitutions: Record<string, string>, commitSha?: string): Promise<BuildSummary> {
    const trigger = `website-${target}`;
    const { data } = await storage.authClient.request<{ metadata: { build: CloudBuild } }>({
        url: `${settings().api}/triggers/${trigger}:run`,
        method: 'POST',
        data: { triggerId: trigger, source: { substitutions, ...(commitSha ? { commitSha } : {}) } },
    });
    return summarize(data.metadata.build, target);
}

/** Each publish builds from its own create-only snapshot object. */
export async function saveSnapshot(snapshot: object): Promise<string> {
    const { bucket } = settings();
    const name = `snapshots/${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}.json`;
    await storage
        .bucket(bucket)
        .file(name)
        .save(`${JSON.stringify(snapshot, null, 2)}\n`, {
            resumable: false,
            preconditionOpts: { ifGenerationMatch: 0 },
            metadata: { contentType: 'application/json' },
        });
    return `gs://${bucket}/${name}`;
}

// Snapshots never change, so the one staging shows is kept between status checks.
let lastRead: { uri: string; snapshot: unknown } | undefined;

export async function readSnapshot(uri: string): Promise<unknown> {
    if (lastRead?.uri === uri) return lastRead.snapshot;
    const root = `gs://${settings().bucket}/`;
    if (!uri.startsWith(`${root}snapshots/`)) throw new PublishError('The staging build did not use a snapshot from the publishing bucket.', 409);
    const [contents] = await storage.bucket(settings().bucket).file(uri.slice(root.length)).download();
    lastRead = { uri, snapshot: JSON.parse(contents.toString('utf8')) };
    return lastRead.snapshot;
}
