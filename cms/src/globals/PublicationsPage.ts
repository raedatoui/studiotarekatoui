import type { GlobalConfig } from 'payload';
import { signedIn } from '../access';
import { publishedByField } from '../fields/publishedBy';

export const PublicationsPage: GlobalConfig = {
    slug: 'publications-page',
    label: 'Publications page (staging)',
    admin: {
        group: false,
        description: 'The heading and introduction above the publications list. Currently visible in local development and on the staging website.',
    },
    access: { read: signedIn, update: signedIn, readVersions: signedIn },
    versions: { drafts: true, max: 30 },
    fields: [
        publishedByField(),
        { name: 'heading', label: 'Page heading', type: 'text', required: true, defaultValue: 'Publications' },
        {
            name: 'introduction',
            type: 'textarea',
            admin: { description: 'Optional text above the publications list. Leave blank to show only the heading.' },
        },
    ],
};
