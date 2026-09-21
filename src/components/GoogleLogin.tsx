import type { AdminViewServerProps } from 'payload'
import { signIn } from '../auth'

export function GoogleLogin({ searchParams }: AdminViewServerProps) {
  const configured = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET && process.env.CMS_ALLOWED_EMAILS,
  )

  return (
    <div className="studio-login">
      <h1>Studio Tarek Atoui</h1>
      <p>Sign in to manage the website’s text, media, and press.</p>
      {searchParams?.error && (
        <p role="alert">Sign-in failed. Use an approved Google account or contact the studio administrator.</p>
      )}
      {configured ? (
        <form action={async () => {
          'use server'
          await signIn('google', { redirectTo: '/admin' })
        }}>
          <button className="btn btn--style-primary btn--size-medium" type="submit">
            Sign in with Google
          </button>
        </form>
      ) : (
        <p>Google sign-in needs configuration. Follow the Google setup steps in the CMS README.</p>
      )}
    </div>
  )
}
