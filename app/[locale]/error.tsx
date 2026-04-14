"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="heading-display text-4xl text-text-primary mb-4">
        Something went wrong
      </h1>
      <p className="text-text-muted mb-8">
        An unexpected error occurred. Please try again.
      </p>
      <p className="mb-6 max-w-xl text-center text-sm text-text-muted/80">
        {error.message || "Unknown error"}
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
      >
        Try Again
      </button>
    </div>
  );
}
