/**
 * Minimal GPX (GPS Exchange Format) waypoint parser.
 *
 * Extracts <wpt> elements into the app's waypoint shape:
 *   { name, lat, lng, category, notes, elevation?, elevationUnit? }
 *
 * GPX <ele> is metres above sea level; it is converted to feet to match the
 * rest of the app. Category is inferred from the <sym>/<type>/name text.
 */

const METERS_TO_FEET = 3.28084;

// Ordered keyword → category rules (first match wins). Categories must be keys
// of WAYPOINT_CATEGORIES in the dashboard.
const CATEGORY_RULES = [
  [/camp|tent|lodg|bivy|shelter/i, 'camp'],
  [/water|spring|creek|river|lake|stream|well|tank|pond/i, 'water'],
  [/glass|view|overlook|scenic|summit|peak|vista|ridge/i, 'glassing'],
  [/trail|hik|foot ?path|path|route/i, 'trail'],
  [/park|trailhead|car|vehicle|lot/i, 'parking'],
  [/danger|caution|hazard|warn|cliff|closed|boundary/i, 'danger'],
];

const inferCategory = (...hints) => {
  const text = hints.filter(Boolean).join(' ');
  for (const [re, cat] of CATEGORY_RULES) if (re.test(text)) return cat;
  return 'other';
};

// Namespace-agnostic tag lookup (GPX uses a default namespace).
const childText = (el, tag) => {
  const node = el.getElementsByTagNameNS('*', tag)[0];
  return node && node.textContent ? node.textContent.trim() : '';
};

/**
 * Parse GPX text and return an array of waypoint objects (without ids).
 * @param {string} text raw GPX/XML content
 * @returns {Array<object>}
 * @throws {Error} on invalid XML, non-GPX documents, or no waypoints found
 */
export function parseGPX(text) {
  if (!text || !text.trim()) {
    throw new Error('The GPX file is empty.');
  }

  const doc = new DOMParser().parseFromString(text, 'application/xml');

  // Browsers/jsdom report XML errors via a <parsererror> element.
  if (doc.getElementsByTagName('parsererror').length > 0) {
    throw new Error('Invalid GPX file — the XML could not be parsed.');
  }

  const root = doc.documentElement;
  if (!root || root.localName.toLowerCase() !== 'gpx') {
    throw new Error('Not a GPX file (missing a <gpx> root element).');
  }

  const wpts = Array.from(doc.getElementsByTagNameNS('*', 'wpt'));
  const results = [];

  for (const wpt of wpts) {
    const lat = parseFloat(wpt.getAttribute('lat'));
    const lng = parseFloat(wpt.getAttribute('lon'));
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    const sym = childText(wpt, 'sym');
    const type = childText(wpt, 'type');
    const name = childText(wpt, 'name') || `Waypoint ${results.length + 1}`;
    const notes = childText(wpt, 'desc') || childText(wpt, 'cmt') || '';

    const wp = {
      name,
      lat,
      lng,
      category: inferCategory(sym, type, name),
      notes,
    };

    const eleMeters = parseFloat(childText(wpt, 'ele'));
    if (Number.isFinite(eleMeters)) {
      wp.elevation = Math.round(eleMeters * METERS_TO_FEET);
      wp.elevationUnit = 'ft';
    }

    results.push(wp);
  }

  if (results.length === 0) {
    throw new Error('No <wpt> waypoints were found in this GPX file.');
  }

  return results;
}
