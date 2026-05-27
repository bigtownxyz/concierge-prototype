"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { Logo } from "@/components/shared/Logo";
import { useUser } from "@/hooks/useUser";
import { NewsletterForm } from "@/components/shared/NewsletterForm";
import { OpenApplyButton } from "./OpenApplyButton";

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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  // Close on Escape + lock body scroll while the menu is open
  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

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
                <Link href="/application" className={primaryButtonClass}>
                  My Account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className={ghostLinkClass}>
                  Sign In
                </Link>
                <OpenApplyButton className={primaryButtonClass}>
                  Enquire
                  <ArrowRight className="h-4 w-4" />
                </OpenApplyButton>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileNavOpen}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-[#dfe2eb] transition-colors hover:border-white/30 hover:bg-white/[0.04] md:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                className="h-5 w-5"
                aria-hidden
              >
                {mobileNavOpen ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileNavOpen && (
          <div
            className="absolute inset-x-0 top-full z-50 border-b border-white/8 bg-[rgba(17,16,28,0.96)] backdrop-blur-xl md:hidden"
            onClick={() => setMobileNavOpen(false)}
          >
            <nav className="mx-auto flex max-w-7xl flex-col px-6 py-4">
              {previewLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center justify-between border-b border-white/8 py-4 text-base font-medium text-[#dfe2eb] transition-colors last:border-b-0 hover:text-[#bbc4f7]"
                >
                  {item.label}
                  <ArrowRight className="h-4 w-4 text-[#8f93a3]" />
                </Link>
              ))}
              {!loading && !user && (
                <Link
                  href="/login"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center justify-between border-t border-white/8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#9aa0b8] transition-colors hover:text-[#bbc4f7]"
                >
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              {!loading && user && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileNavOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center justify-between border-t border-white/8 py-4 text-left text-sm font-semibold uppercase tracking-[0.18em] text-[#9aa0b8] transition-colors hover:text-[#bbc4f7]"
                >
                  Sign Out
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </nav>
          </div>
        )}
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

            <div className="max-w-md space-y-3 pt-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#bbc4f7]">
                Stay in the loop
              </p>
              <p className="text-sm leading-6 text-[#8f9095]">
                Programme changes, jurisdictional updates, and our take on what
                actually matters. No spam.
              </p>
              <NewsletterForm source="footer" variant="footer" />
            </div>
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
