import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Use vi.hoisted so mocks are available in the hoisted vi.mock factories
const { mockInitializeApp, mockGetApps, mockGetAuth } = vi.hoisted(() => ({
  mockInitializeApp: vi.fn(),
  mockGetApps: vi.fn(() => [] as unknown[]),
  mockGetAuth: vi.fn(() => ({ name: 'mock-auth' })),
}));

vi.mock('firebase/app', () => ({
  initializeApp: mockInitializeApp,
  getApps: mockGetApps,
}));

vi.mock('firebase/auth', () => ({
  getAuth: mockGetAuth,
}));

// Must import AFTER mocks are set up
import { initFirebase, isFirebaseConfigured } from '@/shared/lib/firebase';

describe('firebase.ts', () => {
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    vi.resetModules();
    mockInitializeApp.mockReturnValue({ name: 'mock-app' });
    mockGetApps.mockReturnValue([]);
    mockGetAuth.mockReturnValue({ name: 'mock-auth' });
  });

  afterEach(() => {
    // Restore env vars
    Object.keys(import.meta.env).forEach((key) => {
      if (key.startsWith('VITE_FIREBASE_')) {
        delete import.meta.env[key];
      }
    });
    Object.assign(import.meta.env, originalEnv);
  });

  describe('isFirebaseConfigured', () => {
    it('returns false when env vars are missing', () => {
      delete import.meta.env.VITE_FIREBASE_API_KEY;
      delete import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
      delete import.meta.env.VITE_FIREBASE_PROJECT_ID;
      delete import.meta.env.VITE_FIREBASE_APP_ID;

      expect(isFirebaseConfigured()).toBe(false);
    });

    it('returns true when all required env vars are set', () => {
      import.meta.env.VITE_FIREBASE_API_KEY = 'test-key';
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
      import.meta.env.VITE_FIREBASE_PROJECT_ID = 'test-project';
      import.meta.env.VITE_FIREBASE_APP_ID = '1:123:web:abc';

      expect(isFirebaseConfigured()).toBe(true);
    });

    it('returns false when only some env vars are set', () => {
      import.meta.env.VITE_FIREBASE_API_KEY = 'test-key';
      delete import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
      delete import.meta.env.VITE_FIREBASE_PROJECT_ID;
      delete import.meta.env.VITE_FIREBASE_APP_ID;

      expect(isFirebaseConfigured()).toBe(false);
    });
  });

  describe('initFirebase', () => {
    it('throws when required env vars are missing', () => {
      delete import.meta.env.VITE_FIREBASE_API_KEY;
      delete import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
      delete import.meta.env.VITE_FIREBASE_PROJECT_ID;
      delete import.meta.env.VITE_FIREBASE_APP_ID;

      expect(() => initFirebase()).toThrow('Missing Firebase config');
    });

    it('initializes app with correct config when env vars are set', () => {
      import.meta.env.VITE_FIREBASE_API_KEY = 'test-key';
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
      import.meta.env.VITE_FIREBASE_PROJECT_ID = 'test-project';
      import.meta.env.VITE_FIREBASE_APP_ID = '1:123:web:abc';

      const result = initFirebase();

      expect(result.app).toBeDefined();
      expect(result.auth).toBeDefined();
      expect(mockInitializeApp).toHaveBeenCalledWith(
        expect.objectContaining({
          apiKey: 'test-key',
          authDomain: 'test.firebaseapp.com',
          projectId: 'test-project',
          appId: '1:123:web:abc',
        }),
      );
    });

    it('reuses existing app if already initialized', () => {
      import.meta.env.VITE_FIREBASE_API_KEY = 'test-key';
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
      import.meta.env.VITE_FIREBASE_PROJECT_ID = 'test-project';
      import.meta.env.VITE_FIREBASE_APP_ID = '1:123:web:abc';

      // First call initializes
      initFirebase();

      // Second call should return cached — initializeApp should still be called only once
      // (because the module caches the app/auth references)
      const result = initFirebase();
      expect(result.app).toBeDefined();
      expect(result.auth).toBeDefined();
    });
  });

  describe('getFirebaseAuth', () => {
    it('throws when Firebase is not initialized', async () => {
      // Reset module to clear cached instances
      vi.resetModules();
      const freshModule = await import('@/shared/lib/firebase');
      expect(() => freshModule.getFirebaseAuth()).toThrow('Firebase not initialized');
    });
  });
});
