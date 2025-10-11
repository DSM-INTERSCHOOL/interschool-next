"use client";

import { IAnnouncementRead } from "@/interfaces/IAnnouncement";

interface PublicationDetailModalProps {
    publication: IAnnouncementRead | null;
    isOpen: boolean;
    onClose: () => void;
    publicationType: 'announcement' | 'assignment';
}

export const PublicationDetailModal = ({ publication, isOpen, onClose, publicationType }: PublicationDetailModalProps) => {
    if (!isOpen || !publication) return null;

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusBadge = (status: string | null | undefined) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
            ACTIVE: { color: "badge-success", text: "Activo" },
            INACTIVE: { color: "badge-warning", text: "Inactivo" },
            DRAFT: { color: "badge-warning", text: "Borrador" },
            CANCELLED: { color: "badge-error", text: "Cancelado" },
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
        <div className="modal modal-open">
            <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            publicationType === 'assignment' ? 'bg-secondary/10' : 'bg-primary/10'
                        }`}>
                            <span className={`iconify size-6 ${
                                publicationType === 'assignment'
                                    ? 'lucide--clipboard-list text-secondary'
                                    : 'lucide--megaphone text-primary'
                            }`}></span>
                        </div>
                        <div>
                            <h3 className="font-bold text-2xl">{publication.title || "Sin título"}</h3>
                            <p className="text-sm text-base-content/70">
                                {publicationType === 'assignment' ? 'Tarea' : 'Aviso'}
                            </p>
                        </div>
                    </div>
                    <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
                        <span className="iconify lucide--x size-5"></span>
                    </button>
                </div>

                <div className="divider my-2"></div>

                {/* Información General */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="card bg-base-200">
                        <div className="card-body p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="iconify lucide--calendar size-4 text-primary"></span>
                                <h4 className="font-semibold text-sm">Fecha de Inicio</h4>
                            </div>
                            <p className="text-sm">{formatDate(publication.start_date)}</p>
                        </div>
                    </div>

                    <div className="card bg-base-200">
                        <div className="card-body p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="iconify lucide--calendar-x size-4 text-error"></span>
                                <h4 className="font-semibold text-sm">Fecha de Fin</h4>
                            </div>
                            <p className="text-sm">{formatDate(publication.end_date)}</p>
                        </div>
                    </div>

                    {/* Campos adicionales para tareas */}
                    {publicationType === 'assignment' && (publication as any).subject_name && (
                        <>
                            <div className="card bg-base-200">
                                <div className="card-body p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="iconify lucide--book-open size-4 text-secondary"></span>
                                        <h4 className="font-semibold text-sm">Materia</h4>
                                    </div>
                                    <p className="text-sm">{(publication as any).subject_name}</p>
                                    <p className="text-xs text-base-content/60">ID: {(publication as any).subject_id}</p>
                                </div>
                            </div>

                            <div className="card bg-base-200">
                                <div className="card-body p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="iconify lucide--calendar-clock size-4 text-warning"></span>
                                        <h4 className="font-semibold text-sm">Fecha de Entrega</h4>
                                    </div>
                                    <p className="text-sm">{formatDate((publication as any).due_date)}</p>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="card bg-base-200">
                        <div className="card-body p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="iconify lucide--info size-4 text-info"></span>
                                <h4 className="font-semibold text-sm">Estado</h4>
                            </div>
                            {getStatusBadge(publication.status)}
                        </div>
                    </div>

                    <div className="card bg-base-200">
                        <div className="card-body p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="iconify lucide--user size-4 text-accent"></span>
                                <h4 className="font-semibold text-sm">Publicado por</h4>
                            </div>
                            <div className="flex items-center gap-2">
                                {publication.publisher?.profile_picture_url ? (
                                    <img
                                        src={publication.publisher.profile_picture_url}
                                        alt=""
                                        className="w-8 h-8 rounded-full"
                                    />
                                ) : (
                                    <div className="avatar placeholder">
                                        <div className="bg-neutral text-neutral-content rounded-full w-8">
                                            <span className="text-xs">
                                                {publication.publisher?.given_name?.[0] || "?"}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div className="text-sm">
                                    {publication.publisher?.given_name}{" "}
                                    {publication.publisher?.paternal_surname}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Configuración */}
                <div className="card bg-base-200 mb-6">
                    <div className="card-body p-4">
                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <span className="iconify lucide--settings size-4"></span>
                            Configuración
                        </h4>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-sm"
                                    checked={publication.accept_comments}
                                    disabled
                                />
                                <span className="text-sm">Comentarios permitidos</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-sm"
                                    checked={publication.authorized}
                                    disabled
                                />
                                <span className="text-sm">Autorizado</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="card bg-base-200">
                        <div className="card-body p-4 text-center">
                            <div className="flex items-center justify-center gap-2 text-info">
                                <span className="iconify lucide--eye size-5"></span>
                                <span className="text-2xl font-bold">{publication.views || 0}</span>
                            </div>
                            <p className="text-xs text-base-content/70">Vistas</p>
                        </div>
                    </div>
                    <div className="card bg-base-200">
                        <div className="card-body p-4 text-center">
                            <div className="flex items-center justify-center gap-2 text-error">
                                <span className="iconify lucide--heart size-5"></span>
                                <span className="text-2xl font-bold">{publication.likes || 0}</span>
                            </div>
                            <p className="text-xs text-base-content/70">Likes</p>
                        </div>
                    </div>
                    <div className="card bg-base-200">
                        <div className="card-body p-4 text-center">
                            <div className="flex items-center justify-center gap-2 text-success">
                                <span className="iconify lucide--message-circle size-5"></span>
                                <span className="text-2xl font-bold">{publication.comments || 0}</span>
                            </div>
                            <p className="text-xs text-base-content/70">Comentarios</p>
                        </div>
                    </div>
                </div>

                {/* Contenido */}
                <div className="mb-6">
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <span className="iconify lucide--file-text size-4"></span>
                        Contenido
                    </h4>
                    <div
                        className="card bg-base-200"
                    >
                        <div
                            className="card-body p-4 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: publication.content || "Sin contenido" }}
                        />
                    </div>
                </div>

                {/* Archivos adjuntos */}
                {publication.attachments && publication.attachments.length > 0 && (
                    <div className="mb-6">
                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <span className="iconify lucide--paperclip size-4"></span>
                            Archivos Adjuntos ({publication.attachments.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {publication.attachments.map((attachment, index) => (
                                <a
                                    key={index}
                                    href={attachment.public_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="card bg-base-200 hover:bg-base-300 transition-colors"
                                >
                                    <div className="card-body p-3 flex flex-row items-center gap-3">
                                        <span className="iconify lucide--file size-6 text-primary"></span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                                            <p className="text-xs text-base-content/60">
                                                {attachment.file_size ? `${(attachment.file_size / 1024).toFixed(2)} KB` : 'Tamaño desconocido'}
                                            </p>
                                        </div>
                                        <span className="iconify lucide--external-link size-4 text-base-content/60"></span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Botón cerrar */}
                <div className="modal-action">
                    <button className="btn btn-primary" onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
};
