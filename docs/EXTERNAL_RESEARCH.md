# External phone research providers

## Current strategy

The research endpoint uses a structured JSON provider first, then falls back
to GSMArena only when the structured provider has no confident match. Results
are validated with Zod, cached for one hour, and never published to the
verified catalog automatically. A staff member must review and save a
candidate.

The structured provider is configured with `PHONE_SPECS_API_BASE` and defaults
to the existing `phone-specs-api` service. The matcher rejects weak results
instead of returning the first unrelated record: a query for `A05s` must share
model tokens with the returned device.

`PHONE_RESEARCH_PROVIDER` controls the server-only selection (`auto` by
default, or `gsmarena` for diagnostics). `mobileapi` is intentionally guarded:
it returns a configuration error until `MOBILEAPI_API_KEY` is present and no
third-party key is ever included in the Vite bundle. Results include a
`providerVersion` and the in-memory cache key includes both provider and
version, preventing stale results from crossing provider changes.

## Recommended upgrade

For a larger production catalog, evaluate **MobileAPI.dev** as a paid,
server-only adapter. Its documentation describes more than 31,500 devices,
fuzzy search/autocomplete, images, and normalized display/camera/body fields.
Keep its API key in Vercel server environment variables and never expose it in
`VITE_` variables. The current structured provider remains the no-key default
so the MVP stays deployable.

| Provider | Strength | Risk | Role |
| --- | --- | --- | --- |
| Structured phone-specs API | JSON, fast, no browser scraping | Coverage depends on dataset | Primary |
| MobileAPI.dev | Larger maintained catalog and autocomplete | Paid key and quota | Recommended production upgrade |
| GSMArena | Broad public coverage and useful source links | HTML changes, rate limits, anti-bot | Last resort |

All external results are provisional evidence. Staff verification remains the
only path to a public `verified` relationship.
