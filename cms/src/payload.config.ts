import { compatibilityOptions, mongooseAdapter } from '@payloadcms/db-mongodb';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildConfig } from 'payload';
import sharp from 'sharp';

import { serverURL } from './auth/settings';
import { Users } from './collections/Users';
import { Research } from './collections/Research';
import { Publications } from './collections/Publications';
import { About } from './globals/About';
import { Contact } from './globals/Contact';
import { ResearchPage } from './globals/ResearchPage';
import { PublicationsPage } from './globals/PublicationsPage';
import { Navigation } from './globals/Navigation';
import { News } from './globals/News';
import { Chronology } from './globals/Chronology';
import { exportEndpoint } from './content/exportEndpoint';
import { uploadEndpoint } from './media/uploadEndpoint';
import { publishEndpoints } from './publish/endpoints';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
    serverURL,
    csrf: [serverURL],
    endpoints: [exportEndpoint, uploadEndpoint, ...publishEndpoints],
    admin: {
        user: Users.slug,
        autoRefresh: false,
        meta: {
            titleSuffix: '— Studio Tarek Atoui',
            description: 'Studio Tarek Atoui CMS',
            openGraph: {
                description: 'Studio Tarek Atoui CMS',
                siteName: 'Studio Tarek Atoui CMS',
            },
        },
        importMap: { baseDir: path.resolve(dirname) },
        livePreview: {
            collections: ['research'],
            globals: ['research-page', 'publications-page', 'about', 'contact', 'navigation', 'news', 'chronology'],
            url: ({ collectionConfig, globalConfig }) => {
                const kind = collectionConfig?.slug ?? globalConfig?.slug;
                const websiteURL = process.env.WEBSITE_PREVIEW_URL || 'http://localhost:3000';
                // Use a fresh URL for preview routes that were previously cached as 404s.
                return new URL(`/preview/${kind}?preview=1`, websiteURL).href;
            },
        },
        components: {
            beforeDashboard: ['/components/DashboardDrafts#DashboardDrafts'],
            afterDashboard: ['/components/DashboardPages#DashboardPages', '/components/ChronologyCreateButton#ChronologyCreateButton'],
            beforeNavLinks: ['/components/HomeNav#HomeNav'],
            afterNavLinks: ['/components/PagesNav#PagesNav', '/components/PublishNav#PublishNav', '/components/ExportContent#ExportContent'],
            views: {
                pages: { Component: '/components/PagesView#PagesView', path: '/pages', exact: true, meta: { title: 'Pages' } },
                publish: { Component: '/components/PublishView#PublishView', path: '/publish', exact: true, meta: { title: 'Publish website' } },
                guide: {
                    Component: '/components/GuideView#GuideView',
                    path: '/guide',
                    exact: true,
                    meta: { title: 'Managing content and pages' },
                },
                login: { Component: '/components/GoogleLogin#GoogleLogin', path: '/login' },
                logout: { Component: '/components/GoogleLogout#GoogleLogout', path: '/logout' },
                inactivity: { Component: '/components/GoogleLogout#GoogleLogout', path: '/logout-inactivity' },
            },
            logout: { Button: '/components/GoogleLogout#GoogleLogout' },
        },
    },
    collections: [Users, Research, Publications],
    globals: [ResearchPage, News, Chronology, PublicationsPage, About, Contact, Navigation],
    secret: process.env.PAYLOAD_SECRET || '',
    typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
    db: mongooseAdapter({
        url: process.env.DATABASE_URL || '',
        ...compatibilityOptions.firestore,
        connectOptions: { autoIndex: false, autoCreate: false },
    }),
    sharp,
});
