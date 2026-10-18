import { navigationLinkSchema } from '@tarek/content';
import type { GlobalConfig } from 'payload';
import { signedIn } from '../access';

export const Navigation: GlobalConfig = {
    slug: 'navigation',
    label: 'Navigation',
    admin: { group: 'Website' },
    access: { read: signedIn, update: signedIn, readVersions: signedIn },
    versions: { drafts: true, max: 30 },
    fields: [
        {
            name: 'items',
            type: 'array',
            required: true,
            minRows: 1,
            labels: { singular: 'Menu item', plural: 'Menu items' },
            admin: { description: 'Drag to reorder. The same menu appears on desktop and mobile.' },
            defaultValue: [
                { label: 'Research', href: '/research', external: false },
                { label: 'News', href: '/news', external: false },
                { label: 'About', href: '/about', external: false },
                { label: 'Publications', href: '/publications', external: false },
                { label: 'Contact', href: '/contact', external: false },
            ],
            fields: [
                { name: 'label', type: 'text', required: true },
                {
                    name: 'href',
                    label: 'Link',
                    type: 'text',
                    required: true,
                    admin: { description: 'A website path such as /research, or a full https:// URL.' },
                    validate: (value: unknown) =>
                        navigationLinkSchema.safeParse(value).success || 'Enter a website path beginning with / or a valid HTTP(S) URL.',
                },
                { name: 'external', label: 'Open in a new tab', type: 'checkbox', defaultValue: false },
            ],
        },
    ],
};
