const http = require('http');
const config = require('./config');
const {JsonStore} = require('./data/store');
const {handleError, jsonHeaders, sendJson} = require('./lib/http');
const {Router} = require('./lib/router');
const {AuthService} = require('./services/authService');
const {CatalogService} = require('./services/catalogService');
const {OrderService} = require('./services/orderService');
const {registerRoutes} = require('./routes');

const createServices = (store, appConfig) => ({
  auth: new AuthService(store, appConfig),
  catalog: new CatalogService(store),
  orders: new OrderService(store),
});

const createApp = (overrides = {}) => {
  const appConfig = {...config, ...overrides};
  const store = overrides.store || new JsonStore(appConfig.dataFile);
  const services = createServices(store, appConfig);
  const router = new Router({services});

  registerRoutes(router);

  return async (req, res) => {
    if (req.method === 'OPTIONS') {
      sendJson(res, 204, {}, jsonHeaders);
      return;
    }

    try {
      await router.handle(req, res);
    } catch (error) {
      handleError(res, error);
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
