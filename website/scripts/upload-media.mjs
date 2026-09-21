import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const bucket = process.env.MEDIA_BUCKET;
const prefix = process.env.MEDIA_PREFIX;

if (!bucket?.startsWith('gs://') || !prefix) {
    throw new Error('Set MEDIA_BUCKET (gs://bucket) and MEDIA_PREFIX in .env before uploading media.');
}

const destination = `${bucket.replace(/\/+$/, '')}/${prefix.replace(/^\/+|\/+$/g, '')}`;

for (const directory of ['images', 'portfolio', 'media']) {
    const result = spawnSync(
        'gcloud',
        [
            'storage',
            'rsync',
            fileURLToPath(new URL(`../public/${directory}/`, import.meta.url)),
            `${destination}/${directory}`,
            '--recursive',
            '--cache-control=public, max-age=3600',
        ],
        { stdio: 'inherit' }
    );
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status ?? 1);
}
