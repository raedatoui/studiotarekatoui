import type { NextConfig } from 'next';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = path.dirname(fileURLToPath(import.meta.url));
if (!existsSync(path.join(appDir, 'src/data/generated/content.json'))) {
    throw new Error('Missing CMS snapshot. From the workspace root, run: pnpm content:export --output website/src/data/generated/content.json');
}

if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_MEDIA_BASE_URL) {
    throw new Error('Set NEXT_PUBLIC_MEDIA_BASE_URL in .env before building; media is excluded from Firebase Hosting.');
}

if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SITE_URL) {
    throw new Error('Set NEXT_PUBLIC_SITE_URL in .env before building canonical URLs.');
}

if (process.env.NEXT_PUBLIC_SITE_ENV === 'staging') {
    for (const name of [
        'NEXT_PUBLIC_FIREBASE_API_KEY',
        'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
        'NEXT_PUBLIC_FIREBASE_APP_ID',
        'STAGING_ALLOWED_EMAILS',
    ]) {
        if (!process.env[name]?.trim()) throw new Error(`Set ${name} before running the staging website.`);
    }
}

const nextConfig: NextConfig = {
    output: 'export',
    transpilePackages: ['@tarek/content'],
    turbopack: { root: path.resolve(appDir, '..') },
    images: { unoptimized: true },
};

export default nextConfig;
