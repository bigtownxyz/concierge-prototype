export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* AdminSidebar will be added in Phase 7 */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-surface p-6">
        <div className="flex items-center gap-2 mb-8">
          <h2 className="heading-display text-xl text-text-primary">
            Concierge
          </h2>
          <span className="rounded-md bg-primary-muted px-2 py-0.5 text-xs font-medium text-primary">
            Admin
          </span>
        </div>
        <nav className="flex flex-col gap-2 text-sm text-text-muted">
          <span className="py-2 px-3 rounded-md bg-primary-muted text-primary">
            Analytics
          </span>
          <span className="py-2 px-3">Clients</span>
          <span className="py-2 px-3">Applications</span>
          <span className="py-2 px-3">Programs</span>
          <span className="py-2 px-3">Leads</span>
          <span className="py-2 px-3">Advisors</span>
          <span className="py-2 px-3">Tenants</span>
          <span className="py-2 px-3">Audit Log</span>
        </nav>
      </aside>
      <main className="flex-1 p-6 lg:p-10">{children}</main>
    </div>
  );
}
