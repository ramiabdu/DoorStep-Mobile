import {useCallback, useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';

import {api} from '../api/client';
import type {AuthResponse, UserRole} from '../api/types';
import {AuthContext, TOKEN_KEY} from './authContext';

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      if (!token) {
        setIsReady(true);
        return;
      }

      try {
        const response = await api.me(token);
        if (isMounted) {
          setUser(response.user);
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const persistAuth = useCallback((response: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, response.token);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const login = useCallback(
    async (input: {email: string; password: string}) => {
      persistAuth(await api.login(input));
    },
    [persistAuth]
  );

  const signup = useCallback(
    async (input: {name: string; email: string; password: string; role: UserRole}) => {
      persistAuth(await api.signup(input));
    },
    [persistAuth]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isReady,
      login,
      signup,
      logout
    }),
    [isReady, login, logout, signup, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
