import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mountain, MapPin, TreePine, Compass, Home, Plug,
  Layers, ChevronRight, AlertTriangle, CheckCircle,
  Clock, ExternalLink, Pencil, Check, X, Info,
  Navigation, Target, Zap
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════
const C = {
  bg:          "#0c1a10",
  surface:     "#121f16",
  card:        "#182519",
  cardHover:   "#1e2f20",
  border:      "#2a4032",
  borderLight: "#3a5a45",
  accent:      "#c47f20",
  accentHover: "#d9922a",
  accentDim:   "#8a5a14",
  green:       "#4a9a5a",
  greenLight:  "#6ab87a",
  text:        "#e8e4d8",
  textSub:     "#98b898",
  textMuted:   "#5e7e60",
  amber:       "#c4961a",
  red:         "#c04a38",
  redLight:    "#e06050",
  white:       "#ffffff",
};

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&display=swap";

// ═══════════════════════════════════════════════════════════════
// INTEGRATION ADAPTER REGISTRY
// Future GoHunt / HuntWise connections plug in here.
// Each adapter declares its status and the methods it will expose.
// ═══════════════════════════════════════════════════════════════
const INTEGRATIONS = {
  gohunt: {
    id:          "gohunt",
    name:        "GoHunt",
    logoInitial: "G",
    tagline:     "Draw odds, harvest stats, and detailed unit profiles",
    website:     "https://www.gohunt.com",
    status:      "planned",  // "active" | "planned" | "error"
    dataTypes:   ["Draw Odds", "Unit Profile", "Harvest Stats", "Weather Overlays"],
    // Adapter interface — implement when live:
    connect:           async () => { throw new Error("Not implemented"); },
    fetchUnitProfile:  async (unitId, year) => null,
    fetchDrawOdds:     async (unitId, residency) => null,
    fetchHarvestStats: async (unitId) => null,
  },
  huntwise: {
    id:          "huntwise",
    name:        "HuntWise",
    logoInitial: "H",
    tagline:     "Scouting layers, weather, moon phases, and wind forecasts",
    website:     "https://huntwise.com",
    status:      "planned",
    dataTypes:   ["Weather Forecast", "Scouting Layers", "Moon Phase", "Wind Direction"],
    connect:            async () => { throw new Error("Not implemented"); },
    fetchWeather:       async (lat, lng, date) => null,
    fetchScoutingLayers: async (unitId) => null,
  },
};

// ═══════════════════════════════════════════════════════════════
// UNIT DATA
// ═══════════════════════════════════════════════════════════════
const UNITS = [
  {
    id:           "GMU-12",
    displayName:  "GMU 12",
    nickname:     "Flat Tops",
    huntCode:     "EE012O1A",
    choiceRank:   4,
    choiceLabel:  "4th Choice",
    appLabel:     "E/S Limited Archery",
    counties:     ["Routt", "Rio Blanco", "Moffat"],
    state:        "CO",
    forest:       "White River & Routt National Forests",
    elevation:    [5800, 12200],
    coords:       { lat: 40.15, lng: -107.5 },
    draw:         "moderate",
    antler:       "4 pts on one antler OR 5\" brow tine",
    highlights: [
      "Highest elk harvest numbers of any unit in Colorado",
      "Resident herd estimated 38,000–42,000 elk",
      "Flat Tops Wilderness: ~20,000 acres (SE corner, foot/horse only)",
      "Most realistic draw prospect on your 2026 application",
    ],
    terrain: {
      summary:
        "Diverse unit. Private river bottoms and mild foothills in the north transition south into forested canyons, flattened ridges, and moderately steep mountains with patches above timberline. Meadows scattered throughout.",
      vegetation: [
        "Cottonwoods and willows along creek bottoms",
        "Sagebrush, bitterbrush, oak brush, pinyon/juniper below 8,000 ft",
        "Mountain mahogany, bunchgrass, and aspen above 8,000 ft",
        "Lodgepole pine, spruce, and fir at upper elevations",
        "Open meadows and dark timber throughout Routt NF",
      ],
      features: [
        "Flat Tops Wilderness — peaks to 12,200 ft, alpine lakes",
        "Morapos Creek watershed — 8,000–10,000 ft, productive public land",
        "Williams Fork River corridor",
        "Axial Basin — western edge, sagebrush and dry washes",
      ],
      slope: "Moderately steep on public land. Plateau top gives way to steep canyon walls in drainages.",
    },
    access: {
      summary:
        "Northern half predominantly private with BLM/state parcels surrounded by deeded ground. Southern portion is substantial public land via Routt and White River NF. Roads above 8,000 ft can be impassable by late October.",
      publicAreas: [
        "Jensen State Wildlife Area — 5,955 acres",
        "Indian Run State Wildlife Area — 2,039 acres",
        "Morapos Creek State Trust — 640 acres",
        "Monument Butte State Trust — 653 acres",
        "Iles Grove State Trust — 2,079 acres",
        "Flat Tops Wilderness — ~20,000 acres, no motorized access",
      ],
      routes: [
        "Rio Blanco County Rd 8 → White River NF / Morapos trailheads",
        "Routt County Rd 17 → eastern NF access",
        "US-13 N from Meeker → primary unit entry",
        "US-40 W from Craig → northwest access",
      ],
      notes: [
        "Heavy ATV traffic on west portion — hike deeper for less pressure",
        "Motorized travel limited to designated routes in NF",
        "Private land boundaries critical in north half — use onX",
        "Hunters 3–4+ miles from trailheads see significantly reduced competition",
      ],
    },
    directions: {
      fly: {
        airport:   "Denver International (DEN)",
        driveTime: "3.5–4 hrs",
        route:
          "DEN → I-70 W to Rifle (Exit 90) → US-13 N to Meeker (52 mi). Optionally continue US-40 W to Craig (30 mi from Meeker).",
      },
      drive: {
        distance: "~1,850 mi",
        time:     "~26 hrs",
        route:
          "I-40 W → I-25 N through Albuquerque → US-550 N → US-50 W → I-70 W → US-40 W to Craig",
      },
    },
    lodging: {
      hubs: [
        {
          name: "Craig, CO",
          badge: "Primary",
          note: "'Elk Hunting Capital of the World.' Full services: motels, restaurants, meat processors, fuel.",
          dist: "0–30 min",
        },
        {
          name: "Meeker, CO",
          badge: "Secondary",
          note: "20 mi south of Craig. Central to GMUs 12, 23, and 24. Motel-style lodging.",
          dist: "15–45 min",
        },
      ],
      options: [
        "Tunatua RV Resort (Craig) — hunter-friendly RV basecamp, full hookups",
        "The Elk Ranch — private lodge cabin between Craig and Meeker on GMU 12 private land",
        "Yellow Jacket Ranch Cabins (Horn & Fin Outfitters) — 10,000-acre ranch, meals and lodging",
        "Wild Skies Cabins — unguided cabin lodging in Routt NF, Flat Tops",
        "Multiple outfitter drop camps available throughout Routt NF",
      ],
    },
  },
  {
    id:           "GMU-62",
    displayName:  "GMU 62",
    nickname:     "Uncompahgre Plateau",
    huntCode:     "EE062V1A",
    choiceRank:   3,
    choiceLabel:  "3rd Choice",
    appLabel:     "E/S Non-Resident Only",
    counties:     ["Delta", "Mesa", "Montrose", "Ouray"],
    state:        "CO",
    forest:       "Uncompahgre National Forest / BLM",
    elevation:    [4700, 10300],
    coords:       { lat: 38.65, lng: -108.2 },
    draw:         "low-moderate",
    antler:       "4 pts on one antler OR 5\" brow tine",
    highlights: [
      "Shares the Uncompahgre Plateau with Trophy Unit 61",
      "Healthy elk populations with more attainable tags than neighboring units",
      "Fly direct into Montrose Regional Airport (MTJ)",
      "Rut can begin as early as first week of September",
    ],
    terrain: {
      summary:
        "Flat-top mountain range primarily between 8,300–9,200 ft. Steep remote canyons on the flanks. Good road access on the plateau top; many roads become impassable in wet weather.",
      vegetation: [
        "Sagebrush and scrub oak at lower elevations",
        "Aspen groves and dark timber on the plateau",
        "Oak brush and juniper on canyon walls and slopes",
        "Pinyon-juniper on lower canyon flanks",
        "Open grassy meadows across the plateau top",
      ],
      features: [
        "Horsefly Peak — 10,300 ft high point",
        "Divide Road (USFS Rd 402) — splits GMU 62 (NE) from GMU 61 (SW)",
        "Rubideau Creek drainage — productive canyon habitat",
        "Trevor Trail access corridor",
        "Remote canyon systems with steep descents",
      ],
      slope: "Steep overall — 80% of public land has slopes ≤27°. Plateau top is forgiving; canyon country is rugged.",
    },
    access: {
      summary:
        "Good road access across the plateau top via Mesa 25 Road and USFS Rd 402. Lower canyon access is limited and 4WD-dependent. Private land borders eastern canyon sections.",
      publicAreas: [
        "Uncompahgre National Forest — majority of plateau",
        "BLM dispersed land below the mesa (late-season camping)",
        "Public access along Divide Road corridor",
      ],
      routes: [
        "Mesa 25 Road W from Delta → main plateau access",
        "USFS Rd 402 (Divide Road) — north-south spine of plateau",
        "Hwy 90 from Montrose → southern plateau entry",
        "Hwy 62 from Ouray → southeastern access",
      ],
      notes: [
        "Early season: camp along primitive roads on plateau top",
        "Late season: camp on BLM land below the mesa as elk descend",
        "Hunting pressure highest near roads — drop into canyons for less competition",
        "Horses recommended for canyon hunting — pack-out is challenging",
        "Verify eastern canyon access with onX; private land present",
      ],
    },
    directions: {
      fly: {
        airport:   "Montrose Regional (MTJ)",
        driveTime: "30–60 min",
        route:
          "MTJ → US-50 W through Delta → Hwy 90 W onto plateau, or north via Hwy 141. Direct flights from PHX, DEN, and DAL.",
        note: "Best fly-in option of your three units.",
      },
      drive: {
        distance: "~1,700 mi",
        time:     "~24 hrs",
        route:
          "I-40 W → I-25 N (Albuquerque) → US-550 N through Durango and Ouray → US-50 E to Montrose",
      },
    },
    lodging: {
      hubs: [
        {
          name:  "Montrose, CO",
          badge: "Primary",
          note:  "Primary base with direct airport access (MTJ). Full services. 30–60 min to plateau hunting areas.",
          dist:  "30–60 min",
        },
        {
          name:  "Delta, CO",
          badge: "Secondary",
          note:  "Closer to northern plateau access via Mesa 25 Road. Smaller town with basic services.",
          dist:  "20–40 min",
        },
        {
          name:  "Grand Junction, CO",
          badge: "Overflow",
          note:  "Largest city in the region, 60 mi north. More lodging options but further from unit.",
          dist:  "60–80 min",
        },
      ],
      options: [
        "Western Colorado Outfitters base camp — guided/semi-guided, GMU 62 National Forest permit area",
        "Dark Timber Lodge — fully outfitted hunts in Units 61 and 62, meals and lodging included",
        "Primitive road camping on plateau top (early season)",
        "BLM dispersed camping below mesa (late season — free)",
        "Various motels in Montrose and Delta for town-based base camping",
      ],
    },
  },
  {
    id:           "GMU-79",
    displayName:  "GMU 79",
    nickname:     "San Luis Valley",
    huntCode:     "EE079V1A",
    choiceRank:   2,
    choiceLabel:  "2nd Choice",
    appLabel:     "E/S Non-Resident Only",
    counties:     ["Mineral", "Rio Grande", "Saguache"],
    state:        "CO",
    forest:       "Rio Grande National Forest",
    elevation:    [7500, 14000],
    coords:       { lat: 37.8, lng: -106.5 },
    draw:         "high",
    antler:       "4 pts on one antler OR 5\" brow tine (corridor exception near Del Norte/Monte Vista for damage tags ONLY)",
    highlights: [
      "San Luis Valley spans 8,000 square miles of dramatic terrain",
      "Sangre de Cristo Mountains define the rugged eastern boundary",
      "La Garita Wilderness accessible within unit boundaries",
      "Sand Dunes elk herd estimated at 5,000–6,000+ animals",
    ],
    terrain: {
      summary:
        "Vast high-desert valley flanked by Sangre de Cristo Mountains (east) and San Juan Mountains (west). Elevations range from 7,500 ft valley floor to 14,000 ft peaks. Highly varied: open sagebrush flats to rugged alpine terrain.",
      vegetation: [
        "Sagebrush, grass, pinyon, and juniper at valley floor elevations",
        "High ridges between creek drainages at mid-elevation",
        "Spruce-fir forests on upper mountain slopes",
        "Aspen groves in mid-elevation drainages",
        "Alpine tundra above 12,000 ft",
      ],
      features: [
        "Sangre de Cristo Mountains — steep and rugged eastern boundary",
        "La Garita Wilderness — roadless, foot/horse access only",
        "Rio Grande River corridor",
        "La Garita Driveway (ATV trail) — western unit access",
        "USFS Roads 600 and 600-3A — primary forest access routes",
      ],
      slope: "Very steep on public land — 80% of area has slopes ≤24°. Valley floor is flat but elk concentrate in the mountains.",
    },
    access: {
      summary:
        "Good public road access across much of the unit with primitive 4WD roads branching higher. Eastern side limited by private agricultural land. Access ranges from moderate to very difficult depending on depth.",
      publicAreas: [
        "Rio Grande National Forest — primary public land block",
        "La Garita Wilderness — roadless, foot/horse only",
        "BLM scattered parcels across valley floor",
      ],
      routes: [
        "US-285 — eastern boundary corridor",
        "US-160 — southern boundary, main highway",
        "County Hwy 149 — western and northern forest access",
        "USFS Road 600 → upper forest and La Garita access",
        "La Garita Driveway (ATV trail) — western unit access",
      ],
      notes: [
        "Private agricultural land limits eastern access — verify all boundaries with onX",
        "4WD and ATV strongly recommended for upper-elevation routes",
        "Some routes impassable in wet or snowy weather",
        "Elk push into mountains away from valley floor — plan for hiking",
        "Antler restriction corridor exception between Del Norte and Monte Vista applies to DAMAGE TAGS ONLY — not your hunt code",
      ],
    },
    directions: {
      fly: {
        airport:   "Alamosa (ALS) or Denver (DEN)",
        driveTime: "ALS: 30–45 min · DEN: ~3.5 hrs",
        route:
          "DEN → I-25 S → US-160 W (Walsenburg) → Monte Vista or Del Norte. Alternatively, fly ALS via regional carriers for closer access.",
      },
      drive: {
        distance: "~1,600 mi",
        time:     "~23 hrs",
        route:
          "I-40 W → I-25 N (Albuquerque) → US-285 N → Alamosa / Monte Vista corridor",
      },
    },
    lodging: {
      hubs: [
        {
          name:  "Monte Vista, CO",
          badge: "Primary",
          note:  "Primary hotel town for GMU 79. Closest town with lodging to the unit hunting areas.",
          dist:  "15–45 min",
        },
        {
          name:  "Del Norte, CO",
          badge: "Secondary",
          note:  "On the US-160 corridor. Small town with basic services.",
          dist:  "20–50 min",
        },
        {
          name:  "Alamosa, CO",
          badge: "Full Services",
          note:  "Largest nearby city. Regional airport (ALS), meat processing, full hotel selection.",
          dist:  "45–60 min",
        },
      ],
      options: [
        "Most hunters camp along high-elevation roads on public ground — limited hotel supply",
        "Monte Vista motels — limited selection, book early during season",
        "Alamosa provides full services: lodging, meat processing, and regional airport",
        "BBB Outfitters — San Luis Valley outfitter with access to private hunt lands",
        "Rio Grande National Forest dispersed camping (free, primitive)",
      ],
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const DRAW_CONFIG = {
  "high":        { label: "Hard Draw",     color: C.red,   bg: "#2a1210" },
  "moderate":    { label: "Moderate",      color: C.amber, bg: "#2a2010" },
  "low-moderate":{ label: "Low–Moderate",  color: C.green, bg: "#102a18" },
};

const CHOICE_CONFIG = {
  2: { label: "2nd", color: C.red },
  3: { label: "3rd", color: C.amber },
  4: { label: "4th", color: C.green },
};

const TABS = [
  { id: "overview",     label: "Overview",     Icon: Layers },
  { id: "terrain",      label: "Terrain",      Icon: Mountain },
  { id: "access",       label: "Access",       Icon: TreePine },
  { id: "directions",   label: "Directions",   Icon: Compass },
  { id: "lodging",      label: "Lodging",      Icon: Home },
  { id: "integrations", label: "Integrations", Icon: Plug },
];

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function Card({ children, style = {}, as: Tag = "div", ...props }) {
  return (
    <Tag
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: "16px 20px",
        ...style,
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}

function SectionLabel({ children }) {
  return (
    <p
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: C.textMuted,
        margin: "0 0 10px",
      }}
    >
      {children}
    </p>
  );
}

function BulletList({ items, icon: Icon, iconColor = C.accent }) {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          {Icon ? (
            <Icon size={14} style={{ color: iconColor, flexShrink: 0, marginTop: 3 }} aria-hidden="true" />
          ) : (
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: iconColor, flexShrink: 0, marginTop: 7 }} aria-hidden="true" />
          )}
          <span style={{ fontSize: 14, color: C.text, lineHeight: 1.55 }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Badge({ label, color, bg }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 4,
        background: bg || `${color}22`,
        color,
        fontSize: 11,
        fontFamily: "'IBM Plex Mono', monospace",
        fontWeight: 500,
        letterSpacing: "0.05em",
        border: `1px solid ${color}44`,
      }}
    >
      {label}
    </span>
  );
}

// ── TABS ──────────────────────────────────────────────────────
function TabBar({ activeTab, onChange }) {
  const tabRefs = useRef({});

  const handleKeyDown = (e, tabId, idx) => {
    const ids = TABS.map(t => t.id);
    if (e.key === "ArrowRight") {
      const next = TABS[(idx + 1) % TABS.length];
      onChange(next.id);
      tabRefs.current[next.id]?.focus();
    } else if (e.key === "ArrowLeft") {
      const prev = TABS[(idx - 1 + TABS.length) % TABS.length];
      onChange(prev.id);
      tabRefs.current[prev.id]?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Unit detail sections"
      style={{
        display: "flex",
        borderBottom: `1px solid ${C.border}`,
        overflowX: "auto",
        scrollbarWidth: "none",
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
            onKeyDown={e => handleKeyDown(e, id, idx)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "12px 18px",
              background: "none",
              border: "none",
              borderBottom: active ? `2px solid ${C.accent}` : "2px solid transparent",
              color: active ? C.accent : C.textMuted,
              fontFamily: "'Oswald', sans-serif",
              fontSize: 13,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "color 0.15s, border-color 0.15s",
              outline: "none",
            }}
            onFocus={e => { e.currentTarget.style.boxShadow = `inset 0 -2px 0 ${C.accent}, 0 0 0 2px ${C.accent}44`; }}
            onBlur={e => { e.currentTarget.style.boxShadow = "none"; }}
          >
            <Icon size={14} aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ── TAB PANELS ────────────────────────────────────────────────

function OverviewPanel({ unit }) {
  const draw = DRAW_CONFIG[unit.draw];
  const choice = CHOICE_CONFIG[unit.choiceRank];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {/* Highlights */}
      <Card style={{ gridColumn: "1 / -1" }}>
        <SectionLabel>Unit Highlights</SectionLabel>
        <BulletList items={unit.highlights} icon={Target} iconColor={C.accent} />
      </Card>

      {/* Draw Info */}
      <Card>
        <SectionLabel>Draw Status</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <Badge label={draw.label} color={draw.color} bg={draw.bg} />
            <Badge label={`${choice.label} Choice`} color={choice.color} />
          </div>
          <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6, margin: 0 }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.accent }}>
              {unit.huntCode}
            </span>
            {" · "}{unit.appLabel}
          </p>
          <p style={{ fontSize: 13, color: C.textSub, lineHeight: 1.6, margin: 0 }}>
            {unit.draw === "moderate" && "First-year applicant odds are viable. Limited archery tag — check CPW brochure for special restrictions."}
            {unit.draw === "low-moderate" && "Typically 2–3 preference points needed for early seasons. OTC available for archery and select rifle seasons."}
            {unit.draw === "high" && "Competitive draw with limited non-resident tags. Challenging odds without accumulated preference points."}
          </p>
        </div>
      </Card>

      {/* Unit Stats */}
      <Card>
        <SectionLabel>Unit Stats</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "Counties", value: unit.counties.join(", ") },
            { label: "Elevation", value: `${unit.elevation[0].toLocaleString()}–${unit.elevation[1].toLocaleString()} ft` },
            { label: "Primary Forest", value: unit.forest },
            { label: "Antler Restriction", value: unit.antler },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 10, color: C.textMuted, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {label}
              </span>
              <span style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Elevation Bar */}
      <Card style={{ gridColumn: "1 / -1" }}>
        <SectionLabel>Elevation Profile</SectionLabel>
        <div style={{ position: "relative", height: 12, background: C.surface, borderRadius: 6, overflow: "hidden" }}>
          <div
            aria-label={`Elevation range: ${unit.elevation[0].toLocaleString()} to ${unit.elevation[1].toLocaleString()} feet`}
            style={{
              position: "absolute",
              left: `${((unit.elevation[0] - 4500) / (14500 - 4500)) * 100}%`,
              width: `${((unit.elevation[1] - unit.elevation[0]) / (14500 - 4500)) * 100}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${C.green}, ${C.accent})`,
              borderRadius: 6,
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontSize: 11, color: C.textMuted, fontFamily: "'IBM Plex Mono', monospace" }}>
            Low: {unit.elevation[0].toLocaleString()} ft
          </span>
          <span style={{ fontSize: 11, color: C.textMuted, fontFamily: "'IBM Plex Mono', monospace" }}>
            High: {unit.elevation[1].toLocaleString()} ft
          </span>
        </div>
      </Card>
    </div>
  );
}

function TerrainPanel({ unit }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <SectionLabel>Terrain Summary</SectionLabel>
        <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, margin: 0 }}>{unit.terrain.summary}</p>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <SectionLabel>Vegetation Zones</SectionLabel>
          <BulletList items={unit.terrain.vegetation} />
        </Card>
        <Card>
          <SectionLabel>Key Geographic Features</SectionLabel>
          <BulletList items={unit.terrain.features} icon={MapPin} iconColor={C.green} />
        </Card>
      </div>
      <Card>
        <SectionLabel>Slope & Difficulty</SectionLabel>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <AlertTriangle size={16} style={{ color: C.amber, flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
          <p style={{ fontSize: 14, color: C.text, lineHeight: 1.6, margin: 0 }}>{unit.terrain.slope}</p>
        </div>
      </Card>
    </div>
  );
}

function AccessPanel({ unit }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <SectionLabel>Access Overview</SectionLabel>
        <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, margin: 0 }}>{unit.access.summary}</p>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <SectionLabel>Public Land Areas</SectionLabel>
          <BulletList items={unit.access.publicAreas} icon={CheckCircle} iconColor={C.green} />
        </Card>
        <Card>
          <SectionLabel>Primary Access Routes</SectionLabel>
          <BulletList items={unit.access.routes} icon={Navigation} iconColor={C.accent} />
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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <SectionLabel>Fly-In Option</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 20, color: C.accent, letterSpacing: "0.04em" }}>
              {unit.directions.fly.airport}
            </span>
            <Badge label={`Drive: ${unit.directions.fly.driveTime}`} color={C.green} />
          </div>
          <p style={{ fontSize: 14, color: C.text, lineHeight: 1.65, margin: 0 }}>
            {unit.directions.fly.route}
          </p>
          {unit.directions.fly.note && (
            <p style={{ fontSize: 13, color: C.accent, lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>
              ★ {unit.directions.fly.note}
            </p>
          )}
        </div>
      </Card>

      <Card>
        <SectionLabel>Drive from North Carolina</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Badge label={unit.directions.drive.distance} color={C.accent} />
            <Badge label={`~${unit.directions.drive.time}`} color={C.textSub} />
          </div>
          <p style={{ fontSize: 14, color: C.text, lineHeight: 1.65, margin: 0 }}>
            {unit.directions.drive.route}
          </p>
        </div>
      </Card>

      <Card>
        <SectionLabel>Comparison — All Three Units</SectionLabel>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
            aria-label="Drive distance comparison for all hunt units"
          >
            <thead>
              <tr>
                {["Unit", "Drive Distance", "Drive Time", "Nearest Airport"].map(h => (
                  <th
                    key={h}
                    scope="col"
                    style={{
                      textAlign: "left",
                      padding: "6px 12px",
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 10,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
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
                <tr key={u.id} style={{ background: i % 2 === 0 ? "transparent" : `${C.surface}88` }}>
                  <td style={{ padding: "8px 12px", color: C.accent, fontFamily: "'IBM Plex Mono', monospace" }}>{u.displayName}</td>
                  <td style={{ padding: "8px 12px", color: C.text }}>{u.directions.drive.distance}</td>
                  <td style={{ padding: "8px 12px", color: C.text }}>{u.directions.drive.time}</td>
                  <td style={{ padding: "8px 12px", color: C.textSub }}>{u.directions.fly.airport}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function LodgingPanel({ unit }) {
  const hubColors = { Primary: C.accent, Secondary: C.green, "Full Services": C.green, Overflow: C.textSub };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
        {unit.lodging.hubs.map(hub => (
          <Card key={hub.name}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, color: C.text, letterSpacing: "0.03em" }}>
                {hub.name}
              </span>
              <Badge label={hub.badge} color={hubColors[hub.badge] || C.textSub} />
            </div>
            <p style={{ fontSize: 13, color: C.textSub, lineHeight: 1.6, margin: "0 0 8px" }}>{hub.note}</p>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <Navigation size={12} style={{ color: C.textMuted }} aria-hidden="true" />
              <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "'IBM Plex Mono', monospace" }}>
                {hub.dist} from hunting area
              </span>
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <SectionLabel>Lodging Options</SectionLabel>
        <BulletList items={unit.lodging.options} icon={Home} iconColor={C.green} />
      </Card>
    </div>
  );
}

function IntegrationsPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Info size={16} style={{ color: C.accent, flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
          <p style={{ fontSize: 14, color: C.textSub, lineHeight: 1.65, margin: 0 }}>
            Third-party integrations are planned for future versions. When connected, these services will
            surface real-time draw odds, weather forecasts, scouting layers, and harvest data directly
            alongside your unit notes. The adapter architecture is already in place — connection activation
            is the only remaining step.
          </p>
        </div>
      </Card>

      {Object.values(INTEGRATIONS).map(integration => (
        <Card key={integration.id} style={{ position: "relative" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            {/* Logo */}
            <div
              style={{
                width: 44, height: 44, borderRadius: 8,
                background: C.surface, border: `1px solid ${C.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Oswald', sans-serif", fontSize: 20, color: C.textMuted,
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              {integration.logoInitial}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 18, color: C.text, letterSpacing: "0.04em" }}>
                  {integration.name}
                </span>
                <Badge label="Planned" color={C.amber} />
              </div>
              <p style={{ fontSize: 13, color: C.textSub, lineHeight: 1.6, margin: "0 0 12px" }}>
                {integration.tagline}
              </p>

              {/* Data types */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {integration.dataTypes.map(dt => (
                  <span
                    key={dt}
                    style={{
                      padding: "3px 8px", borderRadius: 4,
                      background: C.surface, border: `1px solid ${C.border}`,
                      fontSize: 11, color: C.textMuted,
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    {dt}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  disabled
                  aria-disabled="true"
                  style={{
                    padding: "7px 16px",
                    background: C.accentDim,
                    color: `${C.text}66`,
                    border: "none",
                    borderRadius: 6,
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: 13,
                    letterSpacing: "0.06em",
                    cursor: "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Zap size={13} aria-hidden="true" />
                  Connect (Coming Soon)
                </button>
                <a
                  href={integration.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    fontSize: 13, color: C.accent, textDecoration: "none",
                  }}
                  aria-label={`Visit ${integration.name} website (opens in new tab)`}
                >
                  <ExternalLink size={13} aria-hidden="true" />
                  Visit {integration.name}
                </a>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── NOTES COMPONENT ───────────────────────────────────────────
function NotesSection({ unitId }) {
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const storageKey = `elk-note-${unitId}`;

  useEffect(() => {
    setLoading(true);
    setSaved(false);
    window.storage?.get(storageKey).then(r => {
      setNote(r?.value ?? "");
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [unitId, storageKey]);

  const handleSave = async () => {
    await window.storage?.set(storageKey, note).catch(() => {});
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card style={{ marginTop: 16 }}>
      <SectionLabel>Field Notes — {unitId}</SectionLabel>
      <textarea
        aria-label={`Personal field notes for ${unitId}`}
        value={loading ? "Loading…" : note}
        onChange={e => { setNote(e.target.value); setSaved(false); }}
        disabled={loading}
        placeholder="Add scouting notes, access observations, camp locations…"
        rows={4}
        style={{
          width: "100%",
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 6,
          color: C.text,
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontSize: 14,
          lineHeight: 1.7,
          padding: "10px 12px",
          resize: "vertical",
          outline: "none",
          boxSizing: "border-box",
        }}
        onFocus={e => { e.target.style.borderColor = C.accent; }}
        onBlur={e => { e.target.style.borderColor = C.border; }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 14px",
            background: saved ? C.green : C.accent,
            color: C.bg,
            border: "none",
            borderRadius: 6,
            fontFamily: "'Oswald', sans-serif",
            fontSize: 13,
            letterSpacing: "0.06em",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}
          aria-label={saved ? "Notes saved" : "Save notes"}
        >
          {saved ? <Check size={13} aria-hidden="true" /> : <Pencil size={13} aria-hidden="true" />}
          {saved ? "Saved" : "Save Notes"}
        </button>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function ElkHuntDashboard() {
  const [activeUnitId, setActiveUnitId] = useState(UNITS[2].id); // GMU-12 default
  const [activeTab, setActiveTab]       = useState("overview");
  const mainRef = useRef(null);

  useEffect(() => {
    // Inject Google Fonts
    if (!document.getElementById("elk-gf")) {
      const link = document.createElement("link");
      link.id   = "elk-gf";
      link.rel  = "stylesheet";
      link.href = FONT_URL;
      document.head.appendChild(link);
    }
  }, []);

  const unit = UNITS.find(u => u.id === activeUnitId) ?? UNITS[0];

  const switchUnit = (id) => {
    setActiveUnitId(id);
    setActiveTab("overview");
    mainRef.current?.focus();
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :focus-visible { outline: 2px solid ${C.accent}; outline-offset: 2px; border-radius: 3px; }
        .skip-link { position: absolute; top: -60px; left: 8px; background: ${C.accent}; color: ${C.bg};
          padding: 8px 16px; border-radius: 6px; font-family: 'Oswald', sans-serif; font-size: 14px;
          letter-spacing: 0.05em; z-index: 9999; text-decoration: none; transition: top 0.1s; }
        .skip-link:focus { top: 8px; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: ${C.surface}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.borderLight}; }
        .unit-btn:hover { background: ${C.cardHover} !important; }
        .unit-btn:hover .unit-arrow { opacity: 1 !important; }
      `}</style>

      {/* Skip to content */}
      <a href="#elk-main" className="skip-link">Skip to content</a>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          background: C.bg,
          color: C.text,
          fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
          overflow: "hidden",
        }}
      >
        {/* ── HEADER ─────────────────────────────────────────── */}
        <header
          style={{
            background: C.surface,
            borderBottom: `1px solid ${C.border}`,
            padding: "0 24px",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Mountain size={20} style={{ color: C.accent }} aria-hidden="true" />
            <h1
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: C.text,
              }}
            >
              Elk Hunt Planner
            </h1>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                color: C.textMuted,
                letterSpacing: "0.08em",
                marginLeft: 4,
              }}
              aria-label="Colorado, Season 2026"
            >
              CO · 2026
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {Object.values(INTEGRATIONS).map(i => (
              <span
                key={i.id}
                title={`${i.name}: ${i.status}`}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  fontSize: 11, color: C.textMuted,
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
                aria-label={`${i.name} integration: ${i.status}`}
              >
                <Plug size={11} aria-hidden="true" />
                {i.name}
              </span>
            ))}
          </div>
        </header>

        {/* ── BODY ───────────────────────────────────────────── */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* ── SIDEBAR ──────────────────────────────────────── */}
          <nav
            aria-label="Colorado hunt units"
            style={{
              width: 220,
              background: C.surface,
              borderRight: `1px solid ${C.border}`,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <div style={{ padding: "14px 16px 10px", borderBottom: `1px solid ${C.border}` }}>
              <p
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 9,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: C.textMuted,
                }}
              >
                Applied Units · 2026
              </p>
            </div>
            <ul
              role="list"
              style={{
                listStyle: "none",
                padding: "8px 0",
                overflowY: "auto",
                flex: 1,
              }}
            >
              {UNITS.map(u => {
                const active = u.id === activeUnitId;
                const draw = DRAW_CONFIG[u.draw];
                const choice = CHOICE_CONFIG[u.choiceRank];
                return (
                  <li key={u.id}>
                    <button
                      className="unit-btn"
                      onClick={() => switchUnit(u.id)}
                      aria-current={active ? "true" : undefined}
                      aria-label={`${u.displayName} ${u.nickname}, ${u.choiceLabel}`}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        background: active ? C.card : "transparent",
                        border: "none",
                        borderLeft: active ? `3px solid ${C.accent}` : "3px solid transparent",
                        padding: "12px 16px 12px 14px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                        transition: "background 0.15s",
                        outline: "none",
                      }}
                      onFocus={e => { e.currentTarget.style.outline = `2px solid ${C.accent}`; e.currentTarget.style.outlineOffset = "-2px"; }}
                      onBlur={e => { e.currentTarget.style.outline = "none"; }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span
                          style={{
                            fontFamily: "'Oswald', sans-serif",
                            fontSize: 16,
                            fontWeight: 600,
                            letterSpacing: "0.05em",
                            color: active ? C.accent : C.text,
                          }}
                        >
                          {u.displayName}
                        </span>
                        <ChevronRight
                          className="unit-arrow"
                          size={14}
                          style={{ color: C.textMuted, opacity: active ? 1 : 0, transition: "opacity 0.15s" }}
                          aria-hidden="true"
                        />
                      </div>
                      <span style={{ fontSize: 12, color: C.textSub }}>{u.nickname}</span>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 2 }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: "'IBM Plex Mono', monospace",
                            color: choice.color,
                            background: `${choice.color}18`,
                            padding: "1px 6px",
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
                            padding: "1px 6px",
                            borderRadius: 3,
                            border: `1px solid ${draw.color}30`,
                          }}
                        >
                          {draw.label}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Sidebar footer */}
            <div
              style={{
                padding: "12px 16px",
                borderTop: `1px solid ${C.border}`,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Application Stack
              </p>
              <p style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5 }}>
                1st: Point-only (EP99999P)<br />
                2nd: GMU 79 · 3rd: GMU 62<br />
                4th: GMU 12
              </p>
            </div>
          </nav>

          {/* ── MAIN CONTENT ─────────────────────────────────── */}
          <main
            id="elk-main"
            ref={mainRef}
            tabIndex={-1}
            aria-label={`Details for ${unit.displayName}`}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              outline: "none",
            }}
          >
            {/* Unit Header */}
            <div
              style={{
                background: C.surface,
                borderBottom: `1px solid ${C.border}`,
                padding: "14px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                  <h2
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: 28,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      color: C.accent,
                    }}
                  >
                    {unit.displayName}
                  </h2>
                  <span
                    style={{
                      fontFamily: "'Source Serif 4', Georgia, serif",
                      fontSize: 16,
                      fontStyle: "italic",
                      color: C.textSub,
                    }}
                  >
                    {unit.nickname}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <MapPin size={12} style={{ color: C.textMuted }} aria-hidden="true" />
                  <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "'IBM Plex Mono', monospace" }}>
                    {unit.counties.join(" · ")} Co. · {unit.state}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 12,
                    color: C.accent,
                    background: `${C.accent}18`,
                    border: `1px solid ${C.accent}30`,
                    padding: "4px 10px",
                    borderRadius: 6,
                  }}
                >
                  {unit.huntCode}
                </span>
                <Badge
                  label={unit.appLabel}
                  color={CHOICE_CONFIG[unit.choiceRank].color}
                />
              </div>
            </div>

            {/* Tabs */}
            <TabBar activeTab={activeTab} onChange={setActiveTab} />

            {/* Tab Panels */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px 24px 32px",
              }}
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
                      {id === "overview"     && <OverviewPanel unit={unit} />}
                      {id === "terrain"      && <TerrainPanel unit={unit} />}
                      {id === "access"       && <AccessPanel unit={unit} />}
                      {id === "directions"   && <DirectionsPanel unit={unit} />}
                      {id === "lodging"      && <LodgingPanel unit={unit} />}
                      {id === "integrations" && <IntegrationsPanel />}
                      {id !== "integrations" && <NotesSection unitId={unit.id} />}
                    </>
                  )}
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
