/**
 * TessaDEM Elevation API client.
 * Docs: https://tessadem.com/elevation-api/
 *
 * The API key is read from VITE_TESSADEM_API_KEY (embedded in the client
 * bundle like the app's other VITE_ keys). Points mode supports up to 512
 * locations per request within a 5°x5° extent — hunt-unit waypoints sit well
 * inside that, so a small set of waypoints resolves in a single request.
 */

const API_BASE = 'https://tessadem.com/api/elevation';
// API allows up to 512 points; keep request URLs modest and chunk beyond this.
const MAX_PER_REQUEST = 200;

export const getApiKey = () => import.meta.env.VITE_TESSADEM_API_KEY || '';

export const isElevationConfigured = () => Boolean(getApiKey());

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

// ── Persistent coordinate cache ─────────────────────────────────
// Elevations are keyed by rounded lat,lng and cached in localStorage so a
// given coordinate is only ever looked up once, no matter how many waypoints
// (or reloads) reference it. Resolved nulls are cached too, so unresolvable
// points aren't retried on every render.
const CACHE_KEY = 'elk-elevation-cache-v1';
const CACHE_PRECISION = 5; // ~1 m — fine enough to dedupe identical waypoints

const coordKey = (lat, lng) =>
  `${Number(lat).toFixed(CACHE_PRECISION)},${Number(lng).toFixed(CACHE_PRECISION)}`;

let _cache = null;
const readCache = () => {
  if (_cache) return _cache;
  try {
    _cache = JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
  } catch {
    _cache = {};
  }
  return _cache;
};
const writeCache = () => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(_cache));
  } catch {
    /* ignore quota / unavailable storage */
  }
};

/** Look up a single cached elevation (undefined if never fetched). */
export const getCachedElevation = (lat, lng) => {
  const c = readCache();
  const k = coordKey(lat, lng);
  return k in c ? c[k] : undefined;
};

// Separate cache for area-mode elevation grids (relief map), keyed by
// bbox + grid dimensions so a unit's relief is only fetched once.
// v2: corner order fixed to SW|NE — invalidates any grid cached by the
// earlier (incorrect NW|SE) request so users get a correct fetch.
const GRID_CACHE_KEY = 'elk-elevation-grid-v2';
let _gridCache = null;
const readGridCache = () => {
  if (_gridCache) return _gridCache;
  try {
    _gridCache = JSON.parse(localStorage.getItem(GRID_CACHE_KEY)) || {};
  } catch {
    _gridCache = {};
  }
  return _gridCache;
};
const writeGridCache = () => {
  try {
    localStorage.setItem(GRID_CACHE_KEY, JSON.stringify(_gridCache));
  } catch {
    /* ignore quota / unavailable storage */
  }
};

/** Wipe the elevation caches (points + grid). */
export const clearElevationCache = () => {
  _cache = {};
  _gridCache = {};
  writeCache();
  writeGridCache();
};

const STATUS_MESSAGES = {
  400: 'Malformed request',
  402: 'Insufficient API balance',
  414: 'Request URL too long',
  429: 'Rate limit exceeded — try again shortly',
  500: 'TessaDEM server error',
};

/**
 * Fetch elevations for a list of coordinates.
 * @param {Array<{lat:number, lng:number}>} points
 * @param {{unit?: 'feet'|'meters', signal?: AbortSignal}} [opts]
 * @returns {Promise<Array<number|null>>} elevations aligned to `points`
 *   (null where the API could not resolve a location).
 */
export async function fetchElevations(points, { unit = 'feet', signal } = {}) {
  const key = getApiKey();
  if (!key) {
    throw new Error(
      'TessaDEM API key not configured. Set VITE_TESSADEM_API_KEY in your .env.'
    );
  }
  if (!points || points.length === 0) return [];

  const elevations = [];
  for (const group of chunk(points, MAX_PER_REQUEST)) {
    const locations = group
      .map(p => `${Number(p.lat).toFixed(6)},${Number(p.lng).toFixed(6)}`)
      .join('|');
    const url =
      `${API_BASE}?key=${encodeURIComponent(key)}` +
      `&unit=${encodeURIComponent(unit)}` +
      `&locations=${encodeURIComponent(locations)}`;

    let res;
    try {
      res = await fetch(url, { signal });
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      throw new Error(
        `Network / CORS error contacting TessaDEM: ${err.message}`
      );
    }

    if (!res.ok) {
      throw new Error(
        `TessaDEM API error ${res.status}: ${STATUS_MESSAGES[res.status] || res.statusText}`
      );
    }

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error('TessaDEM returned an invalid JSON response.');
    }

    const rows = Array.isArray(data?.results) ? data.results : [];
    group.forEach((_, i) => {
      const e = rows[i]?.elevation;
      elevations.push(typeof e === 'number' && Number.isFinite(e) ? e : null);
    });
  }
  return elevations;
}

/**
 * Cache-backed variant of {@link fetchElevations}. Only coordinates absent
 * from the cache trigger an API request; everything else is served locally.
 * @param {Array<{lat:number, lng:number}>} points
 * @param {{force?:boolean, unit?:'feet'|'meters', signal?:AbortSignal}} [opts]
 *   `force: true` bypasses the cache and refreshes every point.
 * @returns {Promise<Array<number|null>>} elevations aligned to `points`
 */
export async function fetchElevationsCached(
  points,
  { force = false, unit = 'feet', signal } = {}
) {
  if (!points || points.length === 0) return [];
  const cache = readCache();

  // Only fetch coordinates we haven't resolved before (unless forcing).
  const toFetch = points.filter(
    p => force || !(coordKey(p.lat, p.lng) in cache)
  );

  if (toFetch.length > 0) {
    const fetched = await fetchElevations(toFetch, { unit, signal });
    toFetch.forEach((p, j) => {
      cache[coordKey(p.lat, p.lng)] = fetched[j];
    });
    writeCache();
  }

  return points.map(p => {
    const v = cache[coordKey(p.lat, p.lng)];
    return v === undefined ? null : v;
  });
}

// Normalize TessaDEM area-mode results into a rows×cols 2D array of numbers.
// Handles either a 2D array, a 2D array of {elevation}, or a flat list.
const normalizeGrid = (results, rows, cols) => {
  if (!Array.isArray(results)) return [];
  const toNum = c =>
    typeof c === 'number'
      ? c
      : c && typeof c.elevation === 'number'
        ? c.elevation
        : null;
  if (Array.isArray(results[0])) {
    return results.map(row => row.map(toNum));
  }
  const flat = results.map(toNum);
  const out = [];
  for (let r = 0; r < rows; r++) out.push(flat.slice(r * cols, (r + 1) * cols));
  return out;
};

/**
 * Fetch a grid of elevations over a bounding box using TessaDEM "area" mode,
 * for rendering a shaded-relief map. Results are cached per bbox+dimensions.
 * @param {{south:number, west:number, north:number, east:number}} bbox
 * @param {{rows?:number, cols?:number, unit?:string, signal?:AbortSignal, force?:boolean}} [opts]
 * @returns {Promise<{grid:Array<Array<number|null>>, rows:number, cols:number, bbox:object}>}
 */
export async function fetchElevationGrid(
  bbox,
  { rows = 72, cols = 72, unit = 'feet', signal, force = false } = {}
) {
  const key = getApiKey();
  if (!key) {
    throw new Error(
      'TessaDEM API key not configured. Set VITE_TESSADEM_API_KEY in your .env.'
    );
  }
  const { south, west, north, east } = bbox;
  const cacheKey = `${south.toFixed(4)},${west.toFixed(4)},${north.toFixed(4)},${east.toFixed(4)},${rows}x${cols},${unit}`;
  const cache = readGridCache();
  if (!force && cache[cacheKey]) return cache[cacheKey];

  // TessaDEM area mode expects the SOUTHWEST corner first, then the
  // NORTHEAST corner: `lat_sw,lng_sw|lat_ne,lng_ne` (latitude,longitude).
  const locations =
    `${south.toFixed(6)},${west.toFixed(6)}` +
    `|${north.toFixed(6)},${east.toFixed(6)}`;
  const url =
    `${API_BASE}?key=${encodeURIComponent(key)}` +
    `&mode=area&format=json&unit=${encodeURIComponent(unit)}` +
    `&rows=${rows}&columns=${cols}` +
    `&locations=${encodeURIComponent(locations)}`;

  let res;
  try {
    res = await fetch(url, { signal });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new Error(`Network / CORS error contacting TessaDEM: ${err.message}`);
  }
  if (!res.ok) {
    throw new Error(
      `TessaDEM API error ${res.status}: ${STATUS_MESSAGES[res.status] || res.statusText}`
    );
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('TessaDEM returned an invalid JSON response.');
  }

  const grid = normalizeGrid(data?.results, rows, cols);
  if (!grid.length || !grid[0]?.length) {
    throw new Error('TessaDEM returned no grid data for this area.');
  }
  const payload = { grid, rows: grid.length, cols: grid[0].length, bbox };
  cache[cacheKey] = payload;
  writeGridCache();
  return payload;
}
