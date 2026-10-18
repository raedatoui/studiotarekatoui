import type { GlobalConfig } from 'payload';
import { signedIn } from '../access';
import { publishedByField } from '../fields/publishedBy';

export const ResearchPage: GlobalConfig = {
    slug: 'research-page',
    label: 'Research page',
    admin: { group: false },
    access: { read: signedIn, update: signedIn, readVersions: signedIn },
    versions: { drafts: true, max: 30 },
    fields: [
        publishedByField(),
        { name: 'eyebrow', type: 'text', label: 'Section title' },
        { name: 'heading', type: 'text', required: true },
        { name: 'introduction', type: 'textarea', required: true },
    ],
};
