import { INSTANCE_STATUSES, linkSchema, NEWS_SECTION_LABELS, NEWS_SECTIONS, newsSectionOrderSchema } from '@tarek/content';
import type { Field, GlobalConfig } from 'payload';
import { signedIn } from '../access';
import { publishedByField } from '../fields/publishedBy';

const sectionItemLabels = {
    solo: 'Exhibition',
    group: 'Group exhibition',
    installations: 'Installation',
    performances: 'Performance',
};

const exhibitionFields = (): Field[] => [
    { name: 'venue', type: 'text', required: true },
    { name: 'title', type: 'text' },
    { name: 'dateDisplay', label: 'Display dates', type: 'textarea' },
    { name: 'dateStart', label: 'Start date', type: 'date' },
    { name: 'dateEnd', label: 'End date', type: 'date' },
    { name: 'organization', type: 'text' },
    { name: 'location', type: 'text' },
    { name: 'work', label: 'Featured work', type: 'text' },
    {
        name: 'url',
        label: 'Exhibition link',
        type: 'text',
        validate: (value: unknown) => !value || linkSchema.safeParse(value).success || 'Enter a valid HTTP(S) URL.',
    },
    { name: 'status', type: 'select', options: [...INSTANCE_STATUSES] },
    {
        name: 'subExhibitions',
        label: 'Sub-exhibitions',
        type: 'array',
        labels: { singular: 'Sub-exhibition', plural: 'Sub-exhibitions' },
        admin: {
            description:
                'Adding a sub-exhibition replaces the main entry’s title, display dates, organization, location, and featured work on the website. '
                + 'The venue and exhibition link remain. The main details stay saved and reappear if all sub-exhibitions are removed.',
            components: { RowLabel: '/components/NewsExhibitionRowLabel#NewsExhibitionRowLabel' },
        },
        fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'dateDisplay', label: 'Display dates', type: 'textarea', required: true },
            { name: 'location', type: 'text', required: true },
        ],
    },
];

export const News: GlobalConfig = {
    slug: 'news',
    label: 'News',
    admin: { group: false },
    access: { read: signedIn, update: signedIn, readVersions: signedIn },
    versions: { drafts: true, max: 30 },
    fields: [
        publishedByField(),
        {
            name: 'sectionOrder',
            label: 'Section order',
            type: 'array',
            required: true,
            minRows: NEWS_SECTIONS.length,
            maxRows: NEWS_SECTIONS.length,
            labels: { singular: 'Section', plural: 'Sections' },
            defaultValue: NEWS_SECTIONS.map((section) => ({ section })),
            admin: {
                description:
                    'Drag to reorder the four news sections and the editors below. Include each section once. Publish and export to update the website.',
                components: { RowLabel: '/components/NewsSectionRowLabel#NewsSectionRowLabel' },
            },
            validate: (value: unknown) =>
                newsSectionOrderSchema.safeParse(Array.isArray(value) ? value.map((row) => ({ section: row?.section })) : value).success ||
                'Include each news section exactly once.',
            fields: [
                {
                    name: 'section',
                    type: 'select',
                    required: true,
                    options: NEWS_SECTIONS.map((section) => ({ label: NEWS_SECTION_LABELS[section], value: section })),
                },
            ],
        },
        {
            type: 'row',
            admin: { components: { Field: '/components/NewsSectionsField#NewsSectionsField' } },
            fields: NEWS_SECTIONS.map(
                (section): Field => ({
                    type: 'group',
                    label: NEWS_SECTION_LABELS[section],
                    fields: [
                        {
                            name: `${section}Heading`,
                            label: 'Heading',
                            type: 'text',
                            required: true,
                            defaultValue: NEWS_SECTION_LABELS[section],
                        },
                        {
                            name: section,
                            label: 'Items',
                            type: 'array',
                            labels: { singular: sectionItemLabels[section], plural: NEWS_SECTION_LABELS[section] },
                            admin: { components: { RowLabel: '/components/NewsExhibitionRowLabel#NewsExhibitionRowLabel' } },
                            fields: exhibitionFields(),
                        },
                    ],
                })
            ),
        },
    ],
};
