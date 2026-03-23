import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights on second citizenship, golden visas, and global mobility.",
};

export default function BlogPage() {
  return (
    <div className="py-16 px-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="heading-display text-4xl sm:text-5xl text-text-primary mb-4">
          Blog
        </h1>
        <p className="text-text-muted text-lg mb-12">
          Insights on citizenship by investment, golden visas, and global
          mobility
        </p>
        <div className="rounded-2xl bg-glass-bg border border-glass-border p-12 text-center">
          <p className="text-text-muted">
            Blog posts coming soon. Content will be managed via the admin panel.
          </p>
        </div>
      </div>
    </div>
  );
}
