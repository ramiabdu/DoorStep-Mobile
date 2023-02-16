export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'DoorStep Mobile API',
    version: '1.0.0',
    description: 'Full-stack delivery platform API for customers, drivers, and admins.'
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
    {name: 'Restaurants'},
    {name: 'Cart'},
    {name: 'Orders'},
    {name: 'Driver'},
    {name: 'Admin'}
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Return service health and runtime metadata',
        responses: {
          '200': {
            description: 'Service is healthy'
          }
        }
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
    '/api/restaurants': {
      get: {
        tags: ['Restaurants'],
        summary: 'List restaurants available for delivery'
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
    '/api/orders': {
      get: {
        tags: ['Orders'],
        summary: 'List orders for the authenticated account'
      },
      post: {
        tags: ['Orders'],
        summary: 'Checkout the current cart into an order'
      }
    },
    '/api/admin/overview': {
      get: {
        tags: ['Admin'],
        summary: 'Get admin operations summary'
      }
    },
    '/api/driver/orders': {
      get: {
        tags: ['Driver'],
        summary: 'List orders assigned to the current driver'
      }
    }
  }
};
