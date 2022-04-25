class DocsService {
  constructor(config) {
    this.config = config;
  }

  overview() {
    return {
      service: 'DoorStep API',
      version: '1.0.0',
      baseUrl: this.config.publicBaseUrl,
      endpoints: [
        {
          method: 'GET',
          path: '/health',
          auth: false,
          description: 'Runtime health check for deployment monitors.',
        },
        {
          method: 'POST',
          path: '/auth/register',
          auth: false,
          description: 'Create a customer account and start OTP verification.',
        },
        {
          method: 'POST',
          path: '/auth/login',
          auth: false,
          description: 'Authenticate an existing verified customer.',
        },
        {
          method: 'POST',
          path: '/auth/verify-otp',
          auth: false,
          description: 'Exchange a verification code for a session token.',
        },
        {
          method: 'GET',
          path: '/catalog/home',
          auth: false,
          description: 'Load service categories, partners, and operating metrics.',
        },
        {
          method: 'POST',
          path: '/orders/quote',
          auth: true,
          description: 'Calculate a delivery quote for a verified customer.',
        },
        {
          method: 'POST',
          path: '/orders',
          auth: true,
          description: 'Create a confirmed delivery order.',
        },
        {
          method: 'GET',
          path: '/orders',
          auth: true,
          description: 'List customer orders for the active session.',
        },
        {
          method: 'GET',
          path: '/orders/:id',
          auth: true,
          description: 'Read a single tracked order for the active session.',
        },
      ],
    };
  }
}

module.exports = {
  DocsService,
};
