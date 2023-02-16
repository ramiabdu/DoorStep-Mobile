import type {UserRole} from './domain.js';

declare global {
  namespace Express {
    interface UserContext {
      id: string;
      role: UserRole;
      email: string;
    }

    interface Request {
      user?: UserContext;
    }
  }
}

export {};
