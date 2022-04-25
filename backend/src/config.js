const path = require('path');

const numberFromEnv = (name, fallback) => {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
};

const listFromEnv = (name, fallback) => {
  const raw = process.env[name];

  if (!raw) {
    return fallback;
  }

  return raw
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
};

module.exports = {
  env: process.env.NODE_ENV || 'development',
  host: process.env.HOST || '0.0.0.0',
  port: numberFromEnv('PORT', 4000),
  publicBaseUrl:
    process.env.PUBLIC_BASE_URL || 'https://doorstep-mobile.onrender.com',
  corsOrigins: listFromEnv('CORS_ORIGINS', ['*']),
  demoOtpEnabled: process.env.DEMO_OTP_ENABLED === 'true',
  dataFile:
    process.env.DOORSTEP_DATA_FILE ||
    path.join(__dirname, '..', 'data', 'db.json'),
  otpTtlMs: numberFromEnv('OTP_TTL_MS', 5 * 60 * 1000),
  sessionTtlMs: numberFromEnv('SESSION_TTL_MS', 7 * 24 * 60 * 60 * 1000),
};
