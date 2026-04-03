"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { AppRole } from "../constants/navigation";
import {
  AUTH_STORAGE_KEY,
  authenticateDemoUser,
  getDemoUserByRole,
  parseStoredSession,
  type AuthUser,
} from "../lib/demoAuth";

type LoginResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string };

type AuthContextValue = {
  user: AuthUser | null;
  isReady: boolean;
  login: (email: string, password: string) => LoginResult;
  loginAsRole: (role: AppRole) => LoginResult;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function persistUser(nextUser: AuthUser | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (nextUser) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = typeof window === "undefined"
      ? null
      : parseStoredSession(window.localStorage.getItem(AUTH_STORAGE_KEY));

    setUser(stored);
    setIsReady(true);
  }, []);

  const login = (email: string, password: string): LoginResult => {
    const authenticated = authenticateDemoUser(email, password);

    if (!authenticated) {
      return {
        ok: false,
        error: "That demo account was not recognised. Use one of the seeded accounts below.",
      };
    }

    setUser(authenticated);
    persistUser(authenticated);

    return {
      ok: true,
      user: authenticated,
    };
  };

  const loginAsRole = (role: AppRole): LoginResult => {
    const demoUser = getDemoUserByRole(role);

    if (!demoUser) {
      return {
        ok: false,
        error: "A demo account for that role is not available.",
      };
    }

    setUser(demoUser);
    persistUser(demoUser);

    return {
      ok: true,
      user: demoUser,
    };
  };

  const logout = () => {
    setUser(null);
    persistUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isReady, login, loginAsRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
