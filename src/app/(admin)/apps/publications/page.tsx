"use client";

import { PageTitle } from "@/components/PageTitle";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FiltersModal } from "./components/FiltersModal";
import { getAll } from "@/services/announcement.service";
import { IAnnouncementRead } from "@/interfaces/IAnnouncement";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function PublicationsPage() {
    const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState<any>(null);
    const [announcements, setAnnouncements] = useState<IAnnouncementRead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const loadAnnouncements = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAll({ schoolId: "1000" });
            setAnnouncements(data);
        } catch (err: any) {
            setError(err.message || "Error al cargar las publicaciones");
            console.error("Error loading announcements:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFilters = (filters: any) => {
        setAppliedFilters(filters);
        console.log("Filtros aplicados:", filters);
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
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="card-title text-2xl">
                                <span className="iconify lucide--megaphone size-6"></span>
                                Lista de Publicaciones
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
                                <LoadingSpinner message="Cargando publicaciones..." />
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
                                <span className="iconify lucide--inbox size-24 text-base-content/20 mb-4"></span>
                                <h3 className="text-xl font-medium text-base-content mb-2">
                                    No hay publicaciones
                                </h3>
                                <p className="text-base-content/60 mb-6">
                                    Crea tu primera publicación para comenzar
                                </p>
                                <Link href="/apps/publications/create" className="btn btn-primary btn-sm">
                                    <span className="iconify lucide--plus size-4"></span>
                                    Crear primera publicación
                                </Link>
                            </div>
                        ) : (
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
                                                        <Link href={`/apps/publications/${announcement.id}`} className="btn btn-ghost btn-xs" title="Editar">
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

