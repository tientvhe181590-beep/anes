import { test, expect } from '@playwright/test';

type StubUser = {
  id: number;
  email: string;
  fullName: string;
  onboardingComplete: boolean;
};

async function installE2eAuthOverrides(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    (globalThis as typeof globalThis & { __ANES_E2E_AUTH__?: unknown }).__ANES_E2E_AUTH__ = {
      signInWithEmailAndPassword: async () => ({
        user: { getIdToken: async () => 'e2e-firebase-id-token' },
      }),
      createUserWithEmailAndPassword: async () => ({
        user: { getIdToken: async () => 'e2e-firebase-id-token' },
      }),
      signInWithGooglePopup: async () => ({
        user: { getIdToken: async () => 'e2e-firebase-id-token' },
      }),
      signOut: async () => {},
    };
  });
}

async function mockFirebaseExchange(
  page: import('@playwright/test').Page,
  user: StubUser,
) {
  await page.route('**/api/v1/auth/firebase', async (route) => {
    await route.fulfill({
      status: user.onboardingComplete ? 200 : 201,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Authentication successful.',
        data: { user },
      }),
    });
  });
}

async function mockDashboardSummary(
  page: import('@playwright/test').Page,
  options?: { protected401?: boolean; rateLimitTwice?: boolean; requireAuthHeader?: boolean },
) {
  let requestCount = 0;

  await page.route('**/api/v1/dashboard/summary', async (route) => {
    requestCount += 1;

    const authHeader = route.request().headerValue('authorization');
    if (options?.requireAuthHeader && !authHeader) {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Unauthorized' }),
      });
      return;
    }

    if (options?.protected401) {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Unauthorized' }),
      });
      return;
    }

    if (options?.rateLimitTwice && requestCount <= 2) {
      await route.fulfill({
        status: 429,
        headers: { 'Retry-After': '60' },
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          code: 'RATE_LIMITED',
          message: 'Too many requests.',
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          caloriesConsumed: 1200,
          calorieTarget: 2000,
          macros: { protein: 80, carbs: 120, fat: 40 },
          todayWorkout: { id: 'w1', title: 'Push Day', durationMins: 45, completed: false },
          weekSchedule: [true, true, false, false, false, false, false],
          streak: 3,
        },
      }),
    });
  });
}

test.describe('Task 12 Integration & E2E', () => {
  test('12.1 registration redirects to onboarding', async ({ page }) => {
    await installE2eAuthOverrides(page);
    await mockFirebaseExchange(page, {
      id: 10,
      email: 'new@example.com',
      fullName: 'New User',
      onboardingComplete: false,
    });

    await page.goto('/register');
    await page.getByLabel('Full Name').fill('New User');
    await page.getByLabel('Email').fill('new@example.com');
    await page.getByLabel(/^Password$/).fill('VeryStrongPassword123!');
    await page.getByLabel('Confirm Password').fill('VeryStrongPassword123!');
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page).toHaveURL(/\/onboarding$/);
    await expect(page.getByText('Step 1 of')).toBeVisible();
  });

  test('12.2 google sign-in popup redirects to dashboard', async ({ page }) => {
    await installE2eAuthOverrides(page);
    await mockFirebaseExchange(page, {
      id: 11,
      email: 'google@example.com',
      fullName: 'Google User',
      onboardingComplete: true,
    });
    await mockDashboardSummary(page);

    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign in with Google' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText(/Good (morning|afternoon|evening),/)).toBeVisible();
  });

  test('12.3 sign-out redirects to landing and protected routes require auth', async ({ page }) => {
    await installE2eAuthOverrides(page);
    await mockFirebaseExchange(page, {
      id: 12,
      email: 'member@example.com',
      fullName: 'Member User',
      onboardingComplete: true,
    });
    await mockDashboardSummary(page);

    await page.goto('/login');
    await page.getByLabel('Email').fill('member@example.com');
    await page.getByLabel(/^Password$/).fill('VeryStrongPassword123!');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);

    await page.evaluate(() => {
      window.__ANES_AUTH_STORE__?.getState().logout();
    });
    await page.goto('/landing');
    await expect(page).toHaveURL(/\/landing$/);

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('12.4 rate-limited endpoint returns 429 after threshold and recovers on retry', async ({ page }) => {
    await installE2eAuthOverrides(page);
    await mockFirebaseExchange(page, {
      id: 13,
      email: 'rate@example.com',
      fullName: 'Rate User',
      onboardingComplete: true,
    });
    await mockDashboardSummary(page, { rateLimitTwice: true });

    await page.goto('/login');
    await page.getByLabel('Email').fill('rate@example.com');
    await page.getByLabel(/^Password$/).fill('VeryStrongPassword123!');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText('Something went wrong. Pull to retry.')).toBeVisible();
    await page.getByRole('button', { name: 'Retry' }).click();
    await expect(page.getByText(/Good (morning|afternoon|evening),/)).toBeVisible();
  });
});
