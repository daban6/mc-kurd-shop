"use client";

import { useState, useEffect } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import {
  ShoppingBag,
  User,
  Lock,
  Download,
  ExternalLink,
  FileDown,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = "orders" | "profile" | "password" | "downloads";
type OrderStatus = "pending" | "approved" | "rejected";

interface ApiOrder {
  orderCode: string;
  totalIqd:  number;
  totalUsd:  number;
  currency:  string;
  status:    OrderStatus;
  createdAt: string;
  items:     { nameEn: string }[];
}

interface ApiDownload {
  token:       string;
  productName: string;
  expiresAt:   string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function formatIqd(amount: number) {
  return new Intl.NumberFormat("en-IQ").format(amount) + " IQD";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const statusStyles: Record<OrderStatus, string> = {
  pending:  "bg-yellow-500/15 text-yellow-400",
  approved: "bg-green-500/15 text-green-400",
  rejected: "bg-red-500/15 text-red-400",
};

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[status]}`}>
      {status}
    </span>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label, id, type = "text", placeholder, disabled, value, onChange,
}: {
  label: string; id: string; type?: string; placeholder?: string; disabled?: boolean;
  value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-muted">{label}</label>
      <input
        id={id} type={type} placeholder={placeholder} disabled={disabled}
        value={value} onChange={onChange}
        className="h-9 w-full rounded border border-border bg-background px-3 text-sm text-foreground placeholder-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-40"
      />
    </div>
  );
}

// ─── Tab components ───────────────────────────────────────────────────────────

function OrdersTab({ orders, loading }: { orders: ApiOrder[]; loading: boolean }) {
  if (loading) return <p className="text-sm text-muted">Loading…</p>;
  if (orders.length === 0) return <p className="text-sm text-muted">No orders yet.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted">
            <th className="pb-3 pr-4 font-medium">Order ID</th>
            <th className="pb-3 pr-4 font-medium">Product</th>
            <th className="pb-3 pr-4 font-medium">Date</th>
            <th className="pb-3 pr-4 font-medium">Amount</th>
            <th className="pb-3 pr-4 font-medium">Status</th>
            <th className="pb-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders.map((order) => (
            <tr key={order.orderCode} className="text-foreground">
              <td className="py-3 pr-4 font-mono text-xs text-muted">{order.orderCode}</td>
              <td className="py-3 pr-4 font-medium">
                {order.items.map((i) => i.nameEn).join(", ") || "—"}
              </td>
              <td className="py-3 pr-4 text-muted">{formatDate(order.createdAt)}</td>
              <td className="py-3 pr-4 text-success font-medium">
                {order.currency === "USD"
                  ? `$${order.totalUsd.toFixed(2)}`
                  : formatIqd(order.totalIqd)}
              </td>
              <td className="py-3 pr-4">
                <StatusBadge status={order.status} />
              </td>
              <td className="py-3">
                <Link
                  href={`/order/${order.orderCode}` as never}
                  className="flex items-center gap-1 text-xs text-primary transition-colors hover:text-primary-hover"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProfileTab({ initialName, email }: { initialName: string; email: string }) {
  const [name,    setName]    = useState(initialName);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const { error: updateError } = await authClient.updateUser({ name });
      if (updateError) {
        setError(updateError.message ?? "Failed to save changes.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  const [twoFaMsg, setTwoFaMsg] = useState(false);

  return (
    <div className="space-y-6">
      {/* Avatar (display only) */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-900 text-lg font-bold text-white">
          {getInitials(initialName || "?")}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{initialName || "—"}</p>
          <p className="text-xs text-muted">{email}</p>
        </div>
      </div>

      <div className="h-px bg-border" />

      <form className="max-w-sm space-y-4" onSubmit={handleSave}>
        <Field
          label="Username" id="username" placeholder="CraftMaster99"
          value={name} onChange={(e) => setName(e.target.value)}
        />
        <Field
          label="Email" id="email" type="email" placeholder="you@example.com"
          value={email} disabled
        />
        {error   && <p className="text-xs text-red-400">{error}</p>}
        {success && <p className="text-xs text-green-400">Changes saved.</p>}
        <Button size="default" disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </form>

      <div className="h-px bg-border" />

      {/* 2FA section */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
            <p className="text-xs text-muted">Add an extra layer of security to your account</p>
            {twoFaMsg && (
              <p className="mt-1.5 text-xs text-violet-400">2FA coming soon</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => { setTwoFaMsg(true); setTimeout(() => setTwoFaMsg(false), 3000); }}
          className="shrink-0 rounded bg-primary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-primary-hover"
        >
          Enable 2FA
        </button>
      </div>
    </div>
  );
}

function PasswordTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (!/\d/.test(newPassword)) {
      setError("New password must contain at least one number.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const { error: changeError } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      if (changeError) {
        setError(changeError.message ?? "Failed to update password.");
      } else {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="max-w-sm space-y-4" onSubmit={handleSubmit}>
      <Field
        label="Current Password" id="current-password" type="password" placeholder="••••••••"
        value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <Field
        label="New Password" id="new-password" type="password" placeholder="••••••••"
        value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
      />
      <Field
        label="Confirm New Password" id="confirm-password" type="password" placeholder="••••••••"
        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
      />
      {error   && <p className="text-xs text-red-400">{error}</p>}
      {success && <p className="text-xs text-green-400">Password updated successfully.</p>}
      <Button size="default" disabled={loading}>
        {loading ? "Updating…" : "Update Password"}
      </Button>
    </form>
  );
}

function DownloadsTab({ downloads, loading }: { downloads: ApiDownload[]; loading: boolean }) {
  if (loading) return <p className="text-sm text-muted">Loading…</p>;
  if (downloads.length === 0) return <p className="text-sm text-muted">No downloads available.</p>;

  return (
    <div className="space-y-2">
      {downloads.map((item) => (
        <div
          key={item.token}
          className="flex items-center justify-between rounded border border-border bg-background px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <FileDown className="h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">{item.productName}</p>
              <p className="text-xs text-muted">Expires {formatDate(item.expiresAt)}</p>
            </div>
          </div>
          <a href={`/api/account/downloads/${item.token}`}>
            <Button size="sm">
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
          </a>
        </div>
      ))}
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

const navItems: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "orders",    label: "My Orders",        icon: ShoppingBag },
  { id: "profile",   label: "Profile Settings",  icon: User        },
  { id: "password",  label: "Change Password",   icon: Lock        },
  { id: "downloads", label: "Downloads",         icon: Download    },
];

const tabHeadings: Record<Section, string> = {
  orders:    "My Orders",
  profile:   "Profile Settings",
  password:  "Change Password",
  downloads: "Downloads",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [active, setActive] = useState<Section>("orders");

  const [orders,           setOrders]           = useState<ApiOrder[]>([]);
  const [ordersLoading,    setOrdersLoading]    = useState(true);
  const [downloads,        setDownloads]        = useState<ApiDownload[]>([]);
  const [downloadsLoading, setDownloadsLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) router.push("/auth/login");
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/account/orders")
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [session]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/account/downloads")
      .then((r) => r.json())
      .then((data) => setDownloads(Array.isArray(data) ? data : []))
      .catch(() => setDownloads([]))
      .finally(() => setDownloadsLoading(false));
  }, [session]);

  if (isPending || !session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted">Loading…</p>
      </div>
    );
  }

  const userName = session.user.name ?? session.user.email ?? "";

  function renderTab() {
    switch (active) {
      case "orders":
        return <OrdersTab orders={orders} loading={ordersLoading} />;
      case "profile":
        return <ProfileTab initialName={session!.user.name ?? ""} email={session!.user.email ?? ""} />;
      case "password":
        return <PasswordTab />;
      case "downloads":
        return <DownloadsTab downloads={downloads} loading={downloadsLoading} />;
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

        {/* ── Sidebar ── */}
        <aside className="w-full shrink-0 lg:w-56">
          <div className="rounded-lg border border-border bg-surface p-4">
            {/* Avatar + info */}
            <div className="mb-4 flex flex-col items-center gap-2 border-b border-border pb-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-900 text-lg font-bold text-white">
                {getInitials(userName)}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {session.user.name ?? "—"}
                </p>
                <p className="text-xs text-muted">{session.user.email}</p>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex flex-col gap-1">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  className={`flex w-full items-center gap-2.5 rounded px-3 py-2 text-left text-sm transition-colors ${
                    active === id
                      ? "bg-primary/20 text-primary font-medium"
                      : "text-muted hover:bg-border hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* ── Content ── */}
        <div className="min-w-0 flex-1">
          <div className="rounded-lg border border-border bg-surface p-6">
            <h2 className="mb-5 text-base font-semibold text-foreground">
              {tabHeadings[active]}
            </h2>
            {renderTab()}
          </div>
        </div>

      </div>
    </div>
  );
}
