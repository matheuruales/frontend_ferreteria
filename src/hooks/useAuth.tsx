"use client";

/**
 * Auth context + hook for Multivariedades.
 *
 * Design decisions:
 *   - JWT lives in memory + short-lived cookie mirror (auth.ts) — never localStorage.
 *   - Route protection validates the JWT against backend `/auth/me` in middleware.
 *   - Session survives full-page redirects (e.g. Stripe return_url) via cookie hydration.
 */

import {
  createContext,
  useEffect,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import { apiClient } from "@/lib/api-client";
import { clearToken, getToken, setToken } from "@/lib/auth";
import type { ApiResponse, LoginResponse, User } from "@/types";

// ---------------------------------------------------------------------------
// Context definition
// ---------------------------------------------------------------------------

interface AuthContextValue {
  /** The authenticated user's profile, or null if not logged in. */
  user: User | null;
  /** True while an async auth operation is in flight. */
  loading: boolean;
  /**
   * Authenticate with email/password.
   * On success: stores token and updates user state.
   * Returns the raw ApiResponse so the caller can inspect the role for redirects.
   */
  login: (email: string, password: string) => Promise<ApiResponse<LoginResponse>>;
  /**
   * Invalidate the current session.
   * Calls the backend, then clears token, cookie, and user state regardless of result.
   */
  logout: () => Promise<void>;
  /**
   * Fetch the current user's profile from the backend and update context state.
   * No-op if no token is stored in memory.
   */
  getProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(
    async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
      setLoading(true);
      const result = await apiClient.auth.login({ email, password });
      setLoading(false);

      if (result.error) return result;

      const { access_token, expires_in, user: authUser } = result.data;

      setToken(access_token, expires_in);

      setUser({
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.full_name,
        role: authUser.role,
        // status is always active for logged-in users; full profile available via getProfile
        status: "active",
        created_at: new Date().toISOString(),
      });

      return result;
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    setLoading(true);
    // Best-effort: call backend to invalidate session on Supabase side
    if (getToken()) {
      await apiClient.auth.logout();
    }
    clearToken();
    setUser(null);
    setLoading(false);
  }, []);

  const getProfile = useCallback(async (): Promise<void> => {
    if (!getToken()) return;
    setLoading(true);
    const result = await apiClient.auth.me();
    setLoading(false);
    if (!result.error && result.data) {
      setUser(result.data);
    }
  }, []);

  // Hydrate profile on first load if a valid token cookie exists.
  useEffect(() => {
    if (!user && getToken()) {
      void getProfile();
    }
  }, [user, getProfile]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>.");
  }
  return ctx;
}
