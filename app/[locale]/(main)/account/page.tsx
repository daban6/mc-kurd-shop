"use client";

import { useState } from "react";
import {
  ShoppingBag,
  User,
  Lock,
  Download,
  Upload,
  ExternalLink,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ───────────────────────────────────────────────────────────────────

type Section = "orders" | "profile" | "password" | "downloads";

type OrderStatus = "pending" | "approved" | "rejected";

interface Order {
  id: string;
  product: string;
  date: string;
  amount: string;
  status: OrderStatus;
}

interface DownloadItem {
  product: string;
  date: string;
  size: string;
}

// ─── Hardcoded data ───────────────────────────────────────────────────────────

const orders: Order[] = [
  { id: "#MC-1041", product: "BSL Shaders",         date: "May 8, 2025",   amount: "15,000 IQD", status: "approved"  },
  { id: "#MC-1038", product: "RLCraft Modpack",      date: "May 5, 2025",   amount: "25,000 IQD", status: "pending"   },
  { id: "#MC-1031", product: "Warrior Skin Pack",    date: "Apr 28, 2025",  amount: "8,000 IQD",  status: "approved"  },
  { id: "#MC-1024", product: "EssentialsX Plugin",   date: "Apr 20, 2025",  amount: "12,000 IQD", status: "rejected"  },
  { id: "#MC-1017", product: "SEUS PTGI Shaders",    date: "Apr 11, 2025",  amount: "20,000 IQD", status: "approved"  },
];

const downloadItems: DownloadItem[] = [
  { product: "BSL Shaders",      date: "May 8, 2025",  size: "2.4 MB" },
  { product: "Warrior Skin Pack", date: "Apr 28, 2025", size: "840 KB" },
  { product: "SEUS PTGI Shaders", date: "Apr 11, 2025", size: "3.1 MB" },
];

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

// ─── Input ────────────────────────────────────────────────────────────────────

function Field({
  label,
  id,
  type = "text",
  placeholder,
  disabled,
}: {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-muted">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className="h-9 w-full rounded border border-border bg-background px-3 text-sm text-foreground placeholder-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-40"
      />
    </div>
  );
}

// ─── Tab content ──────────────────────────────────────────────────────────────

function OrdersTab() {
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
            <tr key={order.id} className="text-foreground">
              <td className="py-3 pr-4 font-mono text-xs text-muted">{order.id}</td>
              <td className="py-3 pr-4 font-medium">{order.product}</td>
              <td className="py-3 pr-4 text-muted">{order.date}</td>
              <td className="py-3 pr-4 text-success font-medium">{order.amount}</td>
              <td className="py-3 pr-4">
                <StatusBadge status={order.status} />
              </td>
              <td className="py-3">
                <button className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors">
                  <ExternalLink className="h-3.5 w-3.5" />
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProfileTab() {
  return (
    <div className="space-y-6">
      {/* Avatar upload */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-900 text-lg font-bold text-white">
          MK
        </div>
        <div>
          <p className="mb-1.5 text-sm font-medium text-foreground">Profile Photo</p>
          <Button variant="outline" size="sm">
            <Upload className="h-3.5 w-3.5" />
            Upload Avatar
          </Button>
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Form */}
      <div className="space-y-4 max-w-sm">
        <Field label="Username" id="username" placeholder="CraftMaster99" />
        <Field label="Email" id="email" type="email" placeholder="you@example.com" disabled />
        <Button size="default">Save Changes</Button>
      </div>
    </div>
  );
}

function PasswordTab() {
  return (
    <div className="space-y-4 max-w-sm">
      <Field label="Current Password"     id="current-password"  type="password" placeholder="••••••••" />
      <Field label="New Password"         id="new-password"      type="password" placeholder="••••••••" />
      <Field label="Confirm New Password" id="confirm-password"  type="password" placeholder="••••••••" />
      <Button size="default">Update Password</Button>
    </div>
  );
}

function DownloadsTab() {
  return (
    <div className="space-y-2">
      {downloadItems.map((item) => (
        <div
          key={item.product}
          className="flex items-center justify-between rounded border border-border bg-background px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <FileDown className="h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">{item.product}</p>
              <p className="text-xs text-muted">{item.date} · {item.size}</p>
            </div>
          </div>
          <Button size="sm">
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        </div>
      ))}
    </div>
  );
}

// ─── Nav items ────────────────────────────────────────────────────────────────

const navItems: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "orders",    label: "My Orders",        icon: ShoppingBag },
  { id: "profile",   label: "Profile Settings",  icon: User        },
  { id: "password",  label: "Change Password",   icon: Lock        },
  { id: "downloads", label: "Downloads",         icon: Download    },
];

const tabContent: Record<Section, React.ReactNode> = {
  orders:    <OrdersTab    />,
  profile:   <ProfileTab   />,
  password:  <PasswordTab  />,
  downloads: <DownloadsTab />,
};

const tabHeadings: Record<Section, string> = {
  orders:    "My Orders",
  profile:   "Profile Settings",
  password:  "Change Password",
  downloads: "Downloads",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const [active, setActive] = useState<Section>("orders");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

        {/* ── Sidebar ── */}
        <aside className="w-full shrink-0 lg:w-56">
          <div className="rounded-lg border border-border bg-surface p-4">
            {/* Avatar + info */}
            <div className="mb-4 flex flex-col items-center gap-2 border-b border-border pb-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-900 text-lg font-bold text-white">
                MK
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">MinecraftKurdi</p>
                <p className="text-xs text-muted">kurdi@example.com</p>
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
            {tabContent[active]}
          </div>
        </div>

      </div>
    </div>
  );
}
