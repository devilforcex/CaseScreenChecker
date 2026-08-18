# CaseScreenChecker

**Plug-and-play phone accessory compatibility reference system.**

CaseScreenChecker helps retail staff and phone-accessory sellers instantly find which **screen protectors** and **cases** from one phone model also fit another. It computes physical dimensional tolerances (chassis, screen glass, camera island, buttons, ports) and ranks cross-model compatibility with a confidence score, so a "will this case fit?" question is answered in seconds instead of by trial and error.

![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)

---

## ✨ Features

- **Instant cross-model compatibility** — select a target phone and see which other models' cases/protectors are interchangeable, ranked by confidence.
- **Physics-based inference engine** — when no curated pair exists, it derives a fit score from real specs (dimensions, screen diagonal/curvature/notch, camera island, button layout).
- **Curated verification tiers** — `EXACT_MATCH`, `CONFIRMED_COMPATIBLE`, `HIGHLY_LIKELY`, `POSSIBLE_WITH_CAUTION`, `NOT_COMPATIBLE`, with staff-verified flags and evidence sources.
- **Bilingual UI** — Bulgarian (🇧🇬) and English (🇬🇧).
- **Visual overlay** — side-by-side chassis/screen overlay of the target vs. candidate model.
- **OEM twin scanner** — bulk import and automated detection of rebranded "twin" devices.
- **Printable cheat sheet** — generate a physical reference sheet for the counter.
- **REST API** — searchable model registry + compatibility lookup (`/api/v1/*`).

## 🧰 Tech stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS v4, `lucide-react`, `motion`
- **Backend:** Node.js + Express 5 (REST API)
- **Validation:** Zod
- **Database schema:** PostgreSQL / Supabase (`sql/schema.sql`) — currently seeded in-memory; see [Roadmap](#roadmap)
- **Tests:** Vitest

## 🚀 Quick start

Requirements: **Node.js 20+** and **npm**.

```bash
# 1. Install dependencies
npm install

# 2a. Run the frontend in dev mode (hot reload)
npm run dev

# 2b. Run the API server (serves the built frontend + /api/v1)
npm run start

# 3. Production build (outputs to dist/)
npm run build
```

Open http://localhost:3000.

### Useful scripts

| Script              | Description                                    |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Vite dev server (frontend only)                |
| `npm run dev:server`| API server with watch mode (`tsx watch`)       |
| `npm run start`     | Run the API server (`tsx server.ts`)           |
| `npm run build`     | Typecheck (`tsc`) + production Vite build      |
| `npm run typecheck` | TypeScript typecheck only                       |
| `npm test`          | Run Vitest unit tests                          |
| `npm run preview`   | Preview the production build                   |

## 🐳 Docker

```bash
docker compose up --build
```

The multi-stage `Dockerfile` builds the Vite frontend, then serves it (plus the API) from a minimal Node 20 runner image.

## 🗂 Project structure

```
server.ts                       Express REST API (/api/v1) + SPA static serving
src/
  App.tsx                       Root application shell & state
  types.ts                      Domain types (PhoneModel, CompatibilityPair, …)
  utils/compatibilityEngine.ts  Compatibility scoring & inference engine
  data/phoneDatabase.ts         Seed data (phone models + curated pairs)
  i18n/translations.tsx         BG/EN translation provider
  components/                   UI components (search, cards, modals, research, …)
sql/
  schema.sql                    PostgreSQL/Supabase schema + RLS policies
  seeds.sql                     Seed SQL
docs/                           Architecture, API, DB, deployment docs
```

## 🔌 REST API

| Method | Route                            | Description                                   |
| ------ | -------------------------------- | --------------------------------------------- |
| GET    | `/api/health`                    | Health check                                  |
| GET    | `/api/v1/models`                 | List/search models (`brand`, `search`, `limit`, `offset`) |
| GET    | `/api/v1/models/:id`             | Get a single model's specs                    |
| POST   | `/api/v1/models`                 | Register a new model (Zod-validated)          |
| GET    | `/api/v1/compatibility/lookup`   | Compatibility for a target (`modelId`, `category`) |
| GET    | `/api/v1/compatibility/pairs`    | List curated pairs                            |
| POST   | `/api/v1/compatibility/pairs`    | Add/verify a pair (Zod-validated)             |

> Note: the API currently keeps data in memory and reseeds on restart. The SQL schema and RLS policies are ready for a real database — see the roadmap below.

## 🧪 Testing

```bash
npm test          # single run
npm run test:watch  # watch mode
```

Tests cover the core compatibility engine (`calculateToleranceDiff`, `inferDynamicCompatibility`, `getCompatibilityResultsForModel`).

## 🗺 Roadmap

- [ ] Wire the API to PostgreSQL/Supabase (persistence layer behind `DATABASE_URL`)
- [ ] Frontend data layer that calls `/api/v1` instead of `localStorage`
- [ ] Staff authentication (the schema already has RLS policies for `auth.role() = 'authenticated'`)
- [ ] Replace the simulated "external research" panel with a real spec source
- [ ] ESLint + Prettier (in addition to `tsc` typechecking)

## 📄 License

[MIT](./LICENSE) © Stan
