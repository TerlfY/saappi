# Sääppi

Sääppi is a modern weather dashboard built with React + Vite + TypeScript. It focuses on a clean, fast UI with location search, favorites, charts, radar, and optional live webcams.

## Features

- Current conditions + daily summary
- Hourly forecast (up to 16 days from Open‑Meteo) with a temperature chart
- Location search + geolocation + reverse geocoding
- Favorites
- Unit toggle (°C/°F) and language toggle (FI/EN)
- Dark mode
- Weather radar map (Windy embed)
- PWA support (installable; caches some API responses)
- Optional nearby webcam carousel (Windy Webcams API)

## Tech stack

- React 18 + TypeScript + Vite
- @tanstack/react-query for data fetching/caching
- Open‑Meteo API for forecast + geocoding
- Recharts for charts
- Bootstrap / React-Bootstrap for UI
- vite-plugin-pwa for PWA packaging

## Getting started

Prereqs: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

## Environment variables

Webcams are optional and only enabled when a Windy API key is present.

Create `.env.local`:

```bash
VITE_WINDY_API_KEY=your_windy_api_key
```

Notes:
- Keep API keys out of git history (don’t commit `.env*` files).
- The core forecast UI works without any API keys.

## Scripts

```bash
npm run dev       # start dev server
npm run build     # production build
npm run preview   # preview the build locally
npm run lint      # run ESLint
```

There is also a legacy mock API script:

```bash
npm run server    # json-server on http://localhost:3001 (current-db.json)
```

## Deploying

This project is configured to work on GitHub Pages by using a repo base path when built in GitHub Actions (`/saappi/`). See `vite.config.js` if you need a different base.

## Credits

- Weather data: Open‑Meteo
- Radar map + webcams: Windy (embed + Webcams API)
