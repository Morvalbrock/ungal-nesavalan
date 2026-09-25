"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Tag,
  RotateCcw,
  Clock,
  MessageCircle,
  ExternalLink,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/AuthContext";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/returns", label: "Returns", icon: RotateCcw },
  { href: "/admin/questions", label: "Q & A", icon: MessageCircle },
  { href: "/admin/abandoned-carts", label: "Abandoned carts", icon: Clock },
  { href: "/admin/customers", label: "Customers", icon: Users }
];

export function AdminSidebar() {
  const path = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string, exact?: boolean) => (exact ? path === href : path.startsWith(href));

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border/70 bg-cream lg:flex lg:flex-col">
      <div className="border-b border-border/70 px-5 py-5">
        <Link href="/admin" className="font-display text-lg font-semibold">
          Ungal Nesavalan
        </Link>
        <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-ink-muted">Admin</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 text-sm">
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = isActive(n.href, n.exact);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-3 rounded-card px-3 py-2 transition",
                active ? "bg-ink text-cream" : "text-ink-soft hover:bg-ink/5 hover:text-ink"
              )}
            >
              <Icon className="h-4 w-4" />
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/70 px-3 py-4">
        {user && (
          <div className="mb-3 px-3">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-ink-muted">{user.email}</p>
          </div>
        )}
        <Link
          href="/"
          className="flex items-center gap-3 rounded-card px-3 py-2 text-xs text-ink-soft hover:bg-ink/5 hover:text-ink"
        >
          <ExternalLink className="h-3.5 w-3.5" /> View storefront
        </Link>
        <button
          type="button"
          onClick={() => void logout()}
          className="mt-1 flex w-full items-center gap-3 rounded-card px-3 py-2 text-xs text-maroon hover:bg-maroon/5"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
    </aside>
  );
}
