export type FieldChange = { path: string; kind: 'changed' | 'added' | 'removed' | 'moved'; before?: string; after?: string };
/** `href` is relative to the admin route. */
export type ChangeGroup = { label: string; href: string; kind: 'changed' | 'added' | 'removed'; changes: FieldChange[] };

type Json = null | boolean | number | string | Json[] | JsonObject;
type JsonObject = { [key: string]: Json };

const sections: Record<string, { label: string; href: string }> = {
    navigation: { label: 'Navigation', href: '/globals/navigation' },
    news: { label: 'News', href: '/globals/news' },
    researchPage: { label: 'Research page', href: '/globals/research-page' },
    publicationsPage: { label: 'Publications page', href: '/globals/publications-page' },
    chronology: { label: 'Chronology', href: '/globals/chronology/introduction' },
    about: { label: 'About', href: '/globals/about' },
    contact: { label: 'Contact', href: '/globals/contact' },
};
const collections: Record<string, string> = { research: 'Research', publications: 'Publication' };

const isObject = (value: Json | undefined): value is JsonObject => typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: Json | undefined) => (value === undefined || value === null || typeof value === 'object' ? '' : String(value));
const join = (path: string[]) => path.join(' › ');

function labelOf(item: Json | undefined, index: number): string {
    if (isObject(item)) {
        for (const key of ['title', 'label', 'caption', 'venue', 'heading', 'slug', 'id']) {
            const value = item[key];
            if (typeof value === 'string' && value) return value;
        }
    }
    return `#${index + 1}`;
}

/** Items can be matched across snapshots only when every one has a distinct id. */
function idsOf(items: Json[]): string[] | null {
    const ids = items.map((item) => (isObject(item) && typeof item.id === 'string' ? item.id : ''));
    return ids.every(Boolean) && new Set(ids).size === ids.length ? ids : null;
}

/** Trims the unchanged start and end of long text so the edit itself is visible. */
function excerpt(before: string, after: string): [string, string] {
    let start = 0;
    while (start < before.length && start < after.length && before[start] === after[start]) start += 1;
    let end = 0;
    while (end < before.length - start && end < after.length - start && before[before.length - 1 - end] === after[after.length - 1 - end]) end += 1;
    const from = Math.max(0, start - 30);
    const cut = (value: string) => {
        const to = Math.min(value.length, value.length - end + 30);
        return `${from > 0 ? '…' : ''}${value.slice(from, to)}${to < value.length ? '…' : ''}`;
    };
    return [cut(before), cut(after)];
}

function compareLists(before: Json[], after: Json[], path: string[], changes: FieldChange[]) {
    const beforeIds = idsOf(before);
    const afterIds = idsOf(after);
    if (beforeIds && afterIds) {
        for (const [index, id] of afterIds.entries()) {
            const previous = beforeIds.indexOf(id);
            const itemPath = [...path, labelOf(after[index], index)];
            if (previous < 0) changes.push({ path: join(itemPath), kind: 'added' });
            else compare(before[previous], after[index], itemPath, changes);
        }
        for (const [index, id] of beforeIds.entries()) {
            if (!afterIds.includes(id)) changes.push({ path: join([...path, labelOf(before[index], index)]), kind: 'removed' });
        }
        const kept = beforeIds.filter((id) => afterIds.includes(id));
        if (kept.join() !== afterIds.filter((id) => beforeIds.includes(id)).join()) changes.push({ path: join(path), kind: 'moved' });
        return;
    }
    if (before.length === after.length) {
        for (const [index, item] of after.entries()) compare(before[index], item, [...path, labelOf(item, index)], changes);
        return;
    }
    // A list without ids that grew or shrank: report what appeared and disappeared.
    const found = changes.length;
    const had = new Set(before.map((item) => JSON.stringify(item)));
    const has = new Set(after.map((item) => JSON.stringify(item)));
    for (const [index, item] of after.entries()) {
        if (!had.has(JSON.stringify(item))) changes.push({ path: join([...path, labelOf(item, index)]), kind: 'added', after: text(item) });
    }
    for (const [index, item] of before.entries()) {
        if (!has.has(JSON.stringify(item))) changes.push({ path: join([...path, labelOf(item, index)]), kind: 'removed', before: text(item) });
    }
    if (changes.length === found) changes.push({ path: join(path), kind: 'moved' });
}

function compare(before: Json | undefined, after: Json | undefined, path: string[], changes: FieldChange[]) {
    if (before === undefined || after === undefined) {
        if (after !== undefined) changes.push({ path: join(path), kind: 'added', after: text(after) });
        else if (before !== undefined) changes.push({ path: join(path), kind: 'removed', before: text(before) });
    } else if (Array.isArray(before) && Array.isArray(after)) {
        compareLists(before, after, path, changes);
    } else if (isObject(before) && isObject(after)) {
        for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) compare(before[key], after[key], [...path, key], changes);
    } else if (before !== after) {
        const [was, now] = typeof before === 'string' && typeof after === 'string' ? excerpt(before, after) : [text(before), text(after)];
        changes.push({ path: join(path), kind: 'changed', before: was, after: now });
    }
}

/** Field-level differences between two content snapshots, grouped by the CMS page or document that owns them. */
export function diffSnapshots(before: unknown, after: unknown): ChangeGroup[] {
    const was = isObject(before as Json) ? (before as JsonObject) : {};
    const now = isObject(after as Json) ? (after as JsonObject) : {};
    const groups: ChangeGroup[] = [];
    const add = (label: string, href: string, previous: Json | undefined, current: Json | undefined) => {
        const changes: FieldChange[] = [];
        if (previous !== undefined && current !== undefined) compare(previous, current, [], changes);
        if (previous === undefined) groups.push({ label, href, kind: 'added', changes });
        else if (current === undefined) groups.push({ label, href, kind: 'removed', changes });
        else if (changes.length) groups.push({ label, href, kind: 'changed', changes });
    };
    const byId = (value: Json | undefined) => new Map((Array.isArray(value) ? value : []).filter(isObject).map((doc) => [String(doc.id), doc]));

    for (const key of new Set([...Object.keys(was), ...Object.keys(now)])) {
        if (key === 'exportedAt') continue;
        const collection = collections[key];
        if (collection) {
            const previous = byId(was[key]);
            const current = byId(now[key]);
            for (const id of new Set([...previous.keys(), ...current.keys()])) {
                const label = `${collection}: ${labelOf(current.get(id) ?? previous.get(id), 0)}`;
                add(label, `/collections/${key}/${id}`, previous.get(id), current.get(id));
            }
        } else {
            const section = sections[key] ?? { label: key, href: '' };
            add(section.label, section.href, was[key], now[key]);
        }
    }
    return groups;
}
