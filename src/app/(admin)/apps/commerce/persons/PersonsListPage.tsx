"use client";

import { useState } from "react";

import { AppLink as Link } from "@/components/AppLink";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageTitle } from "@/components/PageTitle";
import { CommercePersonRead } from "@/interfaces/ICommercePerson";

import { ROLE_OPTIONS } from "./constants";
import { usePersons } from "./hooks";
import { PAGE_SIZE_OPTIONS } from "./hooks/usePersons";

const ROLE_BADGE: Record<CommercePersonRead["role"], string> = {
  ADMIN: "badge-primary",
  CASHIER: "badge-info",
  BUYER: "badge-ghost",
};

const roleLabel = (role: CommercePersonRead["role"]) => ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role;

// Page numbers to show around the current one, with "…" gaps:
// 1 … 4 5 [6] 7 8 … 20
const pageWindow = (page: number, totalPages: number): (number | "gap")[] => {
  const pages = new Set<number>([1, totalPages]);
  for (let p = page - 2; p <= page + 2; p++) if (p >= 1 && p <= totalPages) pages.add(p);
  const sorted = Array.from(pages).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
};

const fullName = (person: CommercePersonRead) =>
  [person.given_name, person.paternal_name, person.maternal_name].filter(Boolean).join(" ");

export default function PersonsListPage() {
  const {
    persons,
    total,
    search,
    setSearch,
    role,
    setRole,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    loading,
    error,
    removePerson,
  } = usePersons();
  const firstRow = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastRow = Math.min(page * pageSize, total);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const personToDelete = persons.find((p) => p.person_internal_id === deleteId) ?? null;

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      await removePerson(deleteId);
      setDeleteId(null);
    } catch (err: any) {
      setDeleteError(err.response?.data?.detail || err.message || "Error al eliminar el cliente");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <PageTitle title="Clientes" />
      <div className="mt-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                <input
                  type="text"
                  placeholder="Buscar por nombre, email o ID"
                  className="input input-bordered input-sm w-full sm:w-72"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className="select select-bordered select-sm"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  aria-label="Filtrar por rol">
                  <option value="">Todos los roles</option>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <Link href="/apps/commerce/persons/create" className="btn btn-primary">
                <span className="iconify lucide--plus size-5"></span>
                Nuevo Cliente
              </Link>
            </div>

            {deleteError && (
              <div className="alert alert-error mb-4">
                <span className="iconify lucide--alert-circle size-6"></span>
                <div>{deleteError}</div>
              </div>
            )}

            {loading && persons.length === 0 ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner message="Cargando clientes..." />
              </div>
            ) : error ? (
              <div className="alert alert-error">
                <span className="iconify lucide--alert-circle size-6"></span>
                <div>{error}</div>
              </div>
            ) : persons.length === 0 ? (
              <div className="py-16 text-center">
                <span className="iconify lucide--users text-base-content/20 mb-4 size-24"></span>
                <h3 className="text-base-content mb-2 text-xl font-medium">Sin clientes</h3>
                <p className="text-base-content/60">
                  {search || role
                    ? "Ningún cliente coincide con la búsqueda"
                    : "Todavía no se ha registrado ningún cliente"}
                </p>
              </div>
            ) : (
              <>
                <div
                  className={`overflow-x-auto transition-opacity ${loading ? "pointer-events-none opacity-50" : ""}`}>
                  <table className="table-zebra table w-full">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Rol</th>
                        <th>Origen</th>
                        <th>Email</th>
                        <th>RFC</th>
                        <th className="text-right">Saldo</th>
                        <th className="text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {persons.map((person) => (
                        <tr key={person.person_internal_id}>
                          <td className="font-medium">{person.person_internal_id}</td>
                          <td>{fullName(person) || "—"}</td>
                          <td>
                            <span className={`badge badge-sm ${ROLE_BADGE[person.role]}`}>
                              {roleLabel(person.role)}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge badge-sm ${person.origin === "MANUAL" ? "badge-ghost" : "badge-info"}`}>
                              {person.origin === "MANUAL" ? "Manual" : "Interschool"}
                            </span>
                          </td>
                          <td className="text-base-content/60 text-sm">{person.email ?? "—"}</td>
                          <td className="text-base-content/60 text-sm">{person.rfc ?? "—"}</td>
                          <td className="text-right font-medium">${Number(person.balance).toFixed(2)}</td>
                          <td>
                            <div className="flex justify-end gap-1">
                              <Link
                                href={`/apps/commerce/persons/estado-cuenta?person_id=${encodeURIComponent(person.person_internal_id)}`}
                                className="btn btn-ghost btn-xs"
                                title="Estado de cuenta">
                                <span className="iconify lucide--receipt-text size-4"></span>
                              </Link>
                              <Link
                                href={`/apps/commerce/persons/${person.person_internal_id}`}
                                className="btn btn-ghost btn-xs"
                                title="Editar">
                                <span className="iconify lucide--pencil size-4"></span>
                              </Link>
                              <button
                                className="btn btn-ghost btn-xs text-error"
                                title="Eliminar"
                                onClick={() => setDeleteId(person.person_internal_id)}>
                                <span className="iconify lucide--trash-2 size-4"></span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-base-content/60 flex items-center gap-2 text-sm">
                    <span>
                      Mostrando {firstRow.toLocaleString("es-MX")}–{lastRow.toLocaleString("es-MX")} de{" "}
                      {total.toLocaleString("es-MX")}
                    </span>
                    <select
                      className="select select-bordered select-xs"
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      aria-label="Clientes por página">
                      {PAGE_SIZE_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n} por página
                        </option>
                      ))}
                    </select>
                    {loading && <span className="loading loading-spinner loading-xs"></span>}
                  </div>

                  {totalPages > 1 && (
                    <div className="join">
                      <button
                        type="button"
                        className="btn btn-sm join-item"
                        disabled={page <= 1 || loading}
                        onClick={() => setPage(page - 1)}
                        aria-label="Página anterior">
                        <span className="iconify lucide--chevron-left size-4"></span>
                      </button>
                      {pageWindow(page, totalPages).map((p, i) =>
                        p === "gap" ? (
                          <button key={`gap-${i}`} type="button" className="btn btn-sm join-item btn-disabled">
                            …
                          </button>
                        ) : (
                          <button
                            key={p}
                            type="button"
                            className={`btn btn-sm join-item ${p === page ? "btn-primary" : ""}`}
                            disabled={loading}
                            onClick={() => setPage(p)}>
                            {p}
                          </button>
                        ),
                      )}
                      <button
                        type="button"
                        className="btn btn-sm join-item"
                        disabled={page >= totalPages || loading}
                        onClick={() => setPage(page + 1)}
                        aria-label="Página siguiente">
                        <span className="iconify lucide--chevron-right size-4"></span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar cliente"
        message="¿Estás seguro de que deseas eliminar este cliente? Se eliminará su rol y datos dentro del comercio."
        itemName={personToDelete ? fullName(personToDelete) || personToDelete.person_internal_id : null}
        loading={deleteLoading}
      />
    </>
  );
}
