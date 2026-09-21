import nextEnv from '@next/env';
import { fileURLToPath } from 'node:url';
import { getPayload } from 'payload';

export async function localPayload() {
    nextEnv.loadEnvConfig(fileURLToPath(new URL('../', import.meta.url)), true);
    if (!process.env.DATABASE_URL || !process.env.PAYLOAD_SECRET) {
        throw new Error('Set DATABASE_URL and PAYLOAD_SECRET in cms/.env before running content commands.');
    }
    const { default: config } = await import('../src/payload.config');
    return getPayload({ config });
}
