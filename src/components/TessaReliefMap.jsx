import { useEffect, useMemo, useRef, useState } from 'react';
import { Mountain, RefreshCw, AlertTriangle, MapPin } from 'lucide-react';
import { fetchElevationGrid, isElevationConfigured } from '../lib/elevation';

const C = {
  bg: '#0c1a10',
  surface: '#121f16',
  card: '#182519',
  border: '#2a4032',
  borderLight: '#3a5a45',
  accent: '#c47f20',
  green: '#4a9a5a',
  greenLight: '#6ab87a',
  text: '#e8e4d8',
  textSub: '#98b898',
  textMuted: '#5e7e60',
  red: '#c04a38',
};

// Waypoint category → dot colour (mirrors WAYPOINT_CATEGORIES in the app).
const CAT_COLORS = {
  camp: '#c47f20',
  water: '#4a9aff',
  glassing: '#4a9a5a',
  trail: '#98b898',
  parking: '#8a5a14',
  danger: '#c04a38',
  other: '#c4961a',
};

// Relief window around the unit centre (degrees).
const SPAN_LAT = 0.35;
const SPAN_LNG = 0.45;

// Elevation colour ramp (t: 0..1) → [r,g,b].
const RAMP = [
  [0.0, [36, 69, 31]], // dark timber green
  [0.35, [63, 107, 48]], // green
  [0.55, [143, 138, 60]], // meadow/khaki
  [0.75, [138, 90, 43]], // rock/brown
  [0.9, [184, 176, 160]], // scree
  [1.0, [245, 245, 245]], // snow
];

const rampColor = t => {
  const x = Math.max(0, Math.min(1, t));
  for (let i = 1; i < RAMP.length; i++) {
    if (x <= RAMP[i][0]) {
      const [t0, c0] = RAMP[i - 1];
      const [t1, c1] = RAMP[i];
      const f = (x - t0) / (t1 - t0 || 1);
      return [
        c0[0] + (c1[0] - c0[0]) * f,
        c0[1] + (c1[1] - c0[1]) * f,
        c0[2] + (c1[2] - c0[2]) * f,
      ];
    }
  }
  return RAMP[RAMP.length - 1][1];
};

// Render a hillshaded, elevation-coloured relief into `canvas`.
function drawRelief(canvas, grid, bbox) {
  const ctx = canvas.getContext && canvas.getContext('2d');
  if (!ctx) return null; // jsdom / unsupported — skip silently

  const rows = grid.length;
  const cols = grid[0].length;

  // min/max over valid cells
  let min = Infinity;
  let max = -Infinity;
  for (const row of grid)
    for (const v of row) {
      if (typeof v === 'number') {
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
  if (!Number.isFinite(min)) return null;
  const range = max - min || 1;

  // approximate cell size in feet (for physically-based slope)
  const latMid = (bbox.north + bbox.south) / 2;
  const ftPerDegLat = 364000;
  const ftPerDegLng = 364000 * Math.cos((latMid * Math.PI) / 180);
  const cellH = ((bbox.north - bbox.south) / rows) * ftPerDegLat;
  const cellW = ((bbox.east - bbox.west) / cols) * ftPerDegLng;

  const zFactor = 2.2; // relief exaggeration
  const zenith = ((90 - 45) * Math.PI) / 180; // 45° sun altitude
  const azimuth = ((360 - 315 + 90) % 360) * (Math.PI / 180); // NW light

  const off = document.createElement('canvas');
  off.width = cols;
  off.height = rows;
  const octx = off.getContext('2d');
  if (!octx) return null;
  const img = octx.createImageData(cols, rows);

  const at = (r, c) => {
    const rr = Math.max(0, Math.min(rows - 1, r));
    const cc = Math.max(0, Math.min(cols - 1, c));
    const v = grid[rr][cc];
    return typeof v === 'number' ? v : min;
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = (r * cols + c) * 4;
      const v = grid[r][c];
      if (typeof v !== 'number') {
        img.data[idx] = 18;
        img.data[idx + 1] = 31;
        img.data[idx + 2] = 22;
        img.data[idx + 3] = 255;
        continue;
      }
      const dzdx = (at(r, c + 1) - at(r, c - 1)) / (2 * cellW);
      const dzdy = (at(r + 1, c) - at(r - 1, c)) / (2 * cellH);
      const slope = Math.atan(zFactor * Math.hypot(dzdx, dzdy));
      const aspect = Math.atan2(dzdy, -dzdx);
      let hs =
        Math.cos(zenith) * Math.cos(slope) +
        Math.sin(zenith) * Math.sin(slope) * Math.cos(azimuth - aspect);
      hs = Math.max(0, Math.min(1, hs));

      const [cr, cg, cb] = rampColor((v - min) / range);
      const shade = 0.35 + 0.65 * hs;
      img.data[idx] = Math.round(cr * shade);
      img.data[idx + 1] = Math.round(cg * shade);
      img.data[idx + 2] = Math.round(cb * shade);
      img.data[idx + 3] = 255;
    }
  }
  octx.putImageData(img, 0, 0);

  // upscale smoothly onto the display canvas
  const scale = 9;
  canvas.width = cols * scale;
  canvas.height = rows * scale;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(off, 0, 0, canvas.width, canvas.height);

  return { min, max };
}

export default function TessaReliefMap({ unit }) {
  const enabled = isElevationConfigured();
  const canvasRef = useRef(null);
  const [status, setStatus] = useState(enabled ? 'loading' : 'nokey');
  const [error, setError] = useState(null);
  const [grid, setGrid] = useState(null);
  const [range, setRange] = useState(null);
  const [waypoints, setWaypoints] = useState([]);

  const { lat, lng } = unit.coords;
  const bbox = useMemo(
    () => ({
      south: lat - SPAN_LAT,
      north: lat + SPAN_LAT,
      west: lng - SPAN_LNG,
      east: lng + SPAN_LNG,
    }),
    [lat, lng]
  );

  // geographic aspect ratio so the relief isn't distorted
  const aspect = useMemo(() => {
    const cosLat = Math.cos((lat * Math.PI) / 180);
    return ((bbox.east - bbox.west) * cosLat) / (bbox.north - bbox.south);
  }, [bbox, lat]);

  // load waypoints for the overlay
  useEffect(() => {
    window.storage
      ?.get(`elk-waypoints-${unit.id}`)
      .then(r => setWaypoints(r?.value || []))
      .catch(() => setWaypoints([]));
  }, [unit.id]);

  const load = (force = false) => {
    if (!enabled) {
      setStatus('nokey');
      return;
    }
    setStatus('loading');
    setError(null);
    // grid columns proportional to geographic aspect (keeps cells ~square)
    const rows = 64;
    const cols = Math.max(32, Math.min(128, Math.round(rows * aspect)));
    fetchElevationGrid(bbox, { rows, cols, force })
      .then(res => {
        setGrid(res);
        setStatus('done');
      })
      .catch(err => {
        setError(err.message);
        setStatus('error');
      });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bbox, enabled]);

  // draw whenever grid changes
  useEffect(() => {
    if (status !== 'done' || !grid || !canvasRef.current) return;
    const r = drawRelief(canvasRef.current, grid.grid, grid.bbox);
    if (r) setRange(r);
  }, [status, grid]);

  const inBox = wp =>
    wp.lat <= bbox.north &&
    wp.lat >= bbox.south &&
    wp.lng >= bbox.west &&
    wp.lng <= bbox.east;

  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: '16px 18px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 12,
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: 18,
              fontWeight: 600,
              color: C.text,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Mountain
              size={18}
              style={{ color: C.accent }}
              aria-hidden="true"
            />
            TessaDEM Shaded Relief — {unit.displayName}
          </h3>
          <p
            style={{
              fontSize: 12,
              color: C.textMuted,
              margin: '4px 0 0',
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            Elevation-model hillshade · {waypoints.filter(inBox).length}{' '}
            waypoint
            {waypoints.filter(inBox).length === 1 ? '' : 's'} shown
          </p>
        </div>
        {enabled && (
          <button
            onClick={() => load(true)}
            disabled={status === 'loading'}
            aria-label="Refresh relief map"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 12px',
              background: 'transparent',
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              color: status === 'loading' ? C.textMuted : C.greenLight,
              fontSize: 12,
              fontFamily: "'IBM Plex Mono', monospace",
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            }}
          >
            <RefreshCw size={12} aria-hidden="true" />
            {status === 'loading' ? 'Rendering…' : 'Refresh'}
          </button>
        )}
      </div>

      {/* Relief surface */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: `${aspect}`,
          maxHeight: 520,
          borderRadius: 8,
          overflow: 'hidden',
          border: `1px solid ${C.border}`,
          background: C.surface,
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: status === 'done' ? 'block' : 'none',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Waypoint overlay */}
        {status === 'done' &&
          waypoints.filter(inBox).map(wp => {
            const left = ((wp.lng - bbox.west) / (bbox.east - bbox.west)) * 100;
            const top =
              ((bbox.north - wp.lat) / (bbox.north - bbox.south)) * 100;
            return (
              <div
                key={wp.id}
                title={`${wp.name}${typeof wp.elevation === 'number' ? ` · ${wp.elevation.toLocaleString()} ft` : ''}`}
                style={{
                  position: 'absolute',
                  left: `${left}%`,
                  top: `${top}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: CAT_COLORS[wp.category] || CAT_COLORS.other,
                  border: '2px solid #fff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
                  pointerEvents: 'auto',
                }}
              />
            );
          })}

        {/* Non-rendered states */}
        {status !== 'done' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: 24,
              gap: 10,
            }}
          >
            {status === 'nokey' && (
              <>
                <Mountain size={30} style={{ color: C.textMuted }} />
                <p style={{ color: C.textSub, fontSize: 13, margin: 0 }}>
                  Set <code>VITE_TESSADEM_API_KEY</code> in your{' '}
                  <code>.env</code> to render the TessaDEM shaded-relief map.
                </p>
              </>
            )}
            {status === 'loading' && (
              <p
                style={{
                  color: C.textSub,
                  fontSize: 13,
                  margin: 0,
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                Fetching elevation grid from TessaDEM…
              </p>
            )}
            {status === 'error' && (
              <>
                <AlertTriangle size={26} style={{ color: C.red }} />
                <p style={{ color: C.red, fontSize: 13, margin: 0 }}>{error}</p>
                <p style={{ color: C.textMuted, fontSize: 11, margin: 0 }}>
                  If this is a CORS error, the area request needs a small proxy.
                </p>
                <button
                  onClick={() => load(true)}
                  style={{
                    marginTop: 4,
                    padding: '6px 14px',
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    color: C.greenLight,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Retry
                </button>
              </>
            )}
          </div>
        )}

        {/* Elevation legend */}
        {status === 'done' && range && (
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              background: `${C.bg}e6`,
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              padding: '6px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: C.textSub,
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              {Math.round(range.min).toLocaleString()}′
            </span>
            <div
              style={{
                width: 90,
                height: 8,
                borderRadius: 4,
                background:
                  'linear-gradient(90deg,#24451f,#3f6b30,#8f8a3c,#8a5a2b,#b8b0a0,#f5f5f5)',
              }}
            />
            <span
              style={{
                fontSize: 10,
                color: C.text,
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              {Math.round(range.max).toLocaleString()}′
            </span>
          </div>
        )}

        {/* Coords overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            background: `${C.bg}e6`,
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            padding: '5px 9px',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontFamily: "'IBM Plex Mono', monospace",
              color: C.textSub,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <MapPin size={11} aria-hidden="true" />
            {lat.toFixed(3)}°N / {Math.abs(lng).toFixed(3)}°W
          </span>
        </div>
      </div>

      <p
        style={{
          fontSize: 11,
          color: C.textMuted,
          margin: '8px 0 0',
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        Relief generated from TessaDEM elevation data · NW-lit hillshade ·
        cached per unit
      </p>
    </div>
  );
}
