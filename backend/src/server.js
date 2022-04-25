const http = require('http');
const config = require('./config');
const {JsonStore} = require('./data/store');
const {createCorsHeaders, handleError, sendJson} = require('./lib/http');
const {Router} = require('./lib/router');
const {AuthService} = require('./services/authService');
const {CatalogService} = require('./services/catalogService');
const {DocsService} = require('./services/docsService');
const {OrderService} = require('./services/orderService');
const {registerRoutes} = require('./routes');

const createServices = (store, appConfig) => ({
  auth: new AuthService(store, appConfig),
  catalog: new CatalogService(store),
  docs: new DocsService(appConfig),
  orders: new OrderService(store),
});

const createApp = (overrides = {}) => {
  const appConfig = {...config, ...overrides};
  const store = overrides.store || new JsonStore(appConfig.dataFile);
  const services = createServices(store, appConfig);
  const router = new Router({services});

  registerRoutes(router);

  return async (req, res) => {
    const responseHeaders = createCorsHeaders(req, appConfig.corsOrigins);

    if (req.method === 'OPTIONS') {
      sendJson(res, 204, {}, responseHeaders);
      return;
    }

    try {
      await router.handle(req, res, {responseHeaders});
    } catch (error) {
      handleError(res, error, responseHeaders);
    }
  };
};

if (require.main === module) {
  const server = http.createServer(createApp());

  server.listen(config.port, config.host, () => {
    console.log(`DoorStep API is running on http://${config.host}:${config.port}`);
  });
}

module.exports = {
  createApp,
  createServices,
};
