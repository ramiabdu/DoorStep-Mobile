export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'DoorStep Mobile API',
    version: '2.0.0',
    description:
      'Multi-vendor delivery marketplace API for customers, drivers, admins, stores, products, carts, checkout, tracking, and analytics.'
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Local development'
    },
    {
      url: 'https://doorstep-mobile.onrender.com',
      description: 'Production'
    }
  ],
  tags: [
    {name: 'Health'},
    {name: 'Authentication'},
    {name: 'Marketplace'},
    {name: 'Stores'},
    {name: 'Products'},
    {name: 'Cart'},
    {name: 'Orders'},
    {name: 'Customer'},
    {name: 'Driver'},
    {name: 'Admin'}
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Return service health and runtime metadata',
        responses: {'200': {description: 'Service is healthy'}}
      }
    },
    '/api/auth/signup': {
      post: {
        tags: ['Authentication'],
        summary: 'Create a customer, driver, or admin account'
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Exchange credentials for a JWT'
      }
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Return the authenticated user'
      }
    },
    '/api/categories': {
      get: {
        tags: ['Marketplace'],
        summary: 'List marketplace categories'
      }
    },
    '/api/stores': {
      get: {
        tags: ['Stores'],
        summary: 'List stores with filtering by type, category, query, or featured state'
      }
    },
    '/api/stores/{storeId}': {
      get: {
        tags: ['Stores'],
        summary: 'Get store details, catalog products, and reviews'
      }
    },
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'List products with filtering by store, category, query, deals, or popularity'
      }
    },
    '/api/products/{productId}': {
      get: {
        tags: ['Products'],
        summary: 'Get a single product'
      }
    },
    '/api/restaurants': {
      get: {
        tags: ['Stores'],
        summary: 'List restaurant stores'
      }
    },
    '/api/cart': {
      get: {
        tags: ['Cart'],
        summary: 'Get the authenticated customer cart'
      },
      delete: {
        tags: ['Cart'],
        summary: 'Clear the authenticated customer cart'
      }
    },
    '/api/cart/items': {
      post: {
        tags: ['Cart'],
        summary: 'Add a product to the authenticated customer cart'
      }
    },
    '/api/orders': {
      get: {
        tags: ['Orders'],
        summary: 'List orders for the authenticated customer'
      },
      post: {
        tags: ['Orders'],
        summary: 'Checkout the current cart into an order'
      }
    },
    '/api/addresses': {
      get: {
        tags: ['Customer'],
        summary: 'List customer addresses'
      },
      post: {
        tags: ['Customer'],
        summary: 'Create a customer address'
      }
    },
    '/api/payments': {
      get: {
        tags: ['Customer'],
        summary: 'List customer payment methods'
      }
    },
    '/api/notifications': {
      get: {
        tags: ['Customer'],
        summary: 'List account notifications'
      }
    },
    '/api/coupons': {
      get: {
        tags: ['Customer'],
        summary: 'List active coupons'
      }
    },
    '/api/driver/orders': {
      get: {
        tags: ['Driver'],
        summary: 'List orders assigned to the current driver'
      }
    },
    '/api/admin/overview': {
      get: {
        tags: ['Admin'],
        summary: 'Get admin operations summary'
      }
    },
    '/api/admin/analytics': {
      get: {
        tags: ['Admin'],
        summary: 'Get admin analytics overview'
      }
    },
    '/api/admin/stores': {
      get: {
        tags: ['Admin'],
        summary: 'List stores for admin management'
      }
    },
    '/api/admin/products': {
      get: {
        tags: ['Admin'],
        summary: 'List products for admin management'
      }
    },
    '/api/admin/orders/all': {
      get: {
        tags: ['Admin'],
        summary: 'List all orders for admin operations'
      }
    },
    '/api/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'List users for admin management'
      }
    }
  }
};
