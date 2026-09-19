# Automated P0/P1 coverage

Run `npm test` from the repository root. It delegates to the API server's
lightweight Node test runner through pnpm and never calls Gemini, Razorpay, or
any production service.

| Feature | Automated cases | State |
| --- | --- | --- |
| Catalog/fixture integrity | Every fixture experience exists; amount, 10% fee, and coach earning arithmetic; catalog age ranges and session formats | PASS |
| Recommendations (`/api/recommend`) | Response shape, valid unique catalog IDs, 5–8 results, age-safe results, deterministic keyword fallback, provider failure fallback | PASS (existing `recommendations.test.ts`) |
| Planner (`/api/plan`) | Deterministic age-safe, distinct-category, budget-constrained planner including age 3 catalog coverage | PASS (route + HTTP integration) |
| Booking/payment | Deterministic multi-seat pricing and unique booking-path assertion; valid/tampered HMAC signature contract | PASS (HTTP order/verify integration with mocked provider) |
| Authentication and role routing | Seeded parent/coach/employee login, `/auth/me`, and role guards | PASS (HTTP integration) |
| Dashboards | Paid-only coach earnings, GMV, revenue, pending exclusion and conversion inputs | PASS (HTTP integration against fixture) |
| Parent ownership | Demo booking ownership is exactly the three parent fixture rows | PASS (HTTP integration) |

The integration suite starts the exported Express app in-process, uses serial
local `node:http` calls, and cleans only dynamically created users, sessions,
and `DBL-IT-*` bookings in an `after` hook.