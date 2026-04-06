import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/shared/Logo";
import { PROGRAMS } from "@/lib/constants";

const featuredPrograms = PROGRAMS.filter((p) => p.featured).slice(0, 5);

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/blog", label: "Blog" },
  { href: "/programs", label: "All Programmes" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t"
      style={{
        backgroundColor: "#1A1830",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Main grid */}
        <div className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo size="sm" />
            <p className="mt-4 text-sm leading-relaxed text-text-muted max-w-xs">
              Expert second citizenship and residency advisory for
              high-net-worth individuals seeking global mobility and asset
              protection.
            </p>
          </div>

          {/* Programmes column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted/60 mb-4">
              Programmes
            </h3>
            <ul className="space-y-2.5">
              {featuredPrograms.map((program) => (
                <li key={program.slug}>
                  <Link
                    href={`/programs/${program.slug}`}
                    className="text-sm text-text-muted transition-colors duration-200 hover:text-text-primary"
                  >
                    {program.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted/60 mb-4">
              Company
            </h3>
            <ul className="space-y-2.5">
              {companyLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-text-muted transition-colors duration-200 hover:text-text-primary"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted/60 mb-4">
              Legal
            </h3>
            <ul className="space-y-2.5">
              {legalLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-text-muted transition-colors duration-200 hover:text-text-primary"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col items-center justify-between gap-3 border-t py-6 sm:flex-row"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <p className="text-xs text-text-muted/50">
            &copy; {year} Concierge. All rights reserved.
          </p>
          <p className="text-xs text-text-muted/30">
            Global citizenship &amp; residency advisory
          </p>
        </div>
      </div>
    </footer>
  );
}
