"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { User } from "@/lib/types";
import * as api from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for existing token
  useEffect(() => {
    const stored = localStorage.getItem("dealerreach_token");
    if (stored) {
      setToken(stored);
      api
        .getMe()
        .then((u) => setUser(u))
        .catch(() => {
          localStorage.removeItem("dealerreach_token");
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await api.login(email, password);
    setToken(tokens.access_token);
    const me = await api.getMe();
    setUser(me);
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const tokens = await api.signup(name, email, password);
      setToken(tokens.access_token);
      const me = await api.getMe();
      setUser(me);
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("dealerreach_token");
    setToken(null);
    setUser(null);
    window.location.href = "/";
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, signup, logout }),
    [user, token, loading, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
