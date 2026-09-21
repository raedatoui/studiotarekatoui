import { INSTANCE_STATUSES, linkSchema } from '@tarek/content';
import type { Field, GlobalConfig } from 'payload';
import { signedIn } from '../access';

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
    admin: { group: 'Pages' },
    access: { read: signedIn, update: signedIn, readVersions: signedIn },
    versions: { drafts: true, max: 30 },
    fields: [
        { name: 'soloHeading', type: 'text', required: true, defaultValue: 'Exhibitions' },
        { name: 'solo', label: 'Exhibitions', type: 'array', fields: exhibitionFields() },
        { name: 'groupHeading', type: 'text', required: true, defaultValue: 'Group exhibitions' },
        { name: 'group', label: 'Group exhibitions', type: 'array', fields: exhibitionFields() },
    ],
};
