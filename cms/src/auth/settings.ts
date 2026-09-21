export const serverURL = process.env.AUTH_URL || 'http://localhost:3001'
export const secureCookies = serverURL.startsWith('https://')
export const sessionCookieName = `${secureCookies ? '__Secure-' : ''}tarek-cms.session-token`

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return (process.env.CMS_ALLOWED_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.trim().toLowerCase())
}
