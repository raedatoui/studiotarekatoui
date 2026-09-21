import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { exportContent } from '../src/content/export';
import { localPayload } from './local-payload';

try {
    const { values } = parseArgs({ options: { output: { type: 'string' } } });
    if (!values.output) throw new Error('Usage: pnpm content:export --output <file>');
    const output = path.resolve(values.output);
    const payload = await localPayload();
    try {
        const snapshot = await exportContent(payload);
        await mkdir(path.dirname(output), { recursive: true });
        const temporary = `${output}.${process.pid}.pending`;
        try {
            await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`, { mode: 0o600, flag: 'wx' });
            await rename(temporary, output);
        } finally {
            await rm(temporary, { force: true });
        }
        console.log(`Exported ${snapshot.research.length} published research documents to ${output}`);
    } finally {
        await payload.destroy();
    }
} catch (error) {
    console.error(error instanceof Error ? error.message : 'Content export failed');
    process.exitCode = 1;
}
