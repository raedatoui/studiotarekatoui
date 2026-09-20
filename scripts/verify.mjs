import { readFileSync } from 'node:fs';

const raw = readFileSync('./src/data/site-content.json', 'utf8');
let data;
try {
    data = JSON.parse(raw);
    console.log('JSON.parse: OK');
} catch (e) {
    console.error('JSON.parse FAILED:', e.message);
    process.exit(1);
}

const errs = [];
const MEDIA = new Set(['image', 'video', 'audio', 'press', 'interview', 'external']);
const themeKeys = new Set([
    'id',
    'title',
    'subtitle',
    'yearStart',
    'yearEnd',
    'ongoing',
    'yearsDisplay',
    'summary',
    'description',
    'heroImage',
    'collaborators',
    'materials',
    'images',
    'media',
]);
const topKeys = new Set(['meta', 'navigation', 'bio', 'portrait', 'news', 'contact', 'themes']);

for (const k of Object.keys(data)) if (!topKeys.has(k)) errs.push(`top-level unknown key: ${k}`);

const themeIds = new Set();
for (const t of data.themes) {
    for (const k of Object.keys(t)) if (!themeKeys.has(k)) errs.push(`theme ${t.id}: unknown key ${k}`);
    for (const req of ['id', 'title', 'yearStart', 'ongoing', 'yearsDisplay', 'summary', 'description'])
        if (t[req] === undefined) errs.push(`theme ${t.id}: missing ${req}`);
    if (typeof t.yearStart !== 'number' || !Number.isInteger(t.yearStart)) errs.push(`theme ${t.id}: yearStart not int`);
    if (typeof t.ongoing !== 'boolean') errs.push(`theme ${t.id}: ongoing not bool`);
    if (!Array.isArray(t.description) || t.description.some((d) => typeof d !== 'string')) errs.push(`theme ${t.id}: description not string[]`);
    if (t.images !== undefined) {
        if (!Array.isArray(t.images)) errs.push(`theme ${t.id}: images not array`);
        else for (const image of t.images) {
            for (const key of Object.keys(image))
                if (key !== 'src' && key !== 'caption') errs.push(`theme ${t.id}: unknown image key ${key}`);
            if (typeof image.src !== 'string' || typeof image.caption !== 'string') errs.push(`theme ${t.id}: invalid image`);
        }
    }
    if (t.media)
        for (const md of t.media) {
            if (!MEDIA.has(md.type)) errs.push(`theme ${t.id}: bad media type ${md.type}`);
            if (!md.url) errs.push(`theme ${t.id}: media missing url`);
            if (md.publisher !== undefined && typeof md.publisher !== 'string') errs.push(`theme ${t.id}: media publisher not string`);
        }
    if (themeIds.has(t.id)) errs.push(`duplicate theme id: ${t.id}`);
    themeIds.add(t.id);
}

console.log(`themes: ${data.themes.length}`);

if (errs.length) {
    console.error(`\n❌ ${errs.length} STRUCTURAL ERRORS:`);
    for (const e of errs) console.error(`  - ${e}`);
    process.exit(1);
}
console.log('\n✅ Structural + referential integrity: PASS');
