# API Reference

Interactive Swagger docs are served from:

- Local: `http://localhost:4000/api/docs`
- OpenAPI JSON: `http://localhost:4000/api/openapi.json`

Protected endpoints require:

```http
Authorization: Bearer <jwt>
```

## Health

```http
GET /health
```

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

## Marketplace

```http
GET /api/categories
GET /api/stores
GET /api/stores?type=restaurant
GET /api/stores?type=supermarket
GET /api/stores?q=coffee
GET /api/stores/:storeId
GET /api/restaurants
GET /api/restaurants/:restaurantId
GET /api/restaurants/:restaurantId/menu
GET /api/products
GET /api/products?storeId=store-starbucks
GET /api/products?deal=true
GET /api/products?popular=true
GET /api/products/:productId
```

## Cart

Customer-only endpoints:

```http
GET /api/cart
POST /api/cart/items
PATCH /api/cart/items/:itemId
DELETE /api/cart
```

Example add item:

```json
{
  "menuItemId": "prod-starbucks-caramel-macchiato",
  "quantity": 1
}
```

## Orders

Customer order flow:

```http
GET /api/orders
POST /api/orders
GET /api/orders/:orderId
```

Example checkout:

```json
{
  "deliveryAddress": "Rosenthaler Str. 42, Berlin 10178"
}
```

## Customer Account

```http
GET /api/addresses
POST /api/addresses
DELETE /api/addresses/:addressId
GET /api/payments
GET /api/notifications
PATCH /api/notifications/:notificationId/read
GET /api/coupons
GET /api/reviews/stores/:storeId
POST /api/reviews/stores/:storeId
```

## Driver

Driver-only endpoints:

```http
GET /api/driver/orders
PATCH /api/driver/orders/:orderId/status
```

Status values:

- `confirmed`
- `preparing`
- `ready`
- `picked_up`
- `delivered`
- `cancelled`

## Admin

Admin-only endpoints:

```http
GET /api/admin/overview
GET /api/admin/analytics
GET /api/admin/stores
GET /api/admin/products
GET /api/admin/orders
GET /api/admin/orders/all
GET /api/admin/users
PATCH /api/admin/orders/:orderId/assign
GET /api/users
GET /api/analytics
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
