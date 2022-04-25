# DoorStep Deployment Guide

This guide covers the production deployment shape for the DoorStep full-stack project: a Node.js API on Render and a Vite React frontend on Vercel or Netlify.

## Architecture Overview

```text
Browser / Mobile Client
        |
        | HTTPS
        v
Vercel or Netlify frontend
        |
        | VITE_DOORSTEP_API_URL
        v
Render API: https://doorstep-mobile.onrender.com
        |
        v
JSON persistence file for prototype data
```

Project areas:

- `backend/`: Node.js HTTP API, services, routing, CORS, auth, catalog, orders, and integration tests.
- `frontend/`: React + TypeScript + Vite web dashboard for the live demo.
- `src/`: React Native mobile client.
- `android/` and `ios/`: native React Native projects.
- `.github/workflows/`: CI checks for backend and frontend.

There are no shared package workspaces yet. Shared contracts are intentionally small and documented through `/docs` on the API.

## Backend Deployment On Render

Create a new Render Web Service from this repository.

Recommended settings:

```text
Environment: Node
Build Command: echo "No backend build required"
Start Command: node backend/src/server.js
Health Check Path: /health
```

Required environment variables:

```text
NODE_ENV=production
PORT=10000
HOST=0.0.0.0
PUBLIC_BASE_URL=https://doorstep-mobile.onrender.com
CORS_ORIGINS=https://doorstep-mobile.vercel.app,https://doorstep-mobile.netlify.app
DEMO_OTP_ENABLED=true
```

Optional environment variables:

```text
DOORSTEP_DATA_FILE=/tmp/doorstep-db.json
OTP_TTL_MS=300000
SESSION_TTL_MS=604800000
```

For a real production system, replace JSON file persistence with a managed database. Render ephemeral files can reset between deploys.

## Frontend Deployment

The frontend is in `frontend/` and uses:

```text
VITE_DOORSTEP_API_URL=https://doorstep-mobile.onrender.com
```

Vercel can deploy from the repository root using `vercel.json`.

Netlify can deploy from the `frontend/` directory using `frontend/netlify.toml`.

See [FRONTEND_DEPLOYMENT.md](./FRONTEND_DEPLOYMENT.md) for exact frontend steps.

## Local Setup

Backend:

```bash
node backend/src/server.js
```

Backend test:

```bash
node --test backend/test/*.test.js
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Root Vercel build parity:

```bash
npm run build
```

Mobile:

```bash
yarn install
yarn start
yarn ios
```

The current desktop environment used for this update has `node` available but not `npm` or `yarn`, so dependency installation and the Vite build must run in CI or a normal Node toolchain.

## API Documentation

Production API docs:

```text
https://doorstep-mobile.onrender.com/docs
```

Health check:

```text
https://doorstep-mobile.onrender.com/health
```

Auth-protected routes use:

```text
Authorization: Bearer <token>
```

## CORS

The API reads allowed origins from `CORS_ORIGINS`.

Use comma-separated frontend origins:

```text
CORS_ORIGINS=https://doorstep-mobile.vercel.app,https://doorstep-mobile.netlify.app
```

For quick prototype testing only:

```text
CORS_ORIGINS=*
```

## Deployment Verification

After backend deploy:

```bash
curl https://doorstep-mobile.onrender.com/health
curl https://doorstep-mobile.onrender.com/docs
```

After frontend deploy:

```bash
cd frontend
npm run config:check
npm run typecheck
npm run build
```

GitHub Actions also runs frontend lint, typecheck, build, and backend integration tests on pushes and pull requests.

## Production Gaps

The current implementation is portfolio-grade and deployable, but a real commercial deployment should add:

- Managed database
- Real SMS or email OTP delivery
- Payment provider integration
- Structured logging and tracing
- Secrets manager
- Rate limiting
- Persistent session storage
- Admin and courier operations surfaces
