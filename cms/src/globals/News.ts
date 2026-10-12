import { INSTANCE_STATUSES, linkSchema, NEWS_SECTION_LABELS, NEWS_SECTIONS, newsSectionOrderSchema } from '@tarek/content';
import type { Field, GlobalConfig } from 'payload';
import { signedIn } from '../access';
import { publishedByField } from '../fields/publishedBy';

const exhibitionFields = (): Field[] => [
    { name: 'venue', type: 'text', required: true },
    { name: 'title', type: 'text' },
    { name: 'dateDisplay', label: 'Display dates', type: 'text' },
    { name: 'dateStart', label: 'Start date', type: 'date' },
    { name: 'dateEnd', label: 'End date', type: 'date' },
    { name: 'organization', type: 'text' },
    { name: 'location', type: 'text' },
    { name: 'work', label: 'Featured work', type: 'text' },
    {
        name: 'url', label: 'Exhibition link', type: 'text',
        validate: (value: unknown) => !value || linkSchema.safeParse(value).success || 'Enter a valid HTTP(S) URL.',
    },
    { name: 'status', type: 'select', options: [...INSTANCE_STATUSES] },
    {
        name: 'subExhibitions', label: 'Shows at this venue', type: 'array',
        fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'dateDisplay', label: 'Display dates', type: 'text', required: true },
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
            name: 'sectionOrder', label: 'Section order', type: 'array', required: true,
            minRows: NEWS_SECTIONS.length, maxRows: NEWS_SECTIONS.length,
            labels: { singular: 'Section', plural: 'Sections' },
            defaultValue: NEWS_SECTIONS.map((section) => ({ section })),
            admin: {
                description: 'Drag to reorder the four news sections. Include each section once. Publish and export to update the website.',
                components: { RowLabel: '/components/NewsSectionRowLabel#NewsSectionRowLabel' },
            },
            validate: (value: unknown) => newsSectionOrderSchema.safeParse(
                Array.isArray(value) ? value.map((row) => ({ section: row?.section })) : value
            ).success || 'Include each news section exactly once.',
            fields: [{
                name: 'section', type: 'select', required: true,
                options: NEWS_SECTIONS.map((section) => ({ label: NEWS_SECTION_LABELS[section], value: section })),
            }],
        },
        { name: 'soloHeading', type: 'text', required: true, defaultValue: 'Exhibitions' },
        { name: 'solo', label: 'Exhibitions', type: 'array', fields: exhibitionFields() },
        { name: 'groupHeading', type: 'text', required: true, defaultValue: 'Group exhibitions' },
        { name: 'group', label: 'Group exhibitions', type: 'array', fields: exhibitionFields() },
        {
            name: 'installationsHeading', label: 'Permanent installations heading',
            type: 'text', required: true, defaultValue: 'Permanent installations',
        },
        {
            name: 'installations', label: 'Permanent installations',
            type: 'array', fields: exhibitionFields(),
        },
        { name: 'performancesHeading', label: 'Performances heading', type: 'text', required: true, defaultValue: 'Performances' },
        { name: 'performances', label: 'Performances', type: 'array', fields: exhibitionFields() },
    ],
};
