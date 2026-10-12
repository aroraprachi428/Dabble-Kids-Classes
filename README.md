# Dabble

Dabble helps Bangalore parents discover vetted coaches and children’s classes, choose a trial slot, and book with confidence.

## Demo video

[Watch or download the Dabble demo](./demo-video.mp4)

The 22.5-second animated showcase covers parent class discovery and trial booking, coach operations, and the operations dashboard.

The MP4 is stored directly in this repository’s root as `demo-video.mp4`, alongside this README. It is a compact, silent H.264 video at 960 × 540 resolution; no separate video repository or folder is needed.

## What’s included

- Parent-first class discovery with editable intent filters
- Ranked coach listings and detailed profiles
- Trial slot selection, checkout, fee breakdown, and booking confirmation
- Seat-aware Razorpay test checkout with signature verification
- Natural-language recommendations and monthly planning
- Role-based experiences for parents, coaches, and Dabble operations
- Native Expo mobile experience for parents
- Animated Dabble project story video

## Project structure

| Package | Purpose |
| --- | --- |
| `artifacts/dabble` | React/Vite web experience |
| `artifacts/dabble-mobile` | Expo mobile experience |
| `artifacts/api-server` | Express API and domain routes |
| `artifacts/dabble-project-video` | Animated product showcase |
| `lib/api-spec` | OpenAPI contract and generated client inputs |

## Requirements

- Node.js 24
- pnpm
- PostgreSQL for database-backed development

Install dependencies from the repository root:

```bash
pnpm install
```

## Run locally

Start the API server:

```bash
pnpm --filter @workspace/api-server run dev
```

Start the web experience:

```bash
pnpm --filter @workspace/dabble run dev
```

Start the mobile experience:

```bash
pnpm --filter @workspace/dabble-mobile run dev
```

Start the project story video:

```bash
pnpm --filter @workspace/dabble-project-video run dev
```

## Checks

Run the complete typecheck and build:

```bash
pnpm run typecheck
pnpm run build
```

Run the automated API tests:

```bash
pnpm test
```

See [`TESTS.md`](./TESTS.md) for the current P0/P1 coverage.

## Product notes

- The Bangalore coach catalog is seeded from the supplied fixture data.
- User accounts and booking records are stored in PostgreSQL. Some temporary checkout state remains in API memory, so interrupted payments may need additional recovery handling after a restart.
- Recommendations use a validated deterministic ranking path when an AI provider is unavailable.
- Payment pricing is calculated on the server: coach fee is class price multiplied by seats, and the Dabble fee is 10%.
- Keep credentials such as payment-provider keys and session secrets in environment variables or Replit Secrets; never commit them to the repository.
