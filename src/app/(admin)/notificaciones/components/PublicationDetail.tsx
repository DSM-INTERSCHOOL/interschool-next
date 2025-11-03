"use client";

import { IAnnouncement, IAssignment } from "@/interfaces/IPublication";

interface PublicationDetailProps {
    publication: IAnnouncement | IAssignment | null;
    type: "announcement" | "assignment";
    onLike?: (id: string) => void;
}

export const PublicationDetail = ({ publication, type, onLike }: PublicationDetailProps) => {
    if (!publication) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <span className="iconify lucide--inbox text-base-content/20 size-20" />
                    <p className="text-base-content/40 mt-4">
                        Selecciona {type === "announcement" ? "un aviso" : "una tarea"} para ver los detalles
                    </p>
                </div>
            </div>
        );
    };

    const getPublisherName = () => {
        const { given_name, paternal_surname, maternal_surname } = publication.publisher;
        return `${given_name} ${paternal_surname} ${maternal_surname}`.trim();
    };

    const getPublisherInitials = () => {
        const { given_name, paternal_surname } = publication.publisher;
        return `${given_name[0]}${paternal_surname?.[0] || ""}`.toUpperCase();
    };

    // Función para limpiar HTML y extraer texto plano
    const stripHtml = (html: string): string => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="border-base-300 flex items-start gap-4 border-b p-6">
                <div className="avatar placeholder">
                    <div className="bg-neutral text-neutral-content w-12 rounded-full">
                        {publication.publisher.profile_picture_url ? (
                            <img src={publication.publisher.profile_picture_url} alt={getPublisherName()} />
                        ) : (
                            <span className="text-sm">{getPublisherInitials()}</span>
                        )}
                    </div>
                </div>

                <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold">{publication.title}</h2>
                            <p className="text-base-content/60 text-sm">{getPublisherName()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`badge ${publication.status === "ACTIVO" ? "badge-success" : "badge-ghost"}`}>
                                {publication.status}
                            </span>
                        </div>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-sm text-base-content/60">
                        <div className="flex items-center gap-1">
                            <span className="iconify lucide--calendar size-4" />
                            <span>
                                {new Date(publication.created_at).toLocaleDateString("es-MX", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <span className="iconify lucide--eye size-4" />
                                <span>{publication.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="iconify lucide--thumbs-up size-4" />
                                <span>{publication.likes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="iconify lucide--message-square size-4" />
                                <span>{publication.comments}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="prose max-w-none">
                    {publication.content ? (
                        <div dangerouslySetInnerHTML={{ __html: publication.content }} />
                    ) : (
                        <p className="text-base-content/60 italic">Sin contenido</p>
                    )}

                    {/* Actions */}
                    <div className="divider mt-6"></div>
                    <div className="not-prose flex items-center gap-2 mb-6">
                        <button
                            onClick={() => onLike?.(publication.id)}
                            className={`btn btn-sm ${publication.user_liked ? "btn-primary" : "btn-ghost"}`}>
                            <span className={`iconify ${publication.user_liked ? "lucide--thumbs-up" : "lucide--thumbs-up"} size-4`} />
                            {publication.user_liked ? "Te gusta" : "Me gusta"}
                        </button>
                        {publication.accept_comments && (
                            <button className="btn btn-ghost btn-sm">
                                <span className="iconify lucide--message-square size-4" />
                                Comentarios ({publication.comments})
                            </button>
                        )}
                    </div>

                    {/* Attachments */}
                    {publication.attachments && publication.attachments.length > 0 && (
                        <>
                            <div className="divider"></div>
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Adjuntos ({publication.attachments.length})</h3>
                                <div className="space-y-2">
                                    {publication.attachments.map((attachment) => (
                                        <a
                                            key={attachment.id}
                                            href={attachment.public_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 rounded-lg border border-base-300 p-3 hover:bg-base-200 transition-colors">
                                            <span className="iconify lucide--paperclip size-5 text-base-content/60" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{attachment.file_name}</p>
                                                <p className="text-xs text-base-content/60">
                                                    {(attachment.file_size / 1024).toFixed(2)} KB
                                                </p>
                                            </div>
                                            <span className="iconify lucide--download size-5 text-primary" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
