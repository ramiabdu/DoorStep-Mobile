const crypto = require('crypto');
const {
  badRequest,
  conflict,
  unauthorized,
} = require('../lib/errors');
const {randomId} = require('../lib/id');

const safeUser = user => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  defaultAddress: user.defaultAddress,
  verifiedAt: user.verifiedAt,
});

const normalizeEmail = email => String(email || '').trim().toLowerCase();

const hashPassword = password => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password, storedHash) => {
  const [salt, hash] = String(storedHash || '').split(':');

  if (!salt || !hash) {
    return false;
  }

  const candidate = crypto.scryptSync(password, salt, 64);
  const stored = Buffer.from(hash, 'hex');

  return stored.length === candidate.length && crypto.timingSafeEqual(candidate, stored);
};

const createOtp = () => String(100000 + crypto.randomInt(900000));

class AuthService {
  constructor(store, config) {
    this.store = store;
    this.config = config;
  }

  register(input) {
    const name = String(input.name || '').trim();
    const email = normalizeEmail(input.email);
    const phone = String(input.phone || '').trim();
    const password = String(input.password || '');
    const defaultAddress = String(input.defaultAddress || '').trim();

    if (!name || !email || !phone || !password || !defaultAddress) {
      throw badRequest('Name, email, phone, password, and address are required');
    }

    if (password.length < 8) {
      throw badRequest('Password must be at least 8 characters');
    }

    return this.store.transact(data => {
      const exists = data.users.some(user => user.email === email);

      if (exists) {
        throw conflict('An account already exists for this email');
      }

      const user = {
        id: randomId('usr'),
        name,
        email,
        phone,
        defaultAddress,
        passwordHash: hashPassword(password),
        verifiedAt: null,
        createdAt: new Date().toISOString(),
      };

      data.users.push(user);

      const verification = this.createVerification(data, user.id, 'registration');

      return {
        user: safeUser(user),
        verificationId: verification.id,
        debug: this.debugOtp(verification),
      };
    });
  }

  login(input) {
    const email = normalizeEmail(input.email);
    const password = String(input.password || '');

    if (!email || !password) {
      throw badRequest('Email and password are required');
    }

    return this.store.transact(data => {
      const user = data.users.find(record => record.email === email);

      if (!user || !verifyPassword(password, user.passwordHash)) {
        throw unauthorized('Invalid email or password');
      }

      if (!user.verifiedAt) {
        const verification = this.createVerification(data, user.id, 'login');

        return {
          user: safeUser(user),
          verificationId: verification.id,
          requiresVerification: true,
          debug: this.debugOtp(verification),
        };
      }

      const session = this.createSession(data, user.id);

      return {
        token: session.token,
        user: safeUser(user),
      };
    });
  }

  verifyOtp(input) {
    const verificationId = String(input.verificationId || '').trim();
    const code = String(input.code || '').trim();

    if (!verificationId || !code) {
      throw badRequest('Verification id and code are required');
    }

    return this.store.transact(data => {
      const verification = data.verifications.find(
        record => record.id === verificationId,
      );

      if (!verification || verification.consumedAt) {
        throw unauthorized('Verification code is invalid or already used');
      }

      if (new Date(verification.expiresAt).getTime() < Date.now()) {
        throw unauthorized('Verification code has expired');
      }

      if (verification.code !== code) {
        throw unauthorized('Verification code is incorrect');
      }

      const user = data.users.find(record => record.id === verification.userId);

      if (!user) {
        throw unauthorized('Verification user was not found');
      }

      verification.consumedAt = new Date().toISOString();
      user.verifiedAt = user.verifiedAt || new Date().toISOString();

      const session = this.createSession(data, user.id);

      return {
        token: session.token,
        user: safeUser(user),
      };
    });
  }

  authenticate(token) {
    const data = this.store.snapshot();
    const session = data.sessions.find(record => record.token === token);

    if (!session || new Date(session.expiresAt).getTime() < Date.now()) {
      throw unauthorized();
    }

    const user = data.users.find(record => record.id === session.userId);

    if (!user) {
      throw unauthorized();
    }

    return safeUser(user);
  }

  createVerification(data, userId, purpose) {
    const verification = {
      id: randomId('ver'),
      userId,
      purpose,
      code: createOtp(),
      expiresAt: new Date(Date.now() + this.config.otpTtlMs).toISOString(),
      consumedAt: null,
      createdAt: new Date().toISOString(),
    };

    data.verifications.push(verification);
    return verification;
  }

  createSession(data, userId) {
    const session = {
      id: randomId('ses'),
      token: crypto.randomBytes(32).toString('hex'),
      userId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.config.sessionTtlMs).toISOString(),
    };

    data.sessions.push(session);
    return session;
  }

  debugOtp(verification) {
    if (this.config.env === 'production' && !this.config.demoOtpEnabled) {
      return undefined;
    }

    return {
      otp: verification.code,
      expiresAt: verification.expiresAt,
    };
  }
}

module.exports = {
  AuthService,
};
