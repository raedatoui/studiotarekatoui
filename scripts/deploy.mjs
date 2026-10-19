import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const target = process.argv[2];
if (!['cms', 'prod', 'staging'].includes(target)) throw new Error('Usage: node scripts/deploy.mjs cms|prod|staging');
if (existsSync(path.join(root, '.env'))) loadEnvFile(path.join(root, '.env'));

function required(name) {
    const value = process.env[name]?.trim();
    if (!value) throw new Error(`Set ${name} in the workspace .env before deploying.`);
    return value;
}

function run(command, args, env) {
    const result = spawnSync(command, args, { cwd: root, env, stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`${command} failed (${result.status ?? result.signal}).`);
}

const project = required('FIREBASE_PROJECT_ID');
const template = JSON.parse(readFileSync(path.join(root, 'firebase.json'), 'utf8'));
const scratch = path.join(homedir(), 'tmp');
mkdirSync(scratch, { recursive: true });
const env = { ...process.env, TMPDIR: scratch };
let config;
let only;
if (target === 'cms') {
    const backendId = required('FIREBASE_APPHOSTING_BACKEND_ID');
    const apphosting = readFileSync(path.join(root, 'cms/apphosting.template.yaml'), 'utf8').replace(/\$\{([A-Z_]+)\}/g, (_, name) =>
        JSON.stringify(required(name))
    );
    writeFileSync(path.join(root, 'cms/apphosting.yaml'), apphosting, { mode: 0o600 });
    config = { apphosting: [{ ...template.apphosting[0], backendId }] };
    only = `apphosting:${backendId}`;
} else {
    const site = required(`FIREBASE_HOSTING_SITE_${target.toUpperCase()}`);
    const hosting = { ...template.hosting.find((entry) => entry.target === target), site };
    delete hosting.target;
    config = { hosting: [hosting] };
    only = 'hosting';
    env.NEXT_PUBLIC_SITE_ENV = target === 'staging' ? 'staging' : 'production';
    env.NEXT_PUBLIC_CMS_ORIGIN = required('CMS_AUTH_URL');
    if (target === 'staging') {
        // Share only the approved email list; staging uses its own Firebase Auth session.
        const [secret, version = 'latest'] = required('CMS_ALLOWED_EMAILS_REF').split('@');
        const result = spawnSync('gcloud', ['secrets', 'versions', 'access', version, '--secret', secret, '--project', project], {
            cwd: root,
            env,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'inherit'],
        });
        if (result.error) throw result.error;
        if (result.status !== 0 || !result.stdout.trim()) throw new Error('Could not read the shared staging email list.');
        env.STAGING_ALLOWED_EMAILS = result.stdout.trim();
    }
    run('pnpm', ['build:web'], env);
}

let deployRoot = root;
let configPath;
try {
    if (target === 'cms') {
        deployRoot = mkdtempSync(path.join(scratch, 'tarek-cms-deploy-'));
        const sourceFiles = spawnSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
            cwd: root,
            env,
            encoding: 'utf8',
        });
        if (sourceFiles.error) throw sourceFiles.error;
        if (sourceFiles.status !== 0) throw new Error('Could not collect CMS deployment source.');

        // Copy working files, including uncommitted changes, without upload-time Git ignore rules.
        for (const file of new Set(sourceFiles.stdout.split('\0').filter(Boolean))) {
            const source = path.join(root, file);
            if (path.basename(file) === '.gitignore' || !existsSync(source)) continue;
            const destination = path.join(deployRoot, file);
            mkdirSync(path.dirname(destination), { recursive: true });
            cpSync(source, destination);
        }
        // This generated file is Git-ignored but must always be present in the uploaded source.
        cpSync(path.join(root, 'cms/apphosting.yaml'), path.join(deployRoot, 'cms/apphosting.yaml'));
    }

    // Firebase uploads source relative to the directory containing this configuration.
    configPath = path.join(deployRoot, `.firebase.deploy-${process.pid}.json`);
    writeFileSync(configPath, `${JSON.stringify(config, null, 4)}\n`, { mode: 0o600, flag: 'wx' });
    run('pnpm', ['exec', 'firebase', 'deploy', '--config', configPath, '--only', only, '--project', project], env);
} finally {
    if (deployRoot !== root) rmSync(deployRoot, { recursive: true, force: true });
    else if (configPath) rmSync(configPath, { force: true });
}
