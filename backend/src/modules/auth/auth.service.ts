import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type {SignOptions} from 'jsonwebtoken';

import {env} from '../../config/env.js';
import type {DoorstepRepository} from '../../repositories/repository.js';
import type {User, UserRole} from '../../types/domain.js';
import {unauthorized} from '../../utils/errors.js';

export interface AuthResult {
  user: User;
  token: string;
}

const signToken = (user: User) => {
  const options: SignOptions = {
    subject: user.id,
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn']
  };

  return jwt.sign(
    {
      role: user.role,
      email: user.email
    },
    env.JWT_SECRET,
    options
  );
};

export const createAuthService = (repository: DoorstepRepository) => ({
  async signup(input: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  }): Promise<AuthResult> {
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await repository.createUser({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role ?? 'customer'
    });

    return {
      user,
      token: signToken(user)
    };
  },

  async login(input: {email: string; password: string}): Promise<AuthResult> {
    const storedUser = await repository.findUserByEmail(input.email);
    if (!storedUser) {
      throw unauthorized('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(input.password, storedUser.passwordHash);
    if (!isPasswordValid) {
      throw unauthorized('Invalid email or password');
    }

    const user: User = {
      id: storedUser.id,
      name: storedUser.name,
      email: storedUser.email,
      role: storedUser.role,
      createdAt: storedUser.createdAt
    };

    return {
      user,
      token: signToken(user)
    };
  }
});
