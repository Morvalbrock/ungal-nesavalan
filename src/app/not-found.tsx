import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-6">
      <div className="mx-auto max-w-md text-center">
        <p className="font-display text-6xl text-ink-muted">404</p>
        <h1 className="mt-4 font-display text-3xl">Page not found</h1>
        <p className="mt-3 text-sm text-ink-muted">
          The page you're looking for has been moved or never existed.
        </p>
        <Link href="/" className="btn-primary mt-6 inline-flex">
          Return home
        </Link>
      </div>
    </div>
  );
}
