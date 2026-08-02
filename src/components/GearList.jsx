import { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Search,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  Star,
  Award,
  Image as ImageIcon,
  ExternalLink,
  Scale,
} from 'lucide-react';
import { storage } from '../storage';
import acquiredManifest from '../../assets/acquired-gear.json';

// Normalize a name/category for manifest matching (trim + lowercase)
const normKey = s => (s || '').trim().toLowerCase();

// Build a lookup of manifest entries keyed by "name|category"
const manifestLookup = () => {
  const map = {};
  (acquiredManifest || []).forEach(entry => {
    map[`${normKey(entry.name)}|${normKey(entry.category)}`] = entry;
  });
  return map;
};

// Suggested "optimal" weights (ounces) for common items, keyed by normalized
// item name. Used to prefill the tracking list; every value stays editable.
const WEIGHT_LOOKUP = {
  'treking poles': 16,
  'sit pad': 3,
  'bino harness': 6,
  binos: 28,
  'bear spray': 10,
  'game calls': 3,
  'range finder': 6,
  'multi-tool / knife (gerber dime)': 2,
  'ferro rod': 1,
  'wind detector': 0.5,
  'in reach garmin gps': 3.5,
  'allen key set': 2,
  'lens wipe': 0.2,
  'small lighter': 0.5,
  'fire starter': 1,
  'ul backup headlamp': 1.5,
  'jet boil stove and fuel': 15,
  'water filtration solution': 3,
  'bow & arrows': 64,
  'water and bladder / water bottle': 6,
  'head lamp': 3,
  'power bank and cords': 8,
  tripod: 32,
  '1l soft bottle': 1.5,
  'wind proof matches': 1,
  'bugle tube': 3,
  'sunscreen / balm': 1,
  chapstick: 0.3,
  'fixed blade knife': 5,
  'battery bank usb-c usb-mini': 8,
  spork: 0.5,
  'tent small + foot print': 40,
  'tent large + foot print': 80,
  'apex pant': 12,
  'ascent pant': 12,
  socks: 2,
  underwear: 2,
  'puffy jacket': 16,
  'wind breaker jacket': 8,
  'fleece jacket': 12,
  'base layer x3': 18,
  boots: 32,
  hat: 3,
  'gloves x2': 4,
  belt: 4,
  crocs: 8,
  knife: 3,
  saw: 5,
  'game bags': 6,
  tourniquet: 2,
  'quick clot': 1,
  'trauma blanket': 3,
  'signal mirror': 1,
  paracord: 3,
  tarp: 12,
  'tarp 8x10': 16,
  rope: 8,
  'solar panel and charging cables': 12,
  'large power bank': 12,
  'buddy heater': 40,
  lantern: 8,
  'headlamp backup': 2,
  axe: 32,
  'spotting scope': 40,
  'folding chair': 32,
  'sleeping bag': 40,
  quilt: 20,
  'sleeping pad': 16,
  'water containers': 32,
};

// Ensure every item has owned/image/weight fields, seeding missing values from
// the committed manifest (owned/image, by name+category) and the weight lookup
// (by name). Explicit values already on an item are always kept.
const applyManifest = data => {
  const lookup = manifestLookup();
  const result = {};
  Object.entries(data).forEach(([category, items]) => {
    result[category] = items.map(item => {
      const seed = lookup[`${normKey(item.name)}|${normKey(category)}`];
      const seededWeight = WEIGHT_LOOKUP[normKey(item.name)];
      return {
        ...item,
        owned:
          item.owned !== undefined ? item.owned : seed ? !!seed.owned : false,
        image:
          item.image != null
            ? item.image
            : seed && seed.image
              ? seed.image
              : null,
        weight:
          item.weight !== undefined
            ? item.weight
            : seededWeight !== undefined
              ? seededWeight
              : null,
      };
    });
  });
  return result;
};

// Curated "Buy Once, Cry Once" picks for the GMU 79 hunt, grouped by category.
// Each item links to a product search so it can be bought. `q` = search query.
const CRY_ONCE_PICKS = [
  {
    group: 'Pack & Trekking',
    items: [
      {
        name: 'Exo Mountain Gear K4 5000',
        why: 'Hauls 100+ lb elk quarters in comfort',
        q: 'Exo Mountain Gear K4 5000 backpack',
      },
      {
        name: 'Stone Glacier Sky 5900',
        why: 'Ultralight frame, heavy-load capable',
        q: 'Stone Glacier Sky 5900 backpack',
      },
      {
        name: 'Black Diamond Alpine Carbon Cork',
        why: 'Saves knees on 40% slopes + packouts',
        q: 'Black Diamond Alpine Carbon Cork trekking poles',
      },
    ],
  },
  {
    group: 'Optics',
    items: [
      {
        name: 'Swarovski NL Pure 10x42',
        why: 'Best-in-class western glassing',
        q: 'Swarovski NL Pure 10x42 binoculars',
      },
      {
        name: 'Vortex Razor UHD 10x42',
        why: 'Premium glass at half the price',
        q: 'Vortex Razor UHD 10x42 binoculars',
      },
      {
        name: 'Marsupial Enclosed Bino Harness',
        why: 'Silent magnetic one-hand access',
        q: 'Marsupial Gear enclosed bino harness',
      },
    ],
  },
  {
    group: 'Rangefinder',
    items: [
      {
        name: 'Leupold RX-Fulldraw 5',
        why: 'Archery angle-comp for steep shots',
        q: 'Leupold RX-Fulldraw 5 rangefinder',
      },
      {
        name: 'Sig Sauer KILO4K',
        why: 'Fast, precise, excellent low light',
        q: 'Sig Sauer KILO4K rangefinder',
      },
    ],
  },
  {
    group: 'Water',
    items: [
      {
        name: 'Katadyn BeFree 1L',
        why: 'Instant flow from alpine seeps',
        q: 'Katadyn BeFree 1L water filter',
      },
      {
        name: 'Sawyer Squeeze',
        why: 'Reliable, lightweight backup',
        q: 'Sawyer Squeeze water filter',
      },
    ],
  },
  {
    group: 'Navigation & Safety',
    items: [
      {
        name: 'Garmin inReach Mini 2',
        why: 'Solo remote SOS + check-ins',
        q: 'Garmin inReach Mini 2',
      },
      {
        name: 'onX Hunt (offline maps)',
        why: 'Benches, escape routes, boundaries',
        q: 'onX Hunt app subscription',
      },
      {
        name: 'Counter Assault Bear Spray',
        why: 'Longest range EPA-approved spray',
        q: 'Counter Assault bear spray 10.2 oz',
      },
      {
        name: 'North American Rescue CAT Gen 7',
        why: 'Real tourniquet, not a knockoff',
        q: 'North American Rescue CAT Gen 7 tourniquet',
      },
      {
        name: 'QuikClot Hemostatic Gauze',
        why: 'Fast severe-bleed control',
        q: 'QuikClot hemostatic gauze',
      },
    ],
  },
  {
    group: 'Kill Kit',
    items: [
      {
        name: 'Argali Field Kit',
        why: 'Knife + game bags + cord in one',
        q: 'Argali field kit game bags',
      },
      {
        name: 'Iron Will Knife',
        why: 'Holds edge through a whole elk',
        q: 'Iron Will Outfitters skinning knife',
      },
      {
        name: 'Havalon Piranta',
        why: 'Replaceable-blade precision',
        q: 'Havalon Piranta knife',
      },
    ],
  },
  {
    group: 'Clothing & Footwear',
    items: [
      {
        name: 'First Lite / Kuiu Merino Base',
        why: 'Odor control + warmth on the climb',
        q: 'First Lite merino base layer',
      },
      {
        name: 'Kuiu Super Down LT Puffy',
        why: 'Packs small, cold-morning insurance',
        q: 'Kuiu Super Down LT jacket',
      },
      {
        name: 'Crispi Nevada GTX',
        why: 'Stiff shank for steep packouts',
        q: 'Crispi Nevada GTX boots',
      },
      {
        name: 'Kenetrek Mountain Extreme',
        why: 'Bomber support + durability',
        q: 'Kenetrek Mountain Extreme boots',
      },
    ],
  },
  {
    group: 'Recovery & Nutrition',
    items: [
      {
        name: 'MTN OPS Ignite',
        why: 'Altitude hydration + energy',
        q: 'MTN OPS Ignite drink mix',
      },
      {
        name: 'Liquid IV',
        why: 'Fast electrolyte recovery',
        q: 'Liquid IV hydration multiplier',
      },
      {
        name: 'Leukotape',
        why: 'Bombproof blister prevention',
        q: 'Leukotape P blister tape',
      },
    ],
  },
];

const buyLink = q =>
  `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q)}`;

// Format ounces as a compact weight string (lb + oz once ≥ 1 lb).
const fmtWeight = oz => {
  if (!oz) return '0 oz';
  if (oz < 16) return `${Math.round(oz * 10) / 10} oz`;
  const lb = Math.floor(oz / 16);
  const rem = Math.round(oz - lb * 16);
  return rem ? `${lb} lb ${rem} oz` : `${lb} lb`;
};

// Design tokens - matching the main app
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
};

// Parse CSV data from the ElkGearlist.csv file
const parseGearCSV = csvText => {
  const lines = csvText.trim().split('\n');
  const categories = {};

  if (lines.length === 0) return categories;

  // First line contains category headers
  const headers = lines[0]
    .split(',')
    .map(h => h.trim())
    .filter(h => h);

  // Initialize categories
  headers.forEach(header => {
    categories[header] = [];
  });

  // Parse remaining lines
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    headers.forEach((header, index) => {
      const item = values[index];
      if (item && item !== '') {
        categories[header].push({
          id: `${header}-${i}-${index}`,
          name: item,
          category: header,
          packed: false,
          // owned/image are seeded from the manifest by applyManifest() on load;
          // left unset here so manifest values (e.g. owned: true) can apply.
        });
      }
    });
  }

  return categories;
};

// Initial gear data from CSV
const initialGearData =
  parseGearCSV(`Pack / In the field ,Bino Harness ,Clothes,Pill Bag,First Aid ,Kill Kit,License Bag,Possibles Pouch ,Food & Drink,,Camp
Treking Poles ,Binos,apex pant,ibuprofen,Adventure UL Med Kit 7  minus pills,Knife ,Elk tags,Lighter with duct tape,"Coffee & supplies (filters, pour over)",Foot Powder ,Tarp
Sit Pad,Bear Spray,ascent pant,acetaminophen,wrap for sprains and breaks,saw,Small Game License,Aqua Tabs,,Band-Aids,Rope
Bino Harness ,Game Calls,Socks,contacts,Tourniquet,gloves,Copy of Hunter Safety,Signal Mirror,,Anti-bactirial oinment,Paracord
Pill Bag,Extra Batt: Range Finder (2024),Underwear,water tablets / Purification,Quick Clot,bags,Sharpie,Paracord ,,Mole Skin,Solar Panel and charging cables
Jet Boil Stove and Fuel,Extra Batt: Headlamp (2025),Puffy jacket,Anti-diaretic ,,Game Bags,License's ,Tick Remover,Supplements ,Anti-itch Cream,Large Power Bank
Water Filtration Solution,Range Finder,wind breaker jacket,stool softener,,,pen,Backup Release,Caffine solution / Coffee,tooth care,buddy heater
Possibles Pouch,Multi-tool / knife (Gerber Dime),Fleece jacket,Tums,Overnight,,zip tie,Trauma blanket,Daily Sups,Shampoo (dandruff),Sharpening Tools
Bow & Arrows,Ferro Rod,base layer X3,Eye drops,Tooth paste and Brush,,,Knife,,Lacrosse Ball,tent sealant
Water and bladder / water bottle,Wind Detector,Boots,Naproxin,Floss,,,Signal Flag ,,Q-tips,patches
Head Lamp,In Reach Garmin GPS,hat,Diphenhydramine,Contacts,,,Archery / Tent repair kit. ,,,2 burner stove
Power Bank and cords,Allen Key set,face paint,,Q-tips,,,Fire starter,,,Larger propane
Tripod,Lens wipe,Gloves x2,,Breathing Nose Strips,,,,,,small propane
License Bag,Small Lighter ,belt,,Luko Tape ,,,,Items Packed Day Before,,Jet Boil
1L soft bottle,Fire Starter ,crocs,,Nail Clippers,,,,Pistol,,Tarp 8x10
wind proof matches,UL Backup headlamp,street clothes 2-3 days,,,,,,Sunglasses,,Lantern
Kill Kit,water pills,,,,,,,homemade snacks,,Headlamp Backup
,,,,,,,,toothpaste and toothbrush,,Batteries
Bugle Tube,,,,,,,,,,Sleeping Bag
Possibles Pouch ,,,,,,,,,,Quilt
First Aid ,,,,,,,,,,Shoe Repair Cement
Overnight,,,,,,,,,,Tent Large + Foot print
Sunscreen / Balm ,,,,,,,,,,Water Containers
Chapstick,,,,,,,,,,Axe
Fixed Blade Knife,,,,,,,,,,Sleeping Pad
"Battery Bank USB-C USB-Mini",,,,,,,,,,Backup Water Purification
Spork,,,,,,,,,,
Tent Small + Foot print,,,,,,,,,,
,,,,,,,,,,Bow Tool Box and Supplies
,,,,,,,,,,Extra skinning knife
,,,,,,,,,,Large Saw
,,,,,,,,,,Spotting Scope
,,,,,,,,,,TP
,,,,,,,,,,cots x2
,,,,,,,,,,folding chair`);

const GearList = () => {
  const [gearData, setGearData] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editingImageItem, setEditingImageItem] = useState(null);
  const [imageValue, setImageValue] = useState('');
  const [addingToCategory, setAddingToCategory] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPicksModal, setShowPicksModal] = useState(false);
  const [editingWeightItem, setEditingWeightItem] = useState(null);
  const [weightValue, setWeightValue] = useState('');

  // Load gear data from storage or use initial data
  useEffect(() => {
    const loadGearData = async () => {
      const saved = await storage.get('elk-gear-list');
      // Seed owned/image from the committed manifest, backfilling any items
      // (including existing users' saved data) that lack the newer fields.
      const source = saved || initialGearData;
      const merged = applyManifest(source);
      setGearData(merged);
      // Expand all categories by default
      const expanded = {};
      Object.keys(merged).forEach(cat => (expanded[cat] = true));
      setExpandedCategories(expanded);
    };
    loadGearData();
  }, []);

  // Save gear data to storage whenever it changes
  useEffect(() => {
    if (Object.keys(gearData).length > 0) {
      storage.set('elk-gear-list', gearData);
    }
  }, [gearData]);

  // Toggle category expansion
  const toggleCategory = category => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Toggle item packed status
  const togglePacked = (category, itemId) => {
    setGearData(prev => ({
      ...prev,
      [category]: prev[category].map(item =>
        item.id === itemId ? { ...item, packed: !item.packed } : item
      ),
    }));
  };

  // Toggle item owned (acquired) status
  const toggleOwned = (category, itemId) => {
    setGearData(prev => ({
      ...prev,
      [category]: prev[category].map(item =>
        item.id === itemId ? { ...item, owned: !item.owned } : item
      ),
    }));
  };

  // Delete item
  const deleteItem = (category, itemId) => {
    setGearData(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item.id !== itemId),
    }));
  };

  // Start editing item
  const startEdit = item => {
    setEditingItem(item.id);
    setEditValue(item.name);
  };

  // Save edited item
  const saveEdit = (category, itemId) => {
    if (editValue.trim()) {
      setGearData(prev => ({
        ...prev,
        [category]: prev[category].map(item =>
          item.id === itemId ? { ...item, name: editValue.trim() } : item
        ),
      }));
    }
    setEditingItem(null);
    setEditValue('');
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingItem(null);
    setEditValue('');
  };

  // Start editing an item's image URL
  const startImageEdit = item => {
    setEditingImageItem(item.id);
    setImageValue(item.image || '');
  };

  // Save (or clear) an item's image URL
  const saveImage = (category, itemId) => {
    const url = imageValue.trim();
    setGearData(prev => ({
      ...prev,
      [category]: prev[category].map(item =>
        item.id === itemId ? { ...item, image: url || null } : item
      ),
    }));
    setEditingImageItem(null);
    setImageValue('');
  };

  // Cancel image editing
  const cancelImageEdit = () => {
    setEditingImageItem(null);
    setImageValue('');
  };

  // Start editing an item's optimal weight (oz)
  const startWeightEdit = item => {
    setEditingWeightItem(item.id);
    setWeightValue(item.weight != null ? String(item.weight) : '');
  };

  // Save (or clear) an item's weight
  const saveWeight = (category, itemId) => {
    const raw = weightValue.trim();
    const num = raw === '' ? null : Number(raw);
    setGearData(prev => ({
      ...prev,
      [category]: prev[category].map(item =>
        item.id === itemId
          ? { ...item, weight: Number.isFinite(num) ? num : null }
          : item
      ),
    }));
    setEditingWeightItem(null);
    setWeightValue('');
  };

  const cancelWeightEdit = () => {
    setEditingWeightItem(null);
    setWeightValue('');
  };

  // Add new item to category
  const addItem = category => {
    if (newItemName.trim()) {
      const newItem = {
        id: `${category}-${Date.now()}`,
        name: newItemName.trim(),
        category,
        packed: false,
        owned: false,
        image: null,
        weight: null,
      };
      setGearData(prev => ({
        ...prev,
        [category]: [...(prev[category] || []), newItem],
      }));
      setNewItemName('');
      setAddingToCategory(null);
    }
  };

  // Get all items for search suggestions
  const allItems = useMemo(() => {
    const items = [];
    Object.values(gearData).forEach(categoryItems => {
      items.push(...categoryItems);
    });
    return items;
  }, [gearData]);

  // Search and get related items
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results = allItems.filter(item =>
      item.name.toLowerCase().includes(query)
    );

    return results;
  }, [searchQuery, allItems]);

  // Get suggested related items based on search
  const suggestedItems = useMemo(() => {
    if (!searchQuery.trim() || searchResults.length === 0) return [];

    // Get categories of found items
    const foundCategories = new Set(searchResults.map(item => item.category));

    // Suggest items from the same categories
    const suggestions = allItems.filter(
      item =>
        foundCategories.has(item.category) &&
        !item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }, [searchQuery, searchResults, allItems]);

  // Calculate packing progress
  const packingStats = useMemo(() => {
    let total = 0;
    let packed = 0;
    let owned = 0;
    let totalWeight = 0;
    let packedWeight = 0;
    let ownedWeight = 0;
    Object.values(gearData).forEach(categoryItems => {
      total += categoryItems.length;
      packed += categoryItems.filter(item => item.packed).length;
      owned += categoryItems.filter(item => item.owned).length;
      categoryItems.forEach(item => {
        const w = typeof item.weight === 'number' ? item.weight : 0;
        totalWeight += w;
        if (item.packed) packedWeight += w;
        if (item.owned) ownedWeight += w;
      });
    });
    return {
      total,
      packed,
      owned,
      totalWeight,
      packedWeight,
      ownedWeight,
      percentage: total > 0 ? Math.round((packed / total) * 100) : 0,
      ownedPercentage: total > 0 ? Math.round((owned / total) * 100) : 0,
    };
  }, [gearData]);

  return (
    <div
      style={{
        backgroundColor: C.surface,
        borderRadius: '8px',
        border: `1px solid ${C.border}`,
        padding: '20px',
        color: C.text,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
          }}
        >
          <Package size={28} color={C.accent} />
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
            Elk Hunt Gear List
          </h2>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
              fontSize: '14px',
              color: C.textSub,
            }}
          >
            <span>Packing Progress</span>
            <span>
              {packingStats.packed} / {packingStats.total} (
              {packingStats.percentage}%)
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: C.card,
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${packingStats.percentage}%`,
                height: '100%',
                backgroundColor: C.green,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Owned (Acquired) Progress Bar */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
              fontSize: '14px',
              color: C.textSub,
            }}
          >
            <span>Gear Acquired</span>
            <span>
              {packingStats.owned} / {packingStats.total} (
              {packingStats.ownedPercentage}%)
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: C.card,
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${packingStats.ownedPercentage}%`,
                height: '100%',
                backgroundColor: C.accent,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Pack Weight Summary */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            padding: '10px 12px',
            marginBottom: '16px',
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: '6px',
          }}
        >
          <Scale size={15} style={{ color: C.accent, flexShrink: 0 }} />
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: C.textMuted,
            }}
          >
            Pack Weight
          </span>
          <span style={{ fontSize: '13px', color: C.text }}>
            Total <strong>{fmtWeight(packingStats.totalWeight)}</strong>
          </span>
          <span style={{ color: C.textMuted }}>·</span>
          <span style={{ fontSize: '13px', color: C.greenLight }}>
            Packed {fmtWeight(packingStats.packedWeight)}
          </span>
          <span style={{ color: C.textMuted }}>·</span>
          <span style={{ fontSize: '13px', color: C.accentHover }}>
            Owned {fmtWeight(packingStats.ownedWeight)}
          </span>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              backgroundColor: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: '6px',
            }}
          >
            <Search size={18} color={C.textMuted} />
            <input
              type="text"
              placeholder="Search gear items..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowSuggestions(e.target.value.trim().length > 0);
              }}
              onFocus={() => setShowSuggestions(searchQuery.trim().length > 0)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: C.text,
                fontSize: '14px',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSuggestions(false);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={16} color={C.textMuted} />
              </button>
            )}
          </div>

          {/* Search Results & Suggestions */}
          {showSuggestions && searchQuery && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                backgroundColor: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: '6px',
                maxHeight: '300px',
                overflowY: 'auto',
                zIndex: 10,
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              }}
            >
              {searchResults.length > 0 && (
                <div style={{ padding: '8px' }}>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: C.textSub,
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Found Items ({searchResults.length})
                  </div>
                  {searchResults.map(item => (
                    <div
                      key={item.id}
                      style={{
                        padding: '8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                      onMouseEnter={e =>
                        (e.currentTarget.style.backgroundColor = C.cardHover)
                      }
                      onMouseLeave={e =>
                        (e.currentTarget.style.backgroundColor = 'transparent')
                      }
                      onClick={() => {
                        togglePacked(item.category, item.id);
                        setShowSuggestions(false);
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '14px', color: C.text }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '12px', color: C.textMuted }}>
                          {item.category}
                        </div>
                      </div>
                      {item.packed && <Check size={16} color={C.green} />}
                    </div>
                  ))}
                </div>
              )}

              {suggestedItems.length > 0 && (
                <div
                  style={{ padding: '8px', borderTop: `1px solid ${C.border}` }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: C.accent,
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Lightbulb size={14} />
                    Related Items
                  </div>
                  {suggestedItems.map(item => (
                    <div
                      key={item.id}
                      style={{
                        padding: '8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                      onMouseEnter={e =>
                        (e.currentTarget.style.backgroundColor = C.cardHover)
                      }
                      onMouseLeave={e =>
                        (e.currentTarget.style.backgroundColor = 'transparent')
                      }
                      onClick={() => {
                        togglePacked(item.category, item.id);
                        setShowSuggestions(false);
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '14px', color: C.text }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '12px', color: C.textMuted }}>
                          {item.category}
                        </div>
                      </div>
                      {item.packed && <Check size={16} color={C.green} />}
                    </div>
                  ))}
                </div>
              )}

              {searchResults.length === 0 && (
                <div
                  style={{
                    padding: '16px',
                    textAlign: 'center',
                    color: C.textMuted,
                    fontSize: '14px',
                  }}
                >
                  No items found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Buy Once, Cry Once — opens curated buy-list popup */}
      <button
        onClick={() => setShowPicksModal(true)}
        style={{
          width: '100%',
          textAlign: 'left',
          cursor: 'pointer',
          backgroundColor: C.card,
          border: `2px solid ${C.accent}`,
          borderRadius: '8px',
          marginBottom: '20px',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          background: `linear-gradient(135deg, ${C.cardHover} 0%, ${C.card} 100%)`,
        }}
        aria-label="Open Buy Once, Cry Once recommended gear"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Award size={22} color={C.accent} />
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 600,
                color: C.accent,
              }}
            >
              Buy Once, Cry Once
            </h3>
            <p
              style={{ margin: '2px 0 0', fontSize: '12px', color: C.textSub }}
            >
              Curated premium picks — tap to view &amp; buy
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Star size={18} color={C.amber} fill={C.amber} />
          <ExternalLink size={18} color={C.accent} />
        </div>
      </button>

      {/* Gear Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Object.entries(gearData).map(([category, items]) => {
          const categoryPacked = items.filter(item => item.packed).length;
          const categoryWeight = items.reduce(
            (s, it) => s + (typeof it.weight === 'number' ? it.weight : 0),
            0
          );
          const categoryTotal = items.length;
          const isExpanded = expandedCategories[category];

          return (
            <div
              key={category}
              style={{
                backgroundColor: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              {/* Category Header */}
              <div
                onClick={() => toggleCategory(category)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: C.cardHover,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.backgroundColor = C.border)
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.backgroundColor = C.cardHover)
                }
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {isExpanded ? (
                    <ChevronDown size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )}
                  <span style={{ fontWeight: 600, fontSize: '16px' }}>
                    {category}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      color: C.textSub,
                      backgroundColor: C.card,
                      padding: '2px 8px',
                      borderRadius: '10px',
                    }}
                  >
                    {categoryPacked}/{categoryTotal}
                  </span>
                  {categoryWeight > 0 && (
                    <span
                      style={{
                        fontSize: '11px',
                        color: C.textMuted,
                        fontFamily: "'IBM Plex Mono', monospace",
                      }}
                    >
                      {fmtWeight(categoryWeight)}
                    </span>
                  )}
                </div>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setAddingToCategory(category);
                  }}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${C.accent}`,
                    borderRadius: '4px',
                    color: C.accent,
                    padding: '4px 8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = C.accent;
                    e.currentTarget.style.color = C.white;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = C.accent;
                  }}
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>

              {/* Category Items */}
              {isExpanded && (
                <div style={{ padding: '8px' }}>
                  {/* Add New Item Form */}
                  {addingToCategory === category && (
                    <div
                      style={{
                        padding: '8px',
                        backgroundColor: C.surface,
                        borderRadius: '4px',
                        marginBottom: '8px',
                        display: 'flex',
                        gap: '8px',
                      }}
                    >
                      <input
                        type="text"
                        placeholder="New item name..."
                        value={newItemName}
                        onChange={e => setNewItemName(e.target.value)}
                        onKeyPress={e => {
                          if (e.key === 'Enter') addItem(category);
                          if (e.key === 'Escape') {
                            setAddingToCategory(null);
                            setNewItemName('');
                          }
                        }}
                        autoFocus
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          backgroundColor: C.card,
                          border: `1px solid ${C.border}`,
                          borderRadius: '4px',
                          color: C.text,
                          fontSize: '14px',
                          outline: 'none',
                        }}
                      />
                      <button
                        onClick={() => addItem(category)}
                        style={{
                          backgroundColor: C.green,
                          border: 'none',
                          borderRadius: '4px',
                          color: C.white,
                          padding: '6px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setAddingToCategory(null);
                          setNewItemName('');
                        }}
                        style={{
                          backgroundColor: C.red,
                          border: 'none',
                          borderRadius: '4px',
                          color: C.white,
                          padding: '6px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {/* Item List */}
                  {items.map(item => (
                    <div
                      key={item.id}
                      style={{
                        padding: '8px',
                        marginBottom: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        backgroundColor: item.packed
                          ? C.surface
                          : 'transparent',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={e => {
                        if (!item.packed)
                          e.currentTarget.style.backgroundColor = C.cardHover;
                      }}
                      onMouseLeave={e => {
                        if (!item.packed)
                          e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        {/* Packed checkbox */}
                        <input
                          type="checkbox"
                          title="Packed"
                          checked={item.packed}
                          onChange={() => togglePacked(category, item.id)}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                            accentColor: C.green,
                          }}
                        />

                        {/* Thumbnail / image placeholder */}
                        <button
                          onClick={() => startImageEdit(item)}
                          title={item.image ? 'Change picture' : 'Add picture'}
                          style={{
                            width: '36px',
                            height: '36px',
                            flexShrink: 0,
                            padding: 0,
                            borderRadius: '6px',
                            border: `1px solid ${C.border}`,
                            background: C.surface,
                            cursor: 'pointer',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: C.textMuted,
                          }}
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                              onError={e => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <ImageIcon size={16} />
                          )}
                        </button>

                        {/* Item Name or Edit Input */}
                        {editingItem === item.id ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onKeyPress={e => {
                              if (e.key === 'Enter')
                                saveEdit(category, item.id);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            autoFocus
                            style={{
                              flex: 1,
                              padding: '4px 8px',
                              backgroundColor: C.card,
                              border: `1px solid ${C.accent}`,
                              borderRadius: '4px',
                              color: C.text,
                              fontSize: '14px',
                              outline: 'none',
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              flex: 1,
                              fontSize: '14px',
                              color: item.packed ? C.textMuted : C.text,
                              textDecoration: item.packed
                                ? 'line-through'
                                : 'none',
                            }}
                          >
                            {item.name}
                          </span>
                        )}

                        {/* Optimal weight (editable) */}
                        {editingWeightItem === item.id ? (
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={weightValue}
                            onChange={e => setWeightValue(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter')
                                saveWeight(category, item.id);
                              if (e.key === 'Escape') cancelWeightEdit();
                            }}
                            onBlur={() => saveWeight(category, item.id)}
                            autoFocus
                            placeholder="oz"
                            aria-label="Optimal weight in ounces"
                            style={{
                              width: '56px',
                              flexShrink: 0,
                              padding: '3px 6px',
                              backgroundColor: C.card,
                              border: `1px solid ${C.accent}`,
                              borderRadius: '4px',
                              color: C.text,
                              fontSize: '12px',
                              fontFamily: "'IBM Plex Mono', monospace",
                              outline: 'none',
                            }}
                          />
                        ) : (
                          <button
                            onClick={() => startWeightEdit(item)}
                            title="Optimal weight (click to edit)"
                            style={{
                              flexShrink: 0,
                              minWidth: '52px',
                              padding: '2px 6px',
                              background: 'transparent',
                              border: `1px dashed ${C.border}`,
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontFamily: "'IBM Plex Mono', monospace",
                              fontSize: '11px',
                              color:
                                item.weight != null
                                  ? C.greenLight
                                  : C.textMuted,
                            }}
                          >
                            {item.weight != null
                              ? fmtWeight(item.weight)
                              : '+ wt'}
                          </button>
                        )}

                        {/* Owned (acquired) checkbox */}
                        <label
                          title="I already own this"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            flexShrink: 0,
                            fontSize: '11px',
                            fontFamily: "'IBM Plex Mono', monospace",
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            color: item.owned ? C.accentHover : C.textMuted,
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={!!item.owned}
                            onChange={() => toggleOwned(category, item.id)}
                            style={{
                              width: '16px',
                              height: '16px',
                              cursor: 'pointer',
                              accentColor: C.accent,
                            }}
                          />
                          Owned
                        </label>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {editingItem === item.id ? (
                            <>
                              <button
                                onClick={() => saveEdit(category, item.id)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  color: C.green,
                                }}
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={cancelEdit}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  color: C.red,
                                }}
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(item)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  color: C.textMuted,
                                }}
                                onMouseEnter={e =>
                                  (e.currentTarget.style.color = C.accent)
                                }
                                onMouseLeave={e =>
                                  (e.currentTarget.style.color = C.textMuted)
                                }
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => startImageEdit(item)}
                                title={
                                  item.image
                                    ? 'Edit picture URL'
                                    : 'Add picture URL'
                                }
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  color: item.image ? C.accent : C.textMuted,
                                }}
                                onMouseEnter={e =>
                                  (e.currentTarget.style.color = C.accent)
                                }
                                onMouseLeave={e =>
                                  (e.currentTarget.style.color = item.image
                                    ? C.accent
                                    : C.textMuted)
                                }
                              >
                                <ImageIcon size={14} />
                              </button>
                              <button
                                onClick={() => deleteItem(category, item.id)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  color: C.textMuted,
                                }}
                                onMouseEnter={e =>
                                  (e.currentTarget.style.color = C.red)
                                }
                                onMouseLeave={e =>
                                  (e.currentTarget.style.color = C.textMuted)
                                }
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Inline image URL editor */}
                      {editingImageItem === item.id && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            paddingLeft: '26px',
                          }}
                        >
                          <input
                            type="text"
                            value={imageValue}
                            onChange={e => setImageValue(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter')
                                saveImage(category, item.id);
                              if (e.key === 'Escape') cancelImageEdit();
                            }}
                            autoFocus
                            placeholder="Paste image URL (leave blank to remove)"
                            style={{
                              flex: 1,
                              padding: '4px 8px',
                              backgroundColor: C.card,
                              border: `1px solid ${C.accent}`,
                              borderRadius: '4px',
                              color: C.text,
                              fontSize: '13px',
                              outline: 'none',
                            }}
                          />
                          <button
                            onClick={() => saveImage(category, item.id)}
                            title="Save picture"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              color: C.green,
                            }}
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={cancelImageEdit}
                            title="Cancel"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              color: C.red,
                            }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {items.length === 0 && (
                    <div
                      style={{
                        padding: '16px',
                        textAlign: 'center',
                        color: C.textMuted,
                        fontSize: '14px',
                      }}
                    >
                      No items in this category
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Buy Once, Cry Once — curated picks popup */}
      {showPicksModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Buy Once, Cry Once recommended gear"
          onClick={() => setShowPicksModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(4, 10, 6, 0.72)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '640px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: C.surface,
              border: `1px solid ${C.borderLight}`,
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 20px',
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <Award size={20} color={C.accent} />
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '17px',
                      fontWeight: 600,
                      color: C.accent,
                    }}
                  >
                    Buy Once, Cry Once
                  </h3>
                  <p
                    style={{
                      margin: '2px 0 0',
                      fontSize: '11px',
                      color: C.textMuted,
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    Curated GMU 79 picks · links open a shopping search
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPicksModal(false)}
                aria-label="Close"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: C.textSub,
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ overflowY: 'auto', padding: '12px 20px 20px' }}>
              {CRY_ONCE_PICKS.map(grp => (
                <div key={grp.group} style={{ marginTop: '14px' }}>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '10px',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: C.textMuted,
                      marginBottom: '6px',
                    }}
                  >
                    {grp.group}
                  </div>
                  {grp.items.map(it => (
                    <a
                      key={it.name}
                      href={buyLink(it.q)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        marginBottom: '6px',
                        borderRadius: '6px',
                        border: `1px solid ${C.border}`,
                        background: C.card,
                        textDecoration: 'none',
                      }}
                      onMouseEnter={e =>
                        (e.currentTarget.style.borderColor = C.accent)
                      }
                      onMouseLeave={e =>
                        (e.currentTarget.style.borderColor = C.border)
                      }
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '14px',
                            color: C.text,
                            fontWeight: 500,
                          }}
                        >
                          {it.name}
                        </div>
                        <div style={{ fontSize: '12px', color: C.textSub }}>
                          {it.why}
                        </div>
                      </div>
                      <ExternalLink
                        size={15}
                        color={C.accent}
                        style={{ flexShrink: 0 }}
                      />
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GearList;
