import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { logoutRemote, refreshSession } from '@/lib/auth-api';
import { clearSession, getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from '@/lib/secure-token';

type AuthContextValue = {
  isReady: boolean;
  isAuthenticated: boolean;
  setSessionFromTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let access = await getAccessToken();
      const refresh = await getRefreshToken();

      if (!access && refresh) {
        try {
          const tokens = await refreshSession(refresh);
          access = tokens.accessToken;
          await setAccessToken(tokens.accessToken);
          await setRefreshToken(tokens.refreshToken);
        } catch {
          await clearSession();
          access = null;
        }
      }

      if (!cancelled) {
        setIsAuthenticated(Boolean(access));
        setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setSessionFromTokens = useCallback(async (accessToken: string, refreshToken: string) => {
    await setAccessToken(accessToken);
    await setRefreshToken(refreshToken);
    setIsAuthenticated(true);
  }, []);

  const signOut = useCallback(async () => {
    const refresh = await getRefreshToken();
    if (refresh) {
      try {
        await logoutRemote(refresh);
      } catch {
        // Still clear local session if network fails
      }
    }
    await clearSession();
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({ isReady, isAuthenticated, setSessionFromTokens, signOut }),
    [isAuthenticated, isReady, setSessionFromTokens, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
