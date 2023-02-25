import {createContext} from 'react';

import type {User, UserRole} from '../api/types';

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isReady: boolean;
  login: (input: {email: string; password: string}) => Promise<void>;
  signup: (input: {name: string; email: string; password: string; role: UserRole}) => Promise<void>;
  logout: () => void;
}

export const TOKEN_KEY = 'doorstep_token';
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

