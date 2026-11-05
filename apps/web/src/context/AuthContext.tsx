import React, { createContext, useContext, useState, useEffect } from 'react';

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

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  login: (login: string, pass: string) => Promise<boolean>;
  register: (email: string, username: string, pass: string, name?: string) => Promise<boolean>;
  logout: () => void;
  demoLogin: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('devorbit_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = () => setAuthError(null);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const res = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const json = await res.json();
        setUser(json.data);
      } else {
        localStorage.removeItem('devorbit_token');
        setToken(null);
        setUser(null);
      }
    } catch {
      localStorage.removeItem('devorbit_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (loginId: string, pass: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: loginId, password: pass }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.data?.token) {
        setToken(json.data.token);
        setUser(json.data.user);
        localStorage.setItem('devorbit_token', json.data.token);
        return true;
      }
      const errMessage = json?.error?.message || json?.message || 'Invalid credentials. Please verify your login and password.';
      setAuthError(errMessage);
      return false;
    } catch (err: any) {
      setAuthError(err?.message || 'Network error while attempting to sign in.');
      return false;
    }
  };

  const register = async (email: string, username: string, pass: string, name?: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password: pass, name }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.data?.token) {
        setToken(json.data.token);
        setUser(json.data.user);
        localStorage.setItem('devorbit_token', json.data.token);
        return true;
      }
      const errMessage = json?.error?.message || json?.message || 'Registration failed. Username or email may already be registered.';
      setAuthError(errMessage);
      return false;
    } catch (err: any) {
      setAuthError(err?.message || 'Network error while attempting to register account.');
      return false;
    }
  };

  const logout = () => {
    if (token) {
      fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem('devorbit_token');
    setToken(null);
    setUser(null);
  };

  const demoLogin = async (): Promise<boolean> => {
    setIsLoading(true);
    const success = await login('alex_developer', 'DevOrbit123!');
    setIsLoading(false);
    return success;
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
