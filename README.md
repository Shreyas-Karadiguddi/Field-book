# Fieldbook

Field Client Management CRM. See [CLAUDE.md](CLAUDE.md) for full architecture and conventions.

> **Keep this file current.** Whenever local dev setup, environment variables, the build process,
> or the Railway deployment workflow change, update the relevant section below in the same change.
> This file is the single source of truth for "how do I run this" and "how do I ship this" — don't
> let it drift.

## Structure

- `client/` — Vite + React frontend (MUI, Zustand, React Query, React Router)
- `server/` — NestJS + Fastify backend (Auth, Users, Clients, Visits, Reports modules), Prisma ORM
- `docs/design-proposal.pdf` — original design doc (7 screens, 3 roles)
- `package.json` (root) — orchestrates the production build/start Railway actually runs

## Requirements

- Node.js >= 20.19
- A local PostgreSQL + PostGIS instance for development (production uses Railway's managed Postgres)

## Local development

Frontend and backend run as two separate dev servers locally, talking to your **own local**
database — this never touches production data.

```bash
# Backend
cd server
npm install
cp .env.example .env          # fill in DATABASE_URL for your local Postgres+PostGIS instance
npx prisma generate
npx prisma db push            # sync schema to your local DB
npm run start:dev             # http://localhost:4000/api (nodemon, hot reload)

# Frontend
cd client
npm install
npm run dev                   # http://localhost:5173 (Vite, hot reload)
```

`server/.env` is git-ignored and is only ever read by commands you run locally — it has no effect
on the deployed app (see [Environment configuration](#environment-configuration) below).

## Building for production

The **root** `package.json` (not `server/package.json` or `client/package.json` directly) defines
the exact build/start Railway runs:

```bash
npm run build   # npm --prefix client install && build, then npm --prefix server install && build
npm run start   # cd server && prisma db push --accept-data-loss && npm run start:prod
```

- `build` produces `client/dist` (static assets) and `server/dist` (compiled Nest app via Babel).
- `start` pushes the current Prisma schema to whatever `DATABASE_URL` is in the environment, then
  boots the compiled server, which serves **both** `/api/*` and the static `client/dist` bundle
  from one process (`ServeStaticModule` in `server/src/app.module.js`).

⚠️ `start` uses `prisma db push --accept-data-loss`. Never run `npm start` locally against a
`DATABASE_URL` you care about unless you mean it.

## Environment configuration

There are two env files in `server/`, and neither requires you to hand-edit connection strings
when switching contexts:

| File | Used by | Contains |
|---|---|---|
| `server/.env` | `start:dev`, `build`, `start` — every command by default | Your local Postgres URL + local JWT secrets |
| `server/.env.production` (git-ignored, not committed) | Only when explicitly invoked via `npm run env:prod --` | Railway's **public** Postgres proxy URL + prod JWT secrets |

Default commands never touch production — they always read `server/.env`. To run something
against the real production database from your machine, prefix it:

```bash
cd server
npm run env:prod -- npx prisma studio       # browse prod data
npm run env:prod -- npx prisma db pull      # inspect prod schema
npm run env:prod -- node dist/main.js       # run the compiled server locally against prod DB
```

This works via `dotenv-cli`: `npm run env:prod -- <command>` loads `.env.production` into the
process before running `<command>`, without editing any file. If you're setting this up fresh
(new machine, new teammate), copy `server/.env.production.example` to `server/.env.production`
and fill in the values from `railway variables --service Postgres-dndY --kv` (use
`DATABASE_PUBLIC_URL`, not `DATABASE_URL` — the latter is Railway's internal hostname and only
resolves inside Railway's network).

**On Railway itself**, `DATABASE_URL` and the JWT secrets are injected directly by the platform
as service variables — there is no `.env` file on Railway at all (both `.env` and `.env.*` are
git-ignored and excluded from `railway up` uploads), so production always uses Railway's own
variables automatically.

## Deployment (Railway)

### Topology

Production is **one Railway service** (`fieldbook-app`) — there is no separate frontend host.
The NestJS server serves the compiled React build as static files alongside the API, all from a
single process. The database is a Railway-managed Postgres add-on (`Postgres-dndY`), not Neon.

- Live URL: `https://fieldbook-app-production-05e9.up.railway.app`
- Project: `fieldbook` (workspace: shreyas-karadiguddi's Projects)

### Does `git push` deploy?

**No.** This project is currently deployed via CLI upload (`railway up`), not GitHub
auto-deploy — there's no `railway.json`/`.railway/` config committed and no webhook wired up.
Pushing to GitHub only updates version history; it has **no effect on the live app** until
someone runs `railway up`. If you want push-to-deploy, connect the repo from the Railway
dashboard (Service → Settings → Source), or via CLI:

```bash
railway service source connect --repo <owner>/<repo> --branch master --service fieldbook-app
```

### Deploying

```bash
railway up                       # build + deploy the current local directory to the linked service
railway up --detach              # start the deploy and return immediately (don't stream logs)
railway logs --build              # watch the build as it happens
railway status                    # check current deployment state / URL / health
```

### Railway CLI reference

| Command | What it does |
|---|---|
| `railway login` / `railway whoami` | Authenticate / check current session |
| `railway link` | Link this directory to a Railway project (already done on this machine) |
| `railway up` | Upload current directory and deploy — the main "ship it" command |
| `railway status` | Current deployment state, URL, linked DB |
| `railway logs` / `railway logs --build` / `railway logs --http` | Stream deploy, build, or HTTP request logs |
| `railway deployment list` | History of deployments with IDs and status |
| `railway redeploy` | Re-run the **last** deployment (same code, fresh build) — no new upload |
| `railway restart` | Restart the running instance without rebuilding |
| `railway down` | Remove the most recent deployment (rollback to the one before it) |
| `railway variable` (`vars`) | List/set env vars on a service |
| `railway connect Postgres-dndY` | Open a `psql` shell to the production database |
| `railway open` | Open the project dashboard in a browser |
| `railway delete` | Delete the **entire project** — destructive, dashboard is safer for anything narrower than "the whole project" |

There is no CLI command to remove a single service — that's a dashboard-only action
(`railway open` → service → Settings → Delete Service).

## Notes on the JS-only NestJS setup

This backend is plain JavaScript (no TypeScript), compiled via Babel with the legacy decorator
transform. Babel's legacy decorators do **not** support parameter decorators (`@Body()` etc. on
method arguments) — see `server/src/common/bind-params.js`, which applies Nest's parameter
decorators imperatively (the same thing TypeScript's compiler does under the hood) instead of
using `@` syntax on parameters.
