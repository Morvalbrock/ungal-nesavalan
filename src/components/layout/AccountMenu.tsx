"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { User } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";

export function AccountMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  if (!user) {
    return (
      <Link href="/login" aria-label="Sign in" className="rounded-full p-2 hover:bg-ink/5">
        <User className="h-5 w-5" />
      </Link>
    );
  }

  const initial = user.name?.trim().charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase();

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-cream text-xs font-medium"
      >
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-card border border-border bg-cream shadow-xl">
          <div className="border-b border-border/70 px-4 py-3">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-ink-muted">{user.email}</p>
            {user.role === "admin" && (
              <p className="mt-1 inline-block rounded-full bg-maroon/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-maroon">
                Admin
              </p>
            )}
          </div>
          <nav className="py-2 text-sm">
            <MenuLink href="/account/profile" onClick={() => setOpen(false)}>Profile</MenuLink>
            <MenuLink href="/account/addresses" onClick={() => setOpen(false)}>Addresses</MenuLink>
            <MenuLink href="/account/orders" onClick={() => setOpen(false)}>Orders</MenuLink>
            {user.role === "admin" && (
              <MenuLink href="/admin" onClick={() => setOpen(false)}>Admin dashboard</MenuLink>
            )}
          </nav>
          <div className="border-t border-border/70 px-2 py-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                void logout();
              }}
              className="w-full rounded-card px-3 py-2 text-left text-sm text-maroon hover:bg-maroon/5"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-2 text-ink-soft transition hover:bg-ink/5 hover:text-ink"
    >
      {children}
    </Link>
  );
}
