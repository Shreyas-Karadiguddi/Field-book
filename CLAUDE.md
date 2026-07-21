# Fieldbook — Field Client Management CRM

## What this is
A CRM for field sales executives who visit shops/businesses in person. Executives log visits with photos, GPS, notes, and deal stages. Managers see pipeline, follow-ups, and area coverage. Built for retail, F&B, clubs, and industrial accounts in India.

## Tech stack (all JavaScript, no TypeScript)
- **Frontend:** React + Vite, MUI (Material UI) for components/theming, Zustand (state), React Router v6, React Query (polling, no WebSockets), Recharts (charts), Leaflet + OpenStreetMap (maps, free), React Hook Form + Zod (validation)
- **Backend:** NestJS + Fastify (not Express, not Next.js), Prisma ORM, JWT + bcrypt (auth), Sharp (photo compression)
- **Database:** PostgreSQL + PostGIS (single database, stores everything including photos as BYTEA)
- **Deploy:** Single Railway service (`fieldbook-app`) serving both frontend and backend, with Railway's own managed Postgres (not Neon). No Docker. See [README.md](README.md) for local dev setup, the prod build, environment configuration, and the full Railway CLI workflow — that file is the source of truth for "how do I run/ship this," kept current on purpose.

## Architecture — three layers, nothing else
```
Browser (React) → REST API + JWT → NestJS → Prisma → PostgreSQL
```
No Redis, no S3, no Bull/BullMQ, no Nginx, no rate limiting, no Socket.io. Max 5 concurrent users — keep it simple.

## Backend modules
Five NestJS modules: `AuthModule`, `UsersModule`, `ClientsModule`, `VisitsModule`, `ReportsModule`. Each has its own controllers, services, and DTOs.

## Roles (RBAC via NestJS guards)
- **Executive:** logs visits, manages own clients, sees own pipeline + follow-ups
- **Manager:** sees team data, area coverage, reports, leaderboard
- **Admin:** user management, org settings, full access

## Database (Prisma schema)
Five tables: `users`, `clients`, `visits`, `follow_ups`, `products_discussed`.
- Photos stored as `Bytes` (BYTEA) — Sharp compresses to ~200KB before saving
- GPS stored as `Float` lat/lng columns. For proximity queries use `prisma.$queryRaw` with PostGIS `ST_DWithin`
- Competitor stack stored as `Json` array on clients (e.g. `["Tally Prime", "Marg ERP"]`)
- Deal stages: `lead`, `hot`, `won`, `lost` (Prisma enum)

## Key patterns
- **Data fetching:** React Query with 30-second polling interval (replaces WebSockets)
- **Photo upload:** Browser sends photo in form POST → Sharp compresses → Prisma saves as BYTEA
- **GPS capture:** Browser Geolocation API → lat/lng sent with visit form
- **Follow-ups:** Executives see them on dashboard (overdue, today, upcoming). No push notifications in phase 1.
- **Auth:** Email + password only. JWT access tokens (15min) + refresh tokens (7d, HTTP-only cookie). No SSO in phase 1.
- **PostGIS queries:** Use raw SQL via `prisma.$queryRaw` for geo operations (nearby shops, area coverage). All other queries use normal Prisma client.

## Commands
```bash
# Frontend
cd client && npm run dev        # Vite dev server
cd client && npm run build      # Production build

# Backend
cd server && npm run start:dev  # NestJS dev with hot reload
cd server && npx prisma migrate dev  # Run migrations
cd server && npx prisma studio  # Visual DB browser

# Database
npx prisma db push              # Push schema to DB (dev only)
npx prisma generate             # Regenerate Prisma client
```

## Conventions
- JavaScript only (ES modules), no TypeScript
- File naming: kebab-case (`visit-controller.js`)
- Use `class-validator` for DTO validation on backend
- API routes: `/api/auth/*`, `/api/users/*` (admin-only), `/api/clients/*`, `/api/visits/*`, `/api/reports/*`
- All API responses follow `{ success: true, data: ... }` or `{ success: false, error: "..." }`
- Use Prettier for formatting, ESLint with recommended config
- **Docs stay in sync:** any change to local dev setup, environment variables, the build process, or the Railway deployment workflow must update the matching section in [README.md](README.md) in the same change — don't let it drift.

## Phase 2 (not now)
React Native (Android) + offline sync (Android only) + SSO (Google/Microsoft) + SMS/WhatsApp notifications + voice notes + GST validation + migrate photos to S3/R2

## Design reference
The original design doc is at `docs/design-proposal.pdf` — 7 screens covering login, executive dashboard, visit form, client detail, area map, manager reports, and mobile companion.
