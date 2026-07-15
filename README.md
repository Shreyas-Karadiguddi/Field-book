# Fieldbook

Field Client Management CRM. See [CLAUDE.md](CLAUDE.md) for full architecture and conventions.

## Getting started

```bash
# Backend
cd server
npm install
npx prisma generate
npx prisma db push   # needs DATABASE_URL pointed at a real Postgres+PostGIS instance
npm run start:dev    # http://localhost:4000/api

# Frontend
cd client
npm install
npm run dev           # http://localhost:5173
```

Copy `server/.env.example` to `server/.env` and fill in a real `DATABASE_URL` before running migrations.

## Structure

- `client/` — Vite + React frontend (MUI, Zustand, React Query, React Router)
- `server/` — NestJS + Fastify backend (Auth, Clients, Visits, Reports modules), Prisma ORM
- `docs/design-proposal.pdf` — original design doc (7 screens, 3 roles)

## Notes on the JS-only NestJS setup

This backend is plain JavaScript (no TypeScript), compiled via Babel with the legacy decorator
transform. Babel's legacy decorators do **not** support parameter decorators (`@Body()` etc. on
method arguments) — see `server/src/common/bind-params.js`, which applies Nest's parameter
decorators imperatively (the same thing TypeScript's compiler does under the hood) instead of
using `@` syntax on parameters.
