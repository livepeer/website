"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface MockUser {
  name: string;
  email: string;
  initials: string;
}

interface AuthContextValue {
  isConnected: boolean;
  user: MockUser | null;
  connect: (user: MockUser) => void;
  disconnect: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  isConnected: false,
  user: null,
  connect: () => {},
  disconnect: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<MockUser | null>(null);

  // Restore from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("studio-user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as MockUser;
          setUser(parsed);
          setIsConnected(true);
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const connect = (u: MockUser) => {
    setUser(u);
    setIsConnected(true);
    localStorage.setItem("studio-user", JSON.stringify(u));
  };

  const disconnect = () => {
    setUser(null);
    setIsConnected(false);
    localStorage.removeItem("studio-user");
  };

  return (
    <AuthContext.Provider value={{ isConnected, user, connect, disconnect }}>
      {children}
    </AuthContext.Provider>
  );
}
