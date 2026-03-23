export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Navbar will be added in Phase 2 */}
      <main className="min-h-screen">{children}</main>
      {/* Footer will be added in Phase 2 */}
    </>
  );
}
