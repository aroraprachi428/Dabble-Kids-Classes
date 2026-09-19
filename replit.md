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

- `artifacts/dabble` — React/Vite parent experience
- `artifacts/api-server/src/lib/dabble-data.ts` — placeholder coach catalog and in-memory bookings
- `artifacts/api-server/src/routes` — coach discovery and booking API routes
- `lib/api-spec/openapi.yaml` — API contract and generated frontend hooks

## Architecture decisions

- The coach catalog is placeholder data until the supplied JSON catalog replaces it.
- Filtering is deterministic keyword matching for now; the API contract can support later AI intent parsing.
- Trial bookings are intentionally stored in memory for the MVP.

## Product

- Free-text class discovery with editable intent filters
- Ranked, vetted coach listings and detailed profiles
- Trial slot selection, checkout fee breakdown, and booking confirmation

## User preferences

- Warm, friendly, trustworthy parent-focused design
- Coral or amber primary with calm teal secondary, rounded corners, generous spacing, soft shadows
- Mobile-first with excellent support at 390px
- Every async list view needs loading, empty, and error states

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
