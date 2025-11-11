"use client";

import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { getLikesForAnnouncement, getLikesForAssignment } from "@/services/likes.service";

interface LikesModalProps {
    publicationId: string | null;
    publicationTitle: string | null;
    publicationType: 'announcement' | 'assignment';
    isOpen: boolean;
    onClose: () => void;
}

interface Like {
    id: string;
    person_id: number;
    person?: {
        given_name: string;
        paternal_surname: string;
        maternal_surname?: string;
        profile_picture_url?: string;
    };
    created_at: string;
}

export function LikesModal({ publicationId, publicationTitle, publicationType, isOpen, onClose }: LikesModalProps) {
    const [likes, setLikes] = useState<Like[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && publicationId) {
            loadLikes();
        }
    }, [isOpen, publicationId]);

    const loadLikes = async () => {
        if (!publicationId) return;

        try {
            setLoading(true);
            setError(null);

            const data = publicationType === 'assignment'
                ? await getLikesForAssignment(publicationId)
                : await getLikesForAnnouncement(publicationId);

            setLikes(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar los likes');
            console.error('Error loading likes:', err);
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
                        <span className="iconify lucide--heart size-5 text-error"></span>
                        Likes - {publicationTitle || 'Publicación'}
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
                        <LoadingSpinner message="Cargando likes..." />
                    </div>
                ) : error ? (
                    <div className="alert alert-error">
                        <span className="iconify lucide--alert-circle size-6"></span>
                        <div>
                            <h3 className="font-bold">Error</h3>
                            <div className="text-sm">{error}</div>
                        </div>
                    </div>
                ) : likes.length === 0 ? (
                    <div className="text-center py-8">
                        <span className="iconify lucide--heart size-16 text-base-content/20 mb-4"></span>
                        <p className="text-base-content/60">
                            Aún no hay likes en esta publicación
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
                                {likes.map((like) => (
                                    <tr key={like.person_id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                {like.person?.profile_picture_url ? (
                                                    <img
                                                        src={like.person.profile_picture_url}
                                                        alt=""
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="avatar placeholder">
                                                        <div className="bg-neutral text-neutral-content rounded-full w-10">
                                                            <span className="text-sm">
                                                                {like.person?.given_name?.[0] || '?'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium">
                                                        {like.person?.given_name}{' '}
                                                        {like.person?.paternal_surname}{' '}
                                                        {like.person?.maternal_surname || ''}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-sm text-base-content/60">
                                            {formatDate(like.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-4 text-sm text-base-content/60 text-center">
                            Total: {likes.length} {likes.length === 1 ? 'like' : 'likes'}
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
