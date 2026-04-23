"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
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
  connect: (user: MockUser) => void;
  updateUser: (patch: Partial<MockUser>) => void;
  disconnect: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  isConnected: false,
  isLoading: true,
  user: null,
  connect: () => {},
  updateUser: () => {},
  disconnect: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<MockUser | null>(null);

  // Restore from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("dashboard-user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Partial<MockUser>;
          // Backfill provider for any pre-existing localStorage entries
          const hydrated: MockUser = {
            name: parsed.name ?? "Demo User",
            email: parsed.email ?? "demo@livepeer.org",
            initials: parsed.initials ?? "DU",
            provider: (parsed.provider as AuthProvider) ?? "email",
            avatarUrl: parsed.avatarUrl,
          };
          setUser(hydrated);
          setIsConnected(true);
        } catch {
          // ignore
        }
      }
      setIsLoading(false);
    }
  }, []);

  const connect = (u: MockUser) => {
    setUser(u);
    setIsConnected(true);
    localStorage.setItem("dashboard-user", JSON.stringify(u));
  };

  const updateUser = (patch: Partial<MockUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem("dashboard-user", JSON.stringify(next));
      return next;
    });
  };

  const disconnect = () => {
    setUser(null);
    setIsConnected(false);
    localStorage.removeItem("dashboard-user");
  };

  return (
    <AuthContext.Provider
      value={{ isConnected, isLoading, user, connect, updateUser, disconnect }}
    >
      {children}
    </AuthContext.Provider>
  );
}
