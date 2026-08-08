"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { PageTitle } from "@/components/PageTitle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { getOrgConfig } from "@/lib/orgConfig";
import { useUserRole } from "@/app/(admin)/apps/publications/hooks";
import { useAuthStore } from "@/store/useAuthStore";
import { PollRead } from "@/interfaces/IPoll";
import { getPolls, deletePoll } from "@/services/poll.service";

export default function PollsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlightId");
  const userRole = useUserRole();
  const personId = useAuthStore((state) => state.personId);

  const [polls, setPolls] = useState<PollRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [totalItems, setTotalItems] = useState(0);
  const [highlightedPoll, setHighlightedPoll] = useState<PollRead | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    document.title = "Encuestas - Interschool";
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    loadPolls();
  }, []);

  useEffect(() => {
    loadPolls();
  }, [currentPage, itemsPerPage]);

  const loadPolls = async () => {
    try {
      setLoading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const offset = (currentPage - 1) * itemsPerPage;
      const args: any = { schoolId, offset, limit: itemsPerPage };
      if (userRole === "teacher" && personId) {
        args.filters = `publisher_person_id::eq::${personId}`;
      }
      const data = await getPolls(args);
      setPolls(data);

      if (data.length < itemsPerPage) {
        setTotalItems(offset + data.length);
      } else {
        setTotalItems(offset + data.length + 1);
      }

      if (highlightId) {
        const found = data.find((p) => p.id === highlightId);
        if (found) setHighlightedPoll(found);
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar las encuestas");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pollId: string) => {
    try {
      setDeleteLoading(true);
      const { schoolId } = getOrgConfig();
      await deletePoll({ schoolId, pollId });
      setPolls((prev) => prev.filter((p) => p.id !== pollId));
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert(err.message || "Error al eliminar la encuesta");
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  const getStatusBadge = (status: string | null | undefined) => {
    const map: Record<string, { color: string; text: string }> = {
      PUBLISHED: { color: "badge-success", text: "Publicado" },
      DRAFT: { color: "badge-warning", text: "Borrador" },
      CLOSED: { color: "badge-error", text: "Cerrado" },
    };
    const cfg = map[status || ""] ?? { color: "badge-neutral", text: status || "—" };
    return <div className={`badge ${cfg.color}`}>{cfg.text}</div>;
  };

  return (
    <>
      <PageTitle
        title="Encuestas"
        items={[{ label: "Apps" }, { label: "Encuestas", active: true }]}
      />
      <div className="mt-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title text-2xl">
                <span className="iconify lucide--bar-chart-2 size-6"></span>
                Lista de Encuestas
              </h2>
              <Link href="/apps/polls/create" className="btn btn-primary">
                <span className="iconify lucide--plus size-5"></span>
                Nueva Encuesta
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner message="Cargando encuestas..." />
              </div>
            ) : error ? (
              <div className="alert alert-error">
                <span className="iconify lucide--alert-circle size-6"></span>
                <div>
                  <h3 className="font-bold">Error</h3>
                  <div className="text-sm">{error}</div>
                </div>
              </div>
            ) : polls.length === 0 ? (
              <div className="text-center py-16">
                <span className="iconify lucide--bar-chart-2 size-24 text-base-content/20 mb-4"></span>
                <h3 className="text-xl font-medium text-base-content mb-2">No hay encuestas</h3>
                <p className="text-base-content/60 mb-6">Crea tu primera encuesta para comenzar</p>
                <Link href="/apps/polls/create" className="btn btn-primary btn-sm">
                  <span className="iconify lucide--plus size-4"></span>
                  Crear encuesta
                </Link>
              </div>
            ) : (
              <>
                {highlightedPoll && (
                  <div className="alert alert-success mb-6">
                    <span className="iconify lucide--check-circle size-6"></span>
                    <div className="flex-1">
                      <h3 className="font-bold">Encuesta guardada exitosamente</h3>
                      <div className="text-sm">
                        <strong>{highlightedPoll.title}</strong>
                      </div>
                    </div>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => {
                        setHighlightedPoll(null);
                        router.push("/apps/polls");
                      }}
                    >
                      <span className="iconify lucide--x size-4"></span>
                    </button>
                  </div>
                )}

                <div className="overflow-x-auto max-h-[600px] overflow-y-auto relative">
                  <table className="table table-zebra w-full">
                    <thead className="sticky top-0 z-10 bg-base-200">
                      <tr>
                        <th className="bg-base-200">Título</th>
                        <th className="bg-base-200">Publicado por</th>
                        <th className="bg-base-200">Inicio</th>
                        <th className="bg-base-200">Cierre</th>
                        <th className="bg-base-200">Estado</th>
                        <th className="bg-base-200 text-center">Anónima</th>
                        <th className="bg-base-200 text-center">Preguntas</th>
                        <th className="bg-base-200 text-center">Respuestas</th>
                        <th className="bg-base-200">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {polls.map((poll) => (
                        <tr
                          key={poll.id}
                          className={highlightedPoll?.id === poll.id ? "bg-success/10" : ""}
                        >
                          <td>
                            <div className="max-w-xs">
                              <div className="font-medium">{poll.title || "Sin título"}</div>
                              {poll.description && (
                                <div className="text-sm text-base-content/60 truncate">
                                  {poll.description.substring(0, 80)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              {poll.publisher?.profile_picture_url ? (
                                <img
                                  src={poll.publisher.profile_picture_url}
                                  alt=""
                                  className="w-8 h-8 rounded-full"
                                />
                              ) : (
                                <div className="avatar placeholder">
                                  <div className="bg-neutral text-neutral-content rounded-full w-8">
                                    <span className="text-xs">
                                      {poll.publisher?.given_name?.[0] || "?"}
                                    </span>
                                  </div>
                                </div>
                              )}
                              <div className="text-sm">
                                {poll.publisher?.given_name} {poll.publisher?.paternal_surname}
                              </div>
                            </div>
                          </td>
                          <td className="text-sm">{formatDate(poll.start_date)}</td>
                          <td className="text-sm">{formatDate(poll.end_date)}</td>
                          <td>{getStatusBadge(poll.status)}</td>
                          <td className="text-center">
                            {poll.anonymous ? (
                              <span className="iconify lucide--eye-off size-5 text-base-content/50" title="Anónima"></span>
                            ) : (
                              <span className="iconify lucide--eye size-5 text-base-content/30" title="No anónima"></span>
                            )}
                          </td>
                          <td className="text-center">
                            <span className="badge badge-ghost">
                              {poll.questions?.length ?? 0}
                            </span>
                          </td>
                          <td className="text-center text-sm">
                            <span className="text-success font-medium">
                              {poll.responded_persons ?? 0}/{poll.total_persons ?? 0}
                            </span>
                          </td>
                          <td>
                            <div className="flex gap-1">
                              <Link
                                href={`/apps/polls/${poll.id}`}
                                className="btn btn-ghost btn-xs"
                                title="Editar"
                              >
                                <span className="iconify lucide--pencil size-4"></span>
                              </Link>
                              <button
                                className="btn btn-ghost btn-xs text-error"
                                title="Eliminar"
                                onClick={() => setDeleteConfirmId(poll.id)}
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

                {/* Pagination */}
                {polls.length > 0 && (
                  <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm">Mostrar:</label>
                      <select
                        className="select select-bordered select-sm"
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span className="text-sm text-base-content/60">por página</span>
                    </div>
                    <div className="text-sm text-base-content/60">
                      Mostrando {(currentPage - 1) * itemsPerPage + 1} –{" "}
                      {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}
                    </div>
                    <div className="join">
                      <button
                        className="join-item btn btn-sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(1)}
                      >
                        <span className="iconify lucide--chevrons-left size-4"></span>
                      </button>
                      <button
                        className="join-item btn btn-sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                      >
                        <span className="iconify lucide--chevron-left size-4"></span>
                      </button>
                      <button className="join-item btn btn-sm btn-disabled">
                        Página {currentPage}
                      </button>
                      <button
                        className="join-item btn btn-sm"
                        disabled={polls.length < itemsPerPage}
                        onClick={() => setCurrentPage((p) => p + 1)}
                      >
                        <span className="iconify lucide--chevron-right size-4"></span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="font-bold text-lg">¿Eliminar encuesta?</h3>
            <p className="py-4 text-base-content/70">
              Esta acción no se puede deshacer. La encuesta y todas sus respuestas serán eliminadas.
            </p>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirmId(null)}>
                Cancelar
              </button>
              <button
                className="btn btn-error"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Eliminar"
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setDeleteConfirmId(null)}></div>
        </div>
      )}
    </>
  );
}
