export interface E2eAuthUser {
  getIdToken: (forceRefresh?: boolean) => Promise<string>;
}

export interface E2eAuthResult {
  user: E2eAuthUser;
}

export interface E2eAuthOverrides {
  signInWithEmailAndPassword?: (email: string, password: string) => Promise<E2eAuthResult>;
  createUserWithEmailAndPassword?: (email: string, password: string) => Promise<E2eAuthResult>;
  signInWithGooglePopup?: () => Promise<E2eAuthResult>;
  signOut?: () => Promise<void>;
}

declare global {
  interface Window {
    __ANES_E2E_AUTH__?: E2eAuthOverrides;
  }

  var __ANES_E2E_AUTH__: E2eAuthOverrides | undefined;
}

export function getE2eAuthOverrides(): E2eAuthOverrides | null {
  if (typeof globalThis === 'undefined') {
    return null;
  }
  return globalThis.__ANES_E2E_AUTH__ ?? null;
}
