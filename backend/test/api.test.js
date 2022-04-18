const http = require('http');
const os = require('os');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');
const {createApp} = require('../src/server');

const listen = server =>
  new Promise(resolve => {
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });

const request = async (baseUrl, pathName, options = {}) => {
  const response = await fetch(`${baseUrl}${pathName}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? {Authorization: `Bearer ${options.token}`} : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const body = await response.json();
  return {response, body};
};

test('DoorStep API supports registration, OTP verification, catalog, and orders', async t => {
  const dataFile = path.join(os.tmpdir(), `doorstep-test-${Date.now()}.json`);
  const server = http.createServer(createApp({dataFile}));
  const port = await listen(server);
  const baseUrl = `http://127.0.0.1:${port}`;

  t.after(() => server.close());

  const health = await request(baseUrl, '/health');
  assert.equal(health.response.status, 200);
  assert.equal(health.body.status, 'ok');

  const registered = await request(baseUrl, '/auth/register', {
    method: 'POST',
    body: {
      name: 'Ari Customer',
      email: 'ari@example.com',
      phone: '+1555010101',
      password: 'doorstep-demo',
      defaultAddress: '221 Market Street',
    },
  });
  assert.equal(registered.response.status, 201);
  assert.ok(registered.body.verificationId);
  assert.ok(registered.body.debug.otp);

  const verified = await request(baseUrl, '/auth/verify-otp', {
    method: 'POST',
    body: {
      verificationId: registered.body.verificationId,
      code: registered.body.debug.otp,
    },
  });
  assert.equal(verified.response.status, 200);
  assert.ok(verified.body.token);

  const catalog = await request(baseUrl, '/catalog/home');
  assert.equal(catalog.response.status, 200);
  assert.ok(catalog.body.categories.length >= 4);

  const quote = await request(baseUrl, '/orders/quote', {
    method: 'POST',
    token: verified.body.token,
    body: {
      categoryId: 'grocery',
      pickupAddress: 'FreshLane Market',
      dropoffAddress: '221 Market Street',
      items: ['coffee', 'milk'],
      priority: 'express',
    },
  });
  assert.equal(quote.response.status, 200);
  assert.equal(quote.body.quote.currency, 'USD');

  const created = await request(baseUrl, '/orders', {
    method: 'POST',
    token: verified.body.token,
    body: {
      categoryId: 'grocery',
      pickupAddress: 'FreshLane Market',
      dropoffAddress: '221 Market Street',
      items: ['coffee', 'milk'],
      priority: 'express',
      paymentMethod: 'card',
    },
  });
  assert.equal(created.response.status, 201);
  assert.match(created.body.order.number, /^DS-/);

  const orders = await request(baseUrl, '/orders', {
    token: verified.body.token,
  });
  assert.equal(orders.response.status, 200);
  assert.equal(orders.body.orders.length, 1);
});
