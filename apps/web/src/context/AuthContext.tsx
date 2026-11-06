import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, setUnauthorizedHandler } from '../lib/api.js';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: string;
  bio?: string;
  preference?: {
    theme: string;
    ecoMode: boolean;
    notifyDesktop: boolean;
  };
}

export interface AuthActionResult {
  ok: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  login: (login: string, pass: string) => Promise<AuthActionResult>;
  register: (email: string, username: string, pass: string, name?: string) => Promise<AuthActionResult>;
  logout: () => void;
  demoLogin: () => Promise<AuthActionResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getStoredToken = (): string | null => {
  try {
    return sessionStorage.getItem('devorbit_token') || localStorage.getItem('devorbit_token') || null;
  } catch {
    return null;
  }
};

const storeToken = (token: string | null) => {
  try {
    if (token) {
      sessionStorage.setItem('devorbit_token', token);
      localStorage.removeItem('devorbit_token');
    } else {
      sessionStorage.removeItem('devorbit_token');
      localStorage.removeItem('devorbit_token');
    }
  } catch {}
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = () => setAuthError(null);

  const fetchCurrentUser = async (authToken?: string | null) => {
    try {
      const res = await apiFetch<User>('/api/v1/auth/me', {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        storeToken(null);
        setToken(null);
        setUser(null);
      }
    } catch {
      storeToken(null);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (token) {
      apiFetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    storeToken(null);
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    fetchCurrentUser(token);
  }, []);

  const login = async (loginId: string, pass: string): Promise<AuthActionResult> => {
    setAuthError(null);
    try {
      const json = await apiFetch<{ token: string; user: User }>('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: loginId, password: pass }),
      });
      if (json.success && json.data?.token) {
        setToken(json.data.token);
        setUser(json.data.user);
        storeToken(json.data.token);
        return { ok: true };
      }
      const errMessage = json?.error?.message || json?.message || 'Invalid credentials. Please verify your login and password.';
      setAuthError(errMessage);
      return { ok: false, error: errMessage };
    } catch (err: any) {
      const errMessage = err?.message || 'Network error while attempting to sign in.';
      setAuthError(errMessage);
      return { ok: false, error: errMessage };
    }
  };

  const register = async (email: string, username: string, pass: string, name?: string): Promise<AuthActionResult> => {
    setAuthError(null);
    try {
      const json = await apiFetch<{ token: string; user: User }>('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password: pass, name }),
      });
      if (json.success && json.data?.token) {
        setToken(json.data.token);
        setUser(json.data.user);
        storeToken(json.data.token);
        return { ok: true };
      }
      const errMessage = json?.error?.message || json?.message || 'Registration failed. Username or email may already be registered.';
      setAuthError(errMessage);
      return { ok: false, error: errMessage };
    } catch (err: any) {
      const errMessage = err?.message || 'Network error while attempting to register account.';
      setAuthError(errMessage);
      return { ok: false, error: errMessage };
    }
  };

  const demoLogin = async (): Promise<AuthActionResult> => {
    if (import.meta.env.VITE_ENABLE_DEMO !== 'true') {
      const err = 'Demo mode is disabled in this environment.';
      setAuthError(err);
      return { ok: false, error: err };
    }
    const demoUser = import.meta.env.VITE_DEMO_USER || '';
    const demoPassword = import.meta.env.VITE_DEMO_PASSWORD || '';
    if (!demoUser || !demoPassword) {
      const err = 'Demo credentials are not configured.';
      setAuthError(err);
      return { ok: false, error: err };
    }
    setIsLoading(true);
    const result = await login(demoUser, demoPassword);
    setIsLoading(false);
    return result;
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, authError, clearAuthError, login, register, logout, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
