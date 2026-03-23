import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Programmes",
  description: "Compare citizenship and residency programmes side by side.",
};

export default function ComparePage() {
  return (
    <div className="py-16 px-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="heading-display text-4xl sm:text-5xl text-text-primary mb-4">
          Compare Programmes
        </h1>
        <p className="text-text-muted text-lg mb-12">
          Select up to 3 programmes to compare side by side
        </p>
        <div className="rounded-2xl bg-glass-bg border border-glass-border p-12 text-center">
          <p className="text-text-muted">
            Interactive comparison tool coming in the next update.
          </p>
        </div>
      </div>
    </div>
  );
}
