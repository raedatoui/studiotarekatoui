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
const topKeys = new Set(['meta', 'navigation', 'bio', 'portrait', 'news', 'contact', 'researchEvents', 'themes']);

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
        else
            for (const image of t.images) {
                for (const key of Object.keys(image)) if (key !== 'src' && key !== 'caption') errs.push(`theme ${t.id}: unknown image key ${key}`);
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

const eventKeys = new Set(['id', 'themeIds', 'kind', 'title', 'year', 'dateStart', 'dateDisplay', 'status', 'venue', 'city', 'country', 'url', 'media']);
const eventKinds = new Set(['solo', 'group', 'performance', 'commission', 'curation', 'collaboration', 'residency', 'workshop']);
const eventIds = new Set();
if (!Array.isArray(data.researchEvents)) errs.push('researchEvents: not array');
else {
    for (const event of data.researchEvents) {
        for (const key of Object.keys(event)) if (!eventKeys.has(key)) errs.push(`research event ${event.id}: unknown key ${key}`);
        if (typeof event.id !== 'string') errs.push('research event: id not string');
        if (typeof event.venue !== 'string') errs.push(`research event ${event.id}: venue not string`);
        if (!Number.isInteger(event.year)) errs.push(`research event ${event.id}: year not int`);
        if (!eventKinds.has(event.kind)) errs.push(`research event ${event.id}: bad kind ${event.kind}`);
        if (event.status !== undefined && !['current', 'upcoming', 'past'].includes(event.status))
            errs.push(`research event ${event.id}: bad status ${event.status}`);
        for (const key of ['title', 'dateStart', 'dateDisplay', 'city', 'country', 'url'])
            if (event[key] !== undefined && typeof event[key] !== 'string') errs.push(`research event ${event.id}: ${key} not string`);
        if (event.media !== undefined) {
            if (!Array.isArray(event.media)) errs.push(`research event ${event.id}: media not array`);
            else
                for (const media of event.media) {
                    for (const key of Object.keys(media))
                        if (!['type', 'url', 'label', 'publisher'].includes(key)) errs.push(`research event ${event.id}: unknown media key ${key}`);
                    if (!MEDIA.has(media.type)) errs.push(`research event ${event.id}: bad media type ${media.type}`);
                    if (typeof media.url !== 'string') errs.push(`research event ${event.id}: media url not string`);
                    for (const key of ['label', 'publisher'])
                        if (media[key] !== undefined && typeof media[key] !== 'string') errs.push(`research event ${event.id}: media ${key} not string`);
                }
        }
        if (!Array.isArray(event.themeIds) || event.themeIds.length === 0) errs.push(`research event ${event.id}: themeIds not nonempty array`);
        else for (const themeId of event.themeIds) if (!themeIds.has(themeId)) errs.push(`research event ${event.id}: unknown theme ${themeId}`);
        if (eventIds.has(event.id)) errs.push(`duplicate research event id: ${event.id}`);
        eventIds.add(event.id);
    }
}

console.log(`themes: ${data.themes.length}`);

if (errs.length) {
    console.error(`\n❌ ${errs.length} STRUCTURAL ERRORS:`);
    for (const e of errs) console.error(`  - ${e}`);
    process.exit(1);
}
console.log('\n✅ Structural + referential integrity: PASS');
