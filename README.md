# Material Weight Calculator

Calculate the weight of raw materials based on material type, shape, and dimensions. A professional tool for engineers and fabricators.

## Getting started

Requires Node.js and npm.

```sh
# Install dependencies
npm install

# Start the development server (http://localhost:8080)
npm run dev
```

## Materials data

Densities live in `src/calculator/data/materials.json` — 13 categories and 228
grades, covering steel, stainless, aluminum, copper, brass, bronze, titanium,
nickel alloys, magnesium, lead, tungsten, specialty/refractory metals and
plastics.

Each grade carries a stable `id`, a `name` in both locales, and a density in
kg/m³:

```json
{
  "id": "steel.1-2344",
  "name": { "he": "1.2344", "en": "1.2344" },
  "density": 7800
}
```

Alloy designations (`1018`, `C63000`, `PEEK`) stay in Latin script for both
locales; descriptive names (`Grey Cast Iron`) are translated.

The file is hand-maintained, so `validateMaterials` in
`src/calculator/model/schema.ts` checks it at load: both translations present,
no duplicate ids, density a finite number within 1–25000 kg/m³. A bad edit
fails the test suite rather than surfacing in a quote.

## Available scripts

- `npm run dev` — start the development server
- `npm run build` — production build
- `npm run build:dev` — development-mode build
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build locally
- `npm test` — run the test suite

## Tech stack

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
