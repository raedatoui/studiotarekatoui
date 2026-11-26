import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const target = process.argv[2];
if (!['prod', 'staging'].includes(target)) throw new Error('Usage: node scripts/publish.mjs prod|staging [snapshot-file]');
if (existsSync(path.join(root, '.env'))) loadEnvFile(path.join(root, '.env'));

function required(name) {
    const value = process.env[name]?.trim();
    if (!value) throw new Error(`Set ${name} in the workspace .env before publishing.`);
    return value;
}

const project = required('FIREBASE_PROJECT_ID');
const bucket = required('PUBLISH_BUCKET').replace(/\/+$/, '');
const region = required('PUBLISH_REGION');
const file = path.resolve(process.argv[3] ?? path.join(root, 'website/src/data/generated/content.json'));
if (!existsSync(file)) throw new Error(`Missing CMS snapshot: ${file}`);

// Returns stdout when captured; gcloud progress and errors always reach the terminal.
function gcloud(args, capture = false) {
    const result = spawnSync('gcloud', [...args, '--project', project], {
        cwd: root,
        encoding: 'utf8',
        stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
    });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`gcloud ${args.slice(0, 2).join(' ')} failed (${result.status ?? result.signal}).`);
    return capture ? result.stdout.trim() : '';
}

// Each run builds from its own immutable snapshot object.
const snapshot = `${bucket}/snapshots/${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
gcloud(['storage', 'cp', file, snapshot]);

const [build, logUrl] = gcloud(
    [
        'builds',
        'triggers',
        'run',
        `website-${target}`,
        '--region',
        region,
        '--substitutions',
        `_SNAPSHOT=${snapshot}`,
        '--format',
        'value(metadata.build.id,metadata.build.logUrl)',
    ],
    true
).split('\t');
console.log(`Build ${build} started from ${snapshot}\n${logUrl}`);

gcloud(['builds', 'log', build, '--region', region, '--stream']);
const status = gcloud(['builds', 'describe', build, '--region', region, '--format', 'value(status)'], true);
if (status !== 'SUCCESS') throw new Error(`Build ${build} finished with ${status}.`);
console.log(`Published ${target}.`);
