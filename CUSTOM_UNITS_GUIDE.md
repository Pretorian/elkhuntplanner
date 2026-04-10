# Custom Units Guide

## Overview
You can now add your own custom hunt units to the Elk Hunt Planner! This feature allows you to track additional units beyond the default ones, with the ability to import data from GoHunt or enter it manually.

## How to Add a New Unit

### Quick Start
1. Click the **"+ Add"** button in the sidebar (next to "Hunt Units")
2. Fill in the required fields:
   - **Unit Number** (e.g., 12, 62, 201)
   - **Nickname** (e.g., "Flat Tops", "Holy Cross")
   - Hunt Code (optional)
   - Choice Rank (1st-4th)
   - State (CO, WY, MT, ID, UT, NM)
3. Click **"Add Unit"** to save

Your custom unit will appear in the sidebar with a **"CUSTOM"** badge.

## Features

### Basic Information
All custom units include:
- Unit number and display name
- Nickname for easy reference
- Hunt code (if applicable)
- Choice ranking (1st-4th)
- State designation

### Automatic Data Import (Beta)
The app includes an experimental feature to fetch GoHunt data automatically. However, due to browser security restrictions (CORS), this may not work directly.

**How to try automatic import:**
1. Enter the unit number
2. Click **"Fetch GoHunt Data"**
3. If successful, terrain, access, and lodging data will be imported

### Manual Method (Recommended)

Since automatic fetching is limited by browser security, follow this process:

1. **Add the basic unit info** in the form
2. **Visit GoHunt** - The form provides a direct link to the unit profile
3. **Save the unit** with basic info
4. **Add details later** using the Notes section in each tab

### What Gets Stored

Custom units are saved in your browser's localStorage with:
- Basic unit information (number, name, codes)
- Choice and draw rankings
- Imported data (if fetch succeeds)
- Your personal notes for each unit

## Data Structure

Each custom unit includes the following fields (many will be empty initially):

```javascript
{
  id: "GMU-XX",
  displayName: "GMU XX",
  nickname: "Your Nickname",
  huntCode: "EEXXXOXA",
  choiceRank: 1-4,
  state: "CO",
  // Empty fields you can fill via notes:
  quickTips: [],
  terrain: { summary, vegetation, features },
  access: { summary, publicAreas, routes },
  lodging: { hubs, campgrounds, options },
  isCustom: true // Identifier for custom units
}
```

## Managing Custom Units

### Viewing Custom Units
- Custom units appear in the sidebar with a **"CUSTOM"** badge
- They work exactly like default units
- Click on any custom unit to view/edit details

### Editing Unit Data
After adding a unit, you can:
1. Use the **Notes** section in each tab to add details
2. Add waypoints on the map
3. Track your gear for that specific unit

### Deleting Custom Units
Currently, custom units persist in localStorage. To remove a unit:
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Find `elk-custom-units`
4. Edit or delete the JSON

*Future update: We'll add a delete button in the UI*

## Tips & Best Practices

### 1. Start Simple
Add the unit number and nickname first. Fill in details as you research.

### 2. Use the Notes Feature
Each tab (Terrain, Access, Lodging, etc.) has a Notes section. Use it to copy/paste info from GoHunt or other sources.

### 3. Track Multiple States
You can add units from any western state. The state selector supports:
- Colorado (CO)
- Wyoming (WY)
- Montana (MT)
- Idaho (ID)
- Utah (UT)
- New Mexico (NM)

### 4. GoHunt Integration
While automatic fetch may not work due to browser security, you can:
1. Visit the GoHunt link provided in the form
2. Copy relevant information
3. Paste into Notes sections after adding the unit

## Technical Details

### Storage
- Custom units are stored in `localStorage` under key: `elk-custom-units`
- Data persists across browser sessions
- Stored as JSON array
- Each unit is merged with default units at runtime

### Browser Compatibility
- Works in all modern browsers
- localStorage must be enabled
- Some browsers may block automatic GoHunt fetching (CORS policy)

## Troubleshooting

### "Unable to auto-fetch GoHunt data"
**Why:** Browsers block cross-origin requests for security
**Solution:** Use the manual method - visit GoHunt and copy/paste data

### Custom unit not appearing
**Check:**
1. Did you enter both unit number AND nickname?
2. Is localStorage enabled in your browser?
3. Try refreshing the page

### Data not persisting
**Possible causes:**
1. Browser in Private/Incognito mode
2. localStorage disabled
3. Storage quota exceeded

**Solution:** Check browser settings and clear old data if needed

## Future Enhancements

Planned features for custom units:
- [ ] Delete button in UI
- [ ] Edit existing custom units
- [ ] Import/export custom units to file
- [ ] Share custom units with other users
- [ ] Browser extension for easier GoHunt import
- [ ] Bulk import from CSV

## Example Workflow

**Adding GMU 76 (Vail Area):**

1. Click **"+ Add"** in sidebar
2. Enter:
   - Unit Number: `76`
   - Nickname: `Vail Pass`
   - Choice Rank: `2nd`
   - State: `CO`
3. Click **"Add Unit"**
4. Visit [GoHunt GMU 76](https://www.gohunt.com/tools/profiles/colorado/units/big-game-unit-76)
5. Switch to **Terrain** tab → Add notes from GoHunt
6. Switch to **Access** tab → Add public land info
7. Add waypoints on the **Map** tab
8. Done!

## Questions?

- Check localStorage in DevTools to see your custom units
- Custom units are client-side only - they don't sync across devices
- Consider exporting your custom units data for backup (copy from localStorage)
