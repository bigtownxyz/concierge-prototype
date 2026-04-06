"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, LogOut, LayoutDashboard } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUser } from "@/hooks/useUser";

// ─── User Avatar / Initials ───────────────────────────────────────────────────

function UserInitials({ name, email }: { name?: string; email?: string }) {
  const display = name || email || "?";
  const initials = display
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold flex-shrink-0"
      style={{
        background: "rgba(187,196,247,0.15)",
        border: "1px solid rgba(187,196,247,0.3)",
        color: "#bbc4f7",
        fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
      }}
    >
      {initials}
    </span>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, loading, signOut } = useUser();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20);
  });

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = () => setUserMenuOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [userMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const userName =
    user?.user_metadata?.full_name as string | undefined;
  const userEmail = user?.email;

  return (
    <>
      {/* Desktop navbar */}
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50",
          "transition-[background-color,border-color,box-shadow] duration-500 ease-out"
        )}
        style={{
          backgroundColor: scrolled
            ? "rgba(17, 16, 28, 0.92)"
            : "rgba(17, 16, 28, 0.6)",
          borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}`,
          backdropFilter: "blur(20px) saturate(1.4)",
          WebkitBackdropFilter: "blur(20px) saturate(1.4)",
          boxShadow: scrolled
            ? "0 4px 30px rgba(0, 0, 0, 0.3)"
            : "none",
        }}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="shrink-0" aria-label="Concierge home">
            <Logo size="sm" />
          </Link>

          {/* Center links — desktop only */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive =
                pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium transition-colors duration-200",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-dot"
                      className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[3px] w-[3px] rounded-full bg-primary"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right CTA — desktop only */}
          <div className="hidden lg:flex items-center gap-3">
            {!loading && user ? (
              /* Logged in state */
              <div className="flex items-center gap-2">
                {/* My Results link */}
                <Link
                  href="/results"
                  className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200"
                  style={{
                    color: pathname === "/results" ? "#bbc4f7" : "#c6c6cb",
                    background: pathname === "/results" ? "rgba(187,196,247,0.1)" : "transparent",
                    fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 15, color: pathname === "/results" ? "#bbc4f7" : "#8f9095" }}
                    aria-hidden="true"
                  >
                    bar_chart_4_bars
                  </span>
                  My Results
                </Link>

                {/* User avatar with dropdown */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserMenuOpen((v) => !v);
                    }}
                    className="flex items-center gap-2 rounded-full px-3 py-1.5 transition-all duration-200"
                    style={{
                      background: userMenuOpen
                        ? "rgba(69,71,75,0.3)"
                        : "rgba(69,71,75,0.15)",
                      border: "1px solid rgba(69,71,75,0.3)",
                    }}
                    aria-label="User menu"
                  >
                    <UserInitials name={userName} email={userEmail} />
                    <span
                      className="max-w-[120px] truncate text-sm font-medium"
                      style={{ color: "#c6c6cb", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
                    >
                      {userName || userEmail?.split("@")[0] || "Account"}
                    </span>
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-48 rounded-xl py-2"
                      style={{
                        background: "rgba(28,32,38,0.98)",
                        border: "1px solid rgba(69,71,75,0.4)",
                        backdropFilter: "blur(20px)",
                        boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-4 py-2 border-b" style={{ borderColor: "rgba(69,71,75,0.3)" }}>
                        <p className="text-xs font-semibold truncate" style={{ color: "#dfe2eb" }}>
                          {userName || "Account"}
                        </p>
                        <p className="text-xs truncate mt-0.5" style={{ color: "#8f9095" }}>
                          {userEmail}
                        </p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                        style={{ color: "#c6c6cb", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(184,92,107,0.1)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                      >
                        <LogOut className="h-3.5 w-3.5" style={{ color: "#b85c6b" }} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : !loading ? (
              /* Logged out state */
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium transition-colors duration-200"
                  style={{ color: "#b7c6ed", fontFamily: "var(--font-manrope, 'Manrope', sans-serif)" }}
                >
                  Sign In
                </Link>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent("open-qualify-modal"))}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2 bg-foreground hover:bg-foreground/90 text-background text-sm font-medium transition-all duration-200"
                >
                  Get Qualified
                </button>
              </div>
            ) : null}
          </div>

          {/* Mobile placeholder — keeps spacing */}
          <div className="lg:hidden w-8" />
        </nav>
      </motion.header>

      {/* Mobile bottom sheet trigger — fixed bottom-right */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex items-center justify-center",
                "h-12 w-12 rounded-full",
                "bg-surface/90 border border-glass-border",
                "backdrop-blur-xl",
                "text-text-muted",
                "shadow-lg shadow-black/30",
                "transition-all duration-300",
                "hover:border-glass-border-hover hover:text-text-primary",
                "active:scale-95"
              )}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="border-t border-glass-border bg-surface/95 backdrop-blur-2xl rounded-t-2xl px-6 pb-10 pt-6"
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            {/* Drag handle */}
            <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-glass-border" />

            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label }) => {
                const isActive =
                  pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium transition-colors",
                      isActive
                        ? "bg-primary-muted text-primary"
                        : "text-text-muted hover:bg-glass-bg hover:text-text-primary"
                    )}
                  >
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                    {label}
                  </Link>
                );
              })}

              {/* My Results link — only when logged in */}
              {!loading && user && (
                <Link
                  href="/results"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium transition-colors",
                    pathname === "/results"
                      ? "bg-primary-muted text-primary"
                      : "text-text-muted hover:bg-glass-bg hover:text-text-primary"
                  )}
                >
                  {pathname === "/results" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                  My Results
                </Link>
              )}
            </nav>

            <div className="mt-6 flex flex-col gap-3">
              {!loading && user ? (
                <>
                  <div
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{
                      background: "rgba(10,14,20,0.6)",
                      border: "1px solid rgba(69,71,75,0.3)",
                    }}
                  >
                    <UserInitials name={userName} email={userEmail} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "#dfe2eb" }}>
                        {userName || userEmail?.split("@")[0]}
                      </p>
                      <p className="text-xs truncate" style={{ color: "#8f9095" }}>
                        {userEmail}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setMobileOpen(false); handleSignOut(); }}
                    className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors"
                    style={{
                      background: "rgba(184,92,107,0.1)",
                      border: "1px solid rgba(184,92,107,0.2)",
                      color: "#b85c6b",
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : !loading ? (
                <button
                  onClick={() => { setMobileOpen(false); window.dispatchEvent(new CustomEvent("open-qualify-modal")); }}
                  className="flex items-center justify-center rounded-xl bg-luxury py-3.5 text-base font-semibold text-background transition-colors hover:bg-luxury-hover w-full"
                >
                  Get Started
                </button>
              ) : null}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Spacer to prevent content from going under the fixed navbar */}
      <div className="h-16" />
    </>
  );
}
