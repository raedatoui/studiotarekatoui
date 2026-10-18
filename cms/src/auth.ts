import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { getPayload } from 'payload';

import { isAllowedEmail, secureCookies, sessionCookieName } from './auth/settings';

export const { handlers, signIn, signOut } = NextAuth({
    providers: [Google({ authorization: { params: { prompt: 'select_account' } } })],
    session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
    pages: { signIn: '/admin/login', error: '/admin/login' },
    cookies: {
        sessionToken: {
            name: sessionCookieName,
            options: { httpOnly: true, sameSite: 'lax', path: '/', secure: secureCookies },
        },
    },
    callbacks: {
        async signIn({ account, profile }) {
            if (account?.provider !== 'google' || profile?.email_verified !== true || !profile.email || !isAllowedEmail(profile.email)) return false;

            const { default: config } = await import('./payload.config');
            const payload = await getPayload({ config });
            const existing = await payload.find({
                collection: 'users',
                where: { googleId: { equals: account.providerAccountId } },
                limit: 1,
                overrideAccess: true,
            });
            if (!existing.docs.length) {
                await payload.create({
                    collection: 'users',
                    overrideAccess: true,
                    data: {
                        email: profile.email.toLowerCase(),
                        name: profile.name || profile.email,
                        googleId: account.providerAccountId,
                    },
                });
            }
            return true;
        },
        jwt({ token, account, profile }) {
            if (account?.provider === 'google') {
                token.googleId = account.providerAccountId;
                token.email = profile?.email?.toLowerCase();
            }
            return token;
        },
    },
});
