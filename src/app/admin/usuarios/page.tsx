"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import type { AdminUser, UserRole, AccountStatus } from "@/types";

const ROLE_LABELS: Record<UserRole, string> = {
  cliente: "Cliente",
  gestor_tienda: "Gestor",
  administrador: "Administrador",
};

const STATUS_LABELS: Record<AccountStatus, string> = {
  pending: "Pendiente",
  active: "Activo",
  suspended: "Suspendido",
};

const STATUS_COLORS: Record<AccountStatus, string> = {
  pending: "bg-[rgba(245,158,11,0.1)] text-[#92400e]",
  active: "bg-[rgba(30,58,95,0.1)] text-[#1e3a5f]",
  suspended: "bg-[#f1f5f9] text-[#6b7280]",
};

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "cliente", label: "Cliente" },
  { value: "gestor_tienda", label: "Gestor de tienda" },
  { value: "administrador", label: "Administrador" },
];

const PER_PAGE = 20;

export default function AdminUsuariosPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "administrador";

  useEffect(() => {
    if (currentUser && !isAdmin) {
      router.replace("/admin");
    }
  }, [currentUser, isAdmin, router]);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rowLoading, setRowLoading] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ userId: string; message: string } | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;

    setLoading(true);
    setError(null);
    const params: { page?: number; per_page?: number; role?: string; status?: string; q?: string } = {
      page,
      per_page: PER_PAGE,
    };
    if (roleFilter) params.role = roleFilter;
    if (statusFilter) params.status = statusFilter;
    if (query.trim()) params.q = query.trim();
    const result = await apiClient.admin.listUsers(params);
    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }
    setUsers(result.data.items);
    setTotal(result.data.total);
  }, [isAdmin, page, roleFilter, statusFilter, query]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  async function handleRoleChange(userId: string, newRole: UserRole) {
    setRowLoading(userId);
    setRowError(null);
    const result = await apiClient.admin.updateRole(userId, { role: newRole });
    setRowLoading(null);

    if (result.error) {
      setRowError({ userId, message: result.error.message });
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
  }

  async function handleStatusToggle(userId: string, currentStatus: AccountStatus) {
    const nextStatus: AccountStatus = currentStatus === "active" ? "suspended" : "active";

    setRowLoading(userId);
    setRowError(null);
    const result = await apiClient.admin.updateStatus(userId, { status: nextStatus });
    setRowLoading(null);

    if (result.error) {
      setRowError({ userId, message: result.error.message });
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u)));
  }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  if (currentUser && !isAdmin) return null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#6b7280]">
          🔍
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar usuario..."
            className="w-full border-0 bg-transparent text-sm text-[#111827] outline-none"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="h-[34px] rounded-lg border border-[#e5e7eb] bg-white px-3 text-xs text-[#6b7280]"
        >
          <option value="">Todos los roles</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="h-[34px] rounded-lg border border-[#e5e7eb] bg-white px-3 text-xs text-[#6b7280]"
        >
          <option value="">Todos</option>
          <option value="pending">Pendiente</option>
          <option value="active">Activo</option>
          <option value="suspended">Suspendido</option>
        </select>
        <button
          onClick={() => void fetchUsers()}
          className="h-[34px] rounded-lg bg-[#1e3a5f] px-4 font-display text-xs font-semibold text-white"
          type="button"
        >
          Buscar
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c]">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f1f5f9] text-left text-[11px] uppercase tracking-[0.04em] text-[#6b7280]">
              <th className="px-4 py-2.5">Usuario</th>
              <th className="px-4 py-2.5">Rol</th>
              <th className="px-4 py-2.5">Estado</th>
              <th className="px-4 py-2.5">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[#6b7280]">
                  Cargando usuarios...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[#6b7280]">
                  No se encontraron usuarios.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <UserRow
                  key={u.id}
                  user={u}
                  isAdmin={isAdmin}
                  isSelf={u.id === currentUser?.id}
                  isLoading={rowLoading === u.id}
                  rowError={rowError?.userId === u.id ? rowError.message : null}
                  onRoleChange={handleRoleChange}
                  onStatusToggle={handleStatusToggle}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between text-xs text-[#6b7280]">
          <span>{total} usuarios</span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-8 rounded-md border border-[#e5e7eb] bg-white px-3 disabled:opacity-40"
              type="button"
            >
              ‹
            </button>
            <span className="flex h-8 items-center rounded-md bg-[#1e3a5f] px-3 font-semibold text-white">
              {page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-8 rounded-md border border-[#e5e7eb] bg-white px-3 disabled:opacity-40"
              type="button"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface UserRowProps {
  user: AdminUser;
  isAdmin: boolean;
  isSelf: boolean;
  isLoading: boolean;
  rowError: string | null;
  onRoleChange: (userId: string, role: UserRole) => Promise<void>;
  onStatusToggle: (userId: string, status: AccountStatus) => Promise<void>;
}

function UserRow({
  user,
  isAdmin,
  isSelf,
  isLoading,
  rowError,
  onRoleChange,
  onStatusToggle,
}: UserRowProps) {
  const initials = user.full_name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <>
      <tr className={`border-b border-[#e5e7eb] last:border-b-0 ${isLoading ? "opacity-50" : ""}`}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#1e3a5f,#2d5a96)] text-[10px] font-bold text-white">
              {initials}
            </div>
            <div>
              <div className="text-sm font-semibold text-[#111827]">
                {user.full_name}
                {isSelf && <span className="ml-1 text-xs text-[#6b7280]">(tú)</span>}
              </div>
              <div className="text-[11px] text-[#6b7280]">{user.email}</div>
            </div>
          </div>
        </td>

        <td className="px-4 py-3">
          {isAdmin && !isSelf ? (
            <select
              value={user.role}
              disabled={isLoading}
              onChange={(e) => void onRoleChange(user.id, e.target.value as UserRole)}
              className="h-8 rounded-md border border-[#e5e7eb] bg-white px-2 text-xs text-[#111827]"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-sm text-[#111827]">{ROLE_LABELS[user.role]}</span>
          )}
        </td>

        <td className="px-4 py-3">
          <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${STATUS_COLORS[user.status]}`}>
            {STATUS_LABELS[user.status]}
          </span>
        </td>

        <td className="px-4 py-3">
          {!isSelf && user.status !== "pending" ? (
            <button
              onClick={() => void onStatusToggle(user.id, user.status)}
              disabled={isLoading}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                user.status === "active"
                  ? "bg-[rgba(214,40,40,0.1)] text-[#d62828]"
                  : "bg-[rgba(16,185,129,0.1)] text-[#065f46]"
              }`}
              type="button"
            >
              {user.status === "active" ? "Suspender" : "Activar"}
            </button>
          ) : (
            <span className="text-xs text-[#9ca3af]">—</span>
          )}
        </td>
      </tr>

      {rowError && (
        <tr>
          <td colSpan={4} className="bg-[#fef2f2] px-4 py-2 text-xs text-[#b91c1c]">
            {rowError}
          </td>
        </tr>
      )}
    </>
  );
}
