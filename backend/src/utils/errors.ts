export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new ApiError(400, 'BAD_REQUEST', message, details);

export const unauthorized = (message = 'Authentication is required') =>
  new ApiError(401, 'UNAUTHORIZED', message);

export const forbidden = (message = 'You do not have access to this resource') =>
  new ApiError(403, 'FORBIDDEN', message);

export const notFound = (message = 'Resource was not found') =>
  new ApiError(404, 'NOT_FOUND', message);

export const conflict = (message: string) =>
  new ApiError(409, 'CONFLICT', message);
