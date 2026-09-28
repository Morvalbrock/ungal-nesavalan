import Link from "next/link";

export const metadata = { title: "Forbidden" };

export default function Forbidden() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-6">
      <div className="mx-auto max-w-md text-center">
        <p className="font-display text-6xl text-ink-muted">403</p>
        <h1 className="mt-4 font-display text-3xl">Access denied</h1>
        <p className="mt-3 text-sm text-ink-muted">
          You don't have permission to view this page. If you think this is a
          mistake, sign in with an account that has the required role.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Link href="/" className="btn-primary inline-flex">Return home</Link>
          <Link href="/login" className="text-sm underline decoration-ink-muted underline-offset-4 hover:text-ink">
            Sign in as admin
          </Link>
        </div>
      </div>
    </div>
  );
}
