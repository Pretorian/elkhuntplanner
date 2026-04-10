# ESLint Peer Dependency Fix

## Problem
You encountered an npm peer dependency conflict:
```
npm error Conflicting peer dependency: eslint@10.2.0
npm error peerOptional eslint@"^10.0.0" from @eslint/js@10.0.1
```

The issue was that `@eslint/js@10.0.1` required `eslint@^10.0.0`, but the eslint ecosystem (particularly `eslint-plugin-react`) doesn't yet support eslint v10.

## Solution

### 1. Downgraded to Compatible Versions
Updated `package.json` to use eslint v9 across the board:
- `eslint`: `^9.39.4` → `^9.17.0`
- `@eslint/js`: `^10.0.1` → `^9.17.0`
- `eslint-plugin-react-hooks`: `^7.0.1` → `^5.1.0`

### 2. Added `.npmrc` Configuration
Created `.npmrc` with:
```
legacy-peer-deps=true
```

This tells npm to use legacy peer dependency resolution, which is more forgiving of version conflicts.

### 3. Updated Deployment Configs
Updated all deployment configurations to use `--legacy-peer-deps`:
- `amplify.yml` - AWS Amplify builds
- `.github/workflows/deploy-aws.yml.example` - GitHub Actions CI/CD

### 4. Fixed Linting Issues
- Removed unused import `ExternalLink` from `GearList.jsx`
- Fixed unused catch variable in `storage.js`
- Auto-formatted code with Prettier

## Result
✅ `npm install` - Works without errors
✅ `npm run lint` - Passes with 0 warnings
✅ `npm run build` - Builds successfully

## Why This Happened
ESLint v10 was released recently (2025), but the plugin ecosystem hasn't fully migrated yet. Most popular plugins like `eslint-plugin-react` still only support up to eslint v9.

## Going Forward
- You can now run `npm install` without any flags (`.npmrc` handles it)
- AWS deployments will work automatically with the updated configs
- When the ecosystem catches up to eslint v10, you can upgrade by:
  1. Updating `package.json` versions
  2. Removing or updating `.npmrc`
  3. Running `npm install`
