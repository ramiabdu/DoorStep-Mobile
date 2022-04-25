const {AppError} = require('./errors');

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
};

const createCorsHeaders = (req, allowedOrigins = ['*']) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes('*')) {
    return {
      'Access-Control-Allow-Origin': '*',
    };
  }

  if (origin && allowedOrigins.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      Vary: 'Origin',
    };
  }

  return {
    Vary: 'Origin',
  };
};

const sendJson = (res, statusCode, payload, headers = {}) => {
  res.writeHead(statusCode, {...jsonHeaders, ...headers});
  res.end(JSON.stringify(payload));
};

const readJsonBody = (req, limitBytes = 1024 * 1024) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on('data', chunk => {
      size += chunk.length;

      if (size > limitBytes) {
        reject(
          new AppError('Request body is too large', 413, 'PAYLOAD_TOO_LARGE'),
        );
        req.destroy();
        return;
      }

      chunks.push(chunk);
    });

    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim();

      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new AppError('Invalid JSON payload', 400, 'INVALID_JSON'));
      }
    });

    req.on('error', reject);
  });

const getBearerToken = req => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token.trim();
};

const handleError = (res, error, headers = {}) => {
  const statusCode = error.statusCode || 500;
  const payload = {
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message:
        statusCode >= 500
          ? 'Something went wrong while processing the request'
          : error.message,
    },
  };

  if (error.details) {
    payload.error.details = error.details;
  }

  sendJson(res, statusCode, payload, headers);
};

module.exports = {
  createCorsHeaders,
  getBearerToken,
  handleError,
  jsonHeaders,
  readJsonBody,
  sendJson,
};
