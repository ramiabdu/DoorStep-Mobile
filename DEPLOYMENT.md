# Deployment Guide

This project is deployable as two independent production services:

- Backend API on Render.
- Frontend web app on Vercel.

## Local Production Check

```bash
npm install
npm run lint
npm run typecheck
npm run test
npm run build
```

## Backend on Render

Create a new Render Blueprint from `render.yaml`, or configure the service manually.

Exact Render settings:

| Setting | Value |
| --- | --- |
| Service type | Web Service |
| Root directory | `backend` |
| Runtime | Node |
| Build command | `npm install && npm run build` |
| Start command | `npm run start` |
| Health check path | `/health` |
| Node version | `22` |

Environment variables:

```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=<Render PostgreSQL connection string>
JWT_SECRET=<generated secure secret>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://doorstep-mobile.vercel.app
DATA_DRIVER=postgres
LOG_LEVEL=info
```

After the PostgreSQL database is created, run the schema once:

```bash
cd backend
npm run db:schema
```

Render may run this command from a shell using the production `DATABASE_URL`.

## Frontend on Vercel

Exact Vercel settings:

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Root directory | repository root or `frontend` |
| Install command | `npm install` |
| Build command from root | `npm run build --workspace @doorstep/frontend` |
| Output directory from root | `frontend/dist` |
| Build command from frontend root | `npm run build` |
| Output directory from frontend root | `dist` |

Environment variable:

```bash
VITE_DOORSTEP_API_URL=https://doorstep-mobile.onrender.com
```

The root `vercel.json` supports repository-root deployment. The `frontend/vercel.json` supports selecting `frontend` as the Vercel root.

## CORS

Set backend `CORS_ORIGIN` to the deployed frontend URL:

```bash
CORS_ORIGIN=https://doorstep-mobile.vercel.app
```

For multiple origins:

```bash
CORS_ORIGIN=https://doorstep-mobile.vercel.app,http://localhost:5173
```

## Docker Deployment

```bash
cp .env.example .env
docker compose up --build
```

Services:

- PostgreSQL: `localhost:5432`
- Backend: `http://localhost:4000`
- Frontend: `http://localhost:5173`

## Smoke Tests

```bash
curl https://doorstep-mobile.onrender.com/health
curl https://doorstep-mobile.onrender.com/api/openapi.json
```
