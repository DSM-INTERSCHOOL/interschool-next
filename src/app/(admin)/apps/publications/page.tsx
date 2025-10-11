"use client";

import { PageTitle } from "@/components/PageTitle";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiltersModal } from "./components/FiltersModal";
import { getAll } from "@/services/announcement.service";
import * as assignmentService from "@/services/assignment.service";
import { IAnnouncementRead } from "@/interfaces/IAnnouncement";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function PublicationsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const highlightId = searchParams.get('highlightId');
    const highlightType = searchParams.get('publicationType') as 'announcement' | 'assignment' | null;

    const [publicationType, setPublicationType] = useState<'announcement' | 'assignment'>(highlightType || 'announcement');
    const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState<any>(null);
    const [announcements, setAnnouncements] = useState<IAnnouncementRead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [highlightedPublication, setHighlightedPublication] = useState<IAnnouncementRead | null>(null);

    useEffect(() => {
        loadPublications();
    }, [publicationType]);

    useEffect(() => {
        document.title = "Publicaciones - Interschool";
    }, []);

    const loadPublications = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = publicationType === 'assignment'
                ? await assignmentService.getAll({ schoolId: "1000" })
                : await getAll({ schoolId: "1000" });
            setAnnouncements(data);

            // Si hay highlightId, buscar y destacar esa publicación
            if (highlightId) {
                const highlighted = data.find(pub => pub.id === highlightId);
                if (highlighted) {
                    setHighlightedPublication(highlighted);
                }
            }
        } catch (err: any) {
            setError(err.message || `Error al cargar ${publicationType === 'assignment' ? 'las tareas' : 'los avisos'}`);
            console.error("Error loading publications:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFilters = (filters: any) => {
        setAppliedFilters(filters);
        console.log("Filtros aplicados:", filters);
    };

    const handleCloseHighlight = () => {
        setHighlightedPublication(null);
        // Limpiar query parameters de la URL
        router.push('/apps/publications');
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getStatusBadge = (status: string | null | undefined) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
            PUBLICADO: { color: "badge-success", text: "Publicado" },
            BORRADOR: { color: "badge-warning", text: "Borrador" },
            CANCELADO: { color: "badge-error", text: "Cancelado" },
        };

        const config = statusConfig[status || ""] || {
            color: "badge-neutral",
            text: status || "Sin estado",
        };

        return (
            <div className={`badge ${config.color} gap-1`}>
                {config.text}
            </div>
        );
    };

    return (
        <>
            <PageTitle
                title="Publicaciones"
                items={[{ label: "Apps" }, { label: "Publicaciones", active: true }]}
            />
            <div className="mt-6">
                <div className="card bg-base-100 shadow-lg">
                    <div className="card-body">
                        {/* Selector de tipo de publicación */}
                        <div className="flex justify-center mb-6">
                            <div className="join">
                                <button
                                    className={`join-item btn ${publicationType === 'announcement' ? 'btn-primary' : 'btn-outline'}`}
                                    onClick={() => setPublicationType('announcement')}
                                >
                                    <span className="iconify lucide--megaphone size-5"></span>
                                    Avisos
                                </button>
                                <button
                                    className={`join-item btn ${publicationType === 'assignment' ? 'btn-secondary' : 'btn-outline'}`}
                                    onClick={() => setPublicationType('assignment')}
                                >
                                    <span className="iconify lucide--clipboard-list size-5"></span>
                                    Tareas
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-4">
                            <h2 className="card-title text-2xl">
                                <span className={`iconify size-6 ${
                                    publicationType === 'assignment' ? 'lucide--clipboard-list' : 'lucide--megaphone'
                                }`}></span>
                                Lista de {publicationType === 'assignment' ? 'Tareas' : 'Avisos'}
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsFiltersModalOpen(true)}
                                    className="btn btn-outline"
                                >
                                    <span className="iconify lucide--filter size-5"></span>
                                    Filtros
                                </button>
                                <Link href="/apps/publications/create" className="btn btn-primary">
                                    <span className="iconify lucide--plus size-5"></span>
                                    Nueva Publicación
                                </Link>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-16">
                                <LoadingSpinner message={`Cargando ${publicationType === 'assignment' ? 'tareas' : 'avisos'}...`} />
                            </div>
                        ) : error ? (
                            <div className="alert alert-error">
                                <span className="iconify lucide--alert-circle size-6"></span>
                                <div>
                                    <h3 className="font-bold">Error</h3>
                                    <div className="text-sm">{error}</div>
                                </div>
                            </div>
                        ) : announcements.length === 0 ? (
                            <div className="text-center py-16">
                                <span className={`iconify size-24 text-base-content/20 mb-4 ${
                                    publicationType === 'assignment' ? 'lucide--clipboard-list' : 'lucide--inbox'
                                }`}></span>
                                <h3 className="text-xl font-medium text-base-content mb-2">
                                    No hay {publicationType === 'assignment' ? 'tareas' : 'avisos'}
                                </h3>
                                <p className="text-base-content/60 mb-6">
                                    Crea tu primer{publicationType === 'assignment' ? 'a tarea' : ' aviso'} para comenzar
                                </p>
                                <Link href="/apps/publications/create" className="btn btn-primary btn-sm">
                                    <span className="iconify lucide--plus size-4"></span>
                                    Crear primer{publicationType === 'assignment' ? 'a tarea' : ' aviso'}
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Sección destacada de publicación recién creada/editada */}
                                {highlightedPublication && (
                                    <div className="alert alert-success mb-6">
                                        <span className="iconify lucide--check-circle size-6"></span>
                                        <div className="flex-1">
                                            <h3 className="font-bold">
                                                {publicationType === 'assignment' ? 'Tarea' : 'Aviso'} {highlightId === highlightedPublication.id ? 'guardado' : 'cargado'} exitosamente
                                            </h3>
                                            <div className="text-sm">
                                                <strong>{highlightedPublication.title}</strong>
                                                <div className="mt-1 text-sm opacity-80">
                                                    {highlightedPublication.content?.replace(/<[^>]*>/g, "").substring(0, 100)}...
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            className="btn btn-sm btn-ghost"
                                            onClick={handleCloseHighlight}
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
                                            <th className="bg-base-200">Fecha Inicio</th>
                                            <th className="bg-base-200">Fecha Fin</th>
                                            <th className="bg-base-200">Estado</th>
                                            <th className="bg-base-200">Vistas</th>
                                            <th className="bg-base-200">Likes</th>
                                            <th className="bg-base-200">Comentarios</th>
                                            <th className="bg-base-200">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {announcements.map((announcement) => (
                                            <tr key={announcement.id}>
                                                <td>
                                                    <div className="max-w-xs">
                                                        <div className="font-medium">{announcement.title || "Sin título"}</div>
                                                        <div className="text-sm text-base-content/60 truncate">
                                                            {announcement.content?.replace(/<[^>]*>/g, "").substring(0, 80)}...
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        {announcement.publisher?.profile_picture_url ? (
                                                            <img
                                                                src={announcement.publisher.profile_picture_url}
                                                                alt=""
                                                                className="w-8 h-8 rounded-full"
                                                            />
                                                        ) : (
                                                            <div className="avatar placeholder">
                                                                <div className="bg-neutral text-neutral-content rounded-full w-8">
                                                                    <span className="text-xs">
                                                                        {announcement.publisher?.given_name?.[0] || "?"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="text-sm">
                                                            {announcement.publisher?.given_name}{" "}
                                                            {announcement.publisher?.paternal_surname}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-sm">{formatDate(announcement.start_date)}</td>
                                                <td className="text-sm">{formatDate(announcement.end_date)}</td>
                                                <td>{getStatusBadge(announcement.status)}</td>
                                                <td>
                                                    <div className="flex items-center gap-1">
                                                        <span className="iconify lucide--eye size-4"></span>
                                                        {announcement.views || 0}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-1">
                                                        <span className="iconify lucide--heart size-4"></span>
                                                        {announcement.likes || 0}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-1">
                                                        <span className="iconify lucide--message-circle size-4"></span>
                                                        {announcement.comments || 0}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex gap-1">
                                                        <button className="btn btn-ghost btn-xs" title="Ver">
                                                            <span className="iconify lucide--eye size-4"></span>
                                                        </button>
                                                        <Link
                                                            href={`/apps/publications/${announcement.id}?publicationType=${publicationType}`}
                                                            className="btn btn-ghost btn-xs"
                                                            title="Editar"
                                                        >
                                                            <span className="iconify lucide--pencil size-4"></span>
                                                        </Link>
                                                        <button className="btn btn-ghost btn-xs text-error" title="Eliminar">
                                                            <span className="iconify lucide--trash-2 size-4"></span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <FiltersModal
                isOpen={isFiltersModalOpen}
                onClose={() => setIsFiltersModalOpen(false)}
                onApplyFilters={handleApplyFilters}
            />
        </>
    );
}

