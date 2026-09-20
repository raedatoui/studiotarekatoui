import { readFileSync } from 'node:fs';
import { siteContentSchema } from '../src/data/schema.ts';

const raw = JSON.parse(readFileSync('./src/data/site-content.json', 'utf8'));
const r = siteContentSchema.safeParse(raw);
if (!r.success) {
    console.error('❌ Zod parse FAILED:');
    console.error(JSON.stringify(r.error.issues, null, 2));
    process.exit(1);
}
console.log('✅ Zod parse: PASS — siteContentSchema.parse() accepts site-content.json');
console.log(`   themes=${r.data.themes.length}`);
