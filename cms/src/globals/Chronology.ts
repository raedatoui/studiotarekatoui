import { chronologySchema, INSTANCE_KINDS, INSTANCE_STATUSES, linkSchema, mediaURLSchema, normalizeChronology, PROJECT_MEDIA_TYPES } from '@tarek/content';
import type { GlobalConfig } from 'payload';
import { signedIn } from '../access';
import { publishedByField } from '../fields/publishedBy';

export const Chronology: GlobalConfig = {
    slug: 'chronology',
    label: 'Chronology',
    admin: { group: false, description: 'The full project timeline. Currently visible in local development and on the staging website.' },
    access: { read: signedIn, update: signedIn, readVersions: signedIn },
    versions: { drafts: true, max: 30 },
    hooks: {
        beforeChange: [({ data, originalDoc }) => {
            if (data._status === 'published') chronologySchema.parse(normalizeChronology({ ...originalDoc, ...data }));
            return data;
        }],
    },
    fields: [
        publishedByField(),
        { name: 'heading', type: 'text', required: true, defaultValue: 'Chronology' },
        { name: 'introduction', type: 'textarea' },
        { name: 'editorialNotes', type: 'textarea', admin: { description: 'Private source questions and follow-up notes. Never exported to the website.' } },
        {
            name: 'projects', type: 'array', labels: { singular: 'Project', plural: 'Projects' },
            admin: {
                initCollapsed: true, description: 'Newest year first on the website; drag to order entries within each year.',
                components: { RowLabel: '/components/ChronologyRowLabel#ChronologyRowLabel' },
            },
            fields: [
                { name: 'projectId', label: 'Project ID', type: 'text', required: true, admin: { description: 'Stable ID from projects.json; lowercase words separated by hyphens.' } },
                { name: 'title', type: 'text' },
                { name: 'kind', type: 'select', required: true, options: [...INSTANCE_KINDS] },
                { name: 'year', type: 'number', required: true, min: 1, max: 9999 },
                { name: 'dateStart', type: 'date' },
                { name: 'dateEnd', type: 'date' },
                { name: 'dateDisplay', label: 'Display dates', type: 'text' },
                { name: 'status', type: 'select', options: [...INSTANCE_STATUSES] },
                { name: 'venue', type: 'text', required: true },
                { name: 'city', type: 'text' },
                { name: 'country', type: 'text' },
                { name: 'organization', type: 'text' },
                { name: 'collaborators', type: 'text', hasMany: true },
                { name: 'themeIds', label: 'Research slugs', type: 'text', hasMany: true, admin: { description: 'Confirmed research associations only. Use the research page slugs.' } },
                { name: 'note', label: 'Public note', type: 'textarea' },
                { name: 'needsReview', label: 'Needs editorial review', type: 'checkbox', defaultValue: false },
                { name: 'url', label: 'Project link', type: 'text', validate: (value: unknown) => !value || linkSchema.safeParse(value).success || 'Enter an HTTP(S) URL.' },
                {
                    name: 'media', type: 'array', fields: [
                        { name: 'type', type: 'select', required: true, options: [...PROJECT_MEDIA_TYPES] },
                        { name: 'url', type: 'text', required: true, validate: (value: unknown) => mediaURLSchema.safeParse(value).success || 'Enter an HTTP(S) URL or root-relative media path.' },
                        { name: 'label', type: 'text' },
                        { name: 'publisher', type: 'text' },
                    ],
                },
            ],
        },
    ],
};
