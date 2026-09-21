import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { parseContentSnapshot } from './schema';

try {
    const { positionals } = parseArgs({ allowPositionals: true });
    if (positionals.length !== 1) throw new Error('Usage: pnpm content:validate <file>');
    const snapshot = parseContentSnapshot(JSON.parse(await readFile(positionals[0], 'utf8')));
    console.log(`Valid schema v${snapshot.schemaVersion}: ${snapshot.research.length} research documents, exported ${snapshot.exportedAt}`);
} catch (error) {
    console.error(error instanceof Error ? error.message : 'Content validation failed');
    process.exitCode = 1;
}
