# Security Policy

## Supported Version

The current supported version is `1.x`.

## Reporting a Vulnerability

Open a private security advisory or contact the maintainer directly. Do not publish exploit details in a public issue.

## Security Controls

- Passwords are hashed with bcrypt.
- JWT tokens are signed with `JWT_SECRET`.
- Role-based middleware protects customer, driver, and admin routes.
- Request payloads are validated with Zod.
- Helmet is enabled for baseline HTTP hardening.
- CORS is controlled by `CORS_ORIGIN`.

## Production Requirements

- Use a long random `JWT_SECRET`.
- Use managed PostgreSQL with TLS.
- Limit `CORS_ORIGIN` to deployed frontend domains.
- Rotate credentials if a `.env` file is exposed.
- Enable platform logs and alerting for failed authentication spikes.
