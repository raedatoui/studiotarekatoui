import type { GlobalConfig } from 'payload'
import { signedIn } from '../access'

export const Contact: GlobalConfig = {
  slug: 'contact',
  admin: { group: 'Pages' },
  access: { read: signedIn, update: signedIn, readVersions: signedIn },
  versions: { drafts: true, max: 30 },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Contact' },
    { name: 'text', type: 'textarea' },
    { name: 'email', type: 'email' },
  ],
}
