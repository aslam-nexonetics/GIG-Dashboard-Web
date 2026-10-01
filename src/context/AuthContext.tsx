'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, LoginCredentials } from '@/types/gig';
import { gigApi, tokenManager } from '@/services/gigApi';
import { logger } from '@/services/logger';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithToken: (rawToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Initialize auth state from local storage and verify token
  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      try {
        const storedToken = tokenManager.getToken();
        const storedUser = tokenManager.getStoredUser();

        if (storedToken) {
          // Check token expiration
          if (tokenManager.isTokenExpired(storedToken)) {
            logger.warn('AUTH', 'Stored token is expired, attempting refresh...');
            try {
              const newToken = await gigApi.refreshToken();
              if (cancelled) return;
              setToken(newToken);
              setIsAuthenticated(true);
              const me = await gigApi.getMe();
              if (!cancelled) setUser(me);
              return;
            } catch {
              logger.warn('AUTH', 'Refresh failed. Clearing session.');
              tokenManager.clearSession();
              if (!cancelled) {
                setIsAuthenticated(false);
                setUser(null);
                setToken(null);
              }
            }
          } else {
            // Valid token present
            setToken(storedToken);
            setIsAuthenticated(true);
            if (storedUser) setUser(storedUser);

            // Background refresh of user profile
            gigApi
              .getMe()
              .then((me) => {
                if (!cancelled) setUser(me);
              })
              .catch((err) => {
                logger.warn('AUTH', 'Could not refresh profile:', err);
              });
            return;
          }
        }
      } catch (err) {
        logger.error('AUTH', 'Error initializing auth session:', err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void initAuth();

    // Global session expiry handler
    const handleExpired = () => {
      if (cancelled) return;
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      setAuthError('Your session has expired. Please sign in again.');
      logger.warn('AUTH', 'Session expired event received');
    };

    const handleLogout = () => {
      if (cancelled) return;
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
    };

    window.addEventListener('gig:auth-expired', handleExpired);
    window.addEventListener('gig:auth-logout', handleLogout);

    return () => {
      cancelled = true;
      window.removeEventListener('gig:auth-expired', handleExpired);
      window.removeEventListener('gig:auth-logout', handleLogout);
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await gigApi.login(credentials.emailOrUsername, credentials.password);
      setToken(response.accessToken);
      if (response.user) {
        setUser(response.user);
      }
      setIsAuthenticated(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid username or password.';
      setAuthError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithToken = useCallback(async (rawToken: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const authUser = await gigApi.loginWithRawToken(rawToken);
      setToken(rawToken.trim());
      setUser(authUser);
      setIsAuthenticated(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not authenticate with provided token.';
      setAuthError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await gigApi.logout();
    } finally {
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await gigApi.getMe();
      setUser(me);
    } catch (err) {
      logger.error('AUTH', 'Failed to refresh user profile:', err);
    }
  }, []);

  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        authError,
        login,
        loginWithToken,
        logout,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
