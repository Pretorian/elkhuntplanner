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
  ShoppingCart,
  Star,
  Award,
  Image as ImageIcon,
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

// Ensure every item has owned/image fields, seeding missing values from the
// committed manifest (by name+category). Explicit values already on an item
// (e.g. a user's saved choice) are always kept — the manifest only fills gaps.
const applyManifest = data => {
  const lookup = manifestLookup();
  const result = {};
  Object.entries(data).forEach(([category, items]) => {
    result[category] = items.map(item => {
      const seed = lookup[`${normKey(item.name)}|${normKey(category)}`];
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
      };
    });
  });
  return result;
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

// Top-rated gear recommendations from "Buy Once, Cry Once"
const RECOMMENDED_GEAR = {
  'Pack / In the field': [
    {
      name: 'Exo Mountain Gear K4 5000',
      category: 'Backpack',
      why: 'Incredibly lightweight but capable of hauling 100+ lbs of elk meat without breaking your back. Known for comfort.',
      searchTerms: 'Exo Mountain Gear K4 5000 backpack',
    },
    {
      name: 'Stone Glacier Sky 5900',
      category: 'Backpack',
      why: 'Ultra-light durability, perfect for hauling heavy loads.',
      searchTerms: 'Stone Glacier Sky 5900 backpack',
    },
    {
      name: 'Black Diamond Alpine Carbon Cork',
      category: 'Trekking Poles',
      why: 'Carbon fiber keeps them light, cork grips prevent blisters during steep climbs.',
      searchTerms: 'Black Diamond Alpine Carbon Cork trekking poles',
    },
    {
      name: 'Katadyn BeFree 1L',
      category: 'Water Filtration',
      why: 'Superior flow rate, drink directly from the soft flask or squeeze into bladder.',
      searchTerms: 'Katadyn BeFree 1L water filter',
    },
    {
      name: 'Sawyer Squeeze',
      category: 'Water Filtration',
      why: 'Reliable and lightweight water filtration system.',
      searchTerms: 'Sawyer Squeeze water filter',
    },
    {
      name: 'Leupold RX-Fulldraw 5',
      category: 'Range Finder',
      why: 'Built for archers, uses arrow weight and velocity for exact cut-charts on steep angles.',
      searchTerms: 'Leupold RX-Fulldraw 5 rangefinder',
    },
    {
      name: 'Sig Sauer KILO4K',
      category: 'Range Finder',
      why: 'Premium rangefinder with excellent optics and precision.',
      searchTerms: 'Sig Sauer KILO4K rangefinder',
    },
    {
      name: 'Counter Assault Bear Deterrent (10.2 oz)',
      category: 'Bear Spray',
      why: 'Shoots furthest (40 feet) and lasts longest (8 seconds) of any EPA-approved spray.',
      searchTerms: 'Counter Assault Bear Deterrent 10.2 oz',
    },
    {
      name: 'Leatherman Charge+ TTi',
      category: 'Multi-Tool',
      why: 'Titanium handle, premium S30V steel knife, and gut hook for field dressing.',
      searchTerms: 'Leatherman Charge+ TTi multi-tool',
    },
  ],
  'Bino Harness': [
    {
      name: 'Swarovski NL Pure 10x42',
      category: 'Binos',
      why: 'Undisputed king of western glassing with superior optics.',
      searchTerms: 'Swarovski NL Pure 10x42 binoculars',
    },
    {
      name: 'Vortex Razor UHD',
      category: 'Binos',
      why: 'Premium optics at half the price of Swarovski.',
      searchTerms: 'Vortex Razor UHD binoculars',
    },
    {
      name: 'Marsupial Gear Enclosed Bino Harness',
      category: 'Bino Harness',
      why: 'Magnetic closure for one-handed, dead-silent operation while keeping dust and rain out.',
      searchTerms: 'Marsupial Gear Enclosed Bino Harness',
    },
  ],
  Clothes: [
    {
      name: 'Sitka Mountain Pant',
      category: 'Pants',
      why: 'Highly rated hunting pant with great durability and comfort.',
      searchTerms: 'Sitka Mountain Pant hunting',
    },
    {
      name: 'Kuiu Attack Pant',
      category: 'Pants',
      why: 'Most highly rated hunting pant with zip vents and brush durability.',
      searchTerms: 'Kuiu Attack Pant hunting',
    },
    {
      name: 'Kuiu Super Down LT',
      category: 'Puffy Jacket',
      why: 'Water-resistant down, incredibly light, packs down to grapefruit size.',
      searchTerms: 'Kuiu Super Down LT jacket',
    },
    {
      name: 'First Lite Uncompahgre',
      category: 'Puffy Jacket',
      why: 'Premium insulated jacket for cold weather hunting.',
      searchTerms: 'First Lite Uncompahgre puffy jacket',
    },
    {
      name: 'Crispi Nevada GTX',
      category: 'Boots',
      why: 'Stiff shanks prevent foot fatigue on steep mountainsides with heavy loads.',
      searchTerms: 'Crispi Nevada GTX boots',
    },
    {
      name: 'Kenetrek Mountain Extreme',
      category: 'Boots',
      why: 'Built for elk hunting with superior support and durability.',
      searchTerms: 'Kenetrek Mountain Extreme boots',
    },
  ],
  'Kill Kit': [
    {
      name: 'Iron Will Outfitters Skinning Knife',
      category: 'Fixed Blade Knife',
      why: 'Holds an edge through an entire elk without sharpening.',
      searchTerms: 'Iron Will Outfitters Skinning Knife',
    },
    {
      name: 'Havalon Piranta',
      category: 'Skinning Knife',
      why: 'Industry standard for surgical precision with replaceable blades.',
      searchTerms: 'Havalon Piranta knife',
    },
    {
      name: 'Argali High Country Pack',
      category: 'Game Bags',
      why: 'Ultra-light, breathable, synthetic bags that reflect light at night.',
      searchTerms: 'Argali High Country game bags',
    },
    {
      name: 'Caribou Gear Game Bags',
      category: 'Game Bags',
      why: 'High-quality game bags trusted by hunters.',
      searchTerms: 'Caribou Gear game bags',
    },
  ],
  'First Aid': [
    {
      name: 'North American Rescue C-A-T Gen 7',
      category: 'Tourniquet',
      why: 'Official tourniquet of the US Military. Do not buy knock-offs on Amazon.',
      searchTerms: 'North American Rescue CAT Gen 7 tourniquet',
    },
  ],
  Camp: [
    {
      name: 'Stone Glacier Skyscraper 2P',
      category: 'Tent',
      why: '4-season bomb shelter for severe winds and snow.',
      searchTerms: 'Stone Glacier Skyscraper 2P tent',
    },
    {
      name: 'Big Agnes Copper Spur UL2',
      category: 'Tent',
      why: 'Significantly lighter for early September archery season.',
      searchTerms: 'Big Agnes Copper Spur UL2 tent',
    },
    {
      name: 'Enlightened Equipment Revelation Quilt (10° or 20°)',
      category: 'Sleeping Bag/Quilt',
      why: 'Quilts save weight and space. EE makes the best custom quilts.',
      searchTerms: 'Enlightened Equipment Revelation Quilt',
    },
    {
      name: 'Western Mountaineering Alpinlite',
      category: 'Sleeping Bag',
      why: 'Premium sleeping bag for cold weather.',
      searchTerms: 'Western Mountaineering Alpinlite sleeping bag',
    },
    {
      name: 'Therm-a-Rest NeoAir XTherm NXT',
      category: 'Sleeping Pad',
      why: 'R-Value of 7.3, incredibly warm, only 16 ounces. Fixed the crinkly noise.',
      searchTerms: 'Therm-a-Rest NeoAir XTherm NXT',
    },
    {
      name: 'Jetboil MiniMo',
      category: 'Jet Boil Stove',
      why: 'Wider, shallower cup for easier eating and better simmer control.',
      searchTerms: 'Jetboil MiniMo stove',
    },
    {
      name: 'MSR WindBurner',
      category: 'Stove',
      why: 'Excellent wind resistance and fuel efficiency.',
      searchTerms: 'MSR WindBurner stove',
    },
    {
      name: 'Anker PowerCore 24K (737)',
      category: 'Power Bank',
      why: 'Multiple charges, most reliable battery brand in freezing temperatures.',
      searchTerms: 'Anker PowerCore 24K 737 power bank',
    },
  ],
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
  const [showRecommended, setShowRecommended] = useState(false);
  const [selectedRecommendedCategory, setSelectedRecommendedCategory] =
    useState(null);

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
      };
      setGearData(prev => ({
        ...prev,
        [category]: [...(prev[category] || []), newItem],
      }));
      setNewItemName('');
      setAddingToCategory(null);
    }
  };

  // Search for recommended item online
  const searchOnline = searchTerms => {
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchTerms)}`;
    window.open(googleSearchUrl, '_blank', 'noopener,noreferrer');
  };

  // Add recommended item to gear list
  const addRecommendedItem = (item, category) => {
    const newItem = {
      id: `${category}-${Date.now()}`,
      name: item.name,
      category,
      packed: false,
      owned: false,
      image: null,
    };
    setGearData(prev => ({
      ...prev,
      [category]: [...(prev[category] || []), newItem],
    }));
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
    Object.values(gearData).forEach(categoryItems => {
      total += categoryItems.length;
      packed += categoryItems.filter(item => item.packed).length;
      owned += categoryItems.filter(item => item.owned).length;
    });
    return {
      total,
      packed,
      owned,
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

      {/* Recommended Gear Section */}
      <div
        style={{
          backgroundColor: C.card,
          border: `2px solid ${C.accent}`,
          borderRadius: '8px',
          marginBottom: '20px',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          onClick={() => setShowRecommended(!showRecommended)}
          style={{
            padding: '16px 20px',
            cursor: 'pointer',
            background: `linear-gradient(135deg, ${C.cardHover} 0%, ${C.card} 100%)`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.border)}
          onMouseLeave={e =>
            (e.currentTarget.style.background = `linear-gradient(135deg, ${C.cardHover} 0%, ${C.card} 100%)`)
          }
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {showRecommended ? (
              <ChevronDown size={20} color={C.accent} />
            ) : (
              <ChevronRight size={20} color={C.accent} />
            )}
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
                style={{
                  margin: 0,
                  fontSize: '12px',
                  color: C.textSub,
                  marginTop: '2px',
                }}
              >
                Top-rated gear recommendations from western big game hunters
              </p>
            </div>
          </div>
          <Star size={20} color={C.amber} fill={C.amber} />
        </div>

        {/* Content */}
        {showRecommended && (
          <div style={{ padding: '16px 20px' }}>
            {/* Category Selection */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                marginBottom: '16px',
                paddingBottom: '16px',
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              {Object.keys(RECOMMENDED_GEAR).map(category => (
                <button
                  key={category}
                  onClick={() =>
                    setSelectedRecommendedCategory(
                      selectedRecommendedCategory === category ? null : category
                    )
                  }
                  style={{
                    padding: '8px 14px',
                    backgroundColor:
                      selectedRecommendedCategory === category
                        ? C.accent
                        : C.surface,
                    color:
                      selectedRecommendedCategory === category
                        ? C.white
                        : C.text,
                    border: `1px solid ${selectedRecommendedCategory === category ? C.accent : C.border}`,
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (selectedRecommendedCategory !== category) {
                      e.currentTarget.style.backgroundColor = C.cardHover;
                      e.currentTarget.style.borderColor = C.borderLight;
                    }
                  }}
                  onMouseLeave={e => {
                    if (selectedRecommendedCategory !== category) {
                      e.currentTarget.style.backgroundColor = C.surface;
                      e.currentTarget.style.borderColor = C.border;
                    }
                  }}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Recommended Items */}
            {selectedRecommendedCategory &&
              RECOMMENDED_GEAR[selectedRecommendedCategory] && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {RECOMMENDED_GEAR[selectedRecommendedCategory].map(
                    (item, index) => (
                      <div
                        key={index}
                        style={{
                          backgroundColor: C.surface,
                          border: `1px solid ${C.border}`,
                          borderRadius: '6px',
                          padding: '14px',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = C.cardHover;
                          e.currentTarget.style.borderColor = C.borderLight;
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = C.surface;
                          e.currentTarget.style.borderColor = C.border;
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: '12px',
                            marginBottom: '8px',
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: '15px',
                                fontWeight: 600,
                                color: C.text,
                                marginBottom: '4px',
                              }}
                            >
                              {item.name}
                            </div>
                            <div
                              style={{
                                fontSize: '12px',
                                color: C.accent,
                                marginBottom: '8px',
                                fontWeight: 500,
                              }}
                            >
                              {item.category}
                            </div>
                            <div
                              style={{
                                fontSize: '13px',
                                color: C.textSub,
                                lineHeight: '1.5',
                              }}
                            >
                              {item.why}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div
                          style={{
                            display: 'flex',
                            gap: '8px',
                            marginTop: '12px',
                          }}
                        >
                          <button
                            onClick={() => searchOnline(item.searchTerms)}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              backgroundColor: C.green,
                              color: C.white,
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: 500,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={e =>
                              (e.currentTarget.style.backgroundColor =
                                C.greenLight)
                            }
                            onMouseLeave={e =>
                              (e.currentTarget.style.backgroundColor = C.green)
                            }
                          >
                            <ShoppingCart size={14} />
                            Find Online
                          </button>
                          <button
                            onClick={() =>
                              addRecommendedItem(
                                item,
                                selectedRecommendedCategory
                              )
                            }
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              backgroundColor: 'transparent',
                              color: C.accent,
                              border: `1px solid ${C.accent}`,
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: 500,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.backgroundColor = C.accent;
                              e.currentTarget.style.color = C.white;
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.backgroundColor =
                                'transparent';
                              e.currentTarget.style.color = C.accent;
                            }}
                          >
                            <Plus size={14} />
                            Add to My Gear
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

            {/* No category selected message */}
            {!selectedRecommendedCategory && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '24px',
                  color: C.textMuted,
                  fontSize: '14px',
                }}
              >
                Select a category above to view recommended gear
              </div>
            )}
          </div>
        )}
      </div>

      {/* Gear Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Object.entries(gearData).map(([category, items]) => {
          const categoryPacked = items.filter(item => item.packed).length;
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
    </div>
  );
};

export default GearList;
