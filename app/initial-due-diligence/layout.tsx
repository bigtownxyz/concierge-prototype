/**
 * Layout for the DD applicant portal.
 *
 * Routes under /initial-due-diligence sit OUTSIDE the [locale] tree, so they
 * inherit only the root layout (fonts + globals). That's intentional — this
 * portal has its own minimal chrome, no locale switcher, no marketing nav.
 *
 * If you add a component here that depends on TooltipProvider, NextIntl, or
 * any other context provider used in app/[locale]/layout.tsx, wrap it locally
 * — that tree is not available at this depth.
 */

export default function InitialDueDiligenceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ background: "#10141a" }}>
      {children}
    </div>
  );
}
