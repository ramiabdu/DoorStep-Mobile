const registerRoutes = router => {
  router.get('/', ({services}) => ({
    status: 200,
    body: services.docs.overview(),
  }));

  router.get('/docs', ({services}) => ({
    status: 200,
    body: services.docs.overview(),
  }));

  router.get('/health', () => ({
    status: 200,
    body: {
      status: 'ok',
      service: 'doorstep-api',
      timestamp: new Date().toISOString(),
    },
  }));

  router.post('/auth/register', ({body, services}) => ({
    status: 201,
    body: services.auth.register(body),
  }));

  router.post('/auth/login', ({body, services}) => ({
    status: 200,
    body: services.auth.login(body),
  }));

  router.post('/auth/verify-otp', ({body, services}) => ({
    status: 200,
    body: services.auth.verifyOtp(body),
  }));

  router.get('/catalog/home', ({services}) => ({
    status: 200,
    body: services.catalog.home(),
  }));

  router.get('/catalog/categories', ({services}) => ({
    status: 200,
    body: {
      categories: services.catalog.categories(),
    },
  }));

  router.get('/catalog/partners', ({query, services}) => ({
    status: 200,
    body: {
      partners: services.catalog.partners(query),
    },
  }));

  router.post('/orders/quote', {auth: true}, ({body, services}) => ({
    status: 200,
    body: {
      quote: services.orders.quote(body),
    },
  }));

  router.post('/orders', {auth: true}, ({body, services, user}) => ({
    status: 201,
    body: {
      order: services.orders.create(user, body),
    },
  }));

  router.get('/orders', {auth: true}, ({services, user}) => ({
    status: 200,
    body: {
      orders: services.orders.listForUser(user),
    },
  }));

  router.get('/orders/:id', {auth: true}, ({params, services, user}) => ({
    status: 200,
    body: {
      order: services.orders.getForUser(user, params.id),
    },
  }));
};

module.exports = {
  registerRoutes,
};
