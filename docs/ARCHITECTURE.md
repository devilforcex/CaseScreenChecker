# CaseScreenChecker Architecture

## 1. System Overview

**CaseScreenChecker** is a specialized retail reference web application designed for mobile accessory retail stores. Its primary objective is solving the *accessory stock-out dilemma*: when a customer requests a screen protector or phone case for a specific smartphone model that is out of stock, store personnel can instantly identify physically compatible alternatives from other smartphone models.

```
+-------------------------------------------------------------------------+
|                              Client Layer                               |
|   +---------------------+   +---------------------+   +---------------+ |
|   |  Retail Search UI   |   | Visual Overlay Tool |   |  Admin Panel  | |
|   +---------------------+   +---------------------+   +---------------+ |
+-------------------------------------------------------------------------+
                                    |
                                    v (REST API / Supabase Client)
+-------------------------------------------------------------------------+
|                             Service Layer                               |
|   +-----------------------------------------------------------------+   |
|   |                    Compatibility Scoring Engine                 |   |
|   |    [Chassis Diffs] [Glass Curvature] [Camera Matrix] [Cutouts]  |   |
|   +-----------------------------------------------------------------+   |
|   |  External Research Pipeline  |   |    Reference Data Service    |   |
|   +------------------------------+   +------------------------------+   |
+-------------------------------------------------------------------------+
                                    |
                                    v (Row-Level Security & Postgres)
+-------------------------------------------------------------------------+
|                             Data Layer                                  |
|   +--------------------+ +--------------------+ +---------------------+ |
|   |    Phone Models    | |   Compatibility    | |   Evidence & Audit  | |
|   | & Detailed Specs   | |   Pairs & Groups   | |      Citations      | |
|   +--------------------+ +--------------------+ +---------------------+ |
+-------------------------------------------------------------------------+
```

## 2. Core Architectural Principles

1. **Physical Reality Over String Matching**: Compatibility is never calculated solely on name similarity (e.g. Galaxy A14 4G and Galaxy A14 5G have distinct chassis thicknesses and button locations). Evaluation requires rigorous physical dimensions, camera cutout bounds, screen curvature, and port placements.
2. **Explicit Confidence & Uncertainty**: The system categorizes relationships into distinct confidence tiers (`EXACT_MATCH`, `CONFIRMED_COMPATIBLE`, `HIGHLY_LIKELY`, `POSSIBLE_WITH_CAUTION`, `NOT_COMPATIBLE`, `UNKNOWN`). Inferred relationships are never presented as confirmed truth.
3. **Local-First with External Fallback**: Queries execute against local verified database records first. If local coverage is absent, the system queries external research adapters while preserving provenance and citation evidence.
4. **Decoupled Inventory Readiness**: While Phase 1 focuses exclusively on accessory compatibility reference data without SKU or stock level requirements, the schema is explicitly structured with foreign key hooks for future POS/ERP inventory integration.
5. **Strict Single Language (English)**: All code, schema, API contracts, UI text, and documentation are strictly authored in English.

## 3. Module Boundaries

### 3.1 Phone Model Registry
Maintains canonical device identities, manufacturer data, model aliases (e.g., `SM-A057F`, `A2894`), regional variants, release dates, and hardware revisions.

### 3.2 Physical Specification Matrix
Stores dimensional data (Height, Width, Thickness in mm), screen attributes (diagonal, aspect ratio, flat vs 2.5D/3D curvature, notch/punch-hole geometry), camera module geometry (shape, offsets, cutout dimensions), button layout, and port locations.

### 3.3 Compatibility Engine
Evaluates pair-wise device compatibility using category-specific algorithms:
- **Screen Protectors**: Focuses on display glass flat active area, corner radii, top bezel speaker slit, and front camera cutout alignment.
- **Phone Cases**: Enforces tight chassis tolerances (<=0.4mm height/width delta for TPU, <=0.2mm for hard shell), camera cluster bounding box envelopment, button reachability, and USB/speaker port clearings.

### 3.4 Evidence & Verification Manager
Stores proof of verification, including staff testing logs, manufacturer specification overlap, teardown reports, and community reports.

### 3.5 External Research Engine
An asynchronous pipeline that searches trusted public hardware specification databases and stores structured evidence candidates pending staff verification.
