import { readFileSync } from 'node:fs';

const raw = readFileSync('./src/data/projects.json', 'utf8');
let data;
try {
    data = JSON.parse(raw);
    console.log('JSON.parse: OK');
} catch (e) {
    console.error('JSON.parse FAILED:', e.message);
    process.exit(1);
}

const errs = [];
const KIND = new Set(['solo', 'group', 'performance', 'commission', 'curation', 'collaboration', 'residency', 'workshop']);
const STATUS = new Set(['current', 'upcoming', 'past']);
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
    'portfolioId',
    'media',
]);
const projectKeys = new Set([
    'id',
    'themeIds',
    'kind',
    'title',
    'year',
    'dateStart',
    'dateEnd',
    'dateDisplay',
    'status',
    'venue',
    'city',
    'country',
    'organization',
    'collaborators',
    'note',
    'url',
    'media',
    'needsReview',
]);
const topKeys = new Set(['themes', 'projects', 'openQuestions']);

for (const k of Object.keys(data)) if (!topKeys.has(k)) errs.push(`top-level unknown key: ${k}`);

const themeIds = new Set();
for (const t of data.themes) {
    for (const k of Object.keys(t)) if (!themeKeys.has(k)) errs.push(`theme ${t.id}: unknown key ${k}`);
    for (const req of ['id', 'title', 'yearStart', 'ongoing', 'yearsDisplay', 'summary', 'description'])
        if (t[req] === undefined) errs.push(`theme ${t.id}: missing ${req}`);
    if (typeof t.yearStart !== 'number' || !Number.isInteger(t.yearStart)) errs.push(`theme ${t.id}: yearStart not int`);
    if (typeof t.ongoing !== 'boolean') errs.push(`theme ${t.id}: ongoing not bool`);
    if (!Array.isArray(t.description) || t.description.some((d) => typeof d !== 'string')) errs.push(`theme ${t.id}: description not string[]`);
    if (t.media)
        for (const md of t.media) {
            if (!MEDIA.has(md.type)) errs.push(`theme ${t.id}: bad media type ${md.type}`);
            if (!md.url) errs.push(`theme ${t.id}: media missing url`);
        }
    if (themeIds.has(t.id)) errs.push(`duplicate theme id: ${t.id}`);
    themeIds.add(t.id);
}

const projectIds = new Set();
for (const p of data.projects) {
    for (const k of Object.keys(p)) if (!projectKeys.has(k)) errs.push(`project ${p.id}: unknown key ${k}`);
    for (const req of ['id', 'kind', 'year', 'venue']) if (p[req] === undefined) errs.push(`project ${p.id}: missing ${req}`);
    if (!KIND.has(p.kind)) errs.push(`project ${p.id}: bad kind ${p.kind}`);
    if (p.status !== undefined && !STATUS.has(p.status)) errs.push(`project ${p.id}: bad status ${p.status}`);
    if (typeof p.year !== 'number' || !Number.isInteger(p.year)) errs.push(`project ${p.id}: year not int`);
    if (p.themeIds !== undefined) {
        if (!Array.isArray(p.themeIds)) errs.push(`project ${p.id}: themeIds not array`);
        else for (const tid of p.themeIds) if (!themeIds.has(tid)) errs.push(`project ${p.id}: themeId '${tid}' not found`);
    }
    for (const df of ['dateStart', 'dateEnd'])
        if (p[df] !== undefined) {
            if (Number.isNaN(Date.parse(p[df]))) errs.push(`project ${p.id}: bad date ${df}=${p[df]}`);
        }
    if (p.media)
        for (const md of p.media) {
            if (!MEDIA.has(md.type)) errs.push(`project ${p.id}: bad media type ${md.type}`);
            if (!md.url) errs.push(`project ${p.id}: media missing url`);
        }
    if (projectIds.has(p.id)) errs.push(`duplicate project id: ${p.id}`);
    projectIds.add(p.id);
}

for (const q of data.openQuestions || []) {
    for (const tid of q.relatedThemeIds || []) if (!themeIds.has(tid)) errs.push(`openQ: themeId '${tid}' not found`);
    for (const pid of q.relatedProjectIds || []) if (!projectIds.has(pid)) errs.push(`openQ: projectId '${pid}' not found`);
}

console.log(`themes: ${data.themes.length}, projects: ${data.projects.length}, openQuestions: ${(data.openQuestions || []).length}`);
console.log('\nprojects per theme:');
for (const t of data.themes) {
    const list = data.projects.filter((p) => (p.themeIds || []).includes(t.id));
    const yrs = list.map((p) => p.year);
    const range = yrs.length ? `${Math.min(...yrs)}–${Math.max(...yrs)}` : '—';
    console.log(`  ${t.id.padEnd(22)} ${String(list.length).padStart(2)}  [${range}]`);
}
const standalone = data.projects.filter((p) => !(p.themeIds || []).length);
console.log(`\nstandalone projects (no theme): ${standalone.length}`);
const shared = data.projects.filter((p) => (p.themeIds || []).length > 1);
console.log(`multi-theme (shared) projects: ${shared.length}`);
for (const p of shared) console.log(`  ${p.id} -> [${p.themeIds.join(', ')}]`);
const review = data.projects.filter((p) => p.needsReview);
console.log(`\nneedsReview: ${review.length} (${review.map((p) => p.id).join(', ') || 'none'})`);

if (errs.length) {
    console.error(`\n❌ ${errs.length} STRUCTURAL ERRORS:`);
    for (const e of errs) console.error(`  - ${e}`);
    process.exit(1);
}
console.log('\n✅ Structural + referential integrity: PASS');
