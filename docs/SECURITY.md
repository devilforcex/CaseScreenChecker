# CaseScreenChecker Security Architecture

## 1. Authentication & Authorization Boundaries

1. **Role-Based Access Control (RBAC)**:
   - **Public / Retail Staff**: Read-only access to phone models, specifications, compatibility lookup, tolerance diffs, and evidence sources.
   - **Store Administrator**: Write access to create/update phone models, verify compatibility relationships, manage evidence sources, and manage store user accounts.

2. **Row-Level Security (RLS) Rules**:
   - `phone_models`: `SELECT` allowed to `anon` and `authenticated`. `INSERT/UPDATE/DELETE` restricted to `admin` role.
   - `model_compatibility_pairs`: `SELECT` allowed to all. `INSERT/UPDATE` restricted to `admin` role or staff with verification privileges.
   - `compatibility_evidence`: `SELECT` public, modifications restricted to `admin`.

3. **External Research & Prompt Injection Defense**:
   - Web content retrieved by the research engine is treated strictly as untrusted raw text data.
   - External HTML/text is parsed with strict sanitization (removing executable scripts, tags, and hidden prompt overrides).
   - Inferred compatibility suggestions must never execute elevated DB commands or bypass verification flags.

4. **Secret Management**:
   - Supabase `service_role` keys and third-party API credentials remain strictly server-side.
   - Only `NEXT_PUBLIC_` / `VITE_SUPABASE_ANON_KEY` is exposed to the browser.
