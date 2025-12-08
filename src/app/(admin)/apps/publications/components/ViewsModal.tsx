"use client";

import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { getViewsForAnnouncement, getViewsForAssignment } from "@/services/views.service";

interface ViewsModalProps {
    publicationId: string | null;
    publicationTitle: string | null;
    publicationType: 'announcement' | 'assignment';
    isOpen: boolean;
    onClose: () => void;
}

interface View {
    id: string;
    announcement_id?: string;
    assignment_id?: string;
    person_id: string;
    created_at: string;
    person?: {
        id: string;
        school_id: number;
        given_name: string;
        paternal_surname: string;
        maternal_surname?: string;
        person_internal_id: string;
        type: string;
        official_picture_url?: string;
        profile_picture_url?: string;
    };
}

export function ViewsModal({ publicationId, publicationTitle, publicationType, isOpen, onClose }: ViewsModalProps) {
    const [views, setViews] = useState<View[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && publicationId) {
            loadViews();
        }
    }, [isOpen, publicationId]);

    const loadViews = async () => {
        if (!publicationId) return;

        try {
            setLoading(true);
            setError(null);

            const data = publicationType === 'assignment'
                ? await getViewsForAssignment(publicationId)
                : await getViewsForAnnouncement(publicationId);

            setViews(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar las vistas');
            console.error('Error loading views:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <span className="iconify lucide--eye size-5 text-success"></span>
                        Vistas - {publicationTitle || 'Publicación'}
                    </h3>
                    <button
                        className="btn btn-sm btn-circle btn-ghost"
                        onClick={onClose}
                    >
                        <span className="iconify lucide--x size-5"></span>
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <LoadingSpinner message="Cargando vistas..." />
                    </div>
                ) : error ? (
                    <div className="alert alert-error">
                        <span className="iconify lucide--alert-circle size-6"></span>
                        <div>
                            <h3 className="font-bold">Error</h3>
                            <div className="text-sm">{error}</div>
                        </div>
                    </div>
                ) : views.length === 0 ? (
                    <div className="text-center py-8">
                        <span className="iconify lucide--eye size-16 text-base-content/20 mb-4"></span>
                        <p className="text-base-content/60">
                            Aún no hay vistas en esta publicación
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto max-h-96">
                        <table className="table table-zebra w-full">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {views.map((view) => (
                                    <tr key={view.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                {view.person?.profile_picture_url || view.person?.official_picture_url ? (
                                                    <img
                                                        src={view.person.profile_picture_url || view.person.official_picture_url || ''}
                                                        alt=""
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="avatar placeholder">
                                                        <div className="bg-neutral text-neutral-content rounded-full w-10">
                                                            <span className="text-sm">
                                                                {view.person?.given_name?.[0] || '?'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium">
                                                        {view.person?.given_name}{' '}
                                                        {view.person?.paternal_surname}{' '}
                                                        {view.person?.maternal_surname || ''}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-sm text-base-content/60">
                                            {formatDate(view.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-4 text-sm text-base-content/60 text-center">
                            Total: {views.length} {views.length === 1 ? 'vista' : 'vistas'}
                        </div>
                    </div>
                )}

                <div className="modal-action">
                    <button className="btn" onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
}
