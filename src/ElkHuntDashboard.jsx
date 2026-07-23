import { useState, useEffect, useRef } from 'react';
import {
  Mountain,
  MapPin,
  TreePine,
  Compass,
  Home,
  Plug,
  Layers,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Pencil,
  Check,
  Info,
  Navigation,
  Target,
  Zap,
  Map,
  Lightbulb,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Package,
  Menu,
  Download,
  Eye,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { storage } from './storage';
import GearList from './components/GearList';
import AddUnitForm from './components/AddUnitForm';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import UserMenu from './components/UserMenu';
import FeatureGate from './components/FeatureGate';
import { FEATURES } from './lib/features';

// ═══════════════════════════════════════════════════════════════
// DESIGN TOKENS
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
  accentDim: '#8a5a14',
  green: '#4a9a5a',
  greenLight: '#6ab87a',
  text: '#e8e4d8',
  textSub: '#98b898',
  textMuted: '#5e7e60',
  amber: '#c4961a',
  red: '#c04a38',
  white: '#ffffff',
  gohuntOrange: '#f26522',
};

// Fix Leaflet default marker icon issue with bundlers
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&display=swap';

// ═══════════════════════════════════════════════════════════════
// INTEGRATION ADAPTER REGISTRY
// ═══════════════════════════════════════════════════════════════
const INTEGRATIONS = {
  gohunt: {
    id: 'gohunt',
    name: 'GoHunt',
    logoInitial: 'G',
    tagline: 'Draw odds, harvest stats, full unit profiles, and scouting maps',
    website: 'https://www.gohunt.com',
    status: 'partial', // public data sourced; full API pending membership
    dataTypes: [
      'Unit Stats',
      'Quick Tips',
      'Terrain Narrative',
      'Lodging',
      'Draw Odds (Insider)',
      'Weather Overlays (Insider)',
    ],
    profileBase:
      'https://www.gohunt.com/tools/profiles/colorado/units/big-game-unit-',
    // Adapter interface — implement when Insider API key available:
    connect: async () => {
      throw new Error('Requires GoHunt Insider subscription');
    },
    fetchDrawOdds: async (_unitId, _residency) => null,
    fetchHarvestStats: async _unitId => null,
    fetchWeather: async (_lat, _lng, _date) => null,
  },
  huntwise: {
    id: 'huntwise',
    name: 'HuntWise',
    logoInitial: 'H',
    tagline: 'Scouting layers, wind forecasts, moon phases, and pressure maps',
    website: 'https://huntwise.com',
    status: 'planned',
    dataTypes: [
      'Weather Forecast',
      'Scouting Layers',
      'Moon Phase',
      'Wind Direction',
      'Pressure Maps',
    ],
    connect: async () => {
      throw new Error('Not implemented');
    },
    fetchWeather: async (_lat, _lng, _date) => null,
    fetchScoutingLayers: async _unitId => null,
  },
};

// ═══════════════════════════════════════════════════════════════
// UNIT DATA  —  stats & narratives sourced from GoHunt (Apr 2026)
// ═══════════════════════════════════════════════════════════════
const UNITS = [
  {
    id: 'GMU-79',
    displayName: 'GMU 79',
    nickname: 'San Luis Valley',
    huntCode: 'EE079V1A',
    choiceRank: 2,
    choiceLabel: '2nd Choice',
    appLabel: 'E/S Non-Resident Only',
    counties: ['Mineral', 'Rio Grande', 'Saguache'],
    state: 'CO',
    forest: 'Rio Grande National Forest',
    // GoHunt At a Glance
    sqMiles: 420,
    publicPct: 75,
    elevation: [7683, 12063],
    coords: { lat: 37.8, lng: -106.5, zoom: 9 },
    gohuntSlug: '79',
    draw: 'high',
    antler:
      '4 pts on one antler OR 5" brow tine (corridor exception applies to damage tags ONLY)',
    // GoHunt Draw Odds (Real data from GoHunt - Non-Resident, 1st Choice)
    drawOdds: {
      huntCode: 'EE079V1A',
      year: 2026,
      // Odds by preference points (0-34) - GUARANTEED DRAW at all point levels!
      odds: [
        { points: 0, chance: 100 },
        { points: 1, chance: 100 },
        { points: 2, chance: 100 },
        { points: 3, chance: 100 },
        { points: 4, chance: 100 },
        { points: 5, chance: 100 },
        { points: 6, chance: 100 },
        { points: 7, chance: 100 },
        { points: 8, chance: 100 },
        { points: 9, chance: 100 },
        { points: 10, chance: 100 },
        { points: 11, chance: 100 },
        { points: 12, chance: 100 },
        { points: 13, chance: 100 },
        { points: 14, chance: 100 },
        { points: 15, chance: 100 },
        { points: 16, chance: 100 },
        { points: 17, chance: 100 },
        { points: 18, chance: 100 },
        { points: 19, chance: 100 },
        { points: 20, chance: 100 },
        { points: 21, chance: 100 },
        { points: 22, chance: 100 },
        { points: 23, chance: 100 },
        { points: 24, chance: 100 },
        { points: 25, chance: 100 },
        { points: 26, chance: 100 },
        { points: 27, chance: 100 },
        { points: 28, chance: 100 },
        { points: 29, chance: 100 },
        { points: 30, chance: 100 },
        { points: 31, chance: 100 },
        { points: 32, chance: 100 },
        { points: 33, chance: 100 },
        { points: 34, chance: 100 },
      ],
      applicants: null, // Not provided in HTML data
      tags: null, // Not provided in HTML data
    },
    // Hunt Plan — synthesized from CPW Hunting Atlas elk range layers
    huntPlan: {
      hunt: 'Late-season rifle (E/S Non-Resident) — early-mid November',
      rangePhase:
        'Migration → Winter Range. Snow in the La Garita Wilderness pushes elk east/SE off the high country down major creek drainages toward foothills above the San Luis Valley floor.',
      priorityLayers: [
        'Elk Migration Corridors',
        'Elk Winter Concentration Area',
        'Elk Winter Range',
      ],
      zones: [
        {
          rank: 1,
          name: 'La Garita Creek drainage (upper / mid)',
          layers: ['Elk Migration Corridors'],
          why: 'Primary migration funnel out of the La Garita Wilderness. Cows and bulls follow the drainage as snow accumulates above 10,000 ft. Sit timbered benches above creek bottoms.',
          access:
            'Saguache CR 41G → USFS Rd 670 / La Garita CG. Foot/horse only into wilderness proper; rim access via spur roads gets you above the corridor.',
        },
        {
          rank: 2,
          name: 'Carnero Creek / Bonanza area — winter range edge',
          layers: ['Elk Winter Concentration Area', 'Elk Winter Range'],
          why: 'Lower-elevation foothills and ponderosa/PJ benches where descending elk first concentrate. Sun-warmed south aspects with browse. Highest density once snow has been on the ground a week.',
          access:
            'Saguache CR G and spurs off US-285. Mix of NF, BLM, and private — check boundaries. Park high, hike to glassing positions.',
        },
        {
          rank: 3,
          name: 'Sangre de Cristo foothills — eastern boundary',
          layers: ['Elk Winter Range', 'Elk Overall Range'],
          why: 'Sand Dunes elk herd (5,000–6,000+ animals) winters along this front. Less hunted than wilderness corridors. Patient glassing of foothill draws can produce.',
          access:
            'Routes from US-285 north of Saguache. Private land checkerboard — verify access carefully.',
        },
      ],
      accessStrategy: [
        'Stage from a higher trailhead on USFS Rd 600 / 670 for La Garita Creek access; pre-dawn approach mandatory',
        'After any storm: drop 1,500–2,000 ft of elevation within 24 hrs — elk move fast on snow',
        'Carnero/Bonanza foothills are the "weather pivot" — make this your plan B before storms hit',
        'High non-resident pressure on Divide-area roads — get off-road early and stay mobile',
      ],
    },
    quickTips: [
      'Let optics cover the country for you — glass extensively before moving',
      'Be mobile and willing to move camp to follow elk',
      'Hunt away from roads and main trails to reduce competition',
      'Expect to see other hunters — high non-resident pressure',
      'Hunt low in cold, snowy weather as elk descend to valley floor',
    ],
    highlights: [
      'San Luis Valley — 8,000 square miles of dramatic high-desert terrain',
      '420 sq mi · 75% public land · 7,683–12,063 ft elevation',
      'Sangre de Cristo Mountains define the rugged eastern boundary',
      'Sand Dunes elk herd: 5,000–6,000+ animals',
    ],
    terrain: {
      summary:
        'Where the eastern plains meet the Rockies northwest of Alamosa, this unit has elk, deer and a few antelope. Elevations are mostly between 8,000 and 10,000 feet, with lows at 7,500 feet and some peaks exceeding 12,000 feet. Much of the unit is covered in high ridges between creek drainages. The eastern third is mostly flat with gentle foothills. Much of the low terrain in the east is private agricultural land.',
      vegetation: [
        'Low elevations: sagebrush, grass, pinyon pines, juniper, agricultural fields, scattered cottonwoods along creeks',
        'Middle elevations: slopes heavily forested with spruce and fir, large scattered aspen groves',
        'Ridge tops: flats covered with grass and wildflowers',
        'High elevations: grass, wildflowers, and loose rock scrabble on steep slopes',
        'Valley floor: agricultural fields and irrigated ranch land',
      ],
      features: [
        'Sangre de Cristo Mountains — steep and rugged eastern boundary',
        'La Garita Wilderness — roadless, foot/horse access only',
        'Rio Grande River corridor along southern boundary',
        'La Garita Driveway (ATV trail) — western unit access',
        'USFS Roads 600 and 600-3A — primary forest access',
      ],
      slope:
        'Very steep on public land — 80% of area has slopes ≤24°. Valley floor is flat but elk concentrate up in the mountains away from agricultural land.',
    },
    access: {
      summary:
        'Much of the unit has good public road access. A few well-maintained roads branch into primitive four-wheel-drive roads and ATV trails. Some routes are impassable in wet or snowy weather. Private land limits access on the eastern side of the unit.',
      publicAreas: [
        'Rio Grande National Forest — primary public land block',
        'La Garita Wilderness — roadless, foot/horse only',
        'BLM scattered parcels across unit',
        '75% of unit is public land',
      ],
      routes: [
        'US-285 — eastern boundary corridor',
        'US-160 — southern boundary, main highway from Del Norte',
        'County Hwy 149 — western and northern forest access',
        'USFS Road 600 → upper forest and La Garita access',
        'La Garita Driveway (ATV trail) — western unit',
      ],
      notes: [
        'Private agricultural land limits eastern access — verify all boundaries with onX',
        '4WD and ATV strongly recommended for upper-elevation routes',
        'Some routes impassable in wet or snowy weather',
        'Elk push into mountains away from valley floor — plan for substantial hiking',
        'Antler restriction corridor exception between Del Norte and Monte Vista applies to DAMAGE TAGS ONLY — not your hunt code',
      ],
    },
    directions: {
      fly: {
        airport: 'Alamosa (ALS) or Denver (DEN)',
        driveTime: 'ALS: 30–45 min · DEN: ~3.5 hrs',
        route:
          'DEN → I-25 S → US-160 W (Walsenburg) → Monte Vista / Del Norte. Or fly ALS via regional carriers for closer access.',
      },
      drive: {
        distance: '~1,600 mi',
        time: '~23 hrs',
        route:
          'I-40 W → I-25 N (Albuquerque) → US-285 N → Alamosa / Monte Vista corridor',
      },
    },
    // GoHunt named lodging
    lodging: {
      hubs: [
        {
          name: 'Monte Vista, CO',
          badge: 'Primary',
          note: 'Primary hotel town for GMU 79. Closest lodging to unit hunting areas.',
          dist: '15–45 min',
        },
        {
          name: 'Del Norte, CO',
          badge: 'Secondary',
          note: 'On the US-160 corridor. Small town with basic services.',
          dist: '20–50 min',
        },
        {
          name: 'Alamosa, CO',
          badge: 'Full Services',
          note: 'Regional airport (ALS), meat processing, full hotel selection.',
          dist: '45–60 min',
        },
      ],
      campgrounds: [
        'High-elevation dispersed camping along public roads (most common option)',
        'Rio Grande National Forest dispersed camping — free, primitive, no hookups',
      ],
      options: [
        'The Windsor Hotel — Del Norte (GoHunt listed)',
        'Monte Villa Inn — Monte Vista (GoHunt listed)',
        'Applelodge Bed & Breakfast — Monte Vista (GoHunt listed)',
        'Best Western Movie Manor — Monte Vista area (GoHunt listed)',
        'BBB Outfitters — private land hunt packages in the San Luis Valley',
      ],
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════
const DRAW_CONFIG = {
  high: { label: 'Hard Draw', color: '#c04a38', bg: '#2a1210' },
  moderate: { label: 'Moderate', color: '#c4961a', bg: '#2a2010' },
  'low-moderate': { label: 'Low–Moderate', color: '#4a9a5a', bg: '#102a18' },
};
const CHOICE_CONFIG = {
  2: { label: '2nd', color: '#c04a38' },
  3: { label: '3rd', color: '#c4961a' },
  4: { label: '4th', color: '#4a9a5a' },
};
const TABS = [
  { id: 'overview', label: 'Overview', Icon: Layers },
  { id: 'terrain', label: 'Terrain', Icon: Mountain },
  { id: 'access', label: 'Access', Icon: TreePine },
  { id: 'directions', label: 'Directions', Icon: Compass },
  { id: 'lodging', label: 'Lodging', Icon: Home },
  { id: 'waypoints', label: 'Waypoints', Icon: MapPin },
  { id: 'map', label: 'Map', Icon: Map },
  { id: 'gear', label: 'Gear', Icon: Package },
  { id: 'integrations', label: 'Integrations', Icon: Plug },
  { id: 'huntplan', label: 'Hunt Plan', Icon: Target },
  { id: 'misc', label: 'Misc', Icon: Info },
];

// Waypoint categories
const WAYPOINT_CATEGORIES = {
  camp: { label: 'Camp', color: '#c47f20', icon: '⛺' },
  water: { label: 'Water Source', color: '#4a9aff', icon: '💧' },
  glassing: { label: 'Glassing Spot', color: '#4a9a5a', icon: '👁️' },
  trail: { label: 'Trail Access', color: '#98b898', icon: '🥾' },
  parking: { label: 'Parking', color: '#8a5a14', icon: '🚗' },
  danger: { label: 'Caution', color: '#c04a38', icon: '⚠️' },
  other: { label: 'Other', color: '#c4961a', icon: '📍' },
};

// Map layer options
const MAP_LAYERS = {
  tracestrack: {
    id: 'tracestrack',
    name: 'Tracestrack Topo',
    description:
      'High-quality topographic maps optimized for outdoor activities',
    url: 'https://tile.tracestrack.com/topo__/{z}/{x}/{y}.png',
    attribution:
      'Map: <a href="https://www.tracestrack.com/">Tracestrack</a> | <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    maxZoom: 18,
  },
  usgs: {
    id: 'usgs',
    name: 'USGS Topographic',
    description: 'Classic USGS quad maps with contours',
    url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Map data: <a href="https://www.usgs.gov/">USGS</a>',
    maxZoom: 16,
  },
  satellite: {
    id: 'satellite',
    name: 'Satellite Imagery',
    description: 'High-resolution aerial/satellite photos',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Imagery: <a href="https://www.esri.com/">Esri</a>',
    maxZoom: 19,
  },
  esriTopo: {
    id: 'esriTopo',
    name: 'ESRI World Topo',
    description: 'Modern topo with trails and boundaries',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Map data: <a href="https://www.esri.com/">Esri</a>',
    maxZoom: 19,
  },
  openTopo: {
    id: 'openTopo',
    name: 'OpenTopoMap',
    description: 'European-style topo with contour lines',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map: <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17,
  },
  terrain: {
    id: 'terrain',
    name: 'Terrain Hillshade',
    description: '3D terrain shading to visualize slopes',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Terrain: <a href="https://www.esri.com/">Esri</a>',
    maxZoom: 13,
  },
  usgsImagery: {
    id: 'usgsImagery',
    name: 'USGS Imagery Topo',
    description: 'Satellite imagery with topo overlay',
    url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Map data: <a href="https://www.usgs.gov/">USGS</a>',
    maxZoom: 16,
  },
};

// ═══════════════════════════════════════════════════════════════
// SHARED SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════
function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: '16px 20px',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
function SectionLabel({ children }) {
  return (
    <p
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: C.textMuted,
        margin: '0 0 10px',
      }}
    >
      {children}
    </p>
  );
}
function BulletList({ items, icon: Icon, iconColor = C.accent }) {
  return (
    <ul
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {items.map((item, i) => (
        <li
          key={i}
          style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}
        >
          {Icon ? (
            <Icon
              size={14}
              style={{ color: iconColor, flexShrink: 0, marginTop: 3 }}
              aria-hidden="true"
            />
          ) : (
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: iconColor,
                flexShrink: 0,
                marginTop: 7,
              }}
              aria-hidden="true"
            />
          )}
          <span style={{ fontSize: 14, color: C.text, lineHeight: 1.55 }}>
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}
function Badge({ label, color, bg }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 4,
        background: bg || `${color}22`,
        color,
        fontSize: 11,
        fontFamily: "'IBM Plex Mono', monospace",
        fontWeight: 500,
        letterSpacing: '0.05em',
        border: `1px solid ${color}44`,
      }}
    >
      {label}
    </span>
  );
}
function GoHuntBadge({ slug }) {
  return (
    <a
      href={`${INTEGRATIONS.gohunt.profileBase}${slug}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View GMU ${slug} on GoHunt (opens in new tab)`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 9px',
        borderRadius: 4,
        background: `${C.gohuntOrange}18`,
        border: `1px solid ${C.gohuntOrange}44`,
        color: C.gohuntOrange,
        fontSize: 11,
        fontFamily: "'IBM Plex Mono', monospace",
        textDecoration: 'none',
        letterSpacing: '0.04em',
      }}
    >
      <ExternalLink size={11} aria-hidden="true" />
      GoHunt Profile
    </a>
  );
}

// ═══════════════════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════════════════
function TabBar({ activeTab, onChange }) {
  const tabRefs = useRef({});
  const handleKeyDown = (e, idx) => {
    if (e.key === 'ArrowRight') {
      const n = TABS[(idx + 1) % TABS.length];
      onChange(n.id);
      tabRefs.current[n.id]?.focus();
    }
    if (e.key === 'ArrowLeft') {
      const n = TABS[(idx - 1 + TABS.length) % TABS.length];
      onChange(n.id);
      tabRefs.current[n.id]?.focus();
    }
  };
  return (
    <div
      role="tablist"
      aria-label="Unit detail sections"
      style={{
        display: 'flex',
        borderBottom: `1px solid ${C.border}`,
        overflowX: 'auto',
        scrollbarWidth: 'none',
        flexShrink: 0,
      }}
    >
      {TABS.map(({ id, label, Icon }, idx) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            id={`tab-${id}`}
            role="tab"
            aria-selected={active}
            aria-controls={`panel-${id}`}
            tabIndex={active ? 0 : -1}
            ref={el => (tabRefs.current[id] = el)}
            onClick={() => onChange(id)}
            onKeyDown={e => handleKeyDown(e, idx)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '12px 18px',
              background: 'none',
              border: 'none',
              borderBottom: active
                ? `2px solid ${C.accent}`
                : '2px solid transparent',
              color: active ? C.accent : C.textMuted,
              fontFamily: "'Oswald', sans-serif",
              fontSize: 13,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s',
              outline: 'none',
            }}
          >
            <Icon size={14} aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB PANELS
// ═══════════════════════════════════════════════════════════════
function OverviewPanel({ unit }) {
  const draw = DRAW_CONFIG[unit.draw];
  const choice = CHOICE_CONFIG[unit.choiceRank];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* GoHunt At a Glance */}
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 14,
          }}
        >
          <SectionLabel>At a Glance · GoHunt</SectionLabel>
          <GoHuntBadge slug={unit.gohuntSlug} />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
          }}
        >
          {[
            { label: 'Size', value: `${unit.sqMiles.toLocaleString()} sq mi` },
            { label: 'Public Land', value: `${unit.publicPct}%` },
            {
              label: 'Elevation',
              value: `${unit.elevation[0].toLocaleString()}–${unit.elevation[1].toLocaleString()} ft`,
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                background: C.surface,
                borderRadius: 6,
                padding: '12px 14px',
                border: `1px solid ${C.border}`,
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  color: C.textMuted,
                  fontFamily: "'IBM Plex Mono', monospace",
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  margin: '0 0 4px',
                }}
              >
                {label}
              </p>
              <p
                style={{
                  fontSize: 20,
                  fontFamily: "'Oswald', sans-serif",
                  color: C.accent,
                  letterSpacing: '0.04em',
                  margin: 0,
                }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
        {/* Elevation bar */}
        <div style={{ marginTop: 14 }}>
          <div
            style={{
              position: 'relative',
              height: 8,
              background: C.surface,
              borderRadius: 4,
              overflow: 'hidden',
              border: `1px solid ${C.border}`,
            }}
          >
            <div
              aria-label={`Elevation range: ${unit.elevation[0].toLocaleString()} to ${unit.elevation[1].toLocaleString()} feet`}
              style={{
                position: 'absolute',
                left: `${((unit.elevation[0] - 4000) / (13000 - 4000)) * 100}%`,
                width: `${((unit.elevation[1] - unit.elevation[0]) / (13000 - 4000)) * 100}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${C.green}, ${C.accent})`,
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 5,
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: C.textMuted,
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              Low: {unit.elevation[0].toLocaleString()} ft
            </span>
            <span
              style={{
                fontSize: 10,
                color: C.textMuted,
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              High: {unit.elevation[1].toLocaleString()} ft
            </span>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Draw info */}
        <Card>
          <SectionLabel>Draw Status</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <Badge label={draw.label} color={draw.color} bg={draw.bg} />
              <Badge label={`${choice.label} Choice`} color={choice.color} />
            </div>
            <p
              style={{
                fontSize: 13,
                color: C.text,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: C.accent,
                }}
              >
                {unit.huntCode}
              </span>
              {' · '}
              {unit.appLabel}
            </p>
            <p
              style={{
                fontSize: 13,
                color: C.textSub,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {unit.draw === 'moderate' &&
                'First-year odds are viable. Limited archery — check CPW brochure for special restrictions.'}
              {unit.draw === 'low-moderate' &&
                'Typically 2–3 preference points for early seasons. OTC available for archery and select rifle seasons.'}
              {unit.draw === 'high' &&
                'Competitive draw with limited non-resident allocation. Challenging odds without banked preference points.'}
            </p>
            <p
              style={{
                fontSize: 12,
                color: C.textMuted,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              <strong style={{ color: C.text }}>Antler rule:</strong>{' '}
              {unit.antler}
            </p>
          </div>
        </Card>

        {/* Highlights */}
        <Card>
          <SectionLabel>Key Highlights</SectionLabel>
          <BulletList
            items={unit.highlights}
            icon={Target}
            iconColor={C.accent}
          />
        </Card>
      </div>

      {/* GoHunt Quick Tips */}
      <Card>
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
          <SectionLabel>Quick Tips · GoHunt</SectionLabel>
          <GoHuntBadge slug={unit.gohuntSlug} />
        </div>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}
        >
          {unit.quickTips.map((tip, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
                background: C.surface,
                borderRadius: 6,
                padding: '10px 12px',
                border: `1px solid ${C.border}`,
              }}
            >
              <Lightbulb
                size={13}
                style={{ color: C.amber, flexShrink: 0, marginTop: 2 }}
                aria-hidden="true"
              />
              <span style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>
                {tip}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function TerrainPanel({ unit }) {
  const { lat, lng, zoom } = unit.coords;
  // OpenStreetMap topo layer embed
  const osmTopoUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.8}%2C${lat - 0.5}%2C${lng + 0.8}%2C${lat + 0.5}&layer=cyclemap&marker=${lat}%2C${lng}`;
  const topoLinkUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}&layers=C`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card>
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
          <SectionLabel>Terrain Narrative · GoHunt</SectionLabel>
          <GoHuntBadge slug={unit.gohuntSlug} />
        </div>
        <p
          style={{
            fontSize: 14,
            color: C.text,
            lineHeight: 1.75,
            margin: 0,
            fontFamily: "'Source Serif 4', Georgia, serif",
          }}
        >
          {unit.terrain.summary}
        </p>
      </Card>

      {/* Topographic Map */}
      <Card>
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
            <SectionLabel>Topographic Map</SectionLabel>
            <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>
              Terrain visualization · {unit.elevation[0].toLocaleString()}–
              {unit.elevation[1].toLocaleString()} ft
            </p>
          </div>
          <a
            href={topoLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${unit.displayName} topo map in new tab`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 9px',
              borderRadius: 4,
              background: `${C.green}18`,
              border: `1px solid ${C.green}44`,
              color: C.green,
              fontSize: 11,
              fontFamily: "'IBM Plex Mono', monospace",
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={11} aria-hidden="true" />
            Full Topo Map
          </a>
        </div>

        {/* Map iframe */}
        <div
          style={{
            position: 'relative',
            borderRadius: 8,
            overflow: 'hidden',
            border: `1px solid ${C.border}`,
          }}
        >
          <iframe
            title={`Topographic map of ${unit.displayName} terrain`}
            src={osmTopoUrl}
            width="100%"
            height="360"
            style={{ display: 'block', border: 'none' }}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
          />
          {/* Elevation overlay */}
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              background: `${C.bg}ee`,
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              padding: '6px 10px',
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontFamily: "'IBM Plex Mono', monospace",
                color: C.accent,
                fontWeight: 500,
              }}
            >
              ▲ {unit.elevation[0].toLocaleString()}–
              {unit.elevation[1].toLocaleString()} ft
            </span>
          </div>
        </div>

        {/* Map attribution */}
        <p
          style={{
            fontSize: 10,
            color: C.textMuted,
            margin: '8px 0 0',
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          Topo data ©{' '}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: C.textMuted }}
          >
            OpenStreetMap
          </a>{' '}
          contributors
        </p>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <SectionLabel>Vegetation Zones</SectionLabel>
          <BulletList items={unit.terrain.vegetation} />
        </Card>
        <Card>
          <SectionLabel>Key Geographic Features</SectionLabel>
          <BulletList
            items={unit.terrain.features}
            icon={MapPin}
            iconColor={C.green}
          />
        </Card>
      </div>
      <Card>
        <SectionLabel>Slope & Difficulty Note</SectionLabel>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <AlertTriangle
            size={16}
            style={{ color: C.amber, flexShrink: 0, marginTop: 2 }}
            aria-hidden="true"
          />
          <p
            style={{ fontSize: 14, color: C.text, lineHeight: 1.65, margin: 0 }}
          >
            {unit.terrain.slope}
          </p>
        </div>
      </Card>
    </div>
  );
}

function AccessPanel({ unit }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card>
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
          <SectionLabel>Access Overview · GoHunt</SectionLabel>
          <GoHuntBadge slug={unit.gohuntSlug} />
        </div>
        <p
          style={{
            fontSize: 14,
            color: C.text,
            lineHeight: 1.75,
            margin: 0,
            fontFamily: "'Source Serif 4', Georgia, serif",
          }}
        >
          {unit.access.summary}
        </p>
      </Card>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <SectionLabel>Public Land Areas</SectionLabel>
          <BulletList
            items={unit.access.publicAreas}
            icon={CheckCircle}
            iconColor={C.green}
          />
        </Card>
        <Card>
          <SectionLabel>Primary Access Routes</SectionLabel>
          <BulletList
            items={unit.access.routes}
            icon={Navigation}
            iconColor={C.accent}
          />
        </Card>
      </div>
      <Card>
        <SectionLabel>Field Notes</SectionLabel>
        <BulletList items={unit.access.notes} icon={Info} iconColor={C.amber} />
      </Card>
    </div>
  );
}

function DirectionsPanel({ unit }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card>
        <SectionLabel>Fly-In Option</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 20,
                color: C.accent,
                letterSpacing: '0.04em',
              }}
            >
              {unit.directions.fly.airport}
            </span>
            <Badge
              label={`Drive: ${unit.directions.fly.driveTime}`}
              color={C.green}
            />
          </div>
          <p
            style={{ fontSize: 14, color: C.text, lineHeight: 1.65, margin: 0 }}
          >
            {unit.directions.fly.route}
          </p>
          {unit.directions.fly.note && (
            <p
              style={{
                fontSize: 13,
                color: C.accent,
                lineHeight: 1.5,
                margin: 0,
                fontStyle: 'italic',
              }}
            >
              ★ {unit.directions.fly.note}
            </p>
          )}
        </div>
      </Card>
      <Card>
        <SectionLabel>Drive from North Carolina</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Badge label={unit.directions.drive.distance} color={C.accent} />
            <Badge label={`~${unit.directions.drive.time}`} color={C.textSub} />
          </div>
          <p
            style={{ fontSize: 14, color: C.text, lineHeight: 1.65, margin: 0 }}
          >
            {unit.directions.drive.route}
          </p>
        </div>
      </Card>
      {UNITS.length > 1 && (
        <Card>
          <SectionLabel>All-Units Comparison</SectionLabel>
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 13,
              }}
              aria-label="Drive distance comparison across all hunt units"
            >
              <thead>
                <tr>
                  {[
                    'Unit',
                    'Drive Distance',
                    'Drive Time',
                    'Nearest Airport',
                  ].map(h => (
                    <th
                      key={h}
                      scope="col"
                      style={{
                        textAlign: 'left',
                        padding: '6px 12px',
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: C.textMuted,
                        borderBottom: `1px solid ${C.border}`,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {UNITS.map((u, i) => (
                  <tr
                    key={u.id}
                    style={{
                      background:
                        i % 2 === 0 ? 'transparent' : `${C.surface}88`,
                    }}
                  >
                    <td
                      style={{
                        padding: '8px 12px',
                        color: C.accent,
                        fontFamily: "'IBM Plex Mono', monospace",
                      }}
                    >
                      {u.displayName}
                    </td>
                    <td style={{ padding: '8px 12px', color: C.text }}>
                      {u.directions.drive.distance}
                    </td>
                    <td style={{ padding: '8px 12px', color: C.text }}>
                      {u.directions.drive.time}
                    </td>
                    <td style={{ padding: '8px 12px', color: C.textSub }}>
                      {u.directions.fly.airport}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function LodgingPanel({ unit }) {
  const hubColors = {
    Primary: C.accent,
    Secondary: C.green,
    'Full Services': C.green,
    Overflow: '#8888aa',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: 12,
        }}
      >
        {unit.lodging.hubs.map(hub => (
          <Card key={hub.name}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 15,
                  color: C.text,
                }}
              >
                {hub.name}
              </span>
              <Badge
                label={hub.badge}
                color={hubColors[hub.badge] || C.textSub}
              />
            </div>
            <p
              style={{
                fontSize: 13,
                color: C.textSub,
                lineHeight: 1.6,
                margin: '0 0 8px',
              }}
            >
              {hub.note}
            </p>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Navigation
                size={12}
                style={{ color: C.textMuted }}
                aria-hidden="true"
              />
              <span
                style={{
                  fontSize: 11,
                  color: C.textMuted,
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                {hub.dist} from hunting area
              </span>
            </div>
          </Card>
        ))}
      </div>
      <Card>
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
          <SectionLabel>Campgrounds · GoHunt</SectionLabel>
          <GoHuntBadge slug={unit.gohuntSlug} />
        </div>
        <BulletList
          items={unit.lodging.campgrounds}
          icon={TreePine}
          iconColor={C.green}
        />
      </Card>
      <Card>
        <SectionLabel>Lodging Options</SectionLabel>
        <BulletList
          items={unit.lodging.options}
          icon={Home}
          iconColor={C.accent}
        />
      </Card>
    </div>
  );
}

function MapPanel({ unit }) {
  const { lat, lng, zoom } = unit.coords;
  // OpenStreetMap embed — free, no API key
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 1.2}%2C${lat - 0.8}%2C${lng + 1.2}%2C${lat + 0.8}&layer=cyclemap&marker=${lat}%2C${lng}`;
  const topoUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}&layers=C`;
  const gohuntUrl = `${INTEGRATIONS.gohunt.profileBase}${unit.gohuntSlug}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 12,
          }}
        >
          <div>
            <SectionLabel>Unit Map — {unit.displayName}</SectionLabel>
            <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>
              Topo layer via OpenStreetMap · Centered on {unit.nickname}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <GoHuntBadge slug={unit.gohuntSlug} />
            <a
              href={topoUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${unit.displayName} in OpenStreetMap (opens in new tab)`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '3px 9px',
                borderRadius: 4,
                background: `${C.green}18`,
                border: `1px solid ${C.green}44`,
                color: C.green,
                fontSize: 11,
                fontFamily: "'IBM Plex Mono', monospace",
                textDecoration: 'none',
              }}
            >
              <ExternalLink size={11} aria-hidden="true" />
              Open Full Map
            </a>
          </div>
        </div>

        {/* Map iframe */}
        <div
          style={{
            position: 'relative',
            borderRadius: 8,
            overflow: 'hidden',
            border: `1px solid ${C.border}`,
          }}
        >
          <iframe
            title={`Topographic map of ${unit.displayName} — ${unit.nickname}`}
            src={osmUrl}
            width="100%"
            height="440"
            style={{ display: 'block', border: 'none' }}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
          />
          {/* Coords overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              background: `${C.bg}ee`,
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              padding: '6px 10px',
              display: 'flex',
              gap: 12,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontFamily: "'IBM Plex Mono', monospace",
                color: C.textSub,
              }}
            >
              {lat.toFixed(3)}°N / {Math.abs(lng).toFixed(3)}°W
            </span>
          </div>
        </div>

        {/* Attribution */}
        <p
          style={{
            fontSize: 11,
            color: C.textMuted,
            margin: '8px 0 0',
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          Map data ©{' '}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: C.textMuted }}
          >
            OpenStreetMap
          </a>{' '}
          contributors · Unit boundary data via{' '}
          <a
            href={gohuntUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: C.gohuntOrange }}
          >
            GoHunt
          </a>
        </p>
      </Card>

      {/* Quick links */}
      <Card>
        <SectionLabel>External Map Resources</SectionLabel>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            {
              label: 'GoHunt Unit Profile',
              href: gohuntUrl,
              color: C.gohuntOrange,
            },
            {
              label: 'CPW Unit Info',
              href: `https://cpw.state.co.us/hunting/big-game/elk`,
              color: C.green,
            },
            {
              label: 'CalTopo Topo Map',
              href: `https://caltopo.com/map.html#ll=${lat},${lng}&z=${zoom}&b=mbt`,
              color: C.accent,
            },
            {
              label: 'OnX Hunt Layers',
              href: `https://www.onxmaps.com/hunt`,
              color: C.accent,
            },
          ].map(({ label, href, color }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 6,
                background: `${color}18`,
                border: `1px solid ${color}44`,
                color,
                fontSize: 13,
                fontFamily: "'Oswald', sans-serif",
                letterSpacing: '0.05em',
                textDecoration: 'none',
              }}
              aria-label={`${label} (opens in new tab)`}
            >
              <ExternalLink size={13} aria-hidden="true" />
              {label}
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}

function WaypointsPanel({ unit }) {
  const [waypoints, setWaypoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState('tracestrack');
  const [formData, setFormData] = useState({
    name: '',
    lat: unit.coords.lat.toFixed(4),
    lng: unit.coords.lng.toFixed(4),
    category: 'other',
    notes: '',
  });

  const storageKey = `elk-waypoints-${unit.id}`;
  const currentLayer = MAP_LAYERS[selectedLayer];

  // Load waypoints from storage
  useEffect(() => {
    setLoading(true);
    window.storage
      ?.get(storageKey)
      .then(r => {
        setWaypoints(r?.value || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [unit.id, storageKey]);

  // Save waypoints to storage
  const saveWaypoints = async newWaypoints => {
    setWaypoints(newWaypoints);
    try {
      await window.storage?.set(storageKey, newWaypoints);
    } catch (error) {
      console.error('Failed to save waypoints:', error);
      // Continue execution - waypoints are still updated in state
    }
  };

  const handleAddWaypoint = () => {
    if (!formData.name.trim() || !formData.lat || !formData.lng) return;

    const newWaypoint = {
      id: Date.now().toString(),
      ...formData,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
    };

    if (editingId) {
      // Update existing waypoint
      saveWaypoints(
        waypoints.map(wp => (wp.id === editingId ? newWaypoint : wp))
      );
      setEditingId(null);
    } else {
      // Add new waypoint
      saveWaypoints([...waypoints, newWaypoint]);
    }

    // Reset form
    setFormData({
      name: '',
      lat: unit.coords.lat.toFixed(4),
      lng: unit.coords.lng.toFixed(4),
      category: 'other',
      notes: '',
    });
  };

  const handleEdit = waypoint => {
    setFormData({
      name: waypoint.name,
      lat: waypoint.lat.toFixed(4),
      lng: waypoint.lng.toFixed(4),
      category: waypoint.category,
      notes: waypoint.notes || '',
    });
    setEditingId(waypoint.id);
  };

  const handleDelete = id => {
    if (confirm('Delete this waypoint?')) {
      saveWaypoints(waypoints.filter(wp => wp.id !== id));
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: '',
      lat: unit.coords.lat.toFixed(4),
      lng: unit.coords.lng.toFixed(4),
      category: 'other',
      notes: '',
    });
  };

  const addSampleWaypoints = () => {
    const samples = {
      'GMU-12': [
        {
          name: 'Vaughn Lake Camp',
          lat: 40.12,
          lng: -107.48,
          category: 'camp',
          notes: 'USFS campground, open June-Oct',
        },
        {
          name: 'Morapos Creek',
          lat: 40.18,
          lng: -107.52,
          category: 'water',
          notes: 'Reliable water source',
        },
        {
          name: 'Ridge Glassing Point',
          lat: 40.2,
          lng: -107.45,
          category: 'glassing',
          notes: 'Good morning glassing spot, overlooks valley',
        },
        {
          name: 'Trailhead Parking',
          lat: 40.14,
          lng: -107.5,
          category: 'parking',
          notes: 'Main trailhead access',
        },
      ],
      'GMU-62': [
        {
          name: 'Divide Road Camp',
          lat: 38.65,
          lng: -108.2,
          category: 'camp',
          notes: 'Dispersed camping along USFS Rd 402',
        },
        {
          name: 'Potter Canyon Spring',
          lat: 38.6,
          lng: -108.15,
          category: 'water',
          notes: 'Spring in canyon bottom',
        },
        {
          name: 'Plateau Overlook',
          lat: 38.7,
          lng: -108.25,
          category: 'glassing',
          notes: 'Glassing into canyons from plateau edge',
        },
        {
          name: 'Mesa Access',
          lat: 38.62,
          lng: -108.18,
          category: 'trail',
          notes: 'Trail down into canyon',
        },
      ],
      'GMU-79': [
        {
          name: 'USFS Road 600 Camp',
          lat: 37.8,
          lng: -106.5,
          category: 'camp',
          notes: 'High elevation dispersed camping',
        },
        {
          name: 'La Garita Creek',
          lat: 37.85,
          lng: -106.48,
          category: 'water',
          notes: 'Creek crossing on trail',
        },
        {
          name: 'Ridge Top View',
          lat: 37.82,
          lng: -106.52,
          category: 'glassing',
          notes: 'Panoramic glassing point',
        },
        {
          name: 'Wilderness Boundary',
          lat: 37.78,
          lng: -106.46,
          category: 'danger',
          notes: 'La Garita Wilderness - foot/horse only beyond this point',
        },
      ],
    };

    const unitSamples = samples[unit.id] || [];
    const newWaypoints = [...waypoints];

    unitSamples.forEach(sample => {
      newWaypoints.push({
        id: Date.now().toString() + Math.random(),
        ...sample,
      });
    });

    saveWaypoints(newWaypoints);
  };

  // Custom marker icon creator
  const createCustomIcon = category => {
    const cat = WAYPOINT_CATEGORIES[category] || WAYPOINT_CATEGORIES.other;
    return L.divIcon({
      html: `<div style="background: ${cat.color}; width: 28px; height: 28px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><span style="transform: rotate(45deg); font-size: 14px;">${cat.icon}</span></div>`,
      className: 'custom-marker',
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -28],
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card>
        <div
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
            marginBottom: 12,
          }}
        >
          <Info
            size={16}
            style={{ color: C.accent, flexShrink: 0, marginTop: 2 }}
            aria-hidden="true"
          />
          <p
            style={{
              fontSize: 14,
              color: C.textSub,
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            Mark important locations for your hunt: camps, water sources,
            glassing spots, trail access, parking areas, and more. Waypoints are
            saved per unit and persist across sessions.
          </p>
        </div>
        {waypoints.length === 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              paddingTop: 8,
              borderTop: `1px solid ${C.border}`,
            }}
          >
            <button
              onClick={addSampleWaypoints}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                background: C.surface,
                color: C.accent,
                border: `1px solid ${C.accent}44`,
                borderRadius: 6,
                fontFamily: "'Oswald', sans-serif",
                fontSize: 13,
                cursor: 'pointer',
                letterSpacing: '0.05em',
              }}
            >
              <Lightbulb size={14} />
              Add Sample Waypoints to See Markers
            </button>
          </div>
        )}
      </Card>

      {/* Interactive Map */}
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 12,
          }}
        >
          <SectionLabel>
            Hunt Area Map — {waypoints.length} Waypoint
            {waypoints.length !== 1 ? 's' : ''}
          </SectionLabel>

          {/* Layer Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label
              style={{
                fontSize: 11,
                color: C.textMuted,
                fontFamily: "'IBM Plex Mono', monospace",
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Map Layer:
            </label>
            <select
              value={selectedLayer}
              onChange={e => setSelectedLayer(e.target.value)}
              style={{
                padding: '5px 10px',
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                color: C.text,
                fontSize: 12,
                fontFamily: "'IBM Plex Mono', monospace",
                cursor: 'pointer',
              }}
            >
              {Object.values(MAP_LAYERS).map(layer => (
                <option key={layer.id} value={layer.id}>
                  {layer.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Layer Description */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            background: C.surface,
            borderRadius: 6,
            marginBottom: 12,
            border: `1px solid ${C.border}`,
          }}
        >
          <Info size={13} style={{ color: C.accent, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: C.textSub }}>
            {currentLayer.description}
          </span>
        </div>

        <div
          style={{
            borderRadius: 8,
            overflow: 'hidden',
            border: `1px solid ${C.border}`,
            height: 450,
          }}
        >
          <MapContainer
            center={[unit.coords.lat, unit.coords.lng]}
            zoom={unit.coords.zoom}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            key={selectedLayer}
          >
            <TileLayer
              attribution={currentLayer.attribution}
              url={currentLayer.url}
              maxZoom={currentLayer.maxZoom}
            />
            {waypoints.map(wp => {
              const cat =
                WAYPOINT_CATEGORIES[wp.category] || WAYPOINT_CATEGORIES.other;
              return (
                <Marker
                  key={wp.id}
                  position={[wp.lat, wp.lng]}
                  icon={createCustomIcon(wp.category)}
                >
                  <Popup>
                    <div style={{ minWidth: 180 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ fontSize: 16 }}>{cat.icon}</span>
                        <strong style={{ fontSize: 14 }}>{wp.name}</strong>
                      </div>
                      <div
                        style={{ fontSize: 11, color: '#666', marginBottom: 4 }}
                      >
                        {wp.lat.toFixed(5)}, {wp.lng.toFixed(5)}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: cat.color,
                          marginBottom: 6,
                        }}
                      >
                        {cat.label}
                      </div>
                      {wp.notes && (
                        <div
                          style={{
                            fontSize: 12,
                            marginBottom: 8,
                            paddingTop: 6,
                            borderTop: '1px solid #ddd',
                          }}
                        >
                          {wp.notes}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => handleEdit(wp)}
                          style={{
                            flex: 1,
                            padding: '4px 8px',
                            background: '#4a9a5a',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            fontSize: 11,
                            cursor: 'pointer',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(wp.id)}
                          style={{
                            flex: 1,
                            padding: '4px 8px',
                            background: '#c04a38',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            fontSize: 11,
                            cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
        <p
          style={{
            fontSize: 10,
            color: C.textMuted,
            margin: '8px 0 0',
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          {currentLayer.name} · Click markers for details · Scroll to zoom ·
          Drag to pan
        </p>
      </Card>

      {/* Add/Edit Waypoint Form */}
      <Card>
        <SectionLabel>
          {editingId ? 'Edit Waypoint' : 'Add New Waypoint'}
        </SectionLabel>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                color: C.textMuted,
                marginBottom: 4,
                fontFamily: "'IBM Plex Mono', monospace",
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Base Camp, Elk Creek"
              style={{
                width: '100%',
                padding: '8px 10px',
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                color: C.text,
                fontSize: 13,
                fontFamily: "'Source Serif 4', Georgia, serif",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                color: C.textMuted,
                marginBottom: 4,
                fontFamily: "'IBM Plex Mono', monospace",
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Category *
            </label>
            <select
              value={formData.category}
              onChange={e =>
                setFormData({ ...formData, category: e.target.value })
              }
              style={{
                width: '100%',
                padding: '8px 10px',
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                color: C.text,
                fontSize: 13,
              }}
            >
              {Object.entries(WAYPOINT_CATEGORIES).map(([key, cat]) => (
                <option key={key} value={key}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                color: C.textMuted,
                marginBottom: 4,
                fontFamily: "'IBM Plex Mono', monospace",
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Latitude *
            </label>
            <input
              type="number"
              step="0.0001"
              value={formData.lat}
              onChange={e => setFormData({ ...formData, lat: e.target.value })}
              placeholder="e.g., 40.1234"
              style={{
                width: '100%',
                padding: '8px 10px',
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                color: C.text,
                fontSize: 13,
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                color: C.textMuted,
                marginBottom: 4,
                fontFamily: "'IBM Plex Mono', monospace",
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Longitude *
            </label>
            <input
              type="number"
              step="0.0001"
              value={formData.lng}
              onChange={e => setFormData({ ...formData, lng: e.target.value })}
              placeholder="e.g., -107.5678"
              style={{
                width: '100%',
                padding: '8px 10px',
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                color: C.text,
                fontSize: 13,
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label
            style={{
              display: 'block',
              fontSize: 11,
              color: C.textMuted,
              marginBottom: 4,
              fontFamily: "'IBM Plex Mono', monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Description, directions, observations..."
            rows={2}
            style={{
              width: '100%',
              padding: '8px 10px',
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              color: C.text,
              fontSize: 13,
              fontFamily: "'Source Serif 4', Georgia, serif",
              resize: 'vertical',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginTop: 12,
            justifyContent: 'flex-end',
          }}
        >
          {editingId && (
            <button
              onClick={handleCancelEdit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                background: C.surface,
                color: C.text,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                fontFamily: "'Oswald', sans-serif",
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              <X size={14} />
              Cancel
            </button>
          )}
          <button
            onClick={handleAddWaypoint}
            disabled={!formData.name.trim() || !formData.lat || !formData.lng}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              background: editingId ? C.green : C.accent,
              color: C.bg,
              border: 'none',
              borderRadius: 6,
              fontFamily: "'Oswald', sans-serif",
              fontSize: 13,
              cursor: formData.name.trim() ? 'pointer' : 'not-allowed',
              opacity: formData.name.trim() ? 1 : 0.5,
            }}
          >
            {editingId ? (
              <>
                <Save size={14} />
                Update
              </>
            ) : (
              <>
                <Plus size={14} />
                Add Waypoint
              </>
            )}
          </button>
        </div>
      </Card>

      {/* Waypoints List */}
      {waypoints.length > 0 && (
        <Card>
          <SectionLabel>All Waypoints ({waypoints.length})</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {waypoints.map(wp => {
              const cat =
                WAYPOINT_CATEGORIES[wp.category] || WAYPOINT_CATEGORIES.other;
              return (
                <div
                  key={wp.id}
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                    padding: '12px 14px',
                    background: C.surface,
                    borderRadius: 6,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <span style={{ fontSize: 20, flexShrink: 0 }}>
                    {cat.icon}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <strong style={{ fontSize: 14, color: C.text }}>
                        {wp.name}
                      </strong>
                      <Badge label={cat.label} color={cat.color} />
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: C.textMuted,
                        fontFamily: "'IBM Plex Mono', monospace",
                        marginBottom: 4,
                      }}
                    >
                      {wp.lat.toFixed(5)}°N, {Math.abs(wp.lng).toFixed(5)}°W
                    </div>
                    {wp.notes && (
                      <p
                        style={{
                          fontSize: 12,
                          color: C.textSub,
                          margin: '4px 0 0',
                          lineHeight: 1.5,
                        }}
                      >
                        {wp.notes}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => handleEdit(wp)}
                      aria-label="Edit waypoint"
                      style={{
                        padding: '6px 10px',
                        background: C.surface,
                        border: `1px solid ${C.border}`,
                        borderRadius: 6,
                        color: C.green,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(wp.id)}
                      aria-label="Delete waypoint"
                      style={{
                        padding: '6px 10px',
                        background: C.surface,
                        border: `1px solid ${C.border}`,
                        borderRadius: 6,
                        color: C.red,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {waypoints.length === 0 && !loading && (
        <Card>
          <div style={{ textAlign: 'center', padding: '32px 20px' }}>
            <MapPin
              size={40}
              style={{ color: C.textMuted, margin: '0 auto 12px' }}
            />
            <p style={{ fontSize: 14, color: C.textMuted, margin: 0 }}>
              No waypoints yet. Add your first waypoint using the form above.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

function IntegrationsPanel() {
  const statusConfig = {
    partial: { label: 'Partial — Public Data', color: C.amber },
    planned: { label: 'Planned', color: C.textMuted },
    active: { label: 'Active', color: C.green },
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Info
            size={16}
            style={{ color: C.accent, flexShrink: 0, marginTop: 2 }}
            aria-hidden="true"
          />
          <p
            style={{
              fontSize: 14,
              color: C.textSub,
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            GoHunt public unit data (At a Glance stats, terrain narratives,
            quick tips, campground listings) is already integrated throughout
            this app. Full Insider features — draw odds, harvest stats, weather
            overlays — require a GoHunt API key. HuntWise integration is planned
            for a future version.
          </p>
        </div>
      </Card>

      {Object.values(INTEGRATIONS).map(integration => {
        const st = statusConfig[integration.status];
        return (
          <Card key={integration.id}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 20,
                  color:
                    integration.status === 'partial'
                      ? C.gohuntOrange
                      : C.textMuted,
                  flexShrink: 0,
                }}
                aria-hidden="true"
              >
                {integration.logoInitial}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center',
                    marginBottom: 6,
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: 18,
                      color: C.text,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {integration.name}
                  </span>
                  <Badge label={st.label} color={st.color} />
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: C.textSub,
                    lineHeight: 1.6,
                    margin: '0 0 12px',
                  }}
                >
                  {integration.tagline}
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: 6,
                    flexWrap: 'wrap',
                    marginBottom: 14,
                  }}
                >
                  {integration.dataTypes.map(dt => (
                    <span
                      key={dt}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: C.surface,
                        border: `1px solid ${C.border}`,
                        fontSize: 11,
                        color: C.textMuted,
                        fontFamily: "'IBM Plex Mono', monospace",
                      }}
                    >
                      {dt}
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  {integration.status === 'partial' ? (
                    <Badge
                      label="Public data active · Insider API pending"
                      color={C.amber}
                    />
                  ) : (
                    <button
                      disabled
                      aria-disabled="true"
                      style={{
                        padding: '7px 16px',
                        background: C.accentDim,
                        color: `${C.text}66`,
                        border: 'none',
                        borderRadius: 6,
                        fontFamily: "'Oswald', sans-serif",
                        fontSize: 13,
                        letterSpacing: '0.06em',
                        cursor: 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Zap size={13} aria-hidden="true" />
                      Connect (Coming Soon)
                    </button>
                  )}
                  <a
                    href={integration.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${integration.name} website (opens in new tab)`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 13,
                      color:
                        integration.status === 'partial'
                          ? C.gohuntOrange
                          : C.accent,
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={13} aria-hidden="true" />
                    Visit {integration.name}
                  </a>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DRAW ODDS PANEL
// ═══════════════════════════════════════════════════════════════
function DrawOddsPanel({ unit }) {
  if (!unit.drawOdds) {
    return null;
  }

  const { huntCode, year, odds, applicants, tags } = unit.drawOdds;
  const drawRate =
    applicants && tags ? ((tags / applicants) * 100).toFixed(1) : null;

  // Find key breakpoints
  const halfChance = odds.find(o => o.chance >= 50);
  const highChance = odds.find(o => o.chance >= 90);

  return (
    <Card style={{ marginTop: 16 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <SectionLabel>Draw Odds — {huntCode}</SectionLabel>
        <div
          style={{
            fontSize: 11,
            color: C.textSub,
            fontFamily: "'Oswald', sans-serif",
            letterSpacing: '0.04em',
          }}
        >
          {year} DATA FROM GOHUNT
        </div>
      </div>

      {/* Key Stats */}
      {(applicants || tags || drawRate) && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            marginBottom: 20,
            padding: 12,
            background: C.surfaceAlt,
            borderRadius: 6,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: C.textSub,
                marginBottom: 4,
                fontFamily: "'Oswald', sans-serif",
                letterSpacing: '0.04em',
              }}
            >
              APPLICANTS
            </div>
            <div style={{ fontSize: 18, color: C.text, fontWeight: 600 }}>
              {applicants ? applicants.toLocaleString() : 'N/A'}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 11,
                color: C.textSub,
                marginBottom: 4,
                fontFamily: "'Oswald', sans-serif",
                letterSpacing: '0.04em',
              }}
            >
              TAGS
            </div>
            <div style={{ fontSize: 18, color: C.text, fontWeight: 600 }}>
              {tags ? tags.toLocaleString() : 'N/A'}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 11,
                color: C.textSub,
                marginBottom: 4,
                fontFamily: "'Oswald', sans-serif",
                letterSpacing: '0.04em',
              }}
            >
              DRAW RATE
            </div>
            <div style={{ fontSize: 18, color: C.accent, fontWeight: 600 }}>
              {drawRate ? `${drawRate}%` : 'N/A'}
            </div>
          </div>
        </div>
      )}

      {/* Draw Odds Table */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: 13,
            color: C.text,
            marginBottom: 10,
            fontFamily: "'Oswald', sans-serif",
            letterSpacing: '0.04em',
          }}
        >
          DRAW PROBABILITY BY PREFERENCE POINTS
        </div>

        {/* Horizontal scroll container for mobile */}
        <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(35, 1fr)',
              gap: 3,
              minWidth: 700,
              marginBottom: 8,
            }}
          >
            {odds.map(({ points, chance }) => {
              const height = Math.max(chance, 2); // Minimum 2% for visibility
              const isBreakpoint =
                (halfChance && points === halfChance.points) ||
                (highChance && points === highChance.points);

              return (
                <div
                  key={points}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  {/* Bar */}
                  <div
                    style={{
                      width: '100%',
                      height: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: `${height}%`,
                        background:
                          chance === 0
                            ? C.border
                            : chance < 25
                              ? '#c04a38'
                              : chance < 50
                                ? '#c4961a'
                                : chance < 75
                                  ? '#6aa85a'
                                  : '#4a9a5a',
                        borderRadius: '2px 2px 0 0',
                        transition: 'all 0.2s',
                        border: isBreakpoint ? `2px solid ${C.accent}` : 'none',
                      }}
                      title={`${points} pts: ${chance}% chance`}
                    />
                  </div>
                  {/* Point label - show every 5th */}
                  {points % 5 === 0 && (
                    <div
                      style={{
                        fontSize: 10,
                        color: C.textSub,
                        marginTop: 4,
                        fontFamily: "'Oswald', sans-serif",
                      }}
                    >
                      {points}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            fontSize: 11,
            color: C.textSub,
            marginTop: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 12,
                height: 12,
                background: '#c04a38',
                borderRadius: 2,
              }}
            />
            <span>0-24%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 12,
                height: 12,
                background: '#c4961a',
                borderRadius: 2,
              }}
            />
            <span>25-49%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 12,
                height: 12,
                background: '#6aa85a',
                borderRadius: 2,
              }}
            />
            <span>50-74%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 12,
                height: 12,
                background: '#4a9a5a',
                borderRadius: 2,
              }}
            />
            <span>75-100%</span>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      {(halfChance || highChance) && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: C.surfaceAlt,
            borderRadius: 6,
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          <div
            style={{
              color: C.text,
              marginBottom: 6,
              fontFamily: "'Oswald', sans-serif",
              letterSpacing: '0.04em',
              fontSize: 12,
            }}
          >
            KEY INSIGHTS
          </div>
          <ul style={{ margin: 0, paddingLeft: 20, color: C.textSub }}>
            {halfChance && (
              <li style={{ marginBottom: 4 }}>
                <strong style={{ color: C.accent }}>
                  {halfChance.points} points
                </strong>{' '}
                for 50%+ draw chance ({halfChance.chance}%)
              </li>
            )}
            {highChance && (
              <li>
                <strong style={{ color: C.accent }}>
                  {highChance.points} points
                </strong>{' '}
                for 90%+ draw chance ({highChance.chance}%)
              </li>
            )}
          </ul>
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
// NAVIGATION PANEL — KML/KMZ export for ATAK
// ═══════════════════════════════════════════════════════════════
function escapeXml(s) {
  return String(s ?? '').replace(
    /[<>&"']/g,
    c =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
      })[c]
  );
}

function buildKML(unit, waypoints) {
  const placemarks = [
    `    <Placemark>
      <name>${escapeXml(unit.displayName)} — Center</name>
      <description>${escapeXml(unit.nickname || 'Unit center')}</description>
      <Point><coordinates>${unit.coords.lng},${unit.coords.lat},0</coordinates></Point>
    </Placemark>`,
    ...waypoints.map(wp => {
      const cat = WAYPOINT_CATEGORIES[wp.category] || WAYPOINT_CATEGORIES.other;
      const desc = `${cat.label}${wp.notes ? '\n\n' + wp.notes : ''}`;
      return `    <Placemark>
      <name>${escapeXml(wp.name)}</name>
      <description>${escapeXml(desc)}</description>
      <Point><coordinates>${wp.lng},${wp.lat},0</coordinates></Point>
    </Placemark>`;
    }),
  ].join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapeXml(unit.displayName)} — Elk Hunt</name>
    <description>${escapeXml(`${waypoints.length} waypoint(s). Generated from elkhuntplanner.`)}</description>
${placemarks}
  </Document>
</kml>`;
}

function NavigationPanel({ unit }) {
  const [waypoints, setWaypoints] = useState([]);
  const storageKey = `elk-waypoints-${unit.id}`;

  useEffect(() => {
    window.storage
      ?.get(storageKey)
      .then(r => setWaypoints(r?.value || []))
      .catch(() => setWaypoints([]));
  }, [unit.id, storageKey]);

  const handleDownload = () => {
    const kml = buildKML(unit, waypoints);
    const blob = new Blob([kml], {
      type: 'application/vnd.google-earth.kml+xml',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${unit.id}-elkhunt.kml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const total = waypoints.length + 1; // +1 for unit center

  return (
    <Card style={{ marginTop: 16 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <SectionLabel>Navigation — ATAK / GPS Export</SectionLabel>
        <button
          onClick={handleDownload}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            background: C.accent,
            color: C.bg,
            border: 'none',
            borderRadius: 6,
            fontFamily: "'Oswald', sans-serif",
            fontSize: 13,
            letterSpacing: '0.06em',
            cursor: 'pointer',
          }}
          aria-label={`Download ${unit.displayName} KML for ATAK`}
        >
          <Download size={13} aria-hidden="true" />
          DOWNLOAD KML
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 16,
          padding: 12,
          background: C.surface,
          borderRadius: 6,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              color: C.textSub,
              marginBottom: 4,
              fontFamily: "'Oswald', sans-serif",
              letterSpacing: '0.04em',
            }}
          >
            CENTER LAT
          </div>
          <div
            style={{
              fontSize: 14,
              color: C.text,
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            {unit.coords.lat.toFixed(5)}
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              color: C.textSub,
              marginBottom: 4,
              fontFamily: "'Oswald', sans-serif",
              letterSpacing: '0.04em',
            }}
          >
            CENTER LNG
          </div>
          <div
            style={{
              fontSize: 14,
              color: C.text,
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            {unit.coords.lng.toFixed(5)}
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              color: C.textSub,
              marginBottom: 4,
              fontFamily: "'Oswald', sans-serif",
              letterSpacing: '0.04em',
            }}
          >
            PLACEMARKS
          </div>
          <div
            style={{
              fontSize: 14,
              color: C.accent,
              fontWeight: 600,
            }}
          >
            {total}
          </div>
        </div>
      </div>

      <div
        style={{
          fontSize: 13,
          color: C.textSub,
          lineHeight: 1.65,
          marginBottom: 8,
        }}
      >
        <strong style={{ color: C.text }}>Load in ATAK:</strong> Save the KML to
        your device, then in ATAK go to <em>Import Manager → Local SD</em>,
        select the file, and choose <em>Import</em>. Waypoints appear as markers
        at the categories you tagged.
      </div>
      {waypoints.length === 0 && (
        <div
          style={{
            fontSize: 12,
            color: C.textMuted,
            fontStyle: 'italic',
            marginTop: 4,
          }}
        >
          No waypoints yet — only the unit center will export. Add waypoints in
          the Waypoints tab.
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
// SIGHTINGS PANEL — recent elk observations log
// ═══════════════════════════════════════════════════════════════
function SightingsPanel({ unit }) {
  const [sightings, setSightings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    lat: unit.coords.lat.toFixed(4),
    lng: unit.coords.lng.toFixed(4),
    bulls: '',
    cows: '',
    calves: '',
    notes: '',
  });
  const storageKey = `elk-sightings-${unit.id}`;

  useEffect(() => {
    setLoading(true);
    window.storage
      ?.get(storageKey)
      .then(r => {
        setSightings(r?.value || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [unit.id, storageKey]);

  const save = async next => {
    setSightings(next);
    try {
      await window.storage?.set(storageKey, next);
    } catch (error) {
      console.error('Failed to save sightings:', error);
    }
  };

  const handleAdd = () => {
    const bulls = parseInt(form.bulls, 10) || 0;
    const cows = parseInt(form.cows, 10) || 0;
    const calves = parseInt(form.calves, 10) || 0;
    if (bulls + cows + calves === 0 && !form.notes.trim()) return;

    const entry = {
      id: Date.now().toString(),
      date: form.date,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      bulls,
      cows,
      calves,
      notes: form.notes.trim(),
    };
    save([entry, ...sightings]);
    setForm({
      date: new Date().toISOString().slice(0, 10),
      lat: unit.coords.lat.toFixed(4),
      lng: unit.coords.lng.toFixed(4),
      bulls: '',
      cows: '',
      calves: '',
      notes: '',
    });
  };

  const handleDelete = id => {
    if (confirm('Delete this sighting?')) {
      save(sightings.filter(s => s.id !== id));
    }
  };

  const inputStyle = {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 4,
    color: C.text,
    padding: '6px 8px',
    fontSize: 13,
    fontFamily: "'IBM Plex Mono', monospace",
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  };
  const labelStyle = {
    fontSize: 10,
    color: C.textMuted,
    fontFamily: "'Oswald', sans-serif",
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 3,
    display: 'block',
  };

  return (
    <Card style={{ marginTop: 16 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12,
        }}
      >
        <Eye size={14} style={{ color: C.accent }} aria-hidden="true" />
        <SectionLabel>Recent Elk Sightings</SectionLabel>
      </div>

      {/* Add form */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div>
          <label style={labelStyle}>Date</label>
          <input
            type="date"
            value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Lat</label>
          <input
            value={form.lat}
            onChange={e => setForm({ ...form, lat: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Lng</label>
          <input
            value={form.lng}
            onChange={e => setForm({ ...form, lng: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Bulls</label>
          <input
            type="number"
            min="0"
            value={form.bulls}
            onChange={e => setForm({ ...form, bulls: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Cows</label>
          <input
            type="number"
            min="0"
            value={form.cows}
            onChange={e => setForm({ ...form, cows: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Calves</label>
          <input
            type="number"
            min="0"
            value={form.calves}
            onChange={e => setForm({ ...form, calves: e.target.value })}
            style={inputStyle}
          />
        </div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label style={labelStyle}>Notes</label>
        <input
          value={form.notes}
          onChange={e => setForm({ ...form, notes: e.target.value })}
          placeholder="Bedded in dark timber, moving NE at dawn…"
          style={inputStyle}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 14,
        }}
      >
        <button
          onClick={handleAdd}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            background: C.accent,
            color: C.bg,
            border: 'none',
            borderRadius: 6,
            fontFamily: "'Oswald', sans-serif",
            fontSize: 13,
            letterSpacing: '0.06em',
            cursor: 'pointer',
          }}
        >
          <Plus size={13} aria-hidden="true" />
          LOG SIGHTING
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ color: C.textMuted, fontSize: 13 }}>Loading…</div>
      ) : sightings.length === 0 ? (
        <div style={{ color: C.textMuted, fontSize: 13, fontStyle: 'italic' }}>
          No sightings logged yet.
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {sightings.map(s => {
            const total = s.bulls + s.cows + s.calves;
            return (
              <li
                key={s.id}
                style={{
                  padding: '10px 0',
                  borderTop: `1px solid ${C.border}`,
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'center',
                      marginBottom: 4,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        color: C.text,
                        fontFamily: "'Oswald', sans-serif",
                        letterSpacing: '0.05em',
                      }}
                    >
                      {s.date}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: C.textSub,
                        fontFamily: "'IBM Plex Mono', monospace",
                      }}
                    >
                      {s.lat.toFixed(4)}, {s.lng.toFixed(4)}
                    </span>
                    <span style={{ fontSize: 12, color: C.accent }}>
                      {total} elk
                      {s.bulls > 0 && ` · ${s.bulls}B`}
                      {s.cows > 0 && ` · ${s.cows}C`}
                      {s.calves > 0 && ` · ${s.calves}Cf`}
                    </span>
                  </div>
                  {s.notes && (
                    <div
                      style={{
                        fontSize: 13,
                        color: C.textSub,
                        lineHeight: 1.5,
                      }}
                    >
                      {s.notes}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: C.textMuted,
                    cursor: 'pointer',
                    padding: 4,
                  }}
                  aria-label="Delete sighting"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {unit.cpw && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 12,
            borderTop: `1px solid ${C.border}`,
          }}
        >
          <SectionLabel>CPW Herd Composition</SectionLabel>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: 10,
              fontSize: 13,
              color: C.textSub,
            }}
          >
            {unit.cpw.dau && (
              <div>
                <div style={labelStyle}>DAU</div>
                <div style={{ color: C.text }}>{unit.cpw.dau}</div>
              </div>
            )}
            {unit.cpw.herdEstimate && (
              <div>
                <div style={labelStyle}>Herd Est.</div>
                <div style={{ color: C.text }}>
                  {unit.cpw.herdEstimate.toLocaleString()}
                </div>
              </div>
            )}
            {unit.cpw.bullCowRatio && (
              <div>
                <div style={labelStyle}>Bull:Cow</div>
                <div style={{ color: C.text }}>{unit.cpw.bullCowRatio}</div>
              </div>
            )}
            {unit.cpw.surveyYear && (
              <div>
                <div style={labelStyle}>Survey Year</div>
                <div style={{ color: C.text }}>{unit.cpw.surveyYear}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
// HUNT PLAN PANEL — synthesizes CPW Hunting Atlas elk range layers
// into a ranked harvest plan with road access
// ═══════════════════════════════════════════════════════════════
const CPW_LAYER_LEGEND = [
  {
    name: 'Elk Overall Range',
    desc: 'Total extent occupied by elk year-round. Use as baseline; refine with seasonal layers.',
  },
  {
    name: 'Elk Resident Population Area',
    desc: 'Non-migratory subpopulation that stays in the same general area year-round.',
  },
  {
    name: 'Elk Summer Range',
    desc: 'Occupied roughly June–September. High elevation, alpine and subalpine.',
  },
  {
    name: 'Elk Summer Concentration Range',
    desc: 'Highest summer densities — calving grounds, calf-rearing meadows, mineral parks.',
  },
  {
    name: 'Elk Winter Range',
    desc: 'Occupied during snow season. Lower elevation, south-facing slopes, browse-rich.',
  },
  {
    name: 'Elk Winter Concentration Area',
    desc: 'Highest winter densities — severe-weather refugia. Critical during deep snow.',
  },
  {
    name: 'Elk Migration Corridors',
    desc: 'Narrow connectivity zones used during seasonal movement between ranges. Funnel terrain.',
  },
  {
    name: 'Elk Migration Patterns',
    desc: 'General directional movement information showing how herds shift across the landscape.',
  },
];

const RANK_COLORS = [C.accent, C.greenLight, C.textSub];

function HuntPlanPanel({ unit }) {
  const plan = unit.huntPlan;
  const atlasUrl =
    'https://ndismaps.nrel.colostate.edu/index.html?app=HuntingAtlas';

  if (!plan) {
    return (
      <Card style={{ marginTop: 16 }}>
        <SectionLabel>Hunt Plan</SectionLabel>
        <p style={{ color: C.textSub, fontSize: 14, lineHeight: 1.6 }}>
          No hunt plan curated for this unit yet. Open the{' '}
          <a
            href={atlasUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: C.accent }}
          >
            CPW Hunting Atlas
          </a>{' '}
          and toggle the Elk range layers (Migration Corridors, Winter
          Concentration, Summer Concentration, etc.) over GMU{' '}
          {unit.gohuntSlug || unit.id} to identify high-probability zones.
        </p>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header + Atlas link */}
      <Card>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={16} style={{ color: C.accent }} aria-hidden="true" />
            <SectionLabel>Hunt Plan — {unit.displayName}</SectionLabel>
          </div>
          <a
            href={atlasUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              background: C.surface,
              color: C.accent,
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              fontFamily: "'Oswald', sans-serif",
              fontSize: 12,
              letterSpacing: '0.06em',
              textDecoration: 'none',
            }}
            aria-label="Open CPW Hunting Atlas in new tab"
          >
            CPW HUNTING ATLAS
            <ExternalLink size={12} aria-hidden="true" />
          </a>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: '6px 14px',
            fontSize: 13,
            color: C.textSub,
            lineHeight: 1.6,
          }}
        >
          <div
            style={{
              color: C.textMuted,
              fontFamily: "'Oswald', sans-serif",
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontSize: 11,
              paddingTop: 2,
            }}
          >
            Hunt
          </div>
          <div style={{ color: C.text }}>{plan.hunt}</div>
          <div
            style={{
              color: C.textMuted,
              fontFamily: "'Oswald', sans-serif",
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontSize: 11,
              paddingTop: 2,
            }}
          >
            Phase
          </div>
          <div>{plan.rangePhase}</div>
        </div>

        {plan.priorityLayers && plan.priorityLayers.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div
              style={{
                fontSize: 11,
                color: C.textMuted,
                fontFamily: "'Oswald', sans-serif",
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              Priority CPW Layers for this Hunt
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {plan.priorityLayers.map(layer => (
                <span
                  key={layer}
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.borderLight}`,
                    color: C.accent,
                    padding: '4px 10px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >
                  {layer}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Ranked zones */}
      <Card>
        <SectionLabel>Highest-Probability Zones (Ranked)</SectionLabel>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {plan.zones.map((zone, idx) => {
            const color = RANK_COLORS[idx] || C.textSub;
            return (
              <li
                key={zone.rank}
                style={{
                  marginTop: idx === 0 ? 4 : 16,
                  paddingTop: idx === 0 ? 0 : 16,
                  borderTop: idx === 0 ? 'none' : `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      background: color,
                      color: C.bg,
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Oswald', sans-serif",
                      fontWeight: 700,
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {zone.rank}
                  </span>
                  <h4
                    style={{
                      margin: 0,
                      color: C.text,
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: 16,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {zone.name}
                  </h4>
                </div>
                {zone.layers && zone.layers.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      gap: 5,
                      flexWrap: 'wrap',
                      marginBottom: 8,
                      marginLeft: 36,
                    }}
                  >
                    {zone.layers.map(layer => (
                      <span
                        key={layer}
                        style={{
                          background: C.surface,
                          color: C.textSub,
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 10,
                          fontFamily: "'IBM Plex Mono', monospace",
                          letterSpacing: '0.02em',
                        }}
                      >
                        {layer}
                      </span>
                    ))}
                  </div>
                )}
                <div
                  style={{
                    marginLeft: 36,
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    gap: '4px 12px',
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  <div
                    style={{
                      color: C.textMuted,
                      fontFamily: "'Oswald', sans-serif",
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      fontSize: 10,
                      paddingTop: 3,
                    }}
                  >
                    Why
                  </div>
                  <div style={{ color: C.textSub }}>{zone.why}</div>
                  <div
                    style={{
                      color: C.textMuted,
                      fontFamily: "'Oswald', sans-serif",
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      fontSize: 10,
                      paddingTop: 3,
                    }}
                  >
                    Access
                  </div>
                  <div style={{ color: C.text }}>{zone.access}</div>
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      {/* Access strategy */}
      {plan.accessStrategy && plan.accessStrategy.length > 0 && (
        <Card>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 10,
            }}
          >
            <Navigation
              size={14}
              style={{ color: C.accent }}
              aria-hidden="true"
            />
            <SectionLabel>Access & Execution Strategy</SectionLabel>
          </div>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {plan.accessStrategy.map((step, idx) => (
              <li
                key={idx}
                style={{
                  display: 'flex',
                  gap: 10,
                  fontSize: 13,
                  color: C.textSub,
                  lineHeight: 1.6,
                }}
              >
                <ChevronRight
                  size={14}
                  style={{ color: C.accent, flexShrink: 0, marginTop: 3 }}
                  aria-hidden="true"
                />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* CPW layer legend */}
      <Card>
        <SectionLabel>CPW Elk Range Layer Reference</SectionLabel>
        <p
          style={{
            color: C.textMuted,
            fontSize: 12,
            lineHeight: 1.6,
            margin: '0 0 12px',
            fontStyle: 'italic',
          }}
        >
          Source: Colorado Parks & Wildlife via the NDIS Hunting Atlas. Toggle
          these layers in the Atlas to see exact polygon boundaries inside GMU{' '}
          {unit.gohuntSlug || unit.id}.
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {CPW_LAYER_LEGEND.map(layer => (
            <li
              key={layer.name}
              style={{
                padding: '8px 0',
                borderTop: `1px solid ${C.border}`,
                fontSize: 13,
                lineHeight: 1.55,
              }}
            >
              <div
                style={{
                  color: C.text,
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 13,
                  letterSpacing: '0.04em',
                  marginBottom: 2,
                }}
              >
                {layer.name}
              </div>
              <div style={{ color: C.textSub }}>{layer.desc}</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MISC PANEL — draw odds and other reference data
// ═══════════════════════════════════════════════════════════════
function MiscPanel({ unit }) {
  return (
    <>
      <DrawOddsPanel unit={unit} />
      <NotesSection unitId={unit.id} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// PERSISTENT NOTES
// ═══════════════════════════════════════════════════════════════
function NotesSection({ unitId }) {
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const key = `elk-note-${unitId}`;

  useEffect(() => {
    setLoading(true);
    setSaved(false);
    window.storage
      ?.get(key)
      .then(r => {
        setNote(r?.value ?? '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [unitId, key]);

  const save = async () => {
    try {
      await window.storage?.set(key, note);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save note:', error);
      // Show error state instead of success
      setSaved(false);
    }
  };

  return (
    <Card style={{ marginTop: 16 }}>
      <SectionLabel>Field Notes — {unitId}</SectionLabel>
      <textarea
        aria-label={`Personal field notes for ${unitId}`}
        value={loading ? 'Loading…' : note}
        onChange={e => {
          setNote(e.target.value);
          setSaved(false);
        }}
        disabled={loading}
        placeholder="Scouting observations, camp locations, access notes, waypoints…"
        rows={4}
        style={{
          width: '100%',
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 6,
          color: C.text,
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontSize: 14,
          lineHeight: 1.7,
          padding: '10px 12px',
          resize: 'vertical',
          outline: 'none',
          boxSizing: 'border-box',
        }}
        onFocus={e => {
          e.target.style.borderColor = C.accent;
        }}
        onBlur={e => {
          e.target.style.borderColor = C.border;
        }}
      />
      <div
        style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}
      >
        <button
          onClick={save}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            background: saved ? C.green : C.accent,
            color: C.bg,
            border: 'none',
            borderRadius: 6,
            fontFamily: "'Oswald', sans-serif",
            fontSize: 13,
            letterSpacing: '0.06em',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
          aria-label={saved ? 'Notes saved' : 'Save notes'}
        >
          {saved ? (
            <Check size={13} aria-hidden="true" />
          ) : (
            <Pencil size={13} aria-hidden="true" />
          )}
          {saved ? 'Saved' : 'Save Notes'}
        </button>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
function ElkHuntDashboardInner() {
  const [activeUnitId, setActiveUnitId] = useState(UNITS[0].id);
  const [activeTab, setActiveTab] = useState('overview');
  const [customUnits, setCustomUnits] = useState([]);
  const [showAddUnitForm, setShowAddUnitForm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const mainRef = useRef(null);
  const { isAuthenticated, isConfigured } = useAuth();

  // Load custom units from storage
  useEffect(() => {
    const loadCustomUnits = async () => {
      const saved = await storage.get('elk-custom-units');
      if (saved && Array.isArray(saved)) {
        setCustomUnits(saved);
      }
    };
    loadCustomUnits();
  }, []);

  // Listen for auth modal events from FeatureGate
  useEffect(() => {
    const handleOpenAuthModal = e => {
      setAuthModalMode(e.detail?.mode || 'login');
      setAuthModalOpen(true);
    };

    window.addEventListener('openAuthModal', handleOpenAuthModal);

    return () => {
      window.removeEventListener('openAuthModal', handleOpenAuthModal);
    };
  }, []);

  useEffect(() => {
    if (!document.getElementById('elk-gf')) {
      const l = document.createElement('link');
      l.id = 'elk-gf';
      l.rel = 'stylesheet';
      l.href = FONT_URL;
      document.head.appendChild(l);
    }
  }, []);

  // Merge default and custom units
  const allUnits = [...UNITS, ...customUnits];

  const unit = allUnits.find(u => u.id === activeUnitId) ?? allUnits[0];
  const switchUnit = id => {
    setActiveUnitId(id);
    setActiveTab('overview');
    setMobileMenuOpen(false); // Close mobile menu on selection
    mainRef.current?.focus();
  };

  const handleUnitAdded = newUnit => {
    setCustomUnits(prev => [...prev, newUnit]);
    setActiveUnitId(newUnit.id);
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :focus-visible { outline: 2px solid ${C.accent}; outline-offset: 2px; border-radius: 3px; }
        .skip-link { position: absolute; top: -60px; left: 8px; background: ${C.accent}; color: ${C.bg}; padding: 8px 16px; border-radius: 6px; font-family: 'Oswald',sans-serif; font-size: 14px; letter-spacing: 0.05em; z-index: 9999; text-decoration: none; transition: top 0.1s; }
        .skip-link:focus { top: 8px; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: ${C.surface}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        .unit-btn:hover { background: ${C.cardHover} !important; }
        [role="tab"]:hover { color: ${C.text} !important; }
        a:focus-visible { outline: 2px solid ${C.accent}; outline-offset: 2px; border-radius: 3px; }
        .custom-marker { background: transparent !important; border: none !important; }
        .leaflet-popup-content-wrapper { background: ${C.card}; color: ${C.text}; border: 1px solid ${C.border}; }
        .leaflet-popup-tip { background: ${C.card}; border: 1px solid ${C.border}; }

        /* Mobile Responsive Styles */
        .mobile-menu-btn { display: none; }
        .mobile-overlay { display: none; }
        .sidebar {
          position: relative;
        }

        @media (max-width: 768px) {
          /* Show mobile menu button */
          .mobile-menu-btn {
            display: flex !important;
            align-items: center;
            justify-content: center;
          }

          /* Mobile sidebar - drawer style */
          .sidebar {
            position: fixed !important;
            top: 56px !important;
            bottom: 0 !important;
            left: ${mobileMenuOpen ? '0' : '-220px'} !important;
            z-index: 999 !important;
            transition: left 0.3s ease !important;
          }

          /* Show overlay when menu is open */
          .mobile-overlay {
            display: ${mobileMenuOpen ? 'block' : 'none'} !important;
          }

          /* Hide desktop sidebar label */
          .desktop-only { display: none !important; }

          /* Tab bar horizontal scroll */
          [role="tablist"] {
            overflow-x: auto !important;
            scrollbar-width: thin;
            -webkit-overflow-scrolling: touch;
          }

          /* Larger touch targets on mobile */
          [role="tab"] {
            min-width: auto !important;
            padding: 12px 16px !important;
          }

          button, a {
            min-height: 44px;
          }

          /* Main content - full width on mobile */
          .main-content {
            width: 100% !important;
          }
        }

        @media (max-width: 640px) {
          /* Smaller header on mobile */
          .app-title { font-size: 14px !important; }
          .app-subtitle { display: none !important; }

          /* Compact padding on small screens */
          .content-padding {
            padding: 12px !important;
          }
        }
      `}</style>

      <a href="#elk-main" className="skip-link">
        Skip to content
      </a>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          background: C.bg,
          color: C.text,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* HEADER */}
        <header
          style={{
            background: C.surface,
            borderBottom: `1px solid ${C.border}`,
            padding: '0 16px',
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: C.text,
                cursor: 'pointer',
                padding: '8px',
                display: 'none',
              }}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Mountain
              size={20}
              style={{ color: C.accent }}
              aria-hidden="true"
            />
            <h1
              className="app-title"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: C.text,
              }}
            >
              Elk Hunt Planner
            </h1>
            <span
              className="app-subtitle"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                color: C.textMuted,
                letterSpacing: '0.08em',
              }}
              aria-label="Colorado, 2026 season"
            >
              CO · 2026
            </span>
          </div>
          {/* GoHunt data source credit & Auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  color: C.textMuted,
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                Data:
              </span>
              <a
                href="https://www.gohunt.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GoHunt – data source (opens in new tab)"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  textDecoration: 'none',
                  color: C.gohuntOrange,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  letterSpacing: '0.04em',
                }}
              >
                GoHunt <ExternalLink size={11} aria-hidden="true" />
              </a>
            </div>

            {/* Auth UI */}
            {isConfigured &&
              (isAuthenticated ? (
                <UserMenu />
              ) : (
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setAuthModalOpen(true);
                  }}
                  style={{
                    padding: '6px 16px',
                    backgroundColor: C.accent,
                    color: C.bg,
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: "'Oswald', sans-serif",
                    letterSpacing: '0.05em',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.target.style.backgroundColor = C.accentHover;
                  }}
                  onMouseLeave={e => {
                    e.target.style.backgroundColor = C.accent;
                  }}
                >
                  SIGN IN
                </button>
              ))}
          </div>
        </header>

        {/* BODY */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Mobile Overlay */}
          {mobileMenuOpen && (
            <div
              className="mobile-overlay"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: 'fixed',
                top: 56,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 998,
                display: 'block',
              }}
            />
          )}

          {/* SIDEBAR */}
          <nav
            aria-label="Colorado hunt units"
            className="sidebar"
            style={{
              width: 220,
              background: C.surface,
              borderRight: `1px solid ${C.border}`,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                padding: '14px 16px 10px',
                borderBottom: `1px solid ${C.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <p
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 9,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: C.textMuted,
                }}
              >
                Hunt Units · 2026
              </p>
              <FeatureGate
                feature={FEATURES.AUTHENTICATED.CUSTOM_UNITS}
                showPrompt={false}
              >
                <button
                  onClick={() => setShowAddUnitForm(true)}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${C.accent}`,
                    borderRadius: '3px',
                    color: C.accent,
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: 10,
                    fontFamily: "'IBM Plex Mono', monospace",
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = C.accent;
                    e.currentTarget.style.color = C.white;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = C.accent;
                  }}
                  title="Add new hunt unit"
                >
                  <Plus size={12} aria-hidden="true" />
                  Add
                </button>
              </FeatureGate>
            </div>
            <ul
              role="list"
              style={{
                listStyle: 'none',
                padding: '8px 0',
                overflowY: 'auto',
                flex: 1,
              }}
            >
              {allUnits.map(u => {
                const active = u.id === activeUnitId;
                const draw = DRAW_CONFIG[u.draw];
                const choice = CHOICE_CONFIG[u.choiceRank];
                return (
                  <li key={u.id}>
                    <button
                      className="unit-btn"
                      onClick={() => switchUnit(u.id)}
                      aria-current={active ? 'true' : undefined}
                      aria-label={`${u.displayName} ${u.nickname}, ${u.choiceLabel}`}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        background: active ? C.card : 'transparent',
                        border: 'none',
                        borderLeft: active
                          ? `3px solid ${C.accent}`
                          : '3px solid transparent',
                        padding: '12px 16px 12px 14px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 5,
                        transition: 'background 0.15s',
                        outline: 'none',
                      }}
                      onFocus={e => {
                        e.currentTarget.style.outline = `2px solid ${C.accent}`;
                        e.currentTarget.style.outlineOffset = '-2px';
                      }}
                      onBlur={e => {
                        e.currentTarget.style.outline = 'none';
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Oswald', sans-serif",
                            fontSize: 16,
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            color: active ? C.accent : C.text,
                          }}
                        >
                          {u.displayName}
                        </span>
                        <ChevronRight
                          size={14}
                          style={{
                            color: C.textMuted,
                            opacity: active ? 1 : 0,
                            transition: 'opacity 0.15s',
                          }}
                          aria-hidden="true"
                        />
                      </div>
                      <span style={{ fontSize: 12, color: C.textSub }}>
                        {u.nickname}
                      </span>
                      <div
                        style={{
                          display: 'flex',
                          gap: 5,
                          flexWrap: 'wrap',
                          marginTop: 2,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: "'IBM Plex Mono', monospace",
                            color: choice.color,
                            background: `${choice.color}18`,
                            padding: '1px 6px',
                            borderRadius: 3,
                            border: `1px solid ${choice.color}30`,
                          }}
                        >
                          {u.choiceLabel}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: "'IBM Plex Mono', monospace",
                            color: draw.color,
                            background: draw.bg,
                            padding: '1px 6px',
                            borderRadius: 3,
                            border: `1px solid ${draw.color}30`,
                          }}
                        >
                          {draw.label}
                        </span>
                        {u.isCustom && (
                          <span
                            style={{
                              fontSize: 10,
                              fontFamily: "'IBM Plex Mono', monospace",
                              color: C.accent,
                              background: `${C.accent}18`,
                              padding: '1px 6px',
                              borderRadius: 3,
                              border: `1px solid ${C.accent}30`,
                            }}
                            title="Custom unit"
                          >
                            CUSTOM
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div
              style={{
                padding: '12px 16px',
                borderTop: `1px solid ${C.border}`,
              }}
            >
              <p
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 9,
                  color: C.textMuted,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                Application Stack
              </p>
              <p style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.6 }}>
                1st: Point-only (EP99999P)
                <br />
                2nd: GMU 79 · 3rd: GMU 62
                <br />
                4th: GMU 12
              </p>
            </div>
          </nav>

          {/* MAIN */}
          <main
            id="elk-main"
            ref={mainRef}
            tabIndex={-1}
            aria-label={`Details for ${unit.displayName}`}
            className="main-content"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              outline: 'none',
            }}
          >
            {/* Unit header */}
            <div
              className="content-padding"
              style={{
                background: C.surface,
                borderBottom: `1px solid ${C.border}`,
                padding: '14px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'baseline',
                    flexWrap: 'wrap',
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: 28,
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      color: C.accent,
                    }}
                  >
                    {unit.displayName}
                  </h2>
                  <span
                    style={{
                      fontFamily: "'Source Serif 4', Georgia, serif",
                      fontSize: 16,
                      fontStyle: 'italic',
                      color: C.textSub,
                    }}
                  >
                    {unit.nickname}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}
                >
                  <MapPin
                    size={12}
                    style={{ color: C.textMuted }}
                    aria-hidden="true"
                  />
                  <span
                    style={{
                      fontSize: 12,
                      color: C.textMuted,
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    {unit.counties.join(' · ')} Co. · {unit.state}
                  </span>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 12,
                    color: C.accent,
                    background: `${C.accent}18`,
                    border: `1px solid ${C.accent}30`,
                    padding: '4px 10px',
                    borderRadius: 6,
                  }}
                >
                  {unit.huntCode}
                </span>
                <Badge
                  label={unit.appLabel}
                  color={CHOICE_CONFIG[unit.choiceRank].color}
                />
                <GoHuntBadge slug={unit.gohuntSlug} />
              </div>
            </div>

            <TabBar activeTab={activeTab} onChange={setActiveTab} />

            {/* Panels */}
            <div
              className="content-padding"
              style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 32px' }}
            >
              {TABS.map(({ id }) => (
                <div
                  key={id}
                  role="tabpanel"
                  id={`panel-${id}`}
                  aria-labelledby={`tab-${id}`}
                  hidden={activeTab !== id}
                >
                  {activeTab === id && (
                    <>
                      {id === 'overview' && <OverviewPanel unit={unit} />}
                      {id === 'terrain' && <TerrainPanel unit={unit} />}
                      {id === 'access' && <AccessPanel unit={unit} />}
                      {id === 'directions' && <DirectionsPanel unit={unit} />}
                      {id === 'lodging' && <LodgingPanel unit={unit} />}
                      {id === 'waypoints' && <WaypointsPanel unit={unit} />}
                      {id === 'map' && <MapPanel unit={unit} />}
                      {id === 'gear' && (
                        <FeatureGate
                          feature={FEATURES.AUTHENTICATED.GEAR_TRACKING}
                        >
                          <GearList />
                        </FeatureGate>
                      )}
                      {id === 'integrations' && <IntegrationsPanel />}
                      {id === 'huntplan' && <HuntPlanPanel unit={unit} />}
                      {id === 'misc' && <MiscPanel unit={unit} />}
                      {id !== 'integrations' &&
                        id !== 'waypoints' &&
                        id !== 'gear' &&
                        id !== 'huntplan' &&
                        id !== 'misc' && (
                          <>
                            <NavigationPanel unit={unit} />
                            <SightingsPanel unit={unit} />
                            <NotesSection unitId={unit.id} />
                          </>
                        )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* Add Unit Form Modal */}
      {showAddUnitForm && (
        <AddUnitForm
          onClose={() => setShowAddUnitForm(false)}
          onUnitAdded={handleUnitAdded}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
}

// Main export with AuthProvider wrapper
export default function ElkHuntDashboard() {
  return (
    <AuthProvider>
      <ElkHuntDashboardInner />
    </AuthProvider>
  );
}
