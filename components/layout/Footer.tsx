import { Link } from "@/i18n/navigation";

export default function Footer({ locale }: { locale: string }) {
  const links = [
    { href: "/shop", label: locale === "ku" ? "فرۆشگا" : "Shop" },
    { href: "/about", label: locale === "ku" ? "دەربارە" : "About" },
    { href: "/contact", label: locale === "ku" ? "پەیوەندی" : "Contact" },
  ];

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div className="flex flex-col gap-1">
            <span className="text-base font-bold text-foreground">MC Kurd Shop</span>
            <span className="text-sm text-muted">
              {locale === "ku"
                ? "باشترین چاوگەکان و مۆدەکانی ماینکرافت"
                : "Premium Minecraft shaders, mods & more"}
            </span>
          </div>

          {/* Links */}
          <div className="flex gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 border-t border-border pt-4">
          <p className="text-center text-xs text-muted">
            &copy; {new Date().getFullYear()} MC Kurd Shop.{" "}
            {locale === "ku" ? "هەموو مافەکان پارێزراون." : "All rights reserved."}
          </p>
        </div>
      </div>
    </footer>
  );
}
