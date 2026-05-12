"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle, Loader2, ShoppingBag } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = "pending" | "approved" | "rejected";
type PaymentMethod = "fib" | "fastpay" | "qicard" | "crypto";
type TabFilter = "all" | OrderStatus;

interface OrderItem {
  id: string;
  productId: string;
  priceIqd: number;
  priceUsd: number;
}

interface Order {
  id: string;
  orderCode: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  totalIqd: number;
  createdAt: string;
  user: { name: string; email: string } | null;
  items: OrderItem[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const tabs: { id: TabFilter; label: string }[] = [
  { id: "all",      label: "All"      },
  { id: "pending",  label: "Pending"  },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

const statusStyles: Record<OrderStatus, string> = {
  pending:  "bg-yellow-500/15 text-yellow-400",
  approved: "bg-green-500/15  text-green-400",
  rejected: "bg-red-500/15    text-red-400",
};

const paymentLabels: Record<PaymentMethod, string> = {
  fib:     "FIB",
  fastpay: "FastPay",
  qicard:  "QiCard",
  crypto:  "Crypto",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

function PaymentBadge({ method }: { method: PaymentMethod }) {
  return (
    <span className="inline-flex items-center rounded bg-[#1e1e2e] px-2 py-0.5 text-xs font-medium text-[#f4f4f5]">
      {paymentLabels[method] ?? method}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = useCallback(async (tab: TabFilter) => {
    setLoading(true);
    try {
      const url =
        tab === "all"
          ? "/api/dashboard/orders"
          : `/api/dashboard/orders?status=${tab}`;
      const res = await fetch(url);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab, fetchOrders]);

  async function handleAction(orderId: string, action: "approve" | "reject") {
    setActionLoading(`${orderId}-${action}`);
    try {
      await fetch("/api/dashboard/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action }),
      });
      await fetchOrders(activeTab);
    } finally {
      setActionLoading(null);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#f4f4f5]">Orders</h1>
        <p className="mt-0.5 text-sm text-[#71717a]">
          Manage and approve customer orders
        </p>
      </div>

      {/* Tab bar */}
      <div className="mb-4 flex gap-1 border-b border-[#1e1e2e]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-[#7c3aed] text-[#7c3aed]"
                : "text-[#71717a] hover:text-[#f4f4f5]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="rounded-lg border border-[#1e1e2e] bg-[#13131a]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-[#7c3aed]" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-[#71717a]">
            <ShoppingBag className="h-8 w-8" />
            <p className="text-sm">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e1e2e] text-left text-xs text-[#71717a]">
                  <th className="px-4 py-3 font-medium">Order Code</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Total (IQD)</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e2e]">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className={`transition-colors hover:bg-[#0a0a0f]/50 ${
                      order.status === "pending"
                        ? "shadow-[inset_3px_0_0_rgba(234,179,8,0.45)]"
                        : ""
                    }`}
                  >
                    {/* Order code */}
                    <td className="px-4 py-3 font-mono text-xs text-[#71717a]">
                      {order.orderCode}
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#f4f4f5]">
                        {order.user?.name ?? "—"}
                      </p>
                      <p className="text-xs text-[#71717a]">
                        {order.user?.email ?? "—"}
                      </p>
                    </td>

                    {/* Items count */}
                    <td className="px-4 py-3 text-[#f4f4f5]">
                      {order.items.length}
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3 font-medium text-green-400">
                      {order.totalIqd.toLocaleString()}
                    </td>

                    {/* Payment method */}
                    <td className="px-4 py-3">
                      <PaymentBadge method={order.paymentMethod} />
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-[#71717a]">
                      {formatDate(order.createdAt)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      {order.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAction(order.id, "approve")}
                            disabled={actionLoading !== null}
                            className="flex items-center gap-1 rounded bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400 transition-colors hover:bg-green-500/20 disabled:opacity-50"
                          >
                            {actionLoading === `${order.id}-approve` ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle className="h-3 w-3" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(order.id, "reject")}
                            disabled={actionLoading !== null}
                            className="flex items-center gap-1 rounded bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                          >
                            {actionLoading === `${order.id}-reject` ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-[#71717a]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
