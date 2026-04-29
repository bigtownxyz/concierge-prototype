"use client";

import { ArrowRight } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Logo } from "@/components/shared/Logo";
import { useUser } from "@/hooks/useUser";
import { OpenQualifyButton } from "./OpenQualifyButton";

const previewLinks = [
  { href: "/programs", label: "Programmes" },
  { href: "/compare", label: "Compare" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
];

const primaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#bbc4f7] px-5 text-sm font-semibold tracking-[0.01em] text-[#242d58] transition-colors hover:bg-[#a9b3ea]";
const ghostLinkClass =
  "hidden text-sm font-medium tracking-[0.02em] text-[#c6c6cb] transition-colors hover:text-[#dfe2eb] sm:inline-flex";

export function PreviewShell({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#11101C] text-[#F5F5F6]">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[rgba(17,16,28,0.92)] supports-[backdrop-filter]:bg-[rgba(17,16,28,0.78)] supports-[backdrop-filter]:backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-6 lg:px-8">
          <Link href="/" aria-label="Concierge home">
            <Logo size="sm" />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {previewLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium tracking-[0.02em] text-[#c6c6cb] transition-colors hover:text-[#dfe2eb]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {!loading && user ? (
              <>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className={ghostLinkClass}
                >
                  Sign Out
                </button>
                <Link href="/results" className={primaryButtonClass}>
                  My Results
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className={ghostLinkClass}>
                  Sign In
                </Link>
                <OpenQualifyButton className={primaryButtonClass}>
                  Get Qualified
                  <ArrowRight className="h-4 w-4" />
                </OpenQualifyButton>
              </>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-white/8 bg-[#151423] text-[#F5F5F6]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1.3fr_0.7fr] lg:px-8">
          <div className="space-y-5">
            <Link
              href="/"
              className="inline-flex"
              aria-label="Concierge home"
            >
              <Logo size="sm" />
            </Link>
            <p className="max-w-xl text-sm leading-7 text-[#c6c6cb]">
              Private advisory for citizenship, residency, and strategic global
              mobility planning. Programme availability and eligibility depend on
              nationality, source of funds, family structure, and due diligence
              outcomes.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#bbc4f7]">
                Explore
              </p>
              {previewLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-sm text-[#c6c6cb] transition-colors hover:text-[#dfe2eb]"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#bbc4f7]">
                Legal
              </p>
              {legalLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-sm text-[#c6c6cb] transition-colors hover:text-[#dfe2eb]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
