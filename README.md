# DoorStep-Mobile

![Frontend CI](https://github.com/ramiabdu/DoorStep-Mobile/actions/workflows/frontend-ci.yml/badge.svg)
![Backend CI](https://github.com/ramiabdu/DoorStep-Mobile/actions/workflows/backend-ci.yml/badge.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20Express%20%2B%20PostgreSQL-6C47FF)

DoorStep-Mobile is a production-style multi-vendor delivery platform for food, grocery, and convenience ordering. It is built as a scalable React + TypeScript + Vite frontend with a Node.js + Express + TypeScript backend, JWT authentication, Zod validation, OpenAPI documentation, and PostgreSQL-ready persistence.

The product direction is inspired by modern delivery marketplaces such as Getir, Uber Eats, Deliveroo, Talabat, and Instacart: polished customer discovery, realistic store and product data, secure checkout, order tracking, and an operations-focused admin dashboard.

## Product Highlights

- Multi-vendor marketplace with restaurants, supermarkets, and product catalog browsing.
- Premium home page with hero search, delivery promise cards, categories, offers, featured stores, flash deals, recommendations, active order preview, and floating cart.
- Customer flows for auth, cart, checkout, order success, live tracking, order history, favorites, offers, notifications, profile, addresses, payments, and settings.
- Admin control center for overview metrics, stores, products, orders, users, and analytics.
- Backend REST APIs for auth, stores, restaurants, products, categories, cart, orders, addresses, payments, reviews, coupons, notifications, users, analytics, driver, and admin workflows.
- PostgreSQL schema with relationships, indexes, seed data, carts, orders, reviews, notifications, payments, and coupons.
- Strict TypeScript, ESLint, Vitest/Supertest API tests, Docker support, and Swagger UI.

## Architecture

```mermaid
flowchart LR
  Browser["React + Vite frontend"] --> API["Express TypeScript API"]
  API --> Auth["JWT auth + role middleware"]
  API --> Validation["Zod validation + error handler"]
  API --> Repository["Repository abstraction"]
  Repository --> Memory["In-memory demo data"]
  Repository --> PostgreSQL["PostgreSQL schema"]
  API --> Docs["OpenAPI / Swagger"]
```

## Tech Stack

- Frontend: React, TypeScript, Vite, React Router, Lucide icons, responsive CSS design system.
- Backend: Node.js, Express, TypeScript, JWT, bcrypt, Zod, pino logging, Swagger UI.
- Database: PostgreSQL schema and seed data, with an in-memory demo repository for instant local runs.
- Quality: ESLint, strict TypeScript, Vitest, Supertest.
- DevOps: Docker, docker-compose, Render blueprint, Vercel config.

## Quick Start

Install dependencies once from the repository root:

```bash
npm install
```

Run the API with in-memory demo data:

```bash
npm run dev:api
```

Run the frontend:

```bash
npm run dev:web
```

Open:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:4000/health`
- Swagger docs: `http://localhost:4000/api/docs`

## PostgreSQL / Docker

For the full PostgreSQL stack:

```bash
cp .env.example .env
npm run dev
```

The Docker workflow starts PostgreSQL, seeds `backend/src/db/schema.sql`, runs the backend on `http://localhost:4000`, and serves the frontend on `http://localhost:5173`.

To run PostgreSQL manually:

```bash
cd backend
DATA_DRIVER=postgres DATABASE_URL=postgresql://doorstep:doorstep@localhost:5432/doorstep npm run db:schema
DATA_DRIVER=postgres DATABASE_URL=postgresql://doorstep:doorstep@localhost:5432/doorstep npm run dev
```

## Demo Accounts

All demo accounts use:

```text
Doorstep123!
```

| Role | Email |
| --- | --- |
| Customer | `customer@doorstep.dev` |
| Driver | `driver@doorstep.dev` |
| Admin | `admin@doorstep.dev` |

## Environment Variables

Backend:

```bash
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://doorstep:doorstep@localhost:5432/doorstep
JWT_SECRET=replace-with-a-long-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
DATA_DRIVER=memory
LOG_LEVEL=info
```

Frontend:

```bash
VITE_DOORSTEP_API_URL=http://localhost:4000
```

Use `DATA_DRIVER=postgres` when a PostgreSQL database is available.

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
  backend/
    src/config/          Environment and OpenAPI configuration
    src/db/              PostgreSQL schema
    src/middleware/      Auth, validation, logging, error handling
    src/modules/         Auth, stores, products, cart, orders, admin, and more
    src/repositories/    Memory and PostgreSQL repository implementations
    src/shared/          Marketplace seed data
  frontend/
    src/components/      UI, layout, product, store, cart, order, admin components
    src/pages/           Auth, customer, admin, driver, health pages
    src/hooks/           Reusable data hooks
    src/state/           Auth and cart context
    src/api/             Typed API client
    src/utils/           Formatting utilities
  docs/
```

## Documentation

- [API Reference](./docs/API.md)
- [Architecture Notes](./docs/ARCHITECTURE.md)
- [Operations Guide](./docs/OPERATIONS.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Security](./SECURITY.md)
