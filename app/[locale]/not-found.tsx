import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="heading-display text-5xl text-text-primary mb-4">404</h1>
      <p className="text-text-muted mb-8">Page not found</p>
      <Link
        href="/"
        className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
      >
        Go Home
      </Link>
    </div>
  );
}
