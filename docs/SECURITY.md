# CaseScreenChecker Security Architecture

## 1. Authentication & Authorization Boundaries

1. **Role-Based Access Control (RBAC)**:
   - **Public / Retail Staff**: Read-only access to phone models, specifications, compatibility lookup, tolerance diffs, and evidence sources.
   - **Store Administrator**: Write access to create/update phone models, verify compatibility relationships, manage evidence sources, and manage store user accounts.

2. **Row-Level Security (RLS) Rules**:
   - `phone_models`: `SELECT` allowed to `anon` and `authenticated`; staff can insert/update, while only `admin` can delete.
   - `compatibility_relationships`: anonymous users see only `verified`; staff can submit candidates, while only `admin` can publish/reject/delete.
   - `compatibility_evidence`: public reads are limited to evidence attached to verified relationships; staff can add/update and only `admin` can delete.

3. **External Research & Prompt Injection Defense**:
   - Web content retrieved by the research engine is treated strictly as untrusted raw text data.
   - External HTML/text is parsed with strict sanitization (removing executable scripts, tags, and hidden prompt overrides).
   - Inferred compatibility suggestions must never execute elevated DB commands or bypass verification flags.

4. **Secret Management**:
   - Supabase `service_role` keys and third-party API credentials remain strictly server-side.
   - Only `NEXT_PUBLIC_` / `VITE_SUPABASE_ANON_KEY` is exposed to the browser.

## 5. Production hardening status

The schema hardening migrations `harden_public_api_20260822`,
`revoke_legacy_function_grants_20260822`, and
`isolate_role_lookup_20260822` are applied to the live project. Role lookup is
now kept outside the exposed `public` schema, and legacy RPC grants are
revoked. The remaining Supabase security advisor warning is the Auth dashboard
setting **Leaked Password Protection**; enable it under Authentication →
Password Security.
