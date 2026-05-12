"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { ShoppingCart, Menu, X, Sword, ChevronDown, LogOut, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { authClient } from "@/lib/auth-client";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Navbar({ locale }: { locale: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen]     = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router      = useRouter();
  const pathname    = usePathname();
  const { itemCount } = useCart();
  const { data: session } = authClient.useSession();

  const isKurdish = locale === "ku";

  const navLinks = [
    { href: "/",          label: isKurdish ? "سەرەتا"   : "Home"       },
    { href: "/shop",      label: isKurdish ? "فرۆشگا"   : "Shop"       },
    { href: "/categories",label: isKurdish ? "پۆلەکان"  : "Categories" },
  ];

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
  }

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
            {/* Currency Switcher */}
            <div className="flex items-center rounded border border-border bg-surface text-xs">
              <button className="bg-violet-600 px-2 py-1 text-foreground transition-colors">
                IQD
              </button>
              <button className="px-2 py-1 text-muted transition-colors hover:text-foreground">
                USD
              </button>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center rounded border border-border bg-surface text-xs">
              <button
                onClick={() => switchLocale("en")}
                className={`px-2 py-1 transition-colors ${
                  locale === "en"
                    ? "bg-violet-600 text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => switchLocale("ku")}
                className={`px-2 py-1 transition-colors ${
                  locale === "ku"
                    ? "bg-violet-600 text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                KU
              </button>
            </div>

            {/* Auth: user menu or login */}
            {session ? (
              <div ref={dropdownRef} className="relative hidden sm:block">
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-900 text-[11px] font-bold text-white">
                    {getInitials(session.user.name ?? session.user.email ?? "?")}
                  </div>
                  <span className="max-w-[96px] truncate text-xs font-medium text-foreground">
                    {session.user.name ?? session.user.email}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 rounded border border-border bg-surface shadow-lg">
                    <Link
                      href="/account"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-muted transition-colors hover:bg-border hover:text-foreground"
                    >
                      <User className="h-3.5 w-3.5 shrink-0" />
                      {isKurdish ? "ئەکاونت" : "Account"}
                    </Link>
                    <div className="border-t border-border" />
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted transition-colors hover:bg-border hover:text-foreground"
                    >
                      <LogOut className="h-3.5 w-3.5 shrink-0" />
                      {isKurdish ? "دەرچوون" : "Sign Out"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden text-sm font-medium text-muted transition-colors hover:text-foreground sm:block"
              >
                {isKurdish ? "چوونەژوورەوە" : "Login"}
              </Link>
            )}

            {/* Cart */}
            <button className="relative p-1.5 text-muted transition-colors hover:text-foreground">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-foreground">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
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

              {session ? (
                <>
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-2 py-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
                  >
                    {isKurdish ? "ئەکاونت" : "Account"}
                  </Link>
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                    className="px-2 py-1.5 text-left text-sm font-medium text-muted transition-colors hover:text-foreground"
                  >
                    {isKurdish ? "دەرچوون" : "Sign Out"}
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2 py-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
                >
                  {isKurdish ? "چوونەژوورەوە" : "Login"}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
