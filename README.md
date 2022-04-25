# DoorStep Full Stack

![React Native](https://img.shields.io/badge/React%20Native-0.67-61dafb)
![React](https://img.shields.io/badge/React-Web%20Demo-177a5b)
![TypeScript](https://img.shields.io/badge/TypeScript-Frontend-3157a4)
![Vite](https://img.shields.io/badge/Vite-Production%20Build-646cff)
![Node.js](https://img.shields.io/badge/Node.js-API-1b7c5e)
![CI](https://img.shields.io/badge/GitHub%20Actions-frontend%20CI-2088ff)
![Status](https://img.shields.io/badge/status-production--ready%20portfolio-1b7c5e)

DoorStep is a production-shaped full-stack doorstep delivery platform. It includes a Node.js API, a React Native mobile client, and a new React + TypeScript + Vite web dashboard for live portfolio demos.

## Live Demo

- Frontend expected URL: `https://doorstep-mobile.vercel.app`
- Backend API: `https://doorstep-mobile.onrender.com`
- API health: `https://doorstep-mobile.onrender.com/health`
- API docs: `https://doorstep-mobile.onrender.com/docs`

## What This Shows

- Full-stack architecture with deployable frontend and backend surfaces
- React + TypeScript + Vite web dashboard for live demo deployment
- React Native mobile app for customer delivery flows
- Node.js API for auth, OTP verification, catalog, quotes, orders, and tracking
- CORS and production API URLs controlled by environment variables
- GitHub Actions for frontend lint, typecheck, build, and backend API tests
- Portfolio-grade documentation for local setup and cloud deployment

## Architecture

```text
frontend/                 React + TypeScript + Vite live demo
backend/                  Node.js API and service layer
src/                      React Native mobile app
android/                  Android native project
ios/                      iOS native project
.github/workflows/        CI checks
DEPLOYMENT.md             Full-stack deployment guide
FRONTEND_DEPLOYMENT.md    Frontend-specific deployment guide
```

Runtime flow:

```text
Vercel or Netlify frontend
        |
        | VITE_DOORSTEP_API_URL
        v
Render API: https://doorstep-mobile.onrender.com
        |
        v
Auth, catalog, quotes, orders, tracking
```

There are no shared packages yet. The API exposes its lightweight contract at `/docs`.

## Frontend

The real production web frontend is in `frontend/`.

Key screens:

- Dashboard
- Login and registration
- OTP verification
- API health
- API docs preview
- Responsive service catalog

Build commands:

```bash
cd frontend
npm install
npm run config:check
npm run lint
npm run typecheck
npm run build
```

## Backend

API endpoints:

```text
GET  /
GET  /docs
GET  /health
POST /auth/register
POST /auth/login
POST /auth/verify-otp
GET  /catalog/home
GET  /catalog/categories
GET  /catalog/partners
POST /orders/quote
POST /orders
GET  /orders
GET  /orders/:id
```

Auth-protected order routes expect:

```text
Authorization: Bearer <token>
```

Backend test:

```bash
node --test backend/test/*.test.js
```

## Environment Variables

Backend:

```text
NODE_ENV=production
PORT=10000
HOST=0.0.0.0
PUBLIC_BASE_URL=https://doorstep-mobile.onrender.com
CORS_ORIGINS=https://doorstep-mobile.vercel.app,https://doorstep-mobile.netlify.app
DEMO_OTP_ENABLED=true
DOORSTEP_DATA_FILE=/tmp/doorstep-db.json
OTP_TTL_MS=300000
SESSION_TTL_MS=604800000
```

Frontend:

```text
VITE_DOORSTEP_API_URL=https://doorstep-mobile.onrender.com
```

## Deployment

- Full-stack guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Frontend guide: [FRONTEND_DEPLOYMENT.md](./FRONTEND_DEPLOYMENT.md)
- Vercel config: [vercel.json](./vercel.json)
- Netlify config: [frontend/netlify.toml](./frontend/netlify.toml)
- CI workflow: [.github/workflows/frontend-ci.yml](./.github/workflows/frontend-ci.yml)

## Screenshots

Place production screenshots here after deployment:

```text
docs/screenshots/dashboard.png
docs/screenshots/auth-flow.png
docs/screenshots/api-health.png
docs/screenshots/mobile-home.png
```

## Tech Stack

- React + TypeScript + Vite
- React Native 0.67
- Node.js HTTP API
- JSON persistence for prototype data
- GitHub Actions
- Vercel or Netlify frontend hosting
- Render backend hosting

## Production Notes

This project is deployable and portfolio-grade, but a commercial production version should replace local JSON persistence with a managed database, add real SMS/email OTP delivery, add payment processing, and introduce structured logging, rate limiting, and managed secrets.

## License

No license has been selected yet.
