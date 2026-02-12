import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { checkPasswordBreach } from '../check-password-breach';

describe('checkPasswordBreach', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('returns breached:true when suffix matches', async () => {
    // SHA-1 of "password" = 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8
    // prefix = 5BAA6, suffix = 1E4C9B93F3F0682250B6CF8331B7EE68FD8
    const responseTxt = [
      '0018A45C4D1DEF81644B54AB7F969B88D65:1',
      '1E4C9B93F3F0682250B6CF8331B7EE68FD8:3861493',
      '00D4F6E8FA6EECAD2A3AA415EEC418D38EC:2',
    ].join('\n');

    vi.mocked(fetch).mockResolvedValue(new Response(responseTxt, { status: 200 }));

    const result = await checkPasswordBreach('password');

    expect(result.breached).toBe(true);
    expect(result.count).toBe(3861493);
    expect(result.error).toBe(false);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'https://api.pwnedpasswords.com/range/5BAA6',
      expect.objectContaining({
        headers: { 'Add-Padding': 'true' },
      }),
    );
  });

  it('returns breached:false when suffix not found', async () => {
    const responseTxt = [
      '0018A45C4D1DEF81644B54AB7F969B88D65:1',
      '00D4F6E8FA6EECAD2A3AA415EEC418D38EC:2',
    ].join('\n');

    vi.mocked(fetch).mockResolvedValue(new Response(responseTxt, { status: 200 }));

    const result = await checkPasswordBreach('xK9#mP2!uNiQuE_987!');

    expect(result.breached).toBe(false);
    expect(result.count).toBe(0);
    expect(result.error).toBe(false);
  });

  it('soft-fails when API returns non-OK status', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('Service Unavailable', { status: 503 }));

    const result = await checkPasswordBreach('anything');

    expect(result.breached).toBe(false);
    expect(result.count).toBe(0);
    expect(result.error).toBe(true);
  });

  it('soft-fails on network error', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));

    const result = await checkPasswordBreach('anything');

    expect(result.breached).toBe(false);
    expect(result.count).toBe(0);
    expect(result.error).toBe(true);
  });
});
