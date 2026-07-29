import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// key must exist before importing the module (reads import.meta.env)
import.meta.env.VITE_TESSADEM_API_KEY = 'test-key';
const {
  fetchElevations,
  fetchElevationsCached,
  fetchElevationGrid,
  clearElevationCache,
  isElevationConfigured,
} = await import('../lib/elevation');

describe('elevation client', () => {
  afterEach(() => vi.restoreAllMocks());

  it('reports configured when key present', () => {
    expect(isElevationConfigured()).toBe(true);
  });

  it('requests points in feet and aligns results to input order', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          { latitude: 37.8, longitude: -106.5, elevation: 3000.4 },
          { latitude: 37.85, longitude: -106.48, elevation: 3123.9 },
        ],
      }),
    });
    const out = await fetchElevations([
      { lat: 37.8, lng: -106.5 },
      { lat: 37.85, lng: -106.48 },
    ]);
    expect(out).toEqual([3000.4, 3123.9]);
    const url = spy.mock.calls[0][0];
    expect(url).toContain('unit=feet');
    expect(url).toContain('key=test-key');
    // both locations, pipe-joined (encoded)
    expect(decodeURIComponent(url)).toContain(
      '37.800000,-106.500000|37.850000,-106.480000'
    );
  });

  it('maps unresolved elevations to null', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ results: [{ elevation: null }] }),
    });
    expect(await fetchElevations([{ lat: 1, lng: 2 }])).toEqual([null]);
  });

  it('throws a friendly message on rate limit', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
    });
    await expect(fetchElevations([{ lat: 1, lng: 2 }])).rejects.toThrow(
      /Rate limit/
    );
  });

  it('surfaces network/CORS failures', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new Error('Failed to fetch')
    );
    await expect(fetchElevations([{ lat: 1, lng: 2 }])).rejects.toThrow(/CORS/);
  });
});

describe('elevation cache', () => {
  beforeEach(() => {
    clearElevationCache();
  });
  afterEach(() => vi.restoreAllMocks());

  it('hits the API only for uncached coordinates', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ results: [{ elevation: 2500 }] }),
    });

    // First lookup -> one API call
    const a = await fetchElevationsCached([{ lat: 40.1, lng: -107.5 }]);
    expect(a).toEqual([2500]);
    expect(spy).toHaveBeenCalledTimes(1);

    // Same coordinate again -> served from cache, no new call
    const b = await fetchElevationsCached([{ lat: 40.1, lng: -107.5 }]);
    expect(b).toEqual([2500]);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('force bypasses the cache', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ results: [{ elevation: 2500 }] }),
    });
    await fetchElevationsCached([{ lat: 40.1, lng: -107.5 }]);
    await fetchElevationsCached([{ lat: 40.1, lng: -107.5 }], { force: true });
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('only requests the uncached subset in a mixed batch', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ results: [{ elevation: 1000 }] }),
    });
    // Seed one coordinate
    await fetchElevationsCached([{ lat: 1, lng: 1 }]);
    spy.mockClear();
    spy.mockResolvedValue({
      ok: true,
      json: async () => ({ results: [{ elevation: 2000 }] }),
    });
    // Batch of two: one cached (1,1), one new (2,2)
    const out = await fetchElevationsCached([
      { lat: 1, lng: 1 },
      { lat: 2, lng: 2 },
    ]);
    expect(out).toEqual([1000, 2000]);
    // Exactly one request, and it only contained the new coordinate
    expect(spy).toHaveBeenCalledTimes(1);
    expect(decodeURIComponent(spy.mock.calls[0][0])).toContain(
      '2.000000,2.000000'
    );
    expect(decodeURIComponent(spy.mock.calls[0][0])).not.toContain(
      '1.000000,1.000000'
    );
  });
});

describe('elevation grid (area mode)', () => {
  const bbox = { south: 37.5, west: -107.0, north: 38.0, east: -106.5 };
  beforeEach(() => clearElevationCache());
  afterEach(() => vi.restoreAllMocks());

  it('requests area mode and returns a 2D grid', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          [1000, 1100],
          [1200, 1300],
        ],
      }),
    });
    const res = await fetchElevationGrid(bbox, { rows: 2, cols: 2 });
    expect(res.grid).toEqual([
      [1000, 1100],
      [1200, 1300],
    ]);
    expect(res.rows).toBe(2);
    expect(res.cols).toBe(2);
    const url = decodeURIComponent(spy.mock.calls[0][0]);
    expect(url).toContain('mode=area');
    expect(url).toContain('rows=2');
    expect(url).toContain('columns=2');
    expect(url).toContain('unit=feet');
  });

  it('reshapes a flat result list into rows x cols', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ results: [1, 2, 3, 4, 5, 6] }),
    });
    const res = await fetchElevationGrid(bbox, { rows: 2, cols: 3 });
    expect(res.grid).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
  });

  it('caches the grid per bbox+dimensions', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ results: [[500]] }),
    });
    await fetchElevationGrid(bbox, { rows: 1, cols: 1 });
    await fetchElevationGrid(bbox, { rows: 1, cols: 1 });
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
