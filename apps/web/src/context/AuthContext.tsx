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
  login: (login: string, pass: string) => Promise<boolean>;
  register: (email: string, username: string, pass: string, name?: string) => Promise<boolean>;
  logout: () => void;
  switchUser: (username: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('devorbit_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
      // Default to logging in as demo user Alex Rivera for seamless local exploration
      login('alex_developer', 'DevOrbit123!').finally(() => setIsLoading(false));
    }
  }, []);

  const login = async (loginId: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: loginId, password: pass }),
      });
      if (res.ok) {
        const json = await res.json();
        setToken(json.data.token);
        setUser(json.data.user);
        localStorage.setItem('devorbit_token', json.data.token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const register = async (email: string, username: string, pass: string, name?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password: pass, name }),
      });
      if (res.ok) {
        const json = await res.json();
        setToken(json.data.token);
        setUser(json.data.user);
        localStorage.setItem('devorbit_token', json.data.token);
        return true;
      }
      return false;
    } catch {
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

  const switchUser = async (targetUsername: string) => {
    setIsLoading(true);
    await login(targetUsername, 'DevOrbit123!');
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, switchUser }}>
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
