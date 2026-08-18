import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_PHONE_MODELS, INITIAL_COMPATIBILITY_PAIRS } from './src/data/phoneDatabase.js';
import { PhoneModel, CompatibilityPair, AccessoryCategory } from './src/types.js';
import { getCompatibilityResultsForModel } from './src/utils/compatibilityEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory data store with initial seed (can be wired to PostgreSQL/Supabase via DATABASE_URL)
let phoneModels: PhoneModel[] = [...INITIAL_PHONE_MODELS];
let compatibilityPairs: CompatibilityPair[] = [...INITIAL_COMPATIBILITY_PAIRS];

// ==========================================
// REST API ROUTES (/api/v1)
// ==========================================

// 1. Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'CaseScreenChecker API',
    version: '1.0.0',
    modelCount: phoneModels.length,
    pairCount: compatibilityPairs.length
  });
});

// 2. GET /api/v1/models - List and search phone models
app.get('/api/v1/models', (req: Request, res: Response) => {
  const { brand, search, limit = '100', offset = '0' } = req.query;

  let results = [...phoneModels];

  if (brand && typeof brand === 'string' && brand !== 'All') {
    results = results.filter(m => m.brand.toLowerCase() === brand.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.fullName.toLowerCase().includes(q) ||
      m.brand.toLowerCase().includes(q) ||
      m.aliases?.some(a => a.toLowerCase().includes(q))
    );
  }

  const numLimit = parseInt(limit as string, 10) || 100;
  const numOffset = parseInt(offset as string, 10) || 0;
  const paginated = results.slice(numOffset, numOffset + numLimit);

  res.json({
    total: results.length,
    limit: numLimit,
    offset: numOffset,
    data: paginated
  });
});

// 3. GET /api/v1/models/:id - Get specific phone model specs
app.get('/api/v1/models/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const model = phoneModels.find(m => m.id === id);

  if (!model) {
    return res.status(404).json({ error: `Phone model with ID '${id}' not found.` });
  }

  res.json({ data: model });
});

// 4. POST /api/v1/models - Register new phone model
app.post('/api/v1/models', (req: Request, res: Response) => {
  const newModel: PhoneModel = req.body;

  if (!newModel.id || !newModel.name || !newModel.brand || !newModel.dimensions || !newModel.screen) {
    return res.status(400).json({
      error: 'Missing required fields. Ensure id, name, brand, dimensions, and screen specs are provided.'
    });
  }

  const exists = phoneModels.some(m => m.id === newModel.id);
  if (exists) {
    return res.status(409).json({ error: `Phone model with ID '${newModel.id}' already exists.` });
  }

  phoneModels.push(newModel);
  res.status(201).json({ message: 'Phone model created successfully', data: newModel });
});

// 5. GET /api/v1/compatibility/lookup - Calculate compatibility for a target phone model
app.get('/api/v1/compatibility/lookup', (req: Request, res: Response) => {
  const { modelId, category = 'all_accessories' } = req.query;

  if (!modelId || typeof modelId !== 'string') {
    return res.status(400).json({ error: 'Query parameter modelId is required.' });
  }

  const target = phoneModels.find(m => m.id === modelId);
  if (!target) {
    return res.status(404).json({ error: `Target phone model '${modelId}' not found.` });
  }

  const results = getCompatibilityResultsForModel(
    target,
    phoneModels,
    compatibilityPairs,
    category as AccessoryCategory
  );

  res.json({
    targetModel: target,
    category,
    totalMatches: results.length,
    results
  });
});

// 6. GET /api/v1/compatibility/pairs - List all compatibility pairs
app.get('/api/v1/compatibility/pairs', (req: Request, res: Response) => {
  res.json({
    total: compatibilityPairs.length,
    data: compatibilityPairs
  });
});

// 7. POST /api/v1/compatibility/pairs - Add or verify a pair
app.post('/api/v1/compatibility/pairs', (req: Request, res: Response) => {
  const newPair: CompatibilityPair = req.body;

  if (!newPair.id || !newPair.sourceModelId || !newPair.targetModelId || !newPair.confidenceLevel) {
    return res.status(400).json({
      error: 'Missing required fields: id, sourceModelId, targetModelId, confidenceLevel.'
    });
  }

  // Check if exists and update or push
  const index = compatibilityPairs.findIndex(p => p.id === newPair.id);
  if (index >= 0) {
    compatibilityPairs[index] = newPair;
  } else {
    compatibilityPairs.unshift(newPair);
  }

  res.status(201).json({ message: 'Compatibility pair saved successfully', data: newPair });
});

// ==========================================
// SERVE STATIC PRODUCTION BUILD (Vite SPA)
// ==========================================
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`[CaseScreenChecker Server] Running on http://0.0.0.0:${PORT}`);
});
