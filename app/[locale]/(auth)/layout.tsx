export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="heading-display text-3xl text-text-primary">
            Concierge
          </h1>
        </div>
        <div className="glass-card p-8">{children}</div>
      </div>
    </div>
  );
}
