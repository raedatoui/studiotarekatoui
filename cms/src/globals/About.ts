import type { GlobalConfig } from 'payload'
import { signedIn } from '../access'

export const About: GlobalConfig = {
  slug: 'about',
  admin: { group: 'Pages' },
  access: { read: signedIn, update: signedIn, readVersions: signedIn },
  versions: { drafts: true, max: 30 },
  fields: [
    { name: 'text', type: 'textarea', label: 'Biography' },
    { name: 'exhibitions', type: 'textarea' },
    { name: 'performances', type: 'textarea' },
    { name: 'groupExhibitions', type: 'textarea' },
    { name: 'collections', type: 'textarea' },
    { name: 'portraitURL', type: 'text', label: 'Portrait image URL' },
    {
      name: 'portraitPreview', type: 'ui',
      admin: {
        components: {
          Field: {
            path: '/components/MediaPreview#MediaPreview',
            clientProps: { urlField: 'portraitURL', labelField: 'portraitAlt' },
          },
        },
      },
    },
    { name: 'portraitAlt', type: 'text' },
    { name: 'portraitCredit', type: 'text' },
  ],
}
