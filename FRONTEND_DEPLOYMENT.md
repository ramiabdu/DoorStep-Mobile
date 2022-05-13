# DoorStep Frontend Deployment

The live web demo is a React + TypeScript + Vite app in `frontend/`.

## Frontend Location

```text
frontend/
|-- index.html
|-- package.json
|-- vite.config.ts
|-- src/
|   |-- api.ts
|   |-- main.tsx
|   `-- styles.css
`-- netlify.toml
```

This is the production web frontend. The React Native app remains in `src/` for mobile.

## Environment Variables

Required:

```text
VITE_DOORSTEP_API_URL=https://doorstep-mobile.onrender.com
```

Local example:

```bash
cd frontend
cp .env.example .env.local
```

The committed production default also points to Render, so the build does not rely on localhost.

## Local Development

```bash
cd frontend
npm install
npm run dev
```

The dev server defaults to:

```text
http://localhost:5173
```

## Local Production Build

```bash
cd frontend
npm run config:check
npm run lint
npm run typecheck
npm run build
npm run preview
```

## Deploy To Vercel

Use the repository root as the Vercel project root. The root `vercel.json` already defines:

```text
Framework: Vite
Install Command: npm --prefix frontend install
Build Command: npm --prefix frontend run build
Output Directory: frontend/dist
SPA fallback: /(.*) -> /index.html
```

Add this Vercel environment variable:

```text
VITE_DOORSTEP_API_URL=https://doorstep-mobile.onrender.com
```

Expected frontend URL:

```text
https://doorstep-mobile.vercel.app
```

## Deploy To GitHub Pages

The repository includes `.github/workflows/pages.yml`, which deploys the
frontend automatically after `Frontend CI` succeeds on `main`.

Expected GitHub Pages URL:

```text
https://ramiabdu.github.io/DoorStep-Mobile/
```

## Deploy To Netlify

Recommended Netlify settings:

```text
Base directory: frontend
Build command: npm run build
Publish directory: dist
```

Add this Netlify environment variable:

```text
VITE_DOORSTEP_API_URL=https://doorstep-mobile.onrender.com
```

Expected frontend URL:

```text
https://doorstep-mobile.netlify.app
```

## Frontend Features

- Dashboard with live Render API status
- Login, register, and OTP verification UI
- API health page
- API docs endpoint reader
- Service catalog and partner network
- Mobile responsive design
- Production API URL validation script

## Troubleshooting

If the frontend cannot reach the API:

1. Verify `https://doorstep-mobile.onrender.com/health`.
2. Confirm `VITE_DOORSTEP_API_URL` is set in the hosting platform.
3. Confirm Render has `CORS_ORIGINS` set to the deployed frontend origin.
4. Rebuild and redeploy the frontend after env changes.

If OTP does not appear in the live demo:

1. Set `DEMO_OTP_ENABLED=true` on Render for portfolio demo mode.
2. Restart the Render service.
3. Register again from the frontend.
