"use client";

import { useTransition } from "react";
import { useAuth } from "@/features/auth/AuthContext";

export function SignOutButton({ className }: { className?: string }) {
  const { logout } = useAuth();
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <form action="/api/auth/logout" method="post" className="mt-4">
      <button
        type="submit"
        onClick={handleClick}
        disabled={isPending}
        className={
          className ??
          "w-full rounded-card px-3 py-2 text-left text-sm text-maroon hover:bg-maroon/5 disabled:opacity-50"
        }
      >
        {isPending ? "Signing out..." : "Sign out"}
      </button>
    </form>
  );
}
