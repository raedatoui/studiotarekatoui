import { getToken } from 'next-auth/jwt'
import type { AuthStrategy } from 'payload'

import { isAllowedEmail, serverURL, sessionCookieName } from './settings'

export const googleStrategy: AuthStrategy = {
  name: 'google',
  authenticate: async ({ headers, payload }) => {
    const origin = headers.get('origin')
    if (origin && origin !== serverURL) return { user: null }
    if (!process.env.AUTH_SECRET) return { user: null }

    const token = await getToken({
      req: { headers },
      secret: process.env.AUTH_SECRET,
      cookieName: sessionCookieName,
      salt: sessionCookieName,
    })
    if (!token || typeof token.googleId !== 'string' || !isAllowedEmail(token.email)) {
      return { user: null }
    }

    const result = await payload.find({
      collection: 'users',
      where: { googleId: { equals: token.googleId } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const user = result.docs[0]
    if (!user || !isAllowedEmail(user.email)) return { user: null }
    return { user: { ...user, collection: 'users', _strategy: 'google' } }
  },
}
