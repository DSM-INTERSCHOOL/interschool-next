"use client";

import { useState } from "react";
import { AppLink as Link } from "@/components/AppLink";
import { PageTitle } from "@/components/PageTitle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { CommercePersonRead } from "@/interfaces/ICommercePerson";
import { ROLE_OPTIONS } from "./constants";
import { usePersons } from "./hooks";

const ROLE_BADGE: Record<CommercePersonRead["role"], string> = {
  ADMIN: "badge-primary",
  CASHIER: "badge-info",
  BUYER: "badge-ghost",
};

const roleLabel = (role: CommercePersonRead["role"]) => ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role;

const fullName = (person: CommercePersonRead) =>
  [person.given_name, person.paternal_name, person.maternal_name].filter(Boolean).join(" ");

export default function PersonsListPage() {
  const { persons, search, setSearch, loading, error, removePerson } = usePersons();
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
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="form-control w-full max-w-xs">
                <input
                  type="text"
                  placeholder="Buscar por nombre, email o ID"
                  className="input input-bordered input-sm w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
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

            {loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner message="Cargando clientes..." />
              </div>
            ) : error ? (
              <div className="alert alert-error">
                <span className="iconify lucide--alert-circle size-6"></span>
                <div>{error}</div>
              </div>
            ) : persons.length === 0 ? (
              <div className="text-center py-16">
                <span className="iconify lucide--users size-24 text-base-content/20 mb-4"></span>
                <h3 className="text-xl font-medium text-base-content mb-2">Sin clientes</h3>
                <p className="text-base-content/60">
                  {search ? "Ningún cliente coincide con la búsqueda" : "Todavía no se ha registrado ningún cliente"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
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
                          <span className={`badge badge-sm ${ROLE_BADGE[person.role]}`}>{roleLabel(person.role)}</span>
                        </td>
                        <td>
                          <span className={`badge badge-sm ${person.origin === "MANUAL" ? "badge-ghost" : "badge-info"}`}>
                            {person.origin === "MANUAL" ? "Manual" : "Interschool"}
                          </span>
                        </td>
                        <td className="text-sm text-base-content/60">{person.email ?? "—"}</td>
                        <td className="text-sm text-base-content/60">{person.rfc ?? "—"}</td>
                        <td className="text-right font-medium">${Number(person.balance).toFixed(2)}</td>
                        <td>
                          <div className="flex justify-end gap-1">
                            <Link
                              href={`/apps/commerce/persons/${person.person_internal_id}`}
                              className="btn btn-ghost btn-xs"
                              title="Editar"
                            >
                              <span className="iconify lucide--pencil size-4"></span>
                            </Link>
                            <button
                              className="btn btn-ghost btn-xs text-error"
                              title="Eliminar"
                              onClick={() => setDeleteId(person.person_internal_id)}
                            >
                              <span className="iconify lucide--trash-2 size-4"></span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
