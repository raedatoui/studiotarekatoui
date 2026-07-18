import { readFileSync } from 'node:fs';
const raw = readFileSync('./src/data/projects.json', 'utf8');
let data;
try { data = JSON.parse(raw); console.log('JSON.parse: OK'); }
catch (e) { console.error('JSON.parse FAILED:', e.message); process.exit(1); }

const errs = [];
const KIND = new Set(['solo','group','performance','commission','residency','workshop']);
const STATUS = new Set(['current','upcoming','past']);
const MEDIA = new Set(['image','video','audio','press','interview','external']);
const themeKeys = new Set(['id','title','subtitle','yearStart','yearEnd','ongoing','yearsDisplay','summary','description','heroImage','collaborators','materials','portfolioId']);
const manKeys = new Set(['id','themeIds','kind','title','year','dateStart','dateEnd','dateDisplay','status','venue','city','country','organization','collaborators','note','url','media','needsReview']);
const topKeys = new Set(['themes','manifestations','openQuestions']);

for (const k of Object.keys(data)) if (!topKeys.has(k)) errs.push(`top-level unknown key: ${k}`);

const themeIds = new Set();
for (const t of data.themes) {
  for (const k of Object.keys(t)) if (!themeKeys.has(k)) errs.push(`theme ${t.id}: unknown key ${k}`);
  for (const req of ['id','title','yearStart','ongoing','yearsDisplay','summary','description'])
    if (t[req] === undefined) errs.push(`theme ${t.id}: missing ${req}`);
  if (typeof t.yearStart !== 'number' || !Number.isInteger(t.yearStart)) errs.push(`theme ${t.id}: yearStart not int`);
  if (typeof t.ongoing !== 'boolean') errs.push(`theme ${t.id}: ongoing not bool`);
  if (!Array.isArray(t.description) || t.description.some(d => typeof d !== 'string')) errs.push(`theme ${t.id}: description not string[]`);
  if (themeIds.has(t.id)) errs.push(`duplicate theme id: ${t.id}`);
  themeIds.add(t.id);
}

const manIds = new Set();
for (const m of data.manifestations) {
  for (const k of Object.keys(m)) if (!manKeys.has(k)) errs.push(`man ${m.id}: unknown key ${k}`);
  for (const req of ['id','themeIds','kind','year','venue'])
    if (m[req] === undefined) errs.push(`man ${m.id}: missing ${req}`);
  if (!KIND.has(m.kind)) errs.push(`man ${m.id}: bad kind ${m.kind}`);
  if (m.status !== undefined && !STATUS.has(m.status)) errs.push(`man ${m.id}: bad status ${m.status}`);
  if (typeof m.year !== 'number' || !Number.isInteger(m.year)) errs.push(`man ${m.id}: year not int`);
  if (!Array.isArray(m.themeIds)) errs.push(`man ${m.id}: themeIds not array`);
  else { if (m.themeIds.length === 0) errs.push(`man ${m.id}: EMPTY themeIds`);
    for (const tid of m.themeIds) if (!themeIds.has(tid)) errs.push(`man ${m.id}: themeId '${tid}' not found`); }
  for (const df of ['dateStart','dateEnd']) if (m[df] !== undefined) { if (Number.isNaN(Date.parse(m[df]))) errs.push(`man ${m.id}: bad date ${df}=${m[df]}`); }
  if (m.media) for (const md of m.media) { if (!MEDIA.has(md.type)) errs.push(`man ${m.id}: bad media type ${md.type}`); if (!md.url) errs.push(`man ${m.id}: media missing url`); }
  if (manIds.has(m.id)) errs.push(`duplicate man id: ${m.id}`);
  manIds.add(m.id);
}

for (const q of (data.openQuestions||[])) {
  for (const tid of (q.relatedThemeIds||[])) if (!themeIds.has(tid)) errs.push(`openQ: themeId '${tid}' not found`);
  for (const mid of (q.relatedManifestationIds||[])) if (!manIds.has(mid)) errs.push(`openQ: manId '${mid}' not found`);
}

console.log(`themes: ${data.themes.length}, manifestations: ${data.manifestations.length}, openQuestions: ${(data.openQuestions||[]).length}`);
console.log('\nmanifestations per theme:');
for (const t of data.themes) {
  const list = data.manifestations.filter(m => m.themeIds.includes(t.id));
  const yrs = list.map(m=>m.year); const range = yrs.length? `${Math.min(...yrs)}–${Math.max(...yrs)}`:'—';
  console.log(`  ${t.id.padEnd(22)} ${String(list.length).padStart(2)}  [${range}]`);
}
const shared = data.manifestations.filter(m=>m.themeIds.length>1);
console.log(`\nmulti-theme (shared) manifestations: ${shared.length}`);
for (const m of shared) console.log(`  ${m.id} -> [${m.themeIds.join(', ')}]`);
const review = data.manifestations.filter(m=>m.needsReview);
console.log(`\nneedsReview: ${review.length} (${review.map(m=>m.id).join(', ')||'none'})`);

if (errs.length) { console.error(`\n❌ ${errs.length} STRUCTURAL ERRORS:`); for (const e of errs) console.error('  - '+e); process.exit(1); }
console.log('\n✅ Structural + referential integrity: PASS');
