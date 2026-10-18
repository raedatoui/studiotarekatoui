import type { CollectionConfig } from 'payload';
import { signedIn } from '../access';
import { googleStrategy } from '../auth/googleStrategy';

export const Users: CollectionConfig = {
    slug: 'users',
    admin: {
        useAsTitle: 'email',
        group: 'Administration',
        description: 'Google accounts are added at first sign-in. Access is controlled by CMS_ALLOWED_EMAILS in .env.',
    },
    auth: { disableLocalStrategy: true, useSessions: false, strategies: [googleStrategy] },
    access: {
        admin: ({ req }) => Boolean(req.user),
        read: signedIn,
        create: () => false,
        update: () => false,
        delete: () => false,
    },
    fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true, unique: true },
        { name: 'googleId', type: 'text', required: true, unique: true, admin: { hidden: true } },
    ],
};
