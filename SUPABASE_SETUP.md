# Supabase Setup Guide

## Quick Start (5 minutes)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" → Sign in with GitHub
3. Click "New Project"
4. Fill in:
   - **Name**: `elk-hunt-planner` (or your choice)
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free (50,000 monthly active users)
5. Click "Create new project" (takes ~2 minutes)

### Step 2: Get API Keys

1. Once project is ready, go to **Settings** (⚙️ icon in sidebar)
2. Click **API** in the left menu
3. Copy these two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...` (long string)

### Step 3: Configure Environment Variables

1. Create `.env` file in project root:
```bash
cp .env.example .env
```

2. Edit `.env` and paste your values:
```env
VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc... (your actual anon key)
```

3. **IMPORTANT**: Never commit `.env` to git (already in `.gitignore`)

### Step 4: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (public user data)
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
  section TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, unit_id, section)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_waypoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_gear ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User Units
CREATE POLICY "Users can view own units" ON user_units
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own units" ON user_units
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own units" ON user_units
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own units" ON user_units
  FOR DELETE USING (auth.uid() = user_id);

-- Waypoints
CREATE POLICY "Users can view own waypoints" ON user_waypoints
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own waypoints" ON user_waypoints
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own waypoints" ON user_waypoints
  FOR DELETE USING (auth.uid() = user_id);

-- Gear
CREATE POLICY "Users can view own gear" ON user_gear
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gear" ON user_gear
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gear" ON user_gear
  FOR UPDATE USING (auth.uid() = user_id);

-- Notes
CREATE POLICY "Users can view own notes" ON user_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON user_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON user_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON user_notes
  FOR DELETE USING (auth.uid() = user_id);

-- Create profile automatically on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

4. Click **Run** (bottom right)
5. You should see "Success. No rows returned"

### Step 5: Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. **Email** should be enabled by default
3. Optional: Configure email templates under **Email Templates**

### Step 6: (Optional) Enable OAuth

If you want Google/GitHub login:

1. Go to **Authentication** → **Providers**
2. Click on **Google** or **GitHub**
3. Toggle **Enable**
4. Follow instructions to get OAuth credentials from Google/GitHub
5. Paste credentials and save

### Step 7: Deploy Environment Variables

For AWS Amplify:
1. Go to Amplify console
2. Select your app → **Environment variables**
3. Add:
   - `VITE_SUPABASE_URL` = your project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
4. Redeploy app

---

## Testing Your Setup

1. Start dev server: `npm run dev`
2. Check browser console - should see Supabase client initialized
3. Try signing up with email
4. Check Supabase dashboard → **Authentication** → **Users**
5. You should see your test user

---

## Security Notes

✅ **Safe to expose in frontend:**
- Project URL (`VITE_SUPABASE_URL`)
- Anon key (`VITE_SUPABASE_ANON_KEY`)

❌ **NEVER expose:**
- Database password
- Service role key (keep this secret!)

✅ **Row Level Security (RLS) protects your data:**
- Users can only see/modify their own data
- Enforced at database level (not just frontend)
- Safe even with public anon key

---

## Troubleshooting

### "Invalid API key"
- Double-check you copied the **anon** key, not service_role
- Ensure no extra spaces in `.env` file
- Restart dev server after changing `.env`

### "Failed to fetch"
- Check project URL is correct
- Ensure project is not paused (free tier pauses after inactivity)
- Check browser console for CORS errors

### "Row Level Security policy violation"
- Ensure RLS policies are created
- Ensure user is logged in
- Check auth.uid() matches user_id in database

---

## Next Steps

Once setup is complete:
1. The app will automatically use Supabase for authentication
2. User data will sync to cloud instead of localStorage
3. Users can access their data from any device
4. You can view/manage users in Supabase dashboard

**Cost**: Free tier includes 50,000 monthly active users - more than enough for most use cases.
