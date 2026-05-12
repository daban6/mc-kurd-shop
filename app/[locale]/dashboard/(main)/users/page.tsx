"use client";

import { useState, useMemo } from "react";
import { Search, ShieldBan, ShieldCheck } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type UserStatus = "active" | "banned";

interface User {
  id: string;
  name: string;
  email: string;
  joined: string;
  orders: number;
  status: UserStatus;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const INITIAL_USERS: User[] = [
  { id: "1", name: "MinecraftKurdi",  email: "kurdi@example.com",   joined: "2025-01-15", orders: 5, status: "active" },
  { id: "2", name: "ShadowPlayer99",  email: "shadow@example.com",  joined: "2025-02-20", orders: 2, status: "active" },
  { id: "3", name: "CraftMaster",     email: "craft@example.com",   joined: "2025-03-08", orders: 8, status: "banned" },
  { id: "4", name: "BlockBuilder",    email: "block@example.com",   joined: "2025-04-01", orders: 1, status: "active" },
  { id: "5", name: "Enderman_IQ",     email: "ender@example.com",   joined: "2025-04-22", orders: 3, status: "banned" },
];

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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [users, query]);

  function toggleBan(id: string) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "active" ? "banned" : "active" }
          : u
      )
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-[#f4f4f5]">Users</h1>
          <span className="rounded-full bg-[#1e1e2e] px-2.5 py-0.5 text-xs font-medium text-[#71717a]">
            {users.length}
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#71717a]" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 w-64 rounded border border-[#1e1e2e] bg-[#13131a] pl-9 pr-3 text-sm text-[#f4f4f5] placeholder-[#71717a] outline-none transition-colors focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[#1e1e2e] bg-[#13131a]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e2e] text-left text-xs text-[#71717a]">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e2e]">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-[#71717a]"
                  >
                    No users match your search
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr
                    key={user.id}
                    className={`transition-colors hover:bg-[#0a0a0f]/50 ${
                      user.status === "banned"
                        ? "shadow-[inset_3px_0_0_rgba(239,68,68,0.45)]"
                        : ""
                    }`}
                  >
                    {/* Avatar + name + email */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-900 text-xs font-bold text-white">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="font-medium text-[#f4f4f5]">{user.name}</p>
                          <p className="text-xs text-[#71717a]">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3 text-[#71717a]">
                      {formatDate(user.joined)}
                    </td>

                    {/* Orders */}
                    <td className="px-4 py-3 text-[#f4f4f5]">{user.orders}</td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {user.status === "active" ? (
                        <span className="inline-flex items-center rounded bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-400">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-400">
                          Banned
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      {user.status === "active" ? (
                        <button
                          onClick={() => toggleBan(user.id)}
                          className="flex items-center gap-1 rounded bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
                        >
                          <ShieldBan className="h-3 w-3" />
                          Ban
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleBan(user.id)}
                          className="flex items-center gap-1 rounded bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400 transition-colors hover:bg-green-500/20"
                        >
                          <ShieldCheck className="h-3 w-3" />
                          Unban
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
