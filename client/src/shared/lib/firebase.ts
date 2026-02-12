import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

function loadConfig(): FirebaseConfig {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined;

  if (!apiKey || !authDomain || !projectId || !appId) {
    throw new Error(
      'Missing Firebase config. Ensure VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, ' +
        'VITE_FIREBASE_PROJECT_ID, and VITE_FIREBASE_APP_ID are set in your environment.',
    );
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) ?? undefined,
    messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) ?? undefined,
    appId,
  };
}

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

/**
 * Initialize Firebase. Safe to call multiple times — returns cached instances.
 * Throws if required VITE_FIREBASE_* env vars are missing.
 */
export function initFirebase(): { app: FirebaseApp; auth: Auth } {
  if (app && auth) {
    return { app, auth };
  }

  const config = loadConfig();

  // Re-use existing app if already initialized (HMR / test scenarios)
  app = getApps().length > 0 ? getApps()[0] : initializeApp(config);
  auth = getAuth(app);

  return { app, auth };
}

/**
 * Get the Firebase Auth instance. Must call `initFirebase()` first.
 */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    throw new Error('Firebase not initialized. Call initFirebase() first.');
  }
  return auth;
}

/**
 * Check whether Firebase is configured via env vars (without throwing).
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_APP_ID,
  );
}
