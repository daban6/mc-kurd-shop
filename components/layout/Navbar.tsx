"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { ShoppingCart, Menu, X, Sword } from "lucide-react";
import { useState } from "react";

export default function Navbar({ locale }: { locale: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: locale === "ku" ? "سەرەتا" : "Home" },
    { href: "/shop", label: locale === "ku" ? "فرۆشگا" : "Shop" },
    { href: "/categories", label: locale === "ku" ? "پۆلەکان" : "Categories" },
  ];

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-12 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5">
            <Sword className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-foreground">MC Kurd Shop</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center rounded border border-border bg-surface text-xs">
              <button
                onClick={() => switchLocale("en")}
                className={`px-2 py-1 transition-colors ${
                  locale === "en"
                    ? "bg-primary text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => switchLocale("ku")}
                className={`px-2 py-1 transition-colors ${
                  locale === "ku"
                    ? "bg-primary text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                KU
              </button>
            </div>

            {/* Login Button */}
            <Link
              href="/login"
              className="hidden text-sm font-medium text-muted transition-colors hover:text-foreground sm:block"
            >
              {locale === "ku" ? "چوونەژوورەوە" : "Login"}
            </Link>

            {/* Cart */}
            <button className="relative p-1.5 text-muted transition-colors hover:text-foreground">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-foreground">
                0
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-muted transition-colors hover:text-foreground md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border py-3 md:hidden">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2 py-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                {locale === "ku" ? "چوونەژوورەوە" : "Login"}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
