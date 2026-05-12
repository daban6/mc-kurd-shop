"use client";

import { useState } from "react";
import { Plus, X, UserMinus } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminRole = "superAdmin" | "contentAdmin" | "paymentAdmin";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  joined: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CURRENT_ADMIN_ID = "1";

const INITIAL_ADMINS: Admin[] = [
  { id: "1", name: "DabanAdmin",  email: "daban@mckurdshop.com",   role: "superAdmin",   joined: "2025-01-01" },
  { id: "2", name: "ContentMod",  email: "content@mckurdshop.com", role: "contentAdmin", joined: "2025-02-15" },
  { id: "3", name: "PaymentMod",  email: "payment@mckurdshop.com", role: "paymentAdmin", joined: "2025-03-20" },
];

const ROLES: AdminRole[] = ["superAdmin", "contentAdmin", "paymentAdmin"];

const ROLE_LABELS: Record<AdminRole, string> = {
  superAdmin:   "Super Admin",
  contentAdmin: "Content Admin",
  paymentAdmin: "Payment Admin",
};

const ROLE_STYLES: Record<AdminRole, string> = {
  superAdmin:   "bg-[#7c3aed]/20 text-[#7c3aed]",
  contentAdmin: "bg-blue-500/15  text-blue-400",
  paymentAdmin: "bg-yellow-500/15 text-yellow-400",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const capitals = name.match(/[A-Z]/g);
  if (capitals && capitals.length >= 2) return capitals[0] + capitals[1];
  return name.slice(0, 2).toUpperCase();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminsPage() {
  const [admins,      setAdmins]      = useState<Admin[]>(INITIAL_ADMINS);
  const [showForm,    setShowForm]    = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole,  setInviteRole]  = useState<AdminRole>("contentAdmin");

  function changeRole(id: string, newRole: AdminRole) {
    setAdmins((prev) =>
      prev.map((a) => (a.id === id ? { ...a, role: newRole } : a))
    );
  }

  function removeAdmin(id: string) {
    setAdmins((prev) => prev.filter((a) => a.id !== id));
  }

  const selectCls =
    "h-8 cursor-pointer rounded border border-[#1e1e2e] bg-[#0a0a0f] px-2 text-xs text-[#f4f4f5] outline-none transition-colors focus:border-[#7c3aed] disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#f4f4f5]">Admins</h1>
          <p className="mt-0.5 text-sm text-[#71717a]">
            Manage dashboard access and roles
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1.5 rounded bg-[#7c3aed] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6d28d9]"
        >
          <Plus className="h-4 w-4" />
          Add Admin
        </button>
      </div>

      {/* Inline invite form */}
      {showForm && (
        <div className="mb-4 rounded-lg border border-[#7c3aed]/30 bg-[#13131a] p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-[#f4f4f5]">Invite New Admin</p>
            <button
              onClick={() => setShowForm(false)}
              className="text-[#71717a] transition-colors hover:text-[#f4f4f5]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="admin@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="h-9 flex-1 rounded border border-[#1e1e2e] bg-[#0a0a0f] px-3 text-sm text-[#f4f4f5] placeholder-[#71717a] outline-none transition-colors focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as AdminRole)}
              className="h-9 cursor-pointer rounded border border-[#1e1e2e] bg-[#0a0a0f] px-3 text-sm text-[#f4f4f5] outline-none transition-colors focus:border-[#7c3aed]"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
            <button
              onClick={() => setShowForm(false)}
              className="rounded bg-[#7c3aed] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6d28d9]"
            >
              Send Invite
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-[#1e1e2e] bg-[#13131a]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e2e] text-left text-xs text-[#71717a]">
                <th className="px-4 py-3 font-medium">Admin</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e2e]">
              {admins.map((admin) => {
                const isSelf = admin.id === CURRENT_ADMIN_ID;
                return (
                  <tr
                    key={admin.id}
                    className="transition-colors hover:bg-[#0a0a0f]/50"
                  >
                    {/* Avatar + name + email */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-900 text-xs font-bold text-white">
                          {getInitials(admin.name)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-[#f4f4f5]">
                              {admin.name}
                            </p>
                            {isSelf && (
                              <span className="rounded bg-[#1e1e2e] px-1.5 py-0.5 text-[10px] text-[#71717a]">
                                you
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#71717a]">{admin.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role badge */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${ROLE_STYLES[admin.role]}`}
                      >
                        {ROLE_LABELS[admin.role]}
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3 text-[#71717a]">
                      {formatDate(admin.joined)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={admin.role}
                          disabled={isSelf}
                          onChange={(e) =>
                            changeRole(admin.id, e.target.value as AdminRole)
                          }
                          className={selectCls}
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => removeAdmin(admin.id)}
                          disabled={isSelf}
                          className="flex items-center gap-1 rounded bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <UserMinus className="h-3 w-3" />
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
