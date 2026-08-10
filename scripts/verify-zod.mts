import { readFileSync } from 'node:fs';
import { projectsDataSchema } from '../src/data/projects-schema.ts';

const raw = JSON.parse(readFileSync('./src/data/projects.json', 'utf8'));
const r = projectsDataSchema.safeParse(raw);
if (!r.success) {
    console.error('❌ Zod parse FAILED:');
    console.error(JSON.stringify(r.error.issues, null, 2));
    process.exit(1);
}
console.log('✅ Zod parse: PASS — projectsDataSchema.parse() accepts projects.json');
console.log(`   themes=${r.data.themes.length} projects=${r.data.projects.length}`);
