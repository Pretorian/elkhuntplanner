import { useState } from 'react';
import {
  Plus,
  X,
  Check,
  Loader,
  AlertTriangle,
  ExternalLink,
  Download,
} from 'lucide-react';
import { storage } from '../storage';

// Design tokens
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

const AddUnitForm = ({ onClose, onUnitAdded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchedData, setFetchedData] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    unitNumber: '',
    nickname: '',
    huntCode: '',
    choiceRank: 1,
    state: 'CO',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const fetchGoHuntData = async () => {
    if (!formData.unitNumber) {
      setError('Please enter a unit number first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const gohuntUrl = `https://www.gohunt.com/tools/profiles/colorado/units/big-game-unit-${formData.unitNumber}`;

      // Note: This will likely be blocked by CORS. We'll provide instructions to users.
      const response = await fetch(gohuntUrl);

      if (!response.ok) {
        throw new Error('Failed to fetch GoHunt data');
      }

      const html = await response.text();

      // Parse basic info from HTML
      const data = parseGoHuntHTML(html);

      setFetchedData(data);
      setError('');
    } catch (err) {
      console.error('Fetch error:', err);
      setError(
        'Unable to auto-fetch GoHunt data due to browser restrictions. Please enter data manually or use the browser extension method (see instructions below).'
      );
    } finally {
      setLoading(false);
    }
  };

  const parseGoHuntHTML = html => {
    // This is a simplified parser - in reality, GoHunt's HTML structure would need
    // to be analyzed and proper selectors used
    const data = {
      quickTips: [],
      terrain: { summary: '', vegetation: [], features: [] },
      access: { summary: '', publicAreas: [], routes: [], notes: [] },
      lodging: { hubs: [], campgrounds: [], options: [] },
    };

    // Extract data using regex or DOM parsing
    // This is a placeholder - actual implementation would need proper parsing
    return data;
  };

  const handleManualSave = async () => {
    if (!formData.unitNumber || !formData.nickname) {
      setError('Unit number and nickname are required');
      return;
    }

    setLoading(true);

    try {
      const newUnit = {
        id: `GMU-${formData.unitNumber}`,
        displayName: `GMU ${formData.unitNumber}`,
        nickname: formData.nickname,
        huntCode: formData.huntCode || `EE${formData.unitNumber.padStart(3, '0')}`,
        choiceRank: parseInt(formData.choiceRank),
        choiceLabel: `${formData.choiceRank}${getOrdinalSuffix(formData.choiceRank)} Choice`,
        appLabel: 'Custom Unit',
        counties: [],
        state: formData.state,
        forest: '',
        sqMiles: 0,
        publicPct: 0,
        elevation: [0, 0],
        coords: { lat: 0, lng: 0, zoom: 9 },
        gohuntSlug: formData.unitNumber,
        draw: 'unknown',
        antler: '4 pts on one antler OR 5" brow tine',
        quickTips: fetchedData?.quickTips || [],
        highlights: [],
        terrain: fetchedData?.terrain || {
          summary: '',
          vegetation: [],
          features: [],
          slope: '',
        },
        access: fetchedData?.access || {
          summary: '',
          publicAreas: [],
          routes: [],
          notes: [],
        },
        directions: {
          fly: { airport: '', driveTime: '', route: '' },
          drive: { distance: '', time: '', route: '' },
        },
        lodging: fetchedData?.lodging || {
          hubs: [],
          campgrounds: [],
          options: [],
        },
        isCustom: true,
      };

      // Get existing custom units
      const existingUnits = (await storage.get('elk-custom-units')) || [];

      // Check if unit already exists
      const unitIndex = existingUnits.findIndex(u => u.id === newUnit.id);

      if (unitIndex >= 0) {
        existingUnits[unitIndex] = newUnit;
      } else {
        existingUnits.push(newUnit);
      }

      await storage.set('elk-custom-units', existingUnits);

      if (onUnitAdded) {
        onUnitAdded(newUnit);
      }

      onClose();
    } catch (err) {
      setError(`Failed to save unit: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getOrdinalSuffix = num => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: C.surface,
          borderRadius: '8px',
          border: `1px solid ${C.border}`,
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          color: C.text,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: `1px solid ${C.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Plus size={24} color={C.accent} />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
              Add New Hunt Unit
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              color: C.textMuted,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div style={{ padding: '20px' }}>
          {/* Basic Info */}
          <div style={{ marginBottom: '20px' }}>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 600,
                marginBottom: '12px',
                color: C.accent,
              }}
            >
              Basic Information
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Unit Number */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    color: C.textSub,
                    marginBottom: '4px',
                  }}
                >
                  Unit Number *
                </label>
                <input
                  type="text"
                  value={formData.unitNumber}
                  onChange={e => handleInputChange('unitNumber', e.target.value)}
                  placeholder="e.g., 12, 62, 201"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: C.card,
                    border: `1px solid ${C.border}`,
                    borderRadius: '4px',
                    color: C.text,
                    fontSize: '14px',
                  }}
                />
              </div>

              {/* Nickname */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    color: C.textSub,
                    marginBottom: '4px',
                  }}
                >
                  Nickname *
                </label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={e => handleInputChange('nickname', e.target.value)}
                  placeholder="e.g., Flat Tops, Uncompahgre Plateau"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: C.card,
                    border: `1px solid ${C.border}`,
                    borderRadius: '4px',
                    color: C.text,
                    fontSize: '14px',
                  }}
                />
              </div>

              {/* Hunt Code */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    color: C.textSub,
                    marginBottom: '4px',
                  }}
                >
                  Hunt Code (optional)
                </label>
                <input
                  type="text"
                  value={formData.huntCode}
                  onChange={e => handleInputChange('huntCode', e.target.value)}
                  placeholder="e.g., EE012O1A"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: C.card,
                    border: `1px solid ${C.border}`,
                    borderRadius: '4px',
                    color: C.text,
                    fontSize: '14px',
                  }}
                />
              </div>

              {/* Choice Rank */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    color: C.textSub,
                    marginBottom: '4px',
                  }}
                >
                  Choice Rank
                </label>
                <select
                  value={formData.choiceRank}
                  onChange={e =>
                    handleInputChange('choiceRank', parseInt(e.target.value))
                  }
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: C.card,
                    border: `1px solid ${C.border}`,
                    borderRadius: '4px',
                    color: C.text,
                    fontSize: '14px',
                  }}
                >
                  <option value={1}>1st Choice</option>
                  <option value={2}>2nd Choice</option>
                  <option value={3}>3rd Choice</option>
                  <option value={4}>4th Choice</option>
                </select>
              </div>

              {/* State */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    color: C.textSub,
                    marginBottom: '4px',
                  }}
                >
                  State
                </label>
                <select
                  value={formData.state}
                  onChange={e => handleInputChange('state', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: C.card,
                    border: `1px solid ${C.border}`,
                    borderRadius: '4px',
                    color: C.text,
                    fontSize: '14px',
                  }}
                >
                  <option value="CO">Colorado</option>
                  <option value="WY">Wyoming</option>
                  <option value="MT">Montana</option>
                  <option value="ID">Idaho</option>
                  <option value="UT">Utah</option>
                  <option value="NM">New Mexico</option>
                </select>
              </div>
            </div>
          </div>

          {/* GoHunt Integration */}
          <div
            style={{
              marginBottom: '20px',
              padding: '16px',
              backgroundColor: C.card,
              borderRadius: '6px',
              border: `1px solid ${C.border}`,
            }}
          >
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 600,
                marginBottom: '12px',
                color: C.accent,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Download size={18} />
              Import from GoHunt
            </h3>
            <p
              style={{
                fontSize: '13px',
                color: C.textSub,
                marginBottom: '12px',
                lineHeight: '1.5',
              }}
            >
              Try to automatically fetch unit data from GoHunt. Due to browser
              security, this may not work directly. See manual method below.
            </p>
            <button
              onClick={fetchGoHuntData}
              disabled={loading || !formData.unitNumber}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: loading ? C.cardHover : C.green,
                color: C.white,
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: loading || !formData.unitNumber ? 0.6 : 1,
              }}
            >
              {loading ? (
                <>
                  <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Fetching...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Fetch GoHunt Data
                </>
              )}
            </button>

            {fetchedData && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: C.surface,
                  borderRadius: '4px',
                  border: `1px solid ${C.green}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: C.green,
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  <Check size={16} />
                  Data fetched successfully!
                </div>
              </div>
            )}
          </div>

          {/* Manual Method Instructions */}
          <div
            style={{
              marginBottom: '20px',
              padding: '16px',
              backgroundColor: C.card,
              borderRadius: '6px',
              border: `1px solid ${C.amber}`,
            }}
          >
            <h4
              style={{
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '8px',
                color: C.amber,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <AlertTriangle size={16} />
              Manual Import Method
            </h4>
            <ol
              style={{
                fontSize: '13px',
                color: C.textSub,
                paddingLeft: '20px',
                lineHeight: '1.6',
                margin: 0,
              }}
            >
              <li>
                Visit{' '}
                <a
                  href={`https://www.gohunt.com/tools/profiles/colorado/units/big-game-unit-${formData.unitNumber || 'XX'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: C.accent,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  GoHunt Unit Profile
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>Save the unit and edit details later from the unit view</li>
              <li>
                Or copy/paste key info into notes after adding the unit
              </li>
            </ol>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                marginBottom: '20px',
                padding: '12px',
                backgroundColor: C.surface,
                borderRadius: '4px',
                border: `1px solid ${C.red}`,
                color: C.red,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}
            >
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: 'transparent',
                color: C.textSub,
                border: `1px solid ${C.border}`,
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleManualSave}
              disabled={loading || !formData.unitNumber || !formData.nickname}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor:
                  loading || !formData.unitNumber || !formData.nickname
                    ? C.cardHover
                    : C.accent,
                color: C.white,
                border: 'none',
                borderRadius: '4px',
                cursor:
                  loading || !formData.unitNumber || !formData.nickname
                    ? 'not-allowed'
                    : 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                opacity:
                  loading || !formData.unitNumber || !formData.nickname ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading ? (
                <>
                  <Loader size={16} />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Add Unit
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default AddUnitForm;
