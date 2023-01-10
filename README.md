# DoorStep-Mobile

![Frontend CI](https://github.com/ramiabdu/DoorStep-Mobile/actions/workflows/frontend-ci.yml/badge.svg)
![Backend CI](https://github.com/ramiabdu/DoorStep-Mobile/actions/workflows/backend-ci.yml/badge.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20Express%20%2B%20PostgreSQL-0f766e)

DoorStep-Mobile is a production-ready full-stack delivery platform for a senior-level portfolio. It replaces the broken legacy mobile experiment with a clean monorepo, a polished React web app, a TypeScript Express API, PostgreSQL persistence, JWT authentication, role-based workflows, Docker support, CI, and deployment documentation.

## Live Deployment

| Surface | URL |
| --- | --- |
| Frontend Live Demo | https://doorstep-mobile.vercel.app |
| Backend API | https://doorstep-mobile.onrender.com |
| API Docs | https://doorstep-mobile.onrender.com/api/docs |
| Health Check | https://doorstep-mobile.onrender.com/health |

## Screenshots

| Landing | Customer Flow | Admin Operations |
| --- | --- | --- |
| `docs/screenshots/landing.png` | `docs/screenshots/customer-flow.png` | `docs/screenshots/admin-dashboard.png` |

## Architecture

```mermaid
flowchart LR
  Browser["React + Vite frontend"] --> API["Express TypeScript API"]
  API --> Auth["JWT auth + roles"]
  API --> Database["PostgreSQL"]
  API --> Docs["OpenAPI / Swagger"]
  CI["GitHub Actions"] --> Browser
  CI --> API
  Vercel["Vercel"] --> Browser
  Render["Render"] --> API
```

## Tech Stack

- Frontend: React, TypeScript, Vite, React Router, Lucide icons, responsive CSS.
- Backend: Node.js, Express, TypeScript, PostgreSQL, JWT, bcrypt, Zod, Swagger UI.
- DevOps: Docker, docker-compose, GitHub Actions, Render blueprint, Vercel config.
- Quality: ESLint, strict TypeScript, Vitest, Supertest API tests.

## Features

- Customer signup and login with JWT sessions.
- Restaurant catalog and menu pages.
- Cart management and checkout.
- Order tracking lifecycle.
- Driver delivery queue and status updates.
- Admin operations overview and assignable orders.
- Health check and OpenAPI documentation.
- Environment-driven API URLs and CORS.

## Quick Start

```bash
cp .env.example .env
npm install
npm run dev
```

The Docker workflow starts PostgreSQL, the backend API on `http://localhost:4000`, and the frontend preview on `http://localhost:5173`.

For separate local processes:

```bash
cd backend
npm install
npm run db:schema
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

## Demo Accounts

When using the in-memory repository or seeded local setup:

| Role | Email | Password |
| --- | --- | --- |
| Customer | `customer@doorstep.dev` | `Doorstep123!` |
| Driver | `driver@doorstep.dev` | `Doorstep123!` |
| Admin | `admin@doorstep.dev` | `Doorstep123!` |

## Environment Variables

Backend:

```bash
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://user:password@host:5432/db
JWT_SECRET=replace-with-a-long-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://doorstep-mobile.vercel.app
DATA_DRIVER=postgres
LOG_LEVEL=info
```

Frontend:

```bash
VITE_DOORSTEP_API_URL=https://doorstep-mobile.onrender.com
```

## Quality Commands

```bash
npm run lint
npm run typecheck
npm run build
npm run test
```

## Repository Structure

```text
DoorStep-Mobile/
  backend/              Express TypeScript API
  frontend/             React Vite web app
  docs/                 Architecture and API documentation
  .github/workflows/    CI and deployment readiness checks
  docker-compose.yml    Local full-stack environment
  render.yaml           Backend Render blueprint
  vercel.json           Frontend Vercel deployment config
```

## Roadmap

- Add Stripe checkout.
- Add WebSocket delivery updates.
- Add restaurant partner dashboard.
- Add database migrations with a dedicated migration runner.
- Add E2E tests with Playwright.

## Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [Architecture Notes](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Contributing](./CONTRIBUTING.md)
- [Security](./SECURITY.md)
