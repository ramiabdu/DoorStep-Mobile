# DoorStep Full Stack

![React Native](https://img.shields.io/badge/React%20Native-0.67-61dafb)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-f7df1e)
![Node.js](https://img.shields.io/badge/Node.js-API-1b7c5e)
![Status](https://img.shields.io/badge/status-full%20stack%20prototype-1b7c5e)

DoorStep is a full stack doorstep delivery prototype. It pairs a React Native customer app with a local Node.js API for account verification, catalog discovery, live delivery quotes, order creation, and customer tracking.

## What This Shows

- React Native screen composition for a mobile-first delivery product
- Customer onboarding with login, registration, and OTP confirmation
- API integration with connected/offline states and fallback catalog data
- Backend routes for health, auth, catalog, quote, order, and tracking flows
- JSON-backed local persistence without requiring external services
- Focused backend integration test coverage with Node's built-in test runner

## Product Scope

Implemented:

- Home/dashboard experience with live API status
- Service catalog and trusted partner cards
- Register, login, and OTP verification flow
- Authenticated quote calculation
- Authenticated order creation
- Active order tracking timeline
- Local Node.js backend with structured services and routing
- Backend integration test for the critical customer flow

Not included yet:

- Real SMS/email provider integration
- Production database
- Payment gateway integration
- Push notifications
- Native navigation library
- App store signing/release workflow

## Architecture

```text
.
|-- App.js
|-- src/
|   |-- DoorStepApp.js
|   |-- api/client.js
|   |-- components/
|   |-- data/fallbackCatalog.js
|   `-- screens/
|-- backend/
|   |-- src/
|   |   |-- server.js
|   |   |-- routes/
|   |   |-- services/
|   |   |-- data/
|   |   `-- lib/
|   `-- test/api.test.js
|-- android/
|-- ios/
`-- __tests__/
```

The mobile app defaults to:

- Android emulator API URL: `http://10.0.2.2:4000`
- iOS simulator API URL: `http://localhost:4000`
- Other runtimes: `http://localhost:4000`

## API Endpoints

```text
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

In development, OTP responses include `debug.otp` so the local mobile app can complete verification without an SMS provider.

## Getting Started

Install dependencies:

```bash
yarn install
```

Start the API:

```bash
yarn server
```

Start Metro in another terminal:

```bash
yarn start
```

Run on Android:

```bash
yarn android
```

Run on iOS:

```bash
yarn ios
```

Run backend tests:

```bash
yarn server:test
```

Run React Native tests:

```bash
yarn test
```

## Backend Configuration

Optional environment variables:

```text
PORT=4000
HOST=0.0.0.0
NODE_ENV=development
DOORSTEP_DATA_FILE=backend/data/db.json
OTP_TTL_MS=300000
SESSION_TTL_MS=604800000
```

The API writes local demo data to `backend/data/db.json`. Delete that file to reset the local database.

## Screenshots

Screenshots are not committed yet. Recommended captures:

- Home dashboard
- Register and OTP flow
- Quote and order creation
- Tracking timeline

## Tech Stack

- React Native 0.67
- React 17
- JavaScript
- Node.js HTTP server
- Node.js built-in test runner
- JSON local persistence
- Jest scaffold for React Native

## Portfolio Note

This repository is still a prototype, but the implementation is intentionally structured like a production seed: clear API boundaries, service-level backend logic, persistent local state, mobile client error states, and a complete customer journey.

## Roadmap

- Replace local JSON storage with Postgres or MongoDB
- Add SMS/email OTP provider
- Add payment authorization and receipt generation
- Add courier/admin operations screens
- Add push notifications and background order refresh
- Add screenshots and a short mobile walkthrough GIF

## Contributing

This is a portfolio prototype. Small fixes should include a short explanation and a working local run path.

## License

No license has been selected yet.
