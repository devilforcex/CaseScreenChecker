import React, { useState } from 'react';
import { BookOpen, FileText, Database, Shield, Cpu, Code, CheckSquare, GitBranch } from 'lucide-react';

interface DocItem {
  id: string;
  title: string;
  filename: string;
  icon: React.ElementType;
  description: string;
  content: string;
}

const DOCS_LIST: DocItem[] = [
  {
    id: 'arch',
    title: 'System Architecture',
    filename: 'docs/ARCHITECTURE.md',
    icon: Cpu,
    description: 'System modules, component boundaries, and retail workflow layers.',
    content: `# CaseScreenChecker Architecture

## 1. System Overview
CaseScreenChecker is a specialized retail reference web application designed for mobile accessory retail stores. Its primary objective is solving the accessory stock-out dilemma: when a customer requests a screen protector or phone case for a specific smartphone model that is out of stock, store personnel can instantly identify physically compatible alternatives from other smartphone models.

## 2. Core Architectural Principles
1. Physical Reality Over String Matching: Compatibility is never calculated solely on name similarity (e.g. Galaxy A14 4G and Galaxy A14 5G have distinct chassis thicknesses and button locations). Evaluation requires rigorous physical dimensions, camera cutout bounds, screen curvature, and port placements.
2. Explicit Confidence & Uncertainty: The system categorizes relationships into distinct confidence tiers (EXACT_MATCH, CONFIRMED_COMPATIBLE, HIGHLY_LIKELY, POSSIBLE_WITH_CAUTION, NOT_COMPATIBLE, UNKNOWN). Inferred relationships are never presented as confirmed truth.
3. Local-First with External Fallback: Queries execute against local verified database records first. If local coverage is absent, the system queries external research adapters while preserving provenance and citation evidence.
4. Decoupled Inventory Readiness: While Phase 1 focuses exclusively on accessory compatibility reference data without SKU or stock level requirements, the schema is explicitly structured with foreign key hooks for future POS/ERP inventory integration.
5. Strict Single Language (English): All code, schema, API contracts, UI text, and documentation are strictly authored in English.`
  },
  {
    id: 'db',
    title: 'Database Schema & DDL',
    filename: 'docs/DATABASE.md',
    icon: Database,
    description: 'PostgreSQL & Supabase schemas, tables, and foreign keys.',
    content: `# CaseScreenChecker Database Architecture

## 1. Target Relational Architecture (PostgreSQL / Supabase)
The production database is structured for PostgreSQL with Supabase Row-Level Security (RLS).

### Tables:
1. manufacturers (id, name, slug)
2. phone_models (id, manufacturer_id, name, brand, release_year, height_mm, width_mm, thickness_mm, screen_diagonal_in, screen_curvature, screen_notch_type, camera_island_shape, has_headphone_jack, fingerprint_sensor_location, button_layout, port_type)
3. phone_model_aliases (id, phone_model_id, alias_name, alias_type)
4. model_compatibility_pairs (id, source_model_id, target_model_id, accessory_category, confidence_level, confidence_score, fit_notes, caveats, is_verified_by_staff)
5. compatibility_evidence (id, compatibility_pair_id, source_type, source_url, source_title, evidence_snippet, credibility_rating)

## 2. Future Inventory Integration Strategy
When the retail store connects POS inventory:
- An inventory_items table connects to phone_models and accessory_categories.
- The compatibility query seamlessly joins:
  phone_models (requested) -> model_compatibility_pairs -> phone_models (compatible) -> inventory_items (in_stock > 0).`
  },
  {
    id: 'compat',
    title: 'Compatibility Matrix & Rules',
    filename: 'docs/COMPATIBILITY.md',
    icon: CheckSquare,
    description: 'Dimensional tolerances, chassis millimeter margins, and screen fit rules.',
    content: `# Compatibility Evaluation Engine Specification

## 1. Physical Tolerance Matrix
Compatibility between phone accessories is defined by strict physical metrics:

### 1.1 Screen Protectors (Tempered Glass / Hydrogel)
- Screen Diagonal: Ideal delta 0.0 in, acceptable tolerance <= 0.05 in.
- Aspect Ratio: Delta <= 2% width/height ratio.
- Glass Curvature: Flat to Flat, 2.5D with 1.5mm edge margin. Curved 3D glass lifts on flat screens; flat glass leaves "halo" on 3D curves.
- Front Camera Cutout: Punch hole inside teardrop area works. Dynamic Island vs standard notch does not align accurately.

### 1.2 Phone Cases (TPU, Silicone, Hard Shell)
- TPU / Soft Silicone: Height Delta <= 0.5mm, Width Delta <= 0.4mm, Thickness Delta <= 0.3mm.
- Polycarbonate / Hard Case: Height Delta <= 0.2mm, Width Delta <= 0.2mm, Thickness Delta <= 0.15mm.
- Camera Island Cutout: Candidate cutout must envelop target island dimensions.`
  },
  {
    id: 'api',
    title: 'API Contracts',
    filename: 'docs/API.md',
    icon: Code,
    description: 'REST and JSON endpoint definitions for models and compatibility.',
    content: `# CaseScreenChecker API Specification

## Endpoints
1. GET /api/v1/models - Retrieve phone catalog with fuzzy filtering and alias resolution.
2. GET /api/v1/models/:id - Get complete technical profile and physical dimensions.
3. GET /api/v1/compatibility/lookup - Find compatible accessories for a target phone model.
4. POST /api/v1/research/lookup - Query online hardware databases when model has no local pairings.
5. POST /api/v1/admin/compatibility-pairs - Save verified in-store physical test pairings.`
  },
  {
    id: 'sec',
    title: 'Security & RLS Policies',
    filename: 'docs/SECURITY.md',
    icon: Shield,
    description: 'Authentication boundaries, Row-Level Security, and input sanitization.',
    content: `# CaseScreenChecker Security Architecture

## 1. Authentication & Authorization Boundaries
- Public / Retail Staff: Read-only access to phone models, specifications, compatibility lookup, and tolerance diffs.
- Store Administrator: Write access to create/update phone models, verify compatibility relationships, and manage store user accounts.

## 2. Row-Level Security (RLS) Rules
- phone_models: SELECT allowed to public. INSERT/UPDATE restricted to admin role.
- model_compatibility_pairs: SELECT public. Verification restricted to authenticated staff.

## 3. External Research Defense
- External web content is parsed with strict sanitization to prevent prompt injection and unauthorized script execution.`
  },
  {
    id: 'dec',
    title: 'Architecture Decision Records',
    filename: 'docs/DECISIONS.md',
    icon: GitBranch,
    description: 'ADR 001 to ADR 004 recording major architectural choices.',
    content: `# Architecture Decision Records (ADRs)

## ADR 001: Separation of Compatibility Reference from Inventory Tracking
- Decision: Build Phase 1 as an authoritative compatibility knowledge base without hard SKU requirements, with future relational hooks for inventory.

## ADR 002: Multi-Factor Physical Tolerance Engine Over Fuzzy String Matching
- Decision: Implement a physics and geometry evaluation engine (chassis mm tolerance, screen curvature, notch/punch hole, camera island bounds).

## ADR 003: Single Language Mandate (English)
- Decision: Standardize 100% on English across codebase, schemas, documentation, and UI.

## ADR 004: Supabase / PostgreSQL Target with Local Fallback Engine
- Decision: High-fidelity local database with production Supabase bindings.`
  },
  {
    id: 'deploy',
    title: 'Hostinger VPS Deployment Guide',
    filename: 'docs/DEPLOYMENT_HOSTINGER.md',
    icon: FileText,
    description: 'Step-by-step GitHub to Hostinger VPS deployment with PM2 & Docker.',
    content: `# Hostinger VPS Deployment Guide

## 1. Fast Deploy with PM2 & Node.js 20
\`\`\`bash
# 1. Clone repository to /root/CaseScreenChecker
cd /root
git clone https://github.com/<YOUR_USER>/<REPO>.git CaseScreenChecker
cd CaseScreenChecker

# 2. Install dependencies & build
npm ci
npm run build

# 3. Start Production Server with PM2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
\`\`\`

## 2. Nginx Reverse Proxy
\`\`\`bash
sudo cp nginx.conf /etc/nginx/sites-available/casescreenchecker
sudo ln -s /etc/nginx/sites-available/casescreenchecker /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
\`\`\`

## 3. Free SSL with Certbot
\`\`\`bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
\`\`\`

## 4. Docker Alternative
\`\`\`bash
docker-compose up -d --build
\`\`\``
  }
];

export const ArchitectureDocsViewer: React.FC = () => {
  const [selectedDocId, setSelectedDocId] = useState<string>('arch');
  const activeDoc = DOCS_LIST.find(d => d.id === selectedDocId) || DOCS_LIST[0];

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              Architecture & Foundation Specifications
            </h3>
            <p className="text-xs text-neutral-400">
              Authoritative documentation generated in the <span className="text-blue-400 font-mono">docs/</span> directory
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          {DOCS_LIST.map((doc) => {
            const Icon = doc.icon;
            const isSelected = selectedDocId === doc.id;
            return (
              <button
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 text-neutral-100 shadow-md'
                    : 'bg-neutral-950/70 border-neutral-800 text-neutral-400 hover:bg-neutral-800/80 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs mb-1 text-neutral-200">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-400' : 'text-neutral-500'}`} />
                  <span>{doc.title}</span>
                </div>
                <p className="text-[11px] text-neutral-500 font-mono">
                  {doc.filename}
                </p>
              </button>
            );
          })}
        </div>

        {/* Content Viewer */}
        <div className="lg:col-span-3 bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-inner">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800 font-mono text-xs text-neutral-400">
            <span className="text-blue-400 font-semibold">{activeDoc.filename}</span>
            <span>Markdown Specification</span>
          </div>

          <pre className="text-xs font-mono text-neutral-300 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[500px] scrollbar-thin">
            {activeDoc.content}
          </pre>
        </div>
      </div>
    </div>
  );
};
