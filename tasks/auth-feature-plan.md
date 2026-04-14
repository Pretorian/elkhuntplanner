# Authentication & Feature Flags Implementation Plan

## 🎯 Goal
Add user authentication (account creation + login) with feature flags to gate premium features for authenticated users only.

---

## 📋 Requirements Analysis

### Functional Requirements
- [ ] Users can create accounts (email + password)
- [ ] Users can log in
- [ ] Users can log out
- [ ] Session persistence across page reloads
- [ ] Feature flag system (public vs authenticated)
- [ ] Protected features only visible to authenticated users
- [ ] Graceful degradation for public users

### Non-Functional Requirements
- [ ] Secure password storage (hashed)
- [ ] Session management
- [ ] Responsive auth UI (mobile-friendly)
- [ ] Fast login/logout (no page reload)
- [ ] Works offline (once authenticated)

---

## 🏗️ Architecture Decisions

### 1. **Backend Choice**
**Options:**
- **A) Firebase Auth** (Google) - Easiest, free tier, handles everything
- **B) Supabase** - Open source, PostgreSQL, generous free tier
- **C) Auth0** - Enterprise-grade, complex pricing
- **D) AWS Cognito** - AWS native, complex setup
- **E) Custom backend** - Full control, most work

**Recommendation: Supabase**
**Why:**
- ✅ Free tier (50,000 monthly active users)
- ✅ PostgreSQL database included
- ✅ Row Level Security (RLS) for data isolation
- ✅ Real-time subscriptions
- ✅ Easy SDK integration
- ✅ Works with existing localStorage (migration path)
- ✅ Open source (can self-host later)
- ✅ Email auth + OAuth (Google, GitHub)

**Alternative: Firebase** if you prefer Google ecosystem

### 2. **Feature Flag Strategy**
**Approach:**
```javascript
const FEATURES = {
  // Public features (always available)
  PUBLIC: [
    'view-units',
    'basic-map',
    'search-units',
  ],

  // Authenticated features (require login)
  AUTHENTICATED: [
    'custom-units',
    'save-waypoints',
    'gear-tracking',
    'notes',
    'advanced-maps',
    'weather-data',
    'share-plans',
  ]
};
```

### 3. **Data Migration**
**Current:** All data in localStorage (client-side only)
**Future:** User data in Supabase (synced, multi-device)

**Migration Strategy:**
- Keep localStorage for public features
- Move user-specific data to Supabase on login
- Offer "import from browser" on first login

---

## 📦 Implementation Breakdown

### Phase 1: Supabase Setup (30 min)
- [ ] Create Supabase project
- [ ] Configure authentication (email + password)
- [ ] Enable Google OAuth (optional)
- [ ] Create database schema for user data
- [ ] Set up Row Level Security policies
- [ ] Get API keys and configure `.env`

### Phase 2: Auth UI Components (1-2 hours)
- [ ] `LoginForm.jsx` - Email/password login
- [ ] `SignupForm.jsx` - Account creation
- [ ] `AuthModal.jsx` - Modal wrapper
- [ ] `UserMenu.jsx` - Profile dropdown in header
- [ ] `ProtectedRoute.jsx` - Component wrapper for gated features
- [ ] `FeatureGate.jsx` - Inline feature gating

### Phase 3: Auth Context & State (1 hour)
- [ ] `AuthContext.jsx` - React Context for auth state
- [ ] `useAuth.js` - Custom hook for auth operations
- [ ] Session persistence
- [ ] Auto-refresh tokens
- [ ] Loading states

### Phase 4: Supabase Integration (1-2 hours)
- [ ] Install `@supabase/supabase-js`
- [ ] Configure Supabase client
- [ ] Implement auth methods (login, signup, logout)
- [ ] Set up auth state listeners
- [ ] Error handling

### Phase 5: Feature Flags (1 hour)
- [ ] `features.js` - Feature flag config
- [ ] `useFeatureFlag.js` - Hook to check access
- [ ] Update existing components with gates
- [ ] Add "Sign in to use this feature" prompts

### Phase 6: Data Migration (2 hours)
- [ ] Database tables for user data
  - `user_units` (custom units)
  - `user_waypoints` (saved waypoints)
  - `user_gear` (gear lists)
  - `user_notes` (notes per unit)
- [ ] Migration functions (localStorage → Supabase)
- [ ] Sync logic (write to Supabase on save)
- [ ] Conflict resolution (last-write-wins)

### Phase 7: UI Updates (1-2 hours)
- [ ] Add "Sign In" button to header
- [ ] Show user email/avatar when logged in
- [ ] Add feature gate overlays
- [ ] Update mobile menu with auth status
- [ ] Loading skeletons during auth check

### Phase 8: Testing & Polish (1 hour)
- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test logout flow
- [ ] Test feature gates
- [ ] Test data sync
- [ ] Test mobile responsive
- [ ] Test session persistence

---

## 🎨 User Experience Flow

### New User Journey
```
1. Visit site → See public features
2. Try to use premium feature (e.g., add custom unit)
3. See "Sign in to unlock this feature" prompt
4. Click "Sign Up" → Modal opens
5. Enter email + password → Account created
6. Automatically logged in → Feature now accessible
7. Data saves to cloud (multi-device sync)
```

### Returning User Journey
```
1. Visit site → Auto-logged in (session persisted)
2. See all features unlocked
3. Data syncs from cloud
4. Can log out from profile menu
```

### Public User Journey
```
1. Visit site → Browse public features
2. View default units, basic map
3. See "upgrade prompts" for premium features
4. Can use app without account (limited features)
```

---

## 🔒 Security Considerations

### Authentication
- ✅ Passwords hashed by Supabase (bcrypt)
- ✅ HTTPS only (enforced)
- ✅ JWT tokens (short-lived)
- ✅ Refresh tokens (secure, HTTP-only cookies)
- ✅ Rate limiting on auth endpoints

### Data Access
- ✅ Row Level Security (RLS) - users only see their data
- ✅ API keys in `.env` (not committed)
- ✅ Validate user on server (not client-side only)

### Privacy
- ✅ Email verification (optional)
- ✅ Password reset flow
- ✅ Delete account option
- ✅ GDPR compliance (data export)

---

## 📊 Database Schema (Supabase)

```sql
-- Users table (managed by Supabase Auth)
-- auth.users (built-in)

-- User profile (public data)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom hunt units
CREATE TABLE user_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  unit_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Waypoints
CREATE TABLE user_waypoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  unit_id TEXT NOT NULL,
  waypoint_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gear lists
CREATE TABLE user_gear (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  gear_data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes per unit
CREATE TABLE user_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  unit_id TEXT NOT NULL,
  section TEXT NOT NULL, -- 'terrain', 'access', etc.
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, unit_id, section)
);

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_waypoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_gear ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own units" ON user_units
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own units" ON user_units
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ... (similar for other tables)
```

---

## 🚀 Deployment Considerations

### Environment Variables
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### AWS Amplify
- Add env vars in Amplify console
- Build succeeds with Supabase SDK

### GitHub Actions
- Add secrets for env vars
- No changes needed to build process

---

## 📝 File Structure

```
src/
├── auth/
│   ├── AuthContext.jsx       # Auth provider
│   ├── useAuth.js            # Auth hook
│   ├── LoginForm.jsx         # Login UI
│   ├── SignupForm.jsx        # Signup UI
│   ├── AuthModal.jsx         # Modal wrapper
│   └── UserMenu.jsx          # Profile dropdown
├── features/
│   ├── features.js           # Feature flag config
│   ├── useFeatureFlag.js     # Feature flag hook
│   ├── FeatureGate.jsx       # Inline gate component
│   └── ProtectedRoute.jsx    # Route wrapper
├── supabase/
│   ├── client.js             # Supabase client
│   ├── auth.js               # Auth methods
│   ├── database.js           # Database methods
│   └── migrations.js         # Data migration utils
└── ElkHuntDashboard.jsx      # Updated with AuthProvider
```

---

## 🎯 Success Criteria

### Must Have
- [ ] Users can sign up with email + password
- [ ] Users can log in
- [ ] Users can log out
- [ ] Session persists on page reload
- [ ] Custom units gated behind auth
- [ ] Gear tracking gated behind auth
- [ ] Waypoints gated behind auth
- [ ] Public users can still browse default units
- [ ] Responsive auth UI (mobile)
- [ ] Secure (RLS enabled)

### Nice to Have
- [ ] Google OAuth login
- [ ] GitHub OAuth login
- [ ] Email verification
- [ ] Password reset
- [ ] Profile editing
- [ ] Avatar upload
- [ ] Multi-device sync
- [ ] Offline support with sync on reconnect

---

## ⚠️ Risks & Mitigation

### Risk 1: Data Loss During Migration
**Mitigation:**
- Keep localStorage as backup during migration
- Offer manual "export data" before migration
- Test migration thoroughly

### Risk 2: Supabase Free Tier Limits
**Mitigation:**
- Monitor usage in Supabase dashboard
- Implement pagination (500 items per user max)
- Upgrade to Pro ($25/mo) if needed

### Risk 3: Complex State Management
**Mitigation:**
- Use React Context (simple, built-in)
- Keep auth state separate from app state
- Use custom hooks for clean API

### Risk 4: Breaking Existing Users
**Mitigation:**
- Public features remain public (no gates)
- Gradual rollout (feature flags on server)
- Clear communication about new features

---

## 📅 Estimated Timeline

- **Phase 1-4 (Core Auth):** 3-4 hours
- **Phase 5-6 (Feature Flags + Data):** 3 hours
- **Phase 7-8 (UI + Testing):** 2-3 hours

**Total:** 8-10 hours for full implementation

**MVP (Quick Start):** 4 hours
- Just auth (no data sync)
- Feature gates only
- Manual data migration

---

## 🤔 Questions for User

Before proceeding, I need your input on:

1. **Backend Choice:**
   - Supabase (recommended) or Firebase or something else?

2. **OAuth Providers:**
   - Email/password only or add Google/GitHub login?

3. **Features to Gate:**
   - Which features should be public vs authenticated?
   - My suggestion: Keep viewing units public, gate custom units, gear, waypoints, notes

4. **Data Migration:**
   - Auto-migrate localStorage data on first login or manual export/import?

5. **Timeline:**
   - Full implementation (8-10 hours) or MVP (4 hours)?

6. **Deployment:**
   - Okay to add Supabase env vars to AWS Amplify?

---

**Next Steps:** Once you approve the approach, I'll:
1. Set up Supabase project (or you can do this)
2. Implement auth system
3. Add feature gates
4. Migrate data structure
5. Test thoroughly
6. Deploy

Let me know your preferences and I'll start implementation! 🚀
