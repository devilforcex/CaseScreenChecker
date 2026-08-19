# CaseScreenChecker

> **Status: early prototype — not production-ready.** Several features are
> simulated or incomplete. See [Current limitations](#current-limitations).

A **plug-and-play phone accessory compatibility reference** for retail staff and
phone-accessory sellers. It answers *"will a case / screen protector from phone
model X fit model Y?"* by comparing physical specifications — chassis dimensions,
screen diagonal/curvature/notch, camera-island geometry, and port/button layout —
and ranking cross-model compatibility with a confidence score.

---

## Main purpose

Replace trial-and-error fitting with a quick, structured lookup of interchangeable
screen protectors and cases across phone models.

## Current feature set

### Working (in-browser, local)

- **Cross-model compatibility lookup** — pick a target model and see candidate
  matches ranked by confidence score.
- **Inference engine** — derives a fit score from physical spec tolerances when no
  curated pair exists (`src/utils/compatibilityEngine.ts`).
- **Curated verification tiers** — `EXACT_MATCH`, `CONFIRMED_COMPATIBLE`,
  `HIGHLY_LIKELY`, `POSSIBLE_WITH_CAUTION`, `NOT_COMPATIBLE`.
- **Bilingual UI** — Bulgarian / English.
- **Visual overlay** — side-by-side chassis/screen comparison of target vs candidate.
- **OEM twin scanner** — bulk import and rebranded-"twin" detection helpers.
- **Printable cheat sheet** — physical reference sheet for the counter.

### Simulated / demo (clearly labeled, not real)

- **External research panel** — demonstrates the planned research UI using
  hard-coded sample data. It performs **no live web search** and is labeled
  `DEMO` in the UI. See [Data categories](#data-categories).

### Planned (not implemented yet)

- Real database persistence (Supabase/PostgreSQL).
- Staff authentication.
- A real web-research / spec-lookup integration.
- Frontend data layer wired to an API instead of `localStorage`.

## Technology stack

- **Frontend:** React 18, TypeScript, Vite 6, Tailwind CSS v4, `lucide-react`, `motion`
- **Validation:** Zod
- **Tests:** Vitest
- **Lint / typecheck:** ESLint (flat config) + `tsc`
- **Package manager:** [Bun](https://bun.sh) (`bun.lock` is the lockfile)
- **Legacy backend (disconnected):** Express 5 API (`server.ts`) — see
  [Architecture overview](#architecture-overview)

## Local development

Requirements: **Bun** (recommended) and **Node.js 20+**.

```bash
# 1. Install dependencies (generates/updates bun.lock)
bun install

# 2. Run the frontend in dev mode (hot reload)
bun run dev

# 3. Production build (outputs to dist/)
bun run build
```

Open http://localhost:3000.

> If you do not have Bun, `npm install` works as a fallback, but `bun.lock` is the
> source of truth — do not commit a `package-lock.json`.

### Scripts

| Script              | Description                                   |
| ------------------- | --------------------------------------------- |
| `bun run dev`       | Vite dev server (frontend only)               |
| `bun run build`     | Typecheck (`tsc`) + production Vite build     |
| `bun run typecheck` | TypeScript typecheck only                      |
| `bun run lint`      | ESLint                                        |
| `bun run test`      | Vitest unit tests (single run)                |
| `bun run test:watch`| Vitest watch mode                             |
| `bun run preview`   | Preview the production build                  |
| `bun run start`     | Legacy Express server (`node server.ts`) — **obsolete, see below** |

## Environment variables

Copy `.env.example` to `.env` (never commit `.env`):

```bash
cp .env.example .env
```

| Variable      | Purpose                                        | Status       |
| ------------- | ---------------------------------------------- | ------------ |
| `PORT`        | Port for the legacy Express server             | legacy       |
| `NODE_ENV`    | Environment name (`production`)                | optional     |
| `DATABASE_URL`| PostgreSQL/Supabase connection string          | **planned, not wired up** |

## Build

```bash
bun run build   # runs `tsc && vite build`
```

The static output is written to `dist/`.

## Test

```bash
bun run test            # single run
bun run test:watch      # watch mode
```

Tests cover the core compatibility engine (`calculateToleranceDiff`,
`inferDynamicCompatibility`, `getCompatibilityResultsForModel`).

## Lint and typecheck

```bash
bun run lint        # ESLint
bun run typecheck   # tsc --noEmit
```

## Deployment overview

Target production architecture:

- **GitHub** — source control and CI.
- **Vercel** — static frontend hosting (the Vite SPA).
- **Supabase** — database (schema is prepared but not yet integrated).

The repository still contains a **legacy Hostinger-VPS deployment stack**
(`server.ts`, `Dockerfile`, `docker-compose.yml`, `nginx.conf`,
`ecosystem.config.cjs`) from an earlier architecture. It is **not** part of the
current deployment target and is currently disconnected from the frontend.

## Project structure

```
server.ts                       Legacy Express API (/api/v1) + SPA static serving
src/
  App.tsx                       Root shell & state (localStorage-backed)
  types.ts                      Domain types (PhoneModel, CompatibilityPair, …)
  utils/compatibilityEngine.ts  Compatibility scoring & inference engine
  utils/compatibilityEngine.test.ts  Unit tests for the engine
  data/phoneDatabase.ts         Seed data (static reference)
  validation/schemas.ts         Zod schemas for API payloads
  i18n/translations.tsx         BG/EN translation provider
  components/                   UI components (search, cards, modals, research…)
sql/
  schema.sql                    PostgreSQL/Supabase schema + RLS (prepared)
  seeds.sql                     Seed SQL
docs/                           Architecture, API, DB, deployment docs
eslint.config.js                ESLint flat config
.github/workflows/ci.yml        CI (Bun: install → typecheck → lint → test → build)
```

## Architecture overview

Current (Phase 1) state:

```
Frontend (React/Vite) ──► localStorage / in-memory (per browser)
        │
        │ (NOT connected yet)
        ▼
Express API (server.ts)  ──► in-memory seed data (resets on restart)
                              (legacy, disconnected from the frontend)
Supabase schema (sql/)    ──► prepared but NOT integrated
Vercel                    ──► current deployment target for the static frontend
```

The final persistence/API architecture is a **Phase 2 decision** and has not been
committed to.

## Current limitations

- **Data is local and in-memory.** The app stores everything in `localStorage`; it
  is not shared across staff/browsers and resets if storage is cleared. The SQL
  schema exists but is not wired up.
- **External research is simulated.** The research panel shows hard-coded demo
  data and does not perform real web research.
- **Legacy backend is disconnected.** The Express API, Docker, nginx and PM2
  files are leftover from a previous VPS architecture and are not used by the
  deployed frontend.
- **No authentication.** Anyone with the app can edit local reference data; there
  is no staff-verification workflow wired up.
- **No production data validation on the frontend** (validation exists only on the
  legacy API boundaries).

## Data categories

| Category            | Location                                            | Notes                          |
| ------------------- | --------------------------------------------------- | ------------------------------ |
| Static reference    | `src/data/phoneDatabase.ts`                         | Seed phone models + curated pairs (domain knowledge, preserved) |
| User-created        | `localStorage` (browser)                            | Edits made in the running app   |
| Simulated / demo    | `src/components/ExternalResearchPanel.tsx`          | Hard-coded sample "research" data, labeled `DEMO` |
| Future database     | `sql/schema.sql`, `sql/seeds.sql`                   | Prepared schema, not yet integrated |

## Development workflow

1. Create a feature branch from `main`.
2. `bun install`, then `bun run typecheck && bun run lint && bun run test`.
3. Verify `bun run build` passes.
4. Open a pull request; CI runs install → typecheck → lint → test → build.

> **Note:** Git history cleanup (removing generated artifacts such as
> `node_modules`, `dist`, `.vite` that were committed in the past) is tracked as a
> separate task and is **not** part of normal development. Do not force-push or
> rewrite history without explicit approval.

## License

[MIT](./LICENSE) © Stan
