import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { useAuthStore } from "../store";

type StoredUser = {
  id: number;
  email: string;
  fullName: string;
  onboardingComplete: boolean;
};

const ACCESS_TOKEN_KEY = "anes.accessToken";
const REFRESH_TOKEN_KEY = "anes.refreshToken";
const USER_KEY = "anes.user";

function base64Encode(value: object): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64");
}

function makeJwt(expSeconds: number): string {
  const header = base64Encode({ alg: "none", typ: "JWT" });
  const payload = base64Encode({ exp: expSeconds });
  return `${header}.${payload}.sig`;
}

function seedUser(): StoredUser {
  return {
    id: 1,
    email: "user@example.com",
    fullName: "Test User",
    onboardingComplete: true,
  };
}

describe("useAuthStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().logout();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rehydrates with a valid access token", async () => {
    const token = makeJwt(Math.floor(Date.now() / 1000) + 3600);
    const user = seedUser();

    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, "refresh");
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    await useAuthStore.getState().init();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe(token);
    expect(state.user?.email).toBe("user@example.com");
  });

  it("refreshes when access token is expired", async () => {
    const token = makeJwt(Math.floor(Date.now() / 1000) - 10);
    const user = seedUser();

    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, "refresh");
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          accessToken: "new-access",
          refreshToken: "new-refresh",
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await useAuthStore.getState().init();

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe("new-access");
    expect(state.refreshToken).toBe("new-refresh");
    expect(state.isAuthenticated).toBe(true);
  });

  it("clears state on logout", () => {
    const user = seedUser();
    useAuthStore.getState().setTokens("access", "refresh");
    useAuthStore.getState().setUser(user);

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
  });
});
