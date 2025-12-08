"use client";

import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { getCommentsForAnnouncement, getCommentsForAssignment } from "@/services/comments.service";

interface CommentsModalProps {
    publicationId: string | null;
    publicationTitle: string | null;
    publicationType: 'announcement' | 'assignment';
    isOpen: boolean;
    onClose: () => void;
}

interface Comment {
    id: string;
    person_id: string;
    parent_announcement_comment_id: string | null;
    comment: string;
    created_at: string;
    modified_at: string;
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

export function CommentsModal({ publicationId, publicationTitle, publicationType, isOpen, onClose }: CommentsModalProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && publicationId) {
            loadComments();
        }
    }, [isOpen, publicationId]);

    const loadComments = async () => {
        if (!publicationId) return;

        try {
            setLoading(true);
            setError(null);

            const data = publicationType === 'assignment'
                ? await getCommentsForAssignment(publicationId)
                : await getCommentsForAnnouncement(publicationId);

            setComments(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar los comentarios');
            console.error('Error loading comments:', err);
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
            <div className="modal-box max-w-3xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <span className="iconify lucide--message-circle size-5 text-info"></span>
                        Comentarios - {publicationTitle || 'Publicación'}
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
                        <LoadingSpinner message="Cargando comentarios..." />
                    </div>
                ) : error ? (
                    <div className="alert alert-error">
                        <span className="iconify lucide--alert-circle size-6"></span>
                        <div>
                            <h3 className="font-bold">Error</h3>
                            <div className="text-sm">{error}</div>
                        </div>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-8">
                        <span className="iconify lucide--message-circle size-16 text-base-content/20 mb-4"></span>
                        <p className="text-base-content/60">
                            Aún no hay comentarios en esta publicación
                        </p>
                    </div>
                ) : (
                    <div className="overflow-y-auto max-h-[500px]">
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <div key={comment.id} className="card bg-base-200">
                                    <div className="card-body p-4">
                                        <div className="flex items-start gap-3">
                                            {comment.person?.profile_picture_url || comment.person?.official_picture_url ? (
                                                <img
                                                    src={comment.person.profile_picture_url || comment.person.official_picture_url || ''}
                                                    alt=""
                                                    className="w-10 h-10 rounded-full"
                                                />
                                            ) : (
                                                <div className="avatar placeholder">
                                                    <div className="bg-neutral text-neutral-content rounded-full w-10">
                                                        <span className="text-sm">
                                                            {comment.person?.given_name?.[0] || '?'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="font-medium">
                                                        {comment.person?.given_name}{' '}
                                                        {comment.person?.paternal_surname}{' '}
                                                        {comment.person?.maternal_surname || ''}
                                                    </div>
                                                    <div className="text-xs text-base-content/60">
                                                        {formatDate(comment.created_at)}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-base-content/80 whitespace-pre-wrap">
                                                    {comment.comment}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 text-sm text-base-content/60 text-center">
                            Total: {comments.length} {comments.length === 1 ? 'comentario' : 'comentarios'}
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
