import { getApps, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Called only from browser effects and handlers, never during static export.
export function getFirebaseAuth() {
    const app = getApps()[0] ?? initializeApp(firebaseConfig);
    return getAuth(app);
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
