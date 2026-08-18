# Architecture Decision Records (ADRs)

## ADR 001: Separation of Compatibility Reference from Inventory Tracking
- **Status**: Accepted
- **Context**: The retail store requires an immediate solution for checking cross-model case and screen protector fits, but does not currently have SKU-level sync with physical POS software.
- **Decision**: Build Phase 1 as an authoritative compatibility knowledge base without hard SKU requirements, but design schemas with relational hooks for future inventory integration.

## ADR 002: Multi-Factor Physical Tolerance Engine Over Fuzzy String Matching
- **Status**: Accepted
- **Context**: Relying on phone model name similarity fails catastrophically in hardware (e.g., iPhone 13 vs iPhone 13 Pro cases do not fit due to camera island size; Galaxy A14 4G vs 5G differ in thickness).
- **Decision**: Implement a physics and geometry evaluation engine (chassis mm tolerance, screen curvature, notch/punch hole, camera island bounds).

## ADR 003: Single Language Mandate (English)
- **Status**: Accepted
- **Context**: Keeping the codebase, schemas, API contracts, documentation, and interface standardized in English avoids translation fragmentation and localization overhead in Phase 1.
- **Decision**: Standardize 100% on English.

## ADR 004: Supabase / PostgreSQL Target with Local Fallback Engine
- **Status**: Accepted
- **Context**: Allows fast zero-config local prototyping while providing a production path to Supabase Postgres, RLS, and Auth.
- **Decision**: Structure data services with high-fidelity reference datasets and seamless Supabase client bindings.
