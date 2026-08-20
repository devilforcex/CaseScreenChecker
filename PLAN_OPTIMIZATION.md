# План за оптимизация и Phase 4 — Реално web research

## 1. Текущо състояние — одит

### ✅ Работи добре
- Core SPA (React + Vite + TypeScript) — чиста архитектура
- Фаза 0-3 приложени: демо изчистено, modelSearch, engine config, UI подобрения
- Express backend с REST API (7 endpoint-а)
- Zod валидация на всички граници
- localStorage с авто-чистене и валидация
- 27 теста, TypeScript — чиста компилация
- i18n (BG/EN) в цялото UI
- URL query params за споделяне
- Vite preview работи

### ❌ Проблеми за оптимизация

| Проблем | Сериозност | Описание |
|---------|-----------|----------|
| **Bundle замърсяване** | Високо | `ssh2`, `express`, `pg`, `cors` са в `dependencies` — Vite ги включва в клиентския bundle (338KB). Те са само за server.ts. |
| **ExternalResearchPanel е мъртъв код** | Средно | Хардкоднати 4 демо записа, setTimeout имитация. Табът скрит зад env флаг. |
| **Няма реален web research** | Високо | GSMArena няма public API — трябва scraping. Няма endpoint `/api/v1/research`. |
| **Базата е само localStorage** | Средно | Няма синхрон между устройства. Всеки браузър си има собствена база. |
| **phoneDatabase.ts нараства** | Ниско | 23KB хардкод- Same UI components can be optimized, no code splitting |
| **Няма форма за липсващ модел** | Средно | Потребителят не може да въведе specs ръчно когато GSMArena няма данни |

---

## 2. План за действие

### 🌊 Фаза 0.5 — Code Hygiene (преди нови features)

| Задача | Файлове | Описание |
|--------|---------|----------|
| Премахни `ssh2`, `express`, `pg`, `cors` от `dependencies` | `package.json` | Server-only пакетите да са в `optionalDependencies` или `server/package.json` |
| Separate server/ от src/ | `server.ts` → `server/index.ts` | Раздели backend от frontend за clean separation |
| Dead code elimination | `ExternalResearchPanel.tsx` | Премахни SIMULATED_RESEARCH_DATABASE и setTimeout логиката |

### 🌐 Фаза 4 — Real Web Research (GSMArena)

**Архитектура:**

```
┌─────────────┐     POST /api/v1/research     ┌──────────────────┐
│  Frontend    │ ───────────────────────────?   │  Express Server  │
│  (Vite SPA)  │                                │  (server/)       │
│              │ ←─── PhoneModel[] ─────────── │                  │
└─────────────┘                                └───────┬──────────┘
                                                        │
                                                        │ axios + cheerio
                                                        ▼
                                               ┌──────────────────┐
                                               │  GSMArena HTML   │
                                               │  scraping        │
                                               └──────────────────┘
```

#### 4.1 Server-side research endpoint

**Нов файл:** `server/routes/research.ts`

```typescript
// POST /api/v1/research
// Body: { query: "Galaxy A06" }
// Returns: { found: boolean, model?: PhoneModel, source: "gsmarena"|"none", confidence: "RESEARCHED" }

- Търси модела в GSMArena:
  1. Construct URL: gsmarena.com/results.php3?sQuickSearch=yes&sName=Galaxy+A06
  2. Парсва HTML с cheerio — взима първия резултат от search
  3. Отваря страницата на модела: gsmarena.com/{model}.php
  4. Парсва спецификациите (размери, екран, камера, батерия)
  5. Map-ва към PhoneModel тип
  6. Връща резултата с confidence: "RESEARCHED"
```

#### 4.2 GSMArena HTML Parser

**Нов файл:** `server/utils/gsmarenaParser.ts`

Парсва:
- **Dimensions**: `.specs-list` → `168.0 x 78.0 x 8.8 mm` → height/width/thickness
- **Display**: `6.7"`, `PLS LCD`, `720 x 1600 px` → diagonal, curvature
- **Camera**: `3 MP` → lensCount, `rectangular island`
- **Features**: `USB-C`, `3.5mm jack`, `Fingerprint (side-mounted)`
- **Notch type** derived from resolution, aspect ratio, and display description
- **Model codes/aliases**: `SM-A057F, SM-A057M` from "Also known as"

#### 4.3 Client-side Research UI

**Rewrite `ExternalResearchPanel.tsx`:**

- Премахни симулираните данни
- Бутон "Search GSMArena" → извиква POST /api/v1/research
- Резултати с badge `RESEARCHED` (нов confidenceLevel)
- Бутон "Add to Catalog" → само ако id не съществува
- Поле за ръчно редактиране на specs преди add
- Cache в localStorage с 24h expiry

#### 4.4 Нов type — ResearchResult

```typescript
// В types.ts
interface ResearchResult {
  id: string;
  model?: PhoneModel;
  source: 'gsmarena' | 'none';
  confidenceLevel: 'RESEARCHED';
  searchedAt: string;
  rawSpecs: Record<string, string>; // оригиналните спецификации от HTML-а
}
```

#### 4.5 Auto-Discovery Flow

1. Consumator търсим модел който не е в локальната база
2. UI: "Този модел не е в каталога.Зонайте от GSMArena?"
3. Ако ползоателят approves → извикай `/api/v1/research`
4. Резултат: покажи specs, "RESEARCHED" badge
5. "Promote to Catalog" → добави в PhoneModel[] → сохрани в localStorage
6. При повторно търсене: провери в кеша преди да питаш сървъра

### 📦 Фаза 4.5 — Missing Model Form

**Нов/подобрен компонент:** `components/MissingModelForm.tsx`

- Показва се когато търсенето не намира нищо нито локално нито онлайн
- Форма с всички PhoneModel полета (без id — auto-generate)
- Copy от AdminPairManagerModal "Register New Phone Model" секцията
- Валидация със Zod
- Съхранява се в localStorage

### �⚡ Оптимизации

| Оптимизация | Ефект |
|------------|--------|
| Prемени `ssh2`, `express`, `pg`, `cors` от dependencies | Намаля bundle-а с ~150KB |
| Кеш на research резултати (24h) | Избягва излишни re-scrape-ове |
| Debounce на търсенето (300ms) | По-малко заявки докато потребителя пише |
| Code splitting за модалите | Намалява initial bundle |
| Лоадаble imports за ExternalResearchPanel | Зарежда се само когато се кликне на Research таба |

---

## 3. Файлова структура след промените

```
CaseScreenChecker/
├── server/
│   ├── index.ts          ← преместен от server.ts
│   ├── routes/
│   │   └── research.ts   ← NEW: /api/v1/research
│   └── utils/
│       └── gsarenaParser.ts ←　NEW: HTML scraping
├── src/
│   ├── components/
│   │   ├── ExternalResearchPanel.tsx ← REWRITE: real research
│   │   └── MissingModelForm.tsx      ← NEW: manual specs form
│   ├── utils/
│   │   └── researchCache.ts          ← NEW: localStorage cache with TTL
│   ├── types.ts                      ← ADD: ResearchResult
│   └── ...
├── package.json                      ← CLEAN: server deps separated
└── vite.config.ts
```

## 4. Тестове

| Компонент | Тестове |
|-----------|---------|
| `gsmarenaParser.ts` | Unit: парсване на HTML → PhoneModel, липсващи полета, грешки |
| `researchCache.ts` | Unit: set/get/expiry/cleanup |
| `research.ts` route | Integration: POST /api/v1/research с mock axios |
| `MissingModelForm.tsx` | Component: submit валидни/невалидни данни |

## 5. Приоритет (execution order)

1. **Code hygiene** — премахни server deps от frontend bundle, отдели server/
2. **gsmarenaParser** — ядрото на реалното търсене
3. **researchCache** — клиентски кеш
4. **server/research.ts** — API endpoint
5. **ExternalResearchPanel** — rewrite с реална функционалност
6. **MissingModelForm** — fallback форма
7. **Tests** — за всички нови модули
8. **Deploy** — обнови Vercel/server config
```