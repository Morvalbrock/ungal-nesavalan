"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicUser } from "@/types/user";

interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  initialUser,
  children
}: {
  initialUser: PublicUser | null;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(initialUser);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = (await res.json()) as { user: PublicUser | null };
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (initialUser === null && typeof window !== "undefined") {
      void refresh();
    }
  }, [initialUser, refresh]);

  const value = useMemo(() => ({ user, loading, refresh, logout }), [user, loading, refresh, logout]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
