import type { GlobalConfig } from 'payload';
import { signedIn } from '../access';
import { publishedByField } from '../fields/publishedBy';

export const Contact: GlobalConfig = {
    slug: 'contact',
    admin: { group: false },
    access: { read: signedIn, update: signedIn, readVersions: signedIn },
    versions: { drafts: true, max: 30 },
    fields: [
        publishedByField(),
        { name: 'heading', type: 'text', defaultValue: 'Contact' },
        { name: 'text', type: 'textarea' },
        { name: 'email', type: 'email' },
    ],
};
