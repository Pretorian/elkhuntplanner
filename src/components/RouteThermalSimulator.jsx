import { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Mountain,
  Clock,
  Gauge,
  Wind,
  ArrowUp,
  ArrowDown,
  Sunrise,
  Sun,
  MapPin,
  TrendingUp,
  Crosshair,
  Trees,
  Footprints,
  Droplets,
  Compass,
  Activity,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// DESIGN TOKENS — matching the main app (rugged tactical dark)
// ═══════════════════════════════════════════════════════════════
const C = {
  bg: '#0c1a10',
  surface: '#121f16',
  card: '#182519',
  cardHover: '#1e2f20',
  border: '#2a4032',
  borderLight: '#3a5a45',
  accent: '#c47f20',
  accentHover: '#d9922a',
  green: '#4a9a5a',
  greenLight: '#6ab87a',
  text: '#e8e4d8',
  textSub: '#98b898',
  textMuted: '#5e7e60',
  amber: '#c4961a',
  red: '#c04a38',
  white: '#ffffff',
  // thermal accents
  cold: '#4aa3d4',
  coldDim: '#2b6f96',
  warm: '#e8873a',
  warmDim: '#b8531f',
};

// ═══════════════════════════════════════════════════════════════
// ROUTE DATA — Highway 149 → Dark Timber Bedding Bench (GMU 79)
// Coordinates are representative of the Hwy 149 corridor near Creede, CO.
// ═══════════════════════════════════════════════════════════════
const ROUTE = [
  {
    name: 'Highway 149 Pullout',
    short: 'Trailhead',
    elevation: 8520,
    distance: 0.0,
    lat: 37.8642,
    lng: -107.1385,
    kind: 'start',
  },
  {
    name: 'Aspen Transition Line',
    short: 'Aspen Line',
    elevation: 9500,
    distance: 0.35,
    lat: 37.8681,
    lng: -107.1441,
    kind: 'waypoint',
  },
  {
    name: 'Dark Timber Bedding Bench',
    short: 'Bedding Bench',
    elevation: 10380,
    distance: 0.85,
    lat: 37.8729,
    lng: -107.1502,
    kind: 'end',
  },
];

const TOTAL_GAIN = ROUTE[ROUTE.length - 1].elevation - ROUTE[0].elevation; // 1860 ft
const TOTAL_DISTANCE = ROUTE[ROUTE.length - 1].distance; // 0.85 mi

const PACE_OPTIONS = [
  { mph: 1.0, label: 'Heavy Pack / Steep' },
  { mph: 1.5, label: 'Medium Pack' },
  { mph: 2.0, label: 'Light Pack' },
];

const THERMAL = {
  predawn: {
    id: 'predawn',
    clockLabel: 'Pre-Dawn (4:30 AM)',
    startMin: 4 * 60 + 30,
    dir: 'down',
    color: C.cold,
    colorDim: C.coldDim,
    Icon: Sunrise,
    title: 'Downhill Drainage',
    airWord: 'Cold air sinking',
    detail:
      'Cooling air is dense and drains downhill through drainages and timber. Your scent flows down the mountain.',
    tactic:
      'Approach from BELOW / stay downhill of bedding. Hunt uphill into the draining air so your scent trails behind you.',
  },
  midday: {
    id: 'midday',
    clockLabel: 'Midday (11:00 AM)',
    startMin: 11 * 60,
    dir: 'up',
    color: C.warm,
    colorDim: C.warmDim,
    Icon: Sun,
    title: 'Uphill Rising',
    airWord: 'Warm air rising',
    detail:
      'Solar heating pushes warm air upslope. Your scent rises toward higher bedding areas.',
    tactic:
      'Approach from ABOVE / work the high side. Rising thermals carry scent up to bedded elk, so stay above them.',
  },
};

// ── helpers ───────────────────────────────────────────────────
const fmtDuration = mins => {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const fmtClock = totalMin => {
  const t = Math.round(totalMin) % (24 * 60);
  let h = Math.floor(t / 60);
  const m = t % 60;
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ap}`;
};

// Per-segment grade analysis derived from the topo points.
const buildSegments = route => {
  const segs = [];
  for (let i = 1; i < route.length; i++) {
    const a = route[i - 1];
    const b = route[i];
    const rise = b.elevation - a.elevation; // ft
    const runFt = (b.distance - a.distance) * 5280; // ft
    const grade = runFt > 0 ? (rise / runFt) * 100 : 0;
    const angle = (Math.atan2(rise, runFt) * 180) / Math.PI;
    let rating = 'Moderate';
    if (grade >= 45) rating = 'Very Steep';
    else if (grade >= 30) rating = 'Steep';
    else if (grade < 15) rating = 'Gentle';
    segs.push({ from: a, to: b, rise, grade, angle, rating });
  }
  return segs;
};

// ═══════════════════════════════════════════════════════════════
// SMALL PRIMITIVES
// ═══════════════════════════════════════════════════════════════
function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: '16px 18px',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children, style = {} }) {
  return (
    <p
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: C.textMuted,
        margin: '0 0 10px',
        ...style,
      }}
    >
      {children}
    </p>
  );
}

function MetricCard({ Icon, label, value, sub, accent = C.accent }) {
  return (
    <Card style={{ padding: '14px 16px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8,
        }}
      >
        <Icon size={15} style={{ color: accent }} aria-hidden="true" />
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: C.textMuted,
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          fontFamily: "'Oswald', sans-serif",
          fontSize: 26,
          fontWeight: 600,
          color: C.text,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: C.textSub, marginTop: 6 }}>
          {sub}
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
// ELEVATION CHART + THERMAL OVERLAY
// ═══════════════════════════════════════════════════════════════
function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.borderLight}`,
        borderRadius: 6,
        padding: '8px 10px',
        fontSize: 12,
      }}
    >
      <div style={{ color: C.text, fontWeight: 600, marginBottom: 2 }}>
        {p.name}
      </div>
      <div
        style={{
          color: C.greenLight,
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        {p.elevation.toLocaleString()} ft
      </div>
      <div
        style={{ color: C.textSub, fontFamily: "'IBM Plex Mono', monospace" }}
      >
        {p.distance.toFixed(2)} mi
      </div>
    </div>
  );
}

function MilestoneDot({ cx, cy, payload }) {
  if (cx == null || cy == null) return null;
  const color =
    payload.kind === 'end'
      ? C.accent
      : payload.kind === 'start'
        ? C.greenLight
        : C.green;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={color}
        stroke={C.bg}
        strokeWidth={2}
      />
    </g>
  );
}

// Arrows drawn along the ascending slope. Direction + palette follow thermals.
function ThermalOverlay({ thermal }) {
  const up = thermal.dir === 'up';
  const Arrow = up ? ArrowUp : ArrowDown;
  // positions climb from lower-left to upper-right, tracing the profile
  const arrows = [
    { left: '12%', top: '64%' },
    { left: '28%', top: '52%' },
    { left: '44%', top: '44%' },
    { left: '60%', top: '34%' },
    { left: '76%', top: '24%' },
    { left: '88%', top: '16%' },
  ];
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {arrows.map((a, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: a.left,
            top: a.top,
            animation: `${up ? 'rts-rise' : 'rts-drain'} 2.4s ease-in-out ${i * 0.18}s infinite`,
          }}
        >
          <Arrow
            size={26}
            style={{
              color: thermal.color,
              filter: `drop-shadow(0 0 5px ${thermal.color}88)`,
              opacity: 0.9,
            }}
          />
        </div>
      ))}
    </div>
  );
}

function ElevationPanel({ thermal }) {
  const data = ROUTE.map(p => ({
    name: p.name,
    distance: p.distance,
    elevation: p.elevation,
    kind: p.kind,
  }));
  return (
    <Card style={{ padding: '16px 18px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 4,
        }}
      >
        <h3
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: 18,
            fontWeight: 600,
            color: C.text,
            margin: 0,
          }}
        >
          Elevation Profile
        </h3>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 5,
            background: `${thermal.color}18`,
            border: `1px solid ${thermal.color}55`,
            color: thermal.color,
            fontSize: 11,
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: '0.05em',
          }}
        >
          <Wind size={13} aria-hidden="true" />
          Thermals {thermal.dir === 'up' ? 'Rising ↑' : 'Draining ↓'}
        </span>
      </div>
      <SectionLabel style={{ margin: '0 0 12px' }}>
        Distance (mi) vs. Elevation (ft) · {ROUTE.length} milestones
      </SectionLabel>

      <div style={{ position: 'relative', width: '100%', height: 340 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 16, left: 4, bottom: 4 }}
          >
            <defs>
              <linearGradient id="rtsElevFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.green} stopOpacity={0.55} />
                <stop offset="100%" stopColor={C.green} stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke={C.border}
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="distance"
              type="number"
              domain={[0, TOTAL_DISTANCE]}
              tickFormatter={v => v.toFixed(2)}
              tick={{
                fill: C.textSub,
                fontSize: 11,
                fontFamily: "'IBM Plex Mono', monospace",
              }}
              stroke={C.borderLight}
              label={{
                value: 'Distance (mi)',
                position: 'insideBottom',
                offset: -2,
                fill: C.textMuted,
                fontSize: 11,
              }}
            />
            <YAxis
              domain={[8300, 10600]}
              ticks={[8500, 9000, 9500, 10000, 10500]}
              tickFormatter={v => `${(v / 1000).toFixed(1)}k`}
              tick={{
                fill: C.textSub,
                fontSize: 11,
                fontFamily: "'IBM Plex Mono', monospace",
              }}
              stroke={C.borderLight}
              width={44}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: C.borderLight }}
            />
            <Area
              type="linear"
              dataKey="elevation"
              stroke={C.greenLight}
              strokeWidth={2.5}
              fill="url(#rtsElevFill)"
              dot={<MilestoneDot />}
              activeDot={{ r: 7, fill: C.accent, stroke: C.bg, strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
        <ThermalOverlay thermal={thermal} />
      </div>

      {/* milestone legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 8,
          marginTop: 10,
          flexWrap: 'wrap',
        }}
      >
        {ROUTE.map(p => (
          <div key={p.name} style={{ fontSize: 11 }}>
            <div
              style={{
                color: C.textSub,
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              {p.distance.toFixed(2)} mi
            </div>
            <div style={{ color: C.text, fontWeight: 500 }}>{p.short}</div>
            <div
              style={{
                color: C.greenLight,
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              {p.elevation.toLocaleString()} ft
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
// CONTROLS
// ═══════════════════════════════════════════════════════════════
function Controls({ timeOfDay, setTimeOfDay, pace, setPace }) {
  return (
    <Card>
      <SectionLabel>Simulation Controls</SectionLabel>

      {/* Time of Day toggle */}
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontSize: 12,
            color: C.textSub,
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Compass size={13} aria-hidden="true" /> Time of Day
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 6,
            background: C.surface,
            padding: 4,
            borderRadius: 8,
            border: `1px solid ${C.border}`,
          }}
        >
          {Object.values(THERMAL).map(t => {
            const active = timeOfDay === t.id;
            const TIcon = t.Icon;
            return (
              <button
                key={t.id}
                onClick={() => setTimeOfDay(t.id)}
                aria-pressed={active}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '10px 6px',
                  borderRadius: 6,
                  border: `1px solid ${active ? t.color : 'transparent'}`,
                  background: active ? `${t.color}1f` : 'transparent',
                  color: active ? t.color : C.textSub,
                  cursor: 'pointer',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  transition: 'all 0.15s',
                }}
              >
                <TIcon size={18} aria-hidden="true" />
                {t.id === 'predawn' ? 'Pre-Dawn' : 'Midday'}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 6 }}>
          {THERMAL[timeOfDay].clockLabel}
        </div>
      </div>

      {/* Pace selector */}
      <div>
        <div
          style={{
            fontSize: 12,
            color: C.textSub,
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Gauge size={13} aria-hidden="true" /> Pace / Pack Weight
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {PACE_OPTIONS.map(opt => {
            const active = pace === opt.mph;
            return (
              <button
                key={opt.mph}
                onClick={() => setPace(opt.mph)}
                aria-pressed={active}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: `1px solid ${active ? C.accent : C.border}`,
                  background: active ? `${C.accent}1f` : C.surface,
                  color: active ? C.text : C.textSub,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 13 }}>{opt.label}</span>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 13,
                    color: active ? C.accent : C.textMuted,
                    fontWeight: 600,
                  }}
                >
                  {opt.mph.toFixed(1)} mph
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAP / GPS CARD
// ═══════════════════════════════════════════════════════════════
function MapCard() {
  return (
    <Card>
      <SectionLabel>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <MapPin size={12} aria-hidden="true" /> Map View · GPS Waypoints
        </span>
      </SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ROUTE.map((p, i) => (
          <div
            key={p.name}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '8px 10px',
              background: C.surface,
              borderRadius: 6,
              border: `1px solid ${C.border}`,
            }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                flexShrink: 0,
                background:
                  p.kind === 'end'
                    ? C.accent
                    : p.kind === 'start'
                      ? C.greenLight
                      : C.green,
                color: C.bg,
                fontSize: 11,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              {i + 1}
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>
                {p.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: C.textSub,
                  fontFamily: "'IBM Plex Mono', monospace",
                  marginTop: 2,
                }}
              >
                {p.lat.toFixed(4)}°N, {Math.abs(p.lng).toFixed(4)}°W
              </div>
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 10,
          fontSize: 10,
          color: C.textMuted,
          fontFamily: "'IBM Plex Mono', monospace",
          letterSpacing: '0.04em',
        }}
      >
        DATUM WGS84 · GMU 79 · HWY 149 CORRIDOR
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
// ELK ANALYSIS — topo breakdown → probable elk locations
// ═══════════════════════════════════════════════════════════════
const HABITAT_BANDS = [
  {
    point: ROUTE[0],
    zone: 'Road Corridor / Riparian',
    Icon: Footprints,
    color: C.textSub,
    use: 'Travel & pressure',
    best: 'Avoid mid-day',
    note: 'High human pressure along Hwy 149. Elk cross here at night; not a holding area.',
  },
  {
    point: ROUTE[1],
    zone: 'Aspen Transition — FEEDING',
    Icon: Trees,
    color: C.green,
    use: 'Feeding & staging',
    best: 'Dawn & dusk',
    note: 'Aspen/forb edge produces forage. Elk stage here at first/last light, then retreat to timber.',
  },
  {
    point: ROUTE[2],
    zone: 'Dark Timber Bench — BEDDING',
    Icon: Mountain,
    color: C.accent,
    use: 'Bedding & security',
    best: 'Mid-day',
    note: 'North-facing dark timber on a flat bench = thermal cover + security. Prime mid-day bedding.',
  },
];

function probableZones(thermal) {
  // Confidence shifts slightly with time-of-day (where elk are likely to be).
  const midday = thermal.dir === 'up';
  return [
    {
      name: 'Dark Timber Bedding',
      Icon: Mountain,
      color: C.accent,
      elev: '10,200–10,400 ft',
      score: midday ? 88 : 62,
      why: 'North aspect, flat bench, security cover. Elk hold here through the day.',
    },
    {
      name: 'Aspen Feeding Edge',
      Icon: Trees,
      color: C.green,
      elev: '9,300–9,600 ft',
      score: midday ? 55 : 82,
      why: 'Forb-rich transition. Peak activity at first and last light.',
    },
    {
      name: 'Transition Benches',
      Icon: TrendingUp,
      color: C.greenLight,
      elev: '9,600–10,100 ft',
      score: midday ? 48 : 68,
      why: 'Travel corridors between feed and bed — intercept elk moving with thermals.',
    },
    {
      name: 'Drainage / Water',
      Icon: Droplets,
      color: C.cold,
      elev: 'Below 9,000 ft',
      score: 40,
      why: 'Creek bottoms below the aspen line. Secondary — used briefly, mostly nocturnal.',
    },
  ];
}

function ScoreBar({ score, color }) {
  return (
    <div
      style={{
        width: '100%',
        height: 6,
        background: C.surface,
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          width: `${score}%`,
          height: '100%',
          background: color,
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  );
}

function ElkAnalysis({ thermal }) {
  const segments = useMemo(() => buildSegments(ROUTE), []);
  const zones = probableZones(thermal);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* intro read */}
      <Card>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
          }}
        >
          <Crosshair size={16} style={{ color: C.accent }} aria-hidden="true" />
          <h3
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: 18,
              fontWeight: 600,
              color: C.text,
              margin: 0,
            }}
          >
            Location Read
          </h3>
        </div>
        <p style={{ fontSize: 14, color: C.text, lineHeight: 1.6, margin: 0 }}>
          This 0.85 mi corridor climbs{' '}
          <strong>{TOTAL_GAIN.toLocaleString()} ft</strong> through three
          classic elk habitat bands: a pressured road corridor, a mid-elevation
          aspen feeding edge, and a high dark-timber bedding bench. With{' '}
          <strong>{thermal.airWord.toLowerCase()}</strong>, the play is to{' '}
          <strong style={{ color: thermal.color }}>
            {thermal.dir === 'up'
              ? 'work above bedded elk'
              : 'stay below and hunt uphill'}
          </strong>{' '}
          so thermals keep your scent off the animals.
        </p>
      </Card>

      {/* habitat bands */}
      <Card>
        <SectionLabel>Elevation Band Breakdown</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {HABITAT_BANDS.map(b => {
            const BIcon = b.Icon;
            return (
              <div
                key={b.zone}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '10px 12px',
                  background: C.surface,
                  borderRadius: 6,
                  border: `1px solid ${C.border}`,
                  borderLeft: `3px solid ${b.color}`,
                }}
              >
                <BIcon
                  size={18}
                  style={{ color: b.color, flexShrink: 0, marginTop: 2 }}
                  aria-hidden="true"
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{ fontSize: 14, color: C.text, fontWeight: 600 }}
                    >
                      {b.zone}
                    </span>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 12,
                        color: C.greenLight,
                      }}
                    >
                      {b.point.elevation.toLocaleString()} ft
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      margin: '4px 0 6px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ fontSize: 11, color: b.color }}>
                      {b.use}
                    </span>
                    <span style={{ fontSize: 11, color: C.textMuted }}>·</span>
                    <span style={{ fontSize: 11, color: C.textSub }}>
                      Best: {b.best}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 12.5,
                      color: C.textSub,
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {b.note}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* probable zones with confidence */}
      <Card>
        <SectionLabel>
          Probable Elk Locations ·{' '}
          {thermal.dir === 'up' ? 'Mid-Day' : 'Pre-Dawn'} Confidence
        </SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {zones.map(z => {
            const ZIcon = z.Icon;
            return (
              <div key={z.name}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 5,
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13.5,
                      color: C.text,
                      fontWeight: 500,
                    }}
                  >
                    <ZIcon
                      size={15}
                      style={{ color: z.color }}
                      aria-hidden="true"
                    />
                    {z.name}
                    <span
                      style={{
                        fontSize: 11,
                        color: C.textMuted,
                        fontFamily: "'IBM Plex Mono', monospace",
                      }}
                    >
                      {z.elev}
                    </span>
                  </span>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 13,
                      color: z.color,
                      fontWeight: 700,
                    }}
                  >
                    {z.score}%
                  </span>
                </div>
                <ScoreBar score={z.score} color={z.color} />
                <p
                  style={{
                    fontSize: 12,
                    color: C.textSub,
                    lineHeight: 1.5,
                    margin: '6px 0 0',
                  }}
                >
                  {z.why}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* topo / slope analysis */}
      <Card>
        <SectionLabel>Topo Signal Analysis (from route grade)</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {segments.map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                background: C.surface,
                borderRadius: 6,
                border: `1px solid ${C.border}`,
              }}
            >
              <Activity
                size={16}
                style={{
                  color:
                    s.grade >= 45 ? C.red : s.grade >= 30 ? C.amber : C.green,
                  flexShrink: 0,
                }}
                aria-hidden="true"
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>
                  {s.from.short} → {s.to.short}
                </div>
                <div style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>
                  +{s.rise.toLocaleString()} ft ·{' '}
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    {s.grade.toFixed(0)}% grade (~{s.angle.toFixed(0)}°)
                  </span>
                </div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  padding: '3px 8px',
                  borderRadius: 4,
                  fontFamily: "'IBM Plex Mono', monospace",
                  color:
                    s.grade >= 45 ? C.red : s.grade >= 30 ? C.amber : C.green,
                  background: `${s.grade >= 45 ? C.red : s.grade >= 30 ? C.amber : C.green}18`,
                  border: `1px solid ${s.grade >= 45 ? C.red : s.grade >= 30 ? C.amber : C.green}44`,
                  whiteSpace: 'nowrap',
                }}
              >
                {s.rating}
              </span>
            </div>
          ))}
        </div>
        <p
          style={{
            fontSize: 12,
            color: C.textMuted,
            lineHeight: 1.5,
            margin: '12px 0 0',
          }}
        >
          Steeper pitches below the bench act as natural thermal barriers and
          travel funnels; the flatter bench up top is where elk settle to bed.
        </p>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════
const RouteThermalSimulator = () => {
  const [timeOfDay, setTimeOfDay] = useState('predawn');
  const [pace, setPace] = useState(1.0);
  const [view, setView] = useState('sim'); // 'sim' | 'elk'

  const thermal = THERMAL[timeOfDay];

  const durationMin = (TOTAL_DISTANCE / pace) * 60;
  const arrivalMin = thermal.startMin + durationMin;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* keyframes + responsive layout (no external CSS, matches app pattern) */}
      <style>{`
        @keyframes rts-drain {
          0%   { transform: translateY(-6px); opacity: 0.35; }
          50%  { transform: translateY(6px);  opacity: 1; }
          100% { transform: translateY(-6px); opacity: 0.35; }
        }
        @keyframes rts-rise {
          0%   { transform: translateY(6px);  opacity: 0.35; }
          50%  { transform: translateY(-6px); opacity: 1; }
          100% { transform: translateY(6px);  opacity: 0.35; }
        }
        .rts-layout { display: grid; grid-template-columns: 320px minmax(0, 1fr); gap: 16px; align-items: start; }
        .rts-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        @media (max-width: 900px) {
          .rts-layout { grid-template-columns: 1fr; }
        }
        @media (max-width: 520px) {
          .rts-metrics { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header + view switch */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: 22,
              fontWeight: 600,
              color: C.text,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Mountain
              size={22}
              style={{ color: C.accent }}
              aria-hidden="true"
            />
            Route &amp; Thermal Simulator
          </h2>
          <p style={{ fontSize: 13, color: C.textSub, margin: '4px 0 0' }}>
            Hwy 149 Pullout → Dark Timber Bedding Bench · GMU 79
          </p>
        </div>
        <div
          role="tablist"
          aria-label="Simulator view"
          style={{
            display: 'flex',
            gap: 4,
            background: C.surface,
            padding: 4,
            borderRadius: 8,
            border: `1px solid ${C.border}`,
          }}
        >
          {[
            { id: 'sim', label: 'Simulator', Icon: Activity },
            { id: 'elk', label: 'Elk Analysis', Icon: Crosshair },
          ].map(v => {
            const active = view === v.id;
            const VIcon = v.Icon;
            return (
              <button
                key={v.id}
                role="tab"
                aria-selected={active}
                onClick={() => setView(v.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '8px 14px',
                  borderRadius: 6,
                  border: 'none',
                  background: active ? C.accent : 'transparent',
                  color: active ? C.bg : C.textSub,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "'Oswald', sans-serif",
                  letterSpacing: '0.02em',
                  transition: 'all 0.15s',
                }}
              >
                <VIcon size={15} aria-hidden="true" />
                {v.label}
              </button>
            );
          })}
        </div>
      </div>

      {view === 'sim' ? (
        <>
          {/* metrics row */}
          <div className="rts-metrics">
            <MetricCard
              Icon={TrendingUp}
              label="Total Vertical Gain"
              value={`${TOTAL_GAIN.toLocaleString()} ft`}
              sub={`Over ${TOTAL_DISTANCE.toFixed(2)} mi`}
              accent={C.accent}
            />
            <MetricCard
              Icon={Clock}
              label="Est. Climb Time"
              value={fmtDuration(durationMin)}
              sub={`At ${pace.toFixed(1)} mph · ETA ${fmtClock(arrivalMin)}`}
              accent={C.greenLight}
            />
            <MetricCard
              Icon={thermal.Icon}
              label="Thermal Status"
              value={thermal.title}
              sub={thermal.airWord}
              accent={thermal.color}
            />
          </div>

          {/* main layout: controls sidebar + chart focal point */}
          <div className="rts-layout">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Controls
                timeOfDay={timeOfDay}
                setTimeOfDay={setTimeOfDay}
                pace={pace}
                setPace={setPace}
              />
              <MapCard />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <ElevationPanel thermal={thermal} />

              {/* thermal read-out */}
              <Card
                style={{
                  borderLeft: `3px solid ${thermal.color}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  {thermal.dir === 'up' ? (
                    <ArrowUp
                      size={16}
                      style={{ color: thermal.color }}
                      aria-hidden="true"
                    />
                  ) : (
                    <ArrowDown
                      size={16}
                      style={{ color: thermal.color }}
                      aria-hidden="true"
                    />
                  )}
                  <span
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: 16,
                      fontWeight: 600,
                      color: thermal.color,
                    }}
                  >
                    {thermal.title} — {thermal.airWord}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 13.5,
                    color: C.text,
                    lineHeight: 1.6,
                    margin: '0 0 8px',
                  }}
                >
                  {thermal.detail}
                </p>
                <p
                  style={{
                    fontSize: 13.5,
                    color: C.textSub,
                    lineHeight: 1.6,
                    margin: 0,
                    paddingTop: 8,
                    borderTop: `1px solid ${C.border}`,
                  }}
                >
                  <strong style={{ color: C.text }}>Scent strategy: </strong>
                  {thermal.tactic}
                </p>
              </Card>
            </div>
          </div>
        </>
      ) : (
        <ElkAnalysis thermal={thermal} />
      )}
    </div>
  );
};

export default RouteThermalSimulator;
