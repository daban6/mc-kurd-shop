import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Sword,
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { Link } from "@/i18n/navigation";

const ADMIN_ROLES = ["superAdmin", "contentAdmin", "paymentAdmin"];

const navItems = [
  { href: "/dashboard",          label: "Overview",  icon: LayoutDashboard },
  { href: "/dashboard/orders",   label: "Orders",    icon: ShoppingBag     },
  { href: "/dashboard/products", label: "Products",  icon: Package         },
  { href: "/dashboard/users",    label: "Users",     icon: Users           },
];

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !ADMIN_ROLES.includes(session.user.role as string)) {
    redirect(`/${locale}/dashboard/login`);
  }

  const role = session.user.role as string;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 flex w-56 flex-col border-r border-border bg-surface">
        {/* Logo */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-4">
          <Sword className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold tracking-tight text-foreground">
            MC Kurd Shop
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href as never}
              className="flex items-center gap-2.5 rounded px-3 py-2 text-sm text-muted transition-colors hover:bg-border hover:text-foreground"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}

          {role === "superAdmin" && (
            <Link
              href={"/dashboard/admins" as never}
              className="flex items-center gap-2.5 rounded px-3 py-2 text-sm text-muted transition-colors hover:bg-border hover:text-foreground"
            >
              <ShieldCheck className="h-4 w-4 shrink-0" />
              Admins
            </Link>
          )}
        </nav>

        {/* Sign out */}
        <div className="border-t border-border px-3 py-4">
          <form action="/api/auth/sign-out" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-sm text-muted transition-colors hover:bg-border hover:text-foreground"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="ml-56 flex flex-1 flex-col">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
