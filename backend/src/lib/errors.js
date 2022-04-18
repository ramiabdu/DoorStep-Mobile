class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

const badRequest = (message, details) =>
  new AppError(message, 400, 'BAD_REQUEST', details);

const unauthorized = (message = 'Authentication is required') =>
  new AppError(message, 401, 'UNAUTHORIZED');

const forbidden = (message = 'You do not have access to this resource') =>
  new AppError(message, 403, 'FORBIDDEN');

const notFound = (message = 'Resource was not found') =>
  new AppError(message, 404, 'NOT_FOUND');

const conflict = (message, details) =>
  new AppError(message, 409, 'CONFLICT', details);

module.exports = {
  AppError,
  badRequest,
  conflict,
  forbidden,
  notFound,
  unauthorized,
};
