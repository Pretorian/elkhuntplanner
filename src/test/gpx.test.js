import { describe, it, expect } from 'vitest';
import { parseGPX } from '../lib/gpx';

const GPX = `<?xml version="1.0"?>
<gpx version="1.1" creator="onX" xmlns="http://www.topografix.com/GPX/1/1">
  <wpt lat="37.8000" lon="-106.5000">
    <ele>3000</ele>
    <name>Base Camp</name>
    <desc>Dispersed camping</desc>
    <sym>Campground</sym>
  </wpt>
  <wpt lat="37.8500" lon="-106.4800">
    <name>La Garita Creek</name>
    <type>water source</type>
  </wpt>
  <wpt lat="37.8200" lon="-106.5200">
    <name>Unmarked Point</name>
  </wpt>
</gpx>`;

describe('parseGPX', () => {
  it('parses wpt elements into waypoint objects', () => {
    const wps = parseGPX(GPX);
    expect(wps).toHaveLength(3);
    expect(wps[0]).toMatchObject({
      name: 'Base Camp',
      lat: 37.8,
      lng: -106.5,
      category: 'camp',
      notes: 'Dispersed camping',
    });
  });

  it('converts <ele> metres to feet', () => {
    const wps = parseGPX(GPX);
    // 3000 m * 3.28084 ≈ 9843 ft
    expect(wps[0].elevation).toBe(9843);
    expect(wps[0].elevationUnit).toBe('ft');
  });

  it('infers category from type/sym and defaults to other', () => {
    const wps = parseGPX(GPX);
    expect(wps[1].category).toBe('water');
    expect(wps[2].category).toBe('other');
  });

  it('leaves elevation unset when <ele> is absent (so it can be fetched)', () => {
    const wps = parseGPX(GPX);
    expect(wps[1].elevation).toBeUndefined();
  });

  it('throws on non-GPX XML', () => {
    expect(() => parseGPX('<kml><Document/></kml>')).toThrow(/Not a GPX/);
  });

  it('throws when there are no waypoints', () => {
    expect(() =>
      parseGPX('<gpx xmlns="http://www.topografix.com/GPX/1/1"><trk/></gpx>')
    ).toThrow(/No <wpt>/);
  });

  it('throws on empty input', () => {
    expect(() => parseGPX('')).toThrow(/empty/);
  });
});
