import type { ArrayField, Field } from 'payload';

/** One difference between the published version and the saved draft: a changed value, or a labelled set of nested differences. */
export type DraftChange = {
    label: string;
    /** A list row that was added or removed, or a list whose rows changed order. */
    note?: 'added' | 'removed' | 'moved';
    before?: string;
    after?: string;
    changes?: DraftChange[];
};

type Data = Record<string, unknown>;

const rowsOf = (value: unknown): Data[] => (Array.isArray(value) ? value : []);

/** A field value as an editor reads it in the form. */
function show(field: Field, value: unknown): string {
    if (field.type === 'checkbox') return value ? 'Yes' : 'No';
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) return value.map((item) => show(field, item)).join(', ');
    if (field.type === 'date') return String(value).slice(0, 10);
    if (field.type === 'select') {
        const option = field.options.find((item) => typeof item === 'object' && item.value === value);
        if (typeof option === 'object' && typeof option.label === 'string') return option.label;
    }
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

function diffRows(field: ArrayField, before: Data[], after: Data[]): DraftChange[] {
    const singular = typeof field.labels?.singular === 'string' ? field.labels.singular : 'Item';
    const nameOf = (row: Data, index: number) => {
        for (const key of ['title', 'label', 'venue', 'heading']) {
            const value = row[key];
            if (typeof value === 'string' && value) return value;
        }
        return `${singular} ${index + 1}`;
    };
    const changes: DraftChange[] = [];
    for (const [index, row] of after.entries()) {
        const previous = before.find((item) => item.id === row.id);
        const nested = diffFields(field.fields, previous ?? {}, row);
        if (!previous) changes.push({ label: nameOf(row, index), note: 'added', changes: nested });
        else if (nested.length) changes.push({ label: nameOf(row, index), changes: nested });
    }
    for (const [index, row] of before.entries()) {
        if (!after.some((item) => item.id === row.id)) changes.push({ label: nameOf(row, index), note: 'removed' });
    }
    const order = (rows: Data[], others: Data[]) => rows.filter((row) => others.some((item) => item.id === row.id)).map((row) => row.id).join();
    if (order(before, after) !== order(after, before)) changes.push({ label: 'Order', note: 'moved' });
    return changes;
}

function diffFields(fields: Field[], before: Data, after: Data): DraftChange[] {
    const changes: DraftChange[] = [];
    for (const field of fields) {
        if (field.type === 'ui' || field.type === 'tabs') continue;
        if (!('name' in field)) {
            // Rows and collapsibles only arrange the form; a labelled group says what its fields belong to.
            const nested = diffFields(field.fields, before, after);
            if (field.type === 'group' && typeof field.label === 'string' && nested.length) changes.push({ label: field.label, changes: nested });
            else changes.push(...nested);
            continue;
        }
        // Editors never set the status, hidden or read-only fields by hand.
        if (field.name === '_status' || field.admin?.hidden || field.admin?.readOnly) continue;
        const label = typeof field.label === 'string' ? field.label : field.name;
        if (field.type === 'array') {
            const nested = diffRows(field, rowsOf(before[field.name]), rowsOf(after[field.name]));
            if (nested.length) changes.push({ label, changes: nested });
        } else {
            const was = show(field, before[field.name]);
            const now = show(field, after[field.name]);
            if (was !== now) changes.push({ label, before: was, after: now });
        }
    }
    return changes;
}

/** What the saved draft changes compared with the published version, in the order of the edit form. */
export function diffDraft(fields: Field[], published: object, draft: object): DraftChange[] {
    return diffFields(fields, published as Data, draft as Data);
}
