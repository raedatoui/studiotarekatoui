import {
    chronologySchema,
    INSTANCE_KINDS,
    INSTANCE_STATUSES,
    linkSchema,
    mediaURLSchema,
    normalizeChronology,
    PROJECT_MEDIA_TYPES,
} from '@tarek/content';
import type { GlobalConfig } from 'payload';
import { signedIn } from '../access';
import { publishedByField } from '../fields/publishedBy';

export const Chronology: GlobalConfig = {
    slug: 'chronology',
    label: 'Chronology',
    admin: {
        group: 'Content',
        description: 'The full project timeline. Currently visible in local development and on the staging website.',
        components: {
            views: {
                edit: {
                    default: { Component: '/components/ChronologyEditView#ChronologyEditView' },
                    introduction: {
                        Component: '/components/ChronologyEditView#ChronologyEditView',
                        path: '/introduction',
                        meta: { title: 'Chronology page' },
                    },
                },
            },
        },
    },
    access: { read: signedIn, update: signedIn, readVersions: signedIn },
    versions: { drafts: true, max: 30 },
    hooks: {
        beforeChange: [
            ({ data, originalDoc }) => {
                if (data._status === 'published') chronologySchema.parse(normalizeChronology({ ...originalDoc, ...data }));
                return data;
            },
        ],
    },
    fields: [
        publishedByField(),
        {
            type: 'collapsible',
            label: 'Page introduction',
            fields: [
                { name: 'heading', type: 'text', required: true, defaultValue: 'Chronology' },
                { name: 'introduction', type: 'textarea' },
                {
                    name: 'editorialNotes',
                    type: 'textarea',
                    admin: { description: 'Private source questions and follow-up notes. Never exported to the website.' },
                },
            ],
        },
        {
            name: 'projects',
            type: 'array',
            labels: { singular: 'Project', plural: 'Projects' },
            admin: {
                initCollapsed: true,
                description: 'Newest year first on the website; drag to order entries within each year.',
                components: {
                    Field: '/components/ChronologyProjectsField#ChronologyProjectsField',
                    RowLabel: '/components/ChronologyRowLabel#ChronologyRowLabel',
                },
            },
            fields: [
                {
                    type: 'collapsible',
                    label: 'Project details',
                    fields: [
                        {
                            name: 'projectId',
                            label: 'URL ID',
                            type: 'text',
                            required: true,
                            admin: {
                                description:
                                    'A unique name for this entry in website links, e.g. whispering-playground-2025. '
                                    + 'Use lowercase letters, numbers and hyphens. Keep it unchanged after publishing.',
                            },
                        },
                        { name: 'title', type: 'text' },
                        { name: 'kind', type: 'select', required: true, options: [...INSTANCE_KINDS] },
                    ],
                },
                {
                    type: 'collapsible',
                    label: 'Dates and status',
                    fields: [
                        { name: 'year', type: 'number', required: true, min: 1, max: 9999 },
                        { name: 'dateStart', type: 'date' },
                        { name: 'dateEnd', type: 'date' },
                        { name: 'dateDisplay', label: 'Display dates', type: 'text' },
                        { name: 'status', type: 'select', options: [...INSTANCE_STATUSES] },
                    ],
                },
                {
                    type: 'collapsible',
                    label: 'Location and organization',
                    fields: [
                        { name: 'venue', type: 'text', required: true },
                        { name: 'city', type: 'text' },
                        { name: 'country', type: 'text' },
                        { name: 'organization', type: 'text' },
                    ],
                },
                {
                    type: 'collapsible',
                    label: 'Research and editorial',
                    fields: [
                        { name: 'collaborators', type: 'text', hasMany: true },
                        {
                            name: 'themeIds',
                            label: 'Related research (URL IDs)',
                            type: 'text',
                            hasMany: true,
                            admin: {
                                description:
                                    'Copy the URL ID from each related Research theme. Add only confirmed connections; leave blank if unsure.',
                            },
                        },
                        { name: 'note', label: 'Public note', type: 'textarea' },
                        { name: 'needsReview', label: 'Needs editorial review', type: 'checkbox', defaultValue: false },
                    ],
                },
                {
                    type: 'collapsible',
                    label: 'Links and media',
                    fields: [
                        {
                            name: 'url',
                            label: 'Project link',
                            type: 'text',
                            validate: (value: unknown) => !value || linkSchema.safeParse(value).success || 'Enter an HTTP(S) URL.',
                        },
                        {
                            name: 'media',
                            type: 'array',
                            fields: [
                                { name: 'type', type: 'select', required: true, options: [...PROJECT_MEDIA_TYPES] },
                                {
                                    name: 'url',
                                    type: 'text',
                                    required: true,
                                    validate: (value: unknown) =>
                                        mediaURLSchema.safeParse(value).success || 'Enter an HTTP(S) URL or root-relative media path.',
                                },
                                { name: 'label', type: 'text' },
                                { name: 'publisher', type: 'text' },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};
