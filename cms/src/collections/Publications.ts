import type { CollectionConfig } from 'payload';
import { contentAccess } from '../access';

export const Publications: CollectionConfig = {
    slug: 'publications',
    labels: { singular: 'Publication', plural: 'Publications' },
    admin: {
        useAsTitle: 'title',
        group: 'Content',
        defaultColumns: ['title', 'year', 'price', 'availability', '_status'],
        description: 'Books and records on the staging Publications page. Prices are in euros; checkout is not configured.',
    },
    access: contentAccess,
    versions: { drafts: true, maxPerDoc: 30 },
    fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'year', type: 'number', required: true, min: 1, max: 9999 },
        { name: 'price', label: 'Price (EUR)', type: 'number', min: 0, admin: { description: 'Leave empty when no price is listed.' } },
        {
            name: 'availability',
            type: 'select',
            required: true,
            options: [
                { label: 'Available', value: 'available' },
                { label: 'Out of print', value: 'out-of-print' },
            ],
        },
        { name: 'imageURL', label: 'Cover image URL', type: 'text', required: true },
        { name: 'imageCredit', type: 'text' },
        {
            name: 'coverPreview',
            type: 'ui',
            admin: {
                components: {
                    Field: { path: '/components/MediaPreview#MediaPreview', clientProps: { urlField: 'imageURL', labelField: 'title' } },
                },
            },
        },
        { name: 'body', label: 'Body copy', type: 'textarea', required: true },
        { name: 'sourceURL', label: 'Source publication page', type: 'text', required: true, unique: true },
        { name: 'editorialNotes', type: 'textarea', admin: { description: 'Private source notes for editorial review.' } },
    ],
};
