import {badRequest} from './errors.js';

export const getStringValue = (value: unknown, fieldName: string): string => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim().length > 0) {
    return value[0];
  }

  throw badRequest(`${fieldName} must be a non-empty string`);
};

export const getNumberValue = (value: unknown, fieldName: string): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  throw badRequest(`${fieldName} must be a valid number`);
};

