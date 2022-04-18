const {notFound, unauthorized} = require('./errors');
const {getBearerToken, readJsonBody, sendJson} = require('./http');

const bodyMethods = new Set(['POST', 'PATCH', 'PUT']);

const matchPath = (routePath, requestPath) => {
  const routeParts = routePath.split('/').filter(Boolean);
  const requestParts = requestPath.split('/').filter(Boolean);

  if (routeParts.length !== requestParts.length) {
    return null;
  }

  return routeParts.reduce((params, part, index) => {
    if (params === null) {
      return null;
    }

    if (part.startsWith(':')) {
      return {
        ...params,
        [part.slice(1)]: decodeURIComponent(requestParts[index]),
      };
    }

    return part === requestParts[index] ? params : null;
  }, {});
};

class Router {
  constructor({services}) {
    this.routes = [];
    this.services = services;
  }

  add(method, path, options, handler) {
    if (typeof options === 'function') {
      this.routes.push({method, path, options: {}, handler: options});
      return;
    }

    this.routes.push({method, path, options, handler});
  }

  get(path, options, handler) {
    this.add('GET', path, options, handler);
  }

  post(path, options, handler) {
    this.add('POST', path, options, handler);
  }

  async handle(req, res) {
    const url = new URL(req.url, 'http://doorstep.local');
    const method = req.method.toUpperCase();

    const match = this.routes
      .map(route => ({
        ...route,
        params: route.method === method ? matchPath(route.path, url.pathname) : null,
      }))
      .find(route => route.params);

    if (!match) {
      throw notFound(`No route for ${method} ${url.pathname}`);
    }

    const body = bodyMethods.has(method) ? await readJsonBody(req) : {};
    const context = {
      body,
      params: match.params,
      query: Object.fromEntries(url.searchParams.entries()),
      req,
      services: this.services,
      user: null,
    };

    if (match.options.auth) {
      const token = getBearerToken(req);

      if (!token) {
        throw unauthorized();
      }

      context.user = this.services.auth.authenticate(token);
    }

    const result = await match.handler(context);

    if (!res.writableEnded) {
      sendJson(res, result.status || 200, result.body || result);
    }
  }
}

module.exports = {
  Router,
};
