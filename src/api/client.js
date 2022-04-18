import {Platform} from 'react-native';

const defaultBaseUrl = Platform.select({
  android: 'http://10.0.2.2:4000',
  ios: 'http://localhost:4000',
  default: 'http://localhost:4000',
});

const withTimeout = (promise, timeoutMs = 9000) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('DoorStep API did not respond in time')), timeoutMs);
    }),
  ]);

const parseResponse = async response => {
  const payload = await response.json();

  if (!response.ok) {
    const message = payload && payload.error ? payload.error.message : 'Request failed';
    throw new Error(message);
  }

  return payload;
};

export const createDoorStepClient = (baseUrl = defaultBaseUrl) => {
  const request = async (path, options = {}) => {
    if (typeof fetch !== 'function') {
      throw new Error('Network client is not available in this runtime');
    }

    const response = await withTimeout(
      fetch(`${baseUrl}${path}`, {
        method: options.method || 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(options.token ? {Authorization: `Bearer ${options.token}`} : {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      }),
    );

    return parseResponse(response);
  };

  return {
    baseUrl,
    health: () => request('/health'),
    home: () => request('/catalog/home'),
    register: body => request('/auth/register', {method: 'POST', body}),
    login: body => request('/auth/login', {method: 'POST', body}),
    verifyOtp: body => request('/auth/verify-otp', {method: 'POST', body}),
    quoteOrder: (body, token) =>
      request('/orders/quote', {method: 'POST', body, token}),
    createOrder: (body, token) =>
      request('/orders', {method: 'POST', body, token}),
    listOrders: token => request('/orders', {token}),
  };
};
