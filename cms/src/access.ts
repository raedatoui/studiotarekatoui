import type { Access } from 'payload';

export const signedIn: Access = ({ req }) => Boolean(req.user);
export const contentAccess = {
    read: signedIn,
    create: signedIn,
    update: signedIn,
    delete: signedIn,
    readVersions: signedIn,
};
