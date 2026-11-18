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
        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-deep text-white text-xs font-bold ring-2 ring-purple-200 transition hover:bg-brand-purple"
      >
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-purple-100 bg-white shadow-xl overflow-hidden">
          <div className="border-b border-purple-100 px-4 py-3 bg-purple-50/50">
            <p className="text-sm font-bold text-brand-plum">{user.name}</p>
            <p className="truncate text-xs text-purple-900/60">{user.email}</p>
            {(user.role === "admin" || user.role === "super_admin") && (
              <p className="mt-1.5 inline-block rounded-full bg-purple-100 border border-purple-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-purple">
                {user.role === "super_admin" ? "Super Admin" : "Loom Admin"}
              </p>
            )}
          </div>
          <nav className="py-2 text-sm">
            <MenuLink href="/account/profile" onClick={() => setOpen(false)}>My Profile</MenuLink>
            <MenuLink href="/account/addresses" onClick={() => setOpen(false)}>Delivery Addresses</MenuLink>
            <MenuLink href="/account/orders" onClick={() => setOpen(false)}>Order History</MenuLink>
            <MenuLink href="/account/wishlist" onClick={() => setOpen(false)}>Saved Wishlist</MenuLink>
            {(user.role === "admin" || user.role === "super_admin") && (
              <div className="border-t border-purple-50 my-1">
                <MenuLink href="/admin" onClick={() => setOpen(false)}>Admin Console</MenuLink>
              </div>
            )}
          </nav>
          <div className="border-t border-purple-100 px-2 py-2 bg-purple-50/20">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                void logout();
              }}
              className="w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
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
      className="block px-4 py-2 text-slate-700 font-medium transition hover:bg-purple-50 hover:text-brand-plum"
    >
      {children}
    </Link>
  );
}
