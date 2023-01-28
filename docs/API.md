# API Reference

Interactive Swagger docs are served from:

- Local: `http://localhost:4000/api/docs`
- Production: `https://doorstep-mobile.onrender.com/api/docs`

OpenAPI JSON:

- Local: `http://localhost:4000/api/openapi.json`
- Production: `https://doorstep-mobile.onrender.com/api/openapi.json`

## Health

```http
GET /health
```

Returns service status and runtime metadata.

## Authentication

```http
POST /api/auth/signup
POST /api/auth/login
GET /api/auth/me
```

Roles:

- `customer`
- `driver`
- `admin`

Protected endpoints require:

```http
Authorization: Bearer <jwt>
```

## Restaurants

```http
GET /api/restaurants
GET /api/restaurants/:restaurantId
GET /api/restaurants/:restaurantId/menu
```

## Cart

Customer-only endpoints:

```http
GET /api/cart
POST /api/cart/items
PATCH /api/cart/items/:itemId
DELETE /api/cart
```

## Orders

Customer order flow:

```http
GET /api/orders
POST /api/orders
GET /api/orders/:orderId
```

## Driver

Driver-only endpoints:

```http
GET /api/driver/orders
PATCH /api/driver/orders/:orderId/status
```

## Admin

Admin-only endpoints:

```http
GET /api/admin/overview
GET /api/admin/orders
PATCH /api/admin/orders/:orderId/assign
```

## Error Shape

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {}
  }
}
```

