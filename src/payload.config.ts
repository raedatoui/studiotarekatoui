import { compatibilityOptions, mongooseAdapter } from '@payloadcms/db-mongodb'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { serverURL } from './auth/settings'
import { Users } from './collections/Users'
import { Research } from './collections/Research'
import { About } from './globals/About'
import { Contact } from './globals/Contact'
import { ResearchPage } from './globals/ResearchPage'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  serverURL,
  csrf: [serverURL],
  admin: {
    user: Users.slug,
    autoRefresh: false,
    meta: { titleSuffix: '— Studio Tarek Atoui' },
    importMap: { baseDir: path.resolve(dirname) },
    components: {
      views: {
        login: { Component: '/components/GoogleLogin#GoogleLogin', path: '/login' },
        logout: { Component: '/components/GoogleLogout#GoogleLogout', path: '/logout' },
        inactivity: { Component: '/components/GoogleLogout#GoogleLogout', path: '/logout-inactivity' },
      },
      logout: { Button: '/components/GoogleLogout#GoogleLogout' },
    },
  },
  collections: [Users, Research],
  globals: [ResearchPage, About, Contact],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
    ...compatibilityOptions.firestore,
    connectOptions: { autoIndex: false, autoCreate: false },
  }),
  sharp,
})
