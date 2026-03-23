"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

export function Navbar() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20);
  });

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
                  {/* Active dot indicator */}
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

          {/* CTA — desktop only */}
          <div className="hidden lg:block">
            <Link
              href="/qualify"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 bg-foreground hover:bg-foreground/90 text-background text-sm font-medium transition-all duration-200"
            >
              Get Qualified
            </Link>
          </div>

          {/* Mobile placeholder — keeps spacing, actual trigger is the fixed bottom button */}
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
            </nav>

            <div className="mt-6">
              <Link
                href="/qualify"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center rounded-xl bg-luxury py-3.5 text-base font-semibold text-background transition-colors hover:bg-luxury-hover"
              >
                Get Started
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Spacer to prevent content from going under the fixed navbar */}
      <div className="h-16" />
    </>
  );
}
