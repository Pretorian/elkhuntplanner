/**
 * Feature Flag Configuration
 *
 * Defines which features are public vs. require authentication
 */

export const FEATURES = {
  // Public features (always available)
  PUBLIC: {
    VIEW_UNITS: 'view-units',
    VIEW_MAPS: 'view-maps',
    VIEW_TERRAIN: 'view-terrain',
    VIEW_ACCESS: 'view-access',
    VIEW_REGULATIONS: 'view-regulations',
    SEARCH_UNITS: 'search-units',
  },

  // Authenticated features (require login)
  AUTHENTICATED: {
    CUSTOM_UNITS: 'custom-units',
    SAVE_WAYPOINTS: 'save-waypoints',
    GEAR_TRACKING: 'gear-tracking',
    SAVE_NOTES: 'save-notes',
    ADVANCED_MAPS: 'advanced-maps',
    WEATHER_DATA: 'weather-data',
    SHARE_PLANS: 'share-plans',
  },
};

// Flatten all feature flags for easy checking
export const ALL_FEATURES = {
  ...FEATURES.PUBLIC,
  ...FEATURES.AUTHENTICATED,
};

// List of features that require authentication
const AUTH_REQUIRED_FEATURES = new Set(Object.values(FEATURES.AUTHENTICATED));

/**
 * Check if a feature requires authentication
 * @param {string} featureName - Name of the feature to check
 * @returns {boolean} - True if feature requires auth
 */
export const requiresAuth = (featureName) => {
  return AUTH_REQUIRED_FEATURES.has(featureName);
};

/**
 * Check if user can access a feature
 * @param {string} featureName - Name of the feature to check
 * @param {boolean} isAuthenticated - Whether user is logged in
 * @returns {boolean} - True if user can access the feature
 */
export const canAccessFeature = (featureName, isAuthenticated) => {
  // If feature doesn't require auth, always allow
  if (!requiresAuth(featureName)) {
    return true;
  }

  // If feature requires auth, check if user is authenticated
  return isAuthenticated;
};

/**
 * Get user-friendly feature names for display
 */
export const FEATURE_NAMES = {
  [FEATURES.AUTHENTICATED.CUSTOM_UNITS]: 'Custom Units',
  [FEATURES.AUTHENTICATED.SAVE_WAYPOINTS]: 'Save Waypoints',
  [FEATURES.AUTHENTICATED.GEAR_TRACKING]: 'Gear Tracking',
  [FEATURES.AUTHENTICATED.SAVE_NOTES]: 'Save Notes',
  [FEATURES.AUTHENTICATED.ADVANCED_MAPS]: 'Advanced Maps',
  [FEATURES.AUTHENTICATED.WEATHER_DATA]: 'Weather Data',
  [FEATURES.AUTHENTICATED.SHARE_PLANS]: 'Share Plans',
};

/**
 * Get user-friendly feature descriptions
 */
export const FEATURE_DESCRIPTIONS = {
  [FEATURES.AUTHENTICATED.CUSTOM_UNITS]: 'Add and manage your own custom hunt units',
  [FEATURES.AUTHENTICATED.SAVE_WAYPOINTS]: 'Save waypoints and locations across devices',
  [FEATURES.AUTHENTICATED.GEAR_TRACKING]: 'Track your hunting gear and equipment',
  [FEATURES.AUTHENTICATED.SAVE_NOTES]: 'Add personal notes to hunt units',
  [FEATURES.AUTHENTICATED.ADVANCED_MAPS]: 'Access advanced mapping features',
  [FEATURES.AUTHENTICATED.WEATHER_DATA]: 'View weather forecasts and conditions',
  [FEATURES.AUTHENTICATED.SHARE_PLANS]: 'Share your hunt plans with others',
};
