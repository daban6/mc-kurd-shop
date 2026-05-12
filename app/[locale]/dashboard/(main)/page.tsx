import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

const ADMIN_ROLES = ["superAdmin", "contentAdmin", "paymentAdmin"];

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !ADMIN_ROLES.includes(session.user.role as string)) {
    redirect(`/${locale}/dashboard/login`);
  }

  const stats = [
    { label: "Total Orders", value: 0 },
    { label: "Pending",      value: 0 },
    { label: "Approved",     value: 0 },
    { label: "Revenue (IQD)", value: 0 },
  ];

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold text-foreground">
        Welcome, {session.user.name}
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-surface p-5"
          >
            <p className="text-xs text-muted">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
