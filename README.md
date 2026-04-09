# Elk Hunt Planner

A comprehensive web application for planning elk hunts in Colorado during the 2026 season. Built with React and Vite, featuring interactive maps, waypoint management, and integration with GoHunt data.

## Features

- **Unit Overview**: Detailed information for GMU 12, 62, and 79
- **Interactive Maps**: Leaflet-powered maps with topography and waypoint support
- **Waypoint Management**: Add, edit, and categorize hunting waypoints
- **Field Notes**: Take and save notes for each game management unit
- **GoHunt Integration**: Pre-populated with GoHunt statistics and narratives
- **Offline Capable**: Data persists to localStorage

## Tech Stack

- React 18.2.0
- Vite 5.4.11
- Leaflet 1.9.4 (maps)
- Lucide React (icons)
- Vitest (testing)
- ESLint + Prettier (code quality)

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
git clone git@github.com:Pretorian/elkhuntplanner.git
cd elkhuntplanner

# Install dependencies
npm install
```

### Development

```bash
# Start development server (runs on port 3430)
npm run dev

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Lint code
npm run lint

# Format code
npm run format
```

### Building for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

The production build will be output to the `dist/` directory.

## Production Build Optimizations

The production build includes:

- **Code Splitting**: React, Leaflet, and icons are separated into chunks for optimal caching
- **Minification**: Terser minification with console.log removal
- **Source Maps**: Generated for debugging production issues
- **Tree Shaking**: Unused code is automatically removed

## Deployment

### GitHub Pages

This project is configured for GitHub Pages deployment:

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` directory to the `gh-pages` branch:
   ```bash
   # Using gh-pages package (install first: npm install -g gh-pages)
   gh-pages -d dist

   # Or manually commit the dist folder to gh-pages branch
   git checkout gh-pages
   cp -r dist/* .
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

3. Enable GitHub Pages in repository settings, pointing to the `gh-pages` branch

### Other Static Hosts

The built files in `dist/` can be deployed to any static hosting service:

- **Netlify**: Drag and drop the `dist/` folder or connect your GitHub repo
- **Vercel**: Import the project and it will auto-detect Vite
- **AWS S3**: Upload the `dist/` contents to an S3 bucket with static hosting enabled
- **Cloudflare Pages**: Connect your repo or upload the `dist/` folder

## Environment Variables (Optional)

Create a `.env` file for API integrations:

```bash
# Copy the example file
cp .env.example .env

# Edit with your API keys
VITE_GOHUNT_API_KEY=your_api_key_here
VITE_HUNTWISE_API_KEY=your_api_key_here
```

**Note**: API integrations are planned for future releases. The app currently works with pre-populated GoHunt data.

## Project Structure

```
elkhuntplanner/
├── src/
│   ├── main.jsx              # Application entry point
│   ├── ElkHuntDashboard.jsx  # Main component (1,647 lines)
│   ├── storage.js            # LocalStorage wrapper with error handling
│   ├── logger.js             # Logging infrastructure
│   ├── ErrorBoundary.jsx     # React error boundary
│   └── test/                 # Test files
│       ├── setup.js
│       ├── storage.test.js
│       ├── waypoints.test.js
│       └── ElkHuntDashboard.test.jsx
├── dist/                     # Production build output
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
├── vitest.config.js         # Vitest configuration
├── eslint.config.js         # ESLint configuration
├── .prettierrc              # Prettier configuration
└── package.json             # Dependencies and scripts
```

## Data Persistence

The app uses localStorage to persist:
- Waypoints for each GMU
- Field notes for each GMU

Data survives page refreshes and browser restarts.

## Browser Support

Targets ES2015+ browsers:
- Chrome/Edge 88+
- Firefox 85+
- Safari 14+

## Testing

Test suite includes:
- Storage API tests (7 tests)
- Waypoint management tests (15 tests)
- Component rendering tests (6 tests)

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test

# Run tests with coverage
npm run test:run -- --coverage
```

## Code Quality

Configured with:
- **ESLint**: React best practices, hooks rules
- **Prettier**: Consistent code formatting
- **Vitest**: Fast unit testing with React Testing Library

```bash
# Check linting
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- All tests must pass (`npm test`)
- Code must pass linting (`npm run lint`)
- Code must be formatted (`npm run format`)

## License

This project is personal software for hunting trip planning.

## Acknowledgments

- **GoHunt**: Unit statistics, narratives, and quick tips sourced from GoHunt (April 2026)
- **Colorado Parks and Wildlife**: GMU boundaries and regulations
- **Leaflet**: Open-source mapping library

## Support

For issues or questions:
- Open an issue in the GitHub repository
- Check existing issues for solutions

---

**Season**: 2026 Colorado Elk Archery
**GMUs**: 12 (Flat Tops), 62 (Uncompahgre Plateau), 79 (San Luis Valley)
**Hunt Codes**: EE012O1A, EE062O1R, EE079O2R
