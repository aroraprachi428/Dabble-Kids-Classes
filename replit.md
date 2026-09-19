# Dabble

Dabble helps Bangalore parents find vetted coaches and classes for their children and book a trial.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Bookings currently live in API server memory and reset when the server restarts.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/dabble-mobile` — primary native Expo app for parents
- `artifacts/dabble` — earlier React/Vite companion prototype
- `artifacts/api-server/src/lib/dabble-data.ts` — placeholder coach catalog and in-memory bookings
- `artifacts/api-server/src/routes` — coach discovery and booking API routes
- `lib/api-spec/openapi.yaml` — API contract and generated frontend hooks

## Architecture decisions

- The 41-offer Bangalore catalog comes from the supplied seed JSON and preserves its `exp-*` IDs for API, ranking, and booking flows.
- Trial bookings are intentionally stored in memory for the MVP.
- Recommendations prefer `ANTHROPIC_API_KEY`, fall back to `OPENAI_API_KEY`, then use validated deterministic local ranking if neither provider is available or an AI response fails.

## Product

- Free-text class discovery with editable intent filters
- Ranked, vetted coach listings and detailed profiles
- Trial slot selection, checkout fee breakdown, and booking confirmation
- Native Expo navigation, haptics, safe-area handling, and keyboard-aware checkout
- Natural-language recommendations with parsed, editable intent chips and ranked match reasons

## User preferences

- Warm, friendly, trustworthy parent-focused design
- Coral or amber primary with calm teal secondary, rounded corners, generous spacing, soft shadows
- Mobile-first with excellent support at 390px
- Every async list view needs loading, empty, and error states

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
