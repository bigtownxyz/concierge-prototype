export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* PortalSidebar will be added in Phase 6 */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-surface p-6">
        <h2 className="heading-display text-xl text-text-primary mb-8">
          Concierge
        </h2>
        <nav className="flex flex-col gap-2 text-sm text-text-muted">
          <span className="py-2 px-3 rounded-md bg-primary-muted text-primary">
            Dashboard
          </span>
          <span className="py-2 px-3">Documents</span>
          <span className="py-2 px-3">Messages</span>
          <span className="py-2 px-3">Payments</span>
          <span className="py-2 px-3">Settings</span>
        </nav>
      </aside>
      <main className="flex-1 p-6 lg:p-10">{children}</main>
    </div>
  );
}
