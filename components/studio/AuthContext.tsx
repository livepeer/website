"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export type AuthProvider = "github" | "google" | "email";

export interface MockUser {
  name: string;
  email: string;
  initials: string;
  provider: AuthProvider;
  avatarUrl?: string;
}

interface AuthContextValue {
  isConnected: boolean;
  isLoading: boolean;
  user: MockUser | null;
  browserJwt: string | null;
  connect: (user: MockUser) => void;
  updateUser: (patch: Partial<MockUser>) => void;
  disconnect: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  isConnected: false,
  isLoading: true,
  user: null,
  browserJwt: null,
  connect: () => {},
  updateUser: () => {},
  disconnect: async () => {},
  refresh: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<MockUser | null>(null);
  const [browserJwt, setBrowserJwt] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        cache: "no-store",
      });
      if (!response.ok) {
        setIsConnected(false);
        setUser(null);
        setBrowserJwt(null);
        return;
      }

      const payload = (await response.json()) as {
        authenticated: boolean;
        user?: MockUser;
        browserJwt?: string | null;
      };
      if (!payload.authenticated || !payload.user) {
        setIsConnected(false);
        setUser(null);
        setBrowserJwt(null);
        return;
      }

      setUser(payload.user);
      setIsConnected(true);
      setBrowserJwt(payload.browserJwt ?? null);
    } catch {
      setIsConnected(false);
      setUser(null);
      setBrowserJwt(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const connect = (u: MockUser) => {
    setUser(u);
    setIsConnected(true);
  };

  const updateUser = (patch: Partial<MockUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, ...patch };
    });
  };

  const disconnect = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch {
      // Ignore network errors and still clear client state.
    }
    setUser(null);
    setBrowserJwt(null);
    setIsConnected(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isConnected,
        isLoading,
        user,
        browserJwt,
        connect,
        updateUser,
        disconnect,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
