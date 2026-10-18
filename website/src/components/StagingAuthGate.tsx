'use client';

import { FirebaseError } from 'firebase/app';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { type ReactNode, useEffect, useState } from 'react';
import { getFirebaseAuth, googleProvider } from '@/lib/firebase';

export default function StagingAuthGate({ children, allowedEmails }: { children: ReactNode; allowedEmails: string[] }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [signingIn, setSigningIn] = useState(false);
    const [error, setError] = useState('');
    const authorized = Boolean(user?.emailVerified && user.email && allowedEmails.includes(user.email.trim().toLowerCase()));

    useEffect(
        () =>
            onAuthStateChanged(getFirebaseAuth(), (next) => {
                setUser(next);
                setLoading(false);
            }),
        []
    );

    async function signIn() {
        setError('');
        setSigningIn(true);
        try {
            await signInWithPopup(getFirebaseAuth(), googleProvider);
        } catch (err) {
            const code = err instanceof FirebaseError ? err.code : '';
            setError(
                code === 'auth/popup-closed-by-user'
                    ? 'Sign-in cancelled.'
                    : code === 'auth/popup-blocked'
                      ? 'Allow popups for this site to sign in.'
                      : code === 'auth/unauthorized-domain'
                        ? `Google sign-in is not authorized for ${window.location.hostname} in Firebase Authentication.`
                        : code === 'auth/operation-not-allowed'
                          ? 'Google sign-in is not enabled in Firebase Authentication.'
                          : code === 'auth/configuration-not-found'
                            ? 'Firebase Authentication has not been configured for this project.'
                            : `Sign-in failed (${code || 'unknown error'}). Please try again.`
            );
        } finally {
            setSigningIn(false);
        }
    }

    async function logOut() {
        setError('');
        try {
            await signOut(getFirebaseAuth());
        } catch {
            setError('Sign-out failed. Please try again.');
        }
    }

    if (!loading && authorized) {
        return (
            <>
                <div className="flex flex-wrap items-center justify-end gap-4 border-b border-[var(--color-border)] px-6 py-2 text-sm">
                    <span className="text-[var(--color-text-secondary)]">Staging</span>
                    <button type="button" onClick={logOut} className="cursor-pointer underline underline-offset-4">
                        Sign out
                    </button>
                    {error && <p role="alert">{error}</p>}
                </div>
                {children}
            </>
        );
    }

    return (
        <main className="flex min-h-screen items-center justify-center p-6">
            <section className="w-full max-w-md space-y-6" aria-label="Staging sign-in">
                <p className="font-mono text-sm uppercase tracking-widest text-[var(--color-text-secondary)]">Staging</p>
                <h1 className="font-display text-5xl">Studio Tarek Atoui</h1>
                {loading ? (
                    <p role="status">Loading your account…</p>
                ) : (
                    <>
                        <p>Sign in with your approved Google account to view the staging website.</p>
                        <button
                            type="button"
                            onClick={signIn}
                            disabled={signingIn}
                            className="cursor-pointer rounded border border-[var(--color-border)] px-5 py-3 disabled:cursor-wait disabled:opacity-50"
                        >
                            {signingIn ? 'Signing in…' : user ? 'Use another Google account' : 'Sign in with Google'}
                        </button>
                        {user && !authorized && <p role="alert">This account is not authorized to view staging.</p>}
                        {error && <p role="alert">{error}</p>}
                    </>
                )}
            </section>
        </main>
    );
}
