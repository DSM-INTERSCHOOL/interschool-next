"use client";

import { useState, useEffect } from "react";
import { IAnnouncementRecipient } from "@/interfaces/IAnnouncement";
import { getPersons as getAnnouncementPersons } from "@/services/announcement.service";
import { getPersons as getAssignmentPersons } from "@/services/assignment.service";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { getOrgConfig } from "@/lib/orgConfig";

interface RecipientsModalProps {
    announcementId: string | null;
    announcementTitle?: string | null;
    isOpen: boolean;
    onClose: () => void;
    publicationType: 'announcement' | 'assignment';
}

export const RecipientsModal = ({ announcementId, announcementTitle, isOpen, onClose, publicationType }: RecipientsModalProps) => {
    const [recipients, setRecipients] = useState<IAnnouncementRecipient[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && announcementId) {
            loadRecipients();
        }
    }, [isOpen, announcementId]);

    const loadRecipients = async () => {
        if (!announcementId) return;

        try {
            setLoading(true);
            setError(null);
            const { schoolId } = getOrgConfig();

            const data = publicationType === 'assignment'
                ? await getAssignmentPersons({
                    schoolId,
                    assignmentId: announcementId,
                })
                : await getAnnouncementPersons({
                    schoolId,
                    announcementId,
                });

            setRecipients(data);
        } catch (err: any) {
            setError(err.message || "Error al cargar destinatarios");
            console.error("Error loading recipients:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setRecipients([]);
        setError(null);
        onClose();
    };

    if (!isOpen || !announcementId) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-3xl max-h-[80vh]">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            publicationType === 'assignment' ? 'bg-secondary/10' : 'bg-primary/10'
                        }`}>
                            <span className={`iconify size-6 lucide--users ${
                                publicationType === 'assignment' ? 'text-secondary' : 'text-primary'
                            }`}></span>
                        </div>
                        <div>
                            <h3 className="font-bold text-2xl">Destinatarios</h3>
                            <p className="text-sm text-base-content/70">
                                {announcementTitle || `${publicationType === 'assignment' ? 'Tarea' : 'Aviso'} sin título`}
                            </p>
                        </div>
                    </div>
                    <button className="btn btn-sm btn-circle btn-ghost" onClick={handleClose}>
                        <span className="iconify lucide--x size-5"></span>
                    </button>
                </div>

                {/* Badge con número de destinatarios */}
                {!loading && !error && recipients.length > 0 && (
                    <div className="mb-4">
                        <div className="badge badge-lg badge-primary gap-2">
                            <span className="iconify lucide--users size-4"></span>
                            {recipients.length} {recipients.length === 1 ? 'destinatario' : 'destinatarios'}
                        </div>
                    </div>
                )}

                <div className="divider my-2"></div>

                {/* Contenido */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <LoadingSpinner message="Cargando destinatarios..." />
                    </div>
                ) : error ? (
                    <div className="alert alert-error">
                        <span className="iconify lucide--alert-circle size-6"></span>
                        <div>
                            <h3 className="font-bold">Error</h3>
                            <div className="text-sm">{error}</div>
                        </div>
                    </div>
                ) : recipients.length === 0 ? (
                    <div className="text-center py-16">
                        <span className="iconify lucide--users size-24 text-base-content/20 mb-4"></span>
                        <h3 className="text-xl font-medium text-base-content mb-2">
                            No hay destinatarios
                        </h3>
                        <p className="text-base-content/60">
                            Esta publicación no tiene destinatarios asignados
                        </p>
                    </div>
                ) : (
                    <>
                        

                        <div className="overflow-y-auto max-h-[400px]">
                            <table className="table table-zebra w-full">
                                <thead className="sticky top-0 z-10 bg-base-200">
                                    <tr>
                                        <th className="bg-base-200">Foto</th>
                                        <th className="bg-base-200">Nombre</th>
                                        <th className="bg-base-200">Tipo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recipients.map((recipient) => (
                                        <tr key={recipient.id}>
                                            <td>
                                                {recipient.profile_picture_url || recipient.official_picture_url ? (
                                                    <img
                                                        src={recipient.profile_picture_url || recipient.official_picture_url || ''}
                                                        alt=""
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="avatar placeholder">
                                                        <div className="bg-neutral text-neutral-content rounded-full w-10">
                                                            <span className="text-sm">
                                                                {recipient.given_name?.[0] || "?"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div className="font-medium">
                                                    {recipient.given_name} {recipient.paternal_surname} {recipient.maternal_surname}
                                                </div>
                                            </td>
                                        
                                            <td>
                                                <div className={`badge ${
                                                    recipient.type === 'STUDENT' ? 'badge-info' :
                                                    recipient.type === 'TEACHER' ? 'badge-success' :
                                                    recipient.type === 'PARENT' ? 'badge-warning' :
                                                    'badge-neutral'
                                                }`}>
                                                    {recipient.type || "Sin tipo"}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Botón cerrar */}
                <div className="modal-action">
                    <button className="btn btn-ghost" onClick={handleClose}>
                        Cerrar
                    </button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={handleClose}></div>
        </div>
    );
};
