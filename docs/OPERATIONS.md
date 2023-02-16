# Operations Runbook

## Release Checklist

- Frontend CI passes.
- Backend CI passes.
- `VITE_DOORSTEP_API_URL` points to the production backend.
- `CORS_ORIGIN` points to the production frontend.
- PostgreSQL schema has been applied.
- `/health` returns `status: ok`.
- `/api/docs` opens successfully.

## Incident Checks

1. Check Render service logs.
2. Check Vercel deployment logs.
3. Verify `DATABASE_URL` connectivity.
4. Verify `JWT_SECRET` is present.
5. Verify CORS includes the current frontend domain.

## Database Bootstrap

```bash
cd backend
npm run db:schema
```

## Useful URLs

- Backend health: `/health`
- Swagger UI: `/api/docs`
- OpenAPI JSON: `/api/openapi.json`
