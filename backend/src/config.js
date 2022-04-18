const path = require('path');

const numberFromEnv = (name, fallback) => {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
};

module.exports = {
  env: process.env.NODE_ENV || 'development',
  host: process.env.HOST || '0.0.0.0',
  port: numberFromEnv('PORT', 4000),
  dataFile:
    process.env.DOORSTEP_DATA_FILE ||
    path.join(__dirname, '..', 'data', 'db.json'),
  otpTtlMs: numberFromEnv('OTP_TTL_MS', 5 * 60 * 1000),
  sessionTtlMs: numberFromEnv('SESSION_TTL_MS', 7 * 24 * 60 * 60 * 1000),
};
