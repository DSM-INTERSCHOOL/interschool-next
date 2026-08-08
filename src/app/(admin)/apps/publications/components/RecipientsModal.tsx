"use client";

import { useState, useEffect } from "react";
import { IAnnouncementRecipient } from "@/interfaces/IAnnouncement";
import { getPersons as getAnnouncementPersons } from "@/services/announcement.service";
import { getPersons as getAssignmentPersons } from "@/services/assignment.service";
import { getEventConfirmations, IEventConfirmation } from "@/services/event.service";
import { getPollPersons } from "@/services/poll.service";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { getOrgConfig } from "@/lib/orgConfig";
import type { PublicationType } from "./PublicationTypeSelector";

interface RecipientsModalProps {
    announcementId: string | null;
    announcementTitle?: string | null;
    isOpen: boolean;
    onClose: () => void;
    publicationType: PublicationType;
    requiresConfirmation?: boolean;
    requiresSignature?: boolean;
}

const formatDateTime = (iso: string | null) => {
    if (!iso) return null;
    return new Date(iso).toLocaleString("es-ES", {
        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    });
};

export const RecipientsModal = ({ announcementId, announcementTitle, isOpen, onClose, publicationType, requiresConfirmation, requiresSignature }: RecipientsModalProps) => {
    const [recipients, setRecipients] = useState<IAnnouncementRecipient[]>([]);
    const [confirmations, setConfirmations] = useState<IEventConfirmation[]>([]);
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

            if (publicationType === 'event') {
                const data = await getEventConfirmations({ schoolId, eventId: announcementId });
                setConfirmations(data);
            } else if (publicationType === 'assignment') {
                const data = await getAssignmentPersons({ schoolId, assignmentId: announcementId });
                setRecipients(data);
            } else if (publicationType === 'poll') {
                const data = await getPollPersons({ schoolId, pollId: announcementId });
                setRecipients(data as any);
            } else {
                const data = await getAnnouncementPersons({ schoolId, announcementId });
                setRecipients(data);
            }
        } catch (err: any) {
            setError(err.message || "Error al cargar destinatarios");
            console.error("Error loading recipients:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setRecipients([]);
        setConfirmations([]);
        setError(null);
        onClose();
    };

    if (!isOpen || !announcementId) return null;

    const isEvent = publicationType === 'event';
    const isPoll = publicationType === 'poll';
    const totalCount = isEvent ? confirmations.length : recipients.length;
    const confirmedCount = isEvent ? confirmations.filter((c) => c.confirmed).length : 0;
    const signedCount = isEvent ? confirmations.filter((c) => c.signed).length : 0;
    const respondedCount = isPoll ? recipients.filter((r) => (r as any).responded).length : 0;

    const typeColor = publicationType === 'assignment' ? 'bg-secondary/10' : publicationType === 'event' ? 'bg-accent/10' : 'bg-primary/10';
    const typeTextColor = publicationType === 'assignment' ? 'text-secondary' : publicationType === 'event' ? 'text-accent' : 'text-primary';
    const typeLabel = publicationType === 'assignment' ? 'Tarea' : publicationType === 'event' ? 'Evento' : 'Aviso';

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-3xl max-h-[80vh]">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeColor}`}>
                            <span className={`iconify size-6 lucide--users ${typeTextColor}`}></span>
                        </div>
                        <div>
                            <h3 className="font-bold text-2xl">Destinatarios</h3>
                            <p className="text-sm text-base-content/70">
                                {announcementTitle || `${typeLabel} sin título`}
                            </p>
                        </div>
                    </div>
                    <button className="btn btn-sm btn-circle btn-ghost" onClick={handleClose}>
                        <span className="iconify lucide--x size-5"></span>
                    </button>
                </div>

                {/* Counts */}
                {!loading && !error && totalCount > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        <div className="badge badge-lg badge-ghost gap-2">
                            <span className="iconify lucide--users size-4"></span>
                            {totalCount} {totalCount === 1 ? 'destinatario' : 'destinatarios'}
                        </div>
                        {isPoll && (
                            <div className="badge badge-lg badge-success gap-2">
                                <span className="iconify lucide--check-circle size-4"></span>
                                {respondedCount} respondido{respondedCount !== 1 ? 's' : ''}
                            </div>
                        )}
                        {isEvent && requiresConfirmation && (
                            <div className="badge badge-lg badge-success gap-2">
                                <span className="iconify lucide--check size-4"></span>
                                {confirmedCount} confirmado{confirmedCount !== 1 ? 's' : ''}
                            </div>
                        )}
                        {isEvent && requiresSignature && (
                            <div className="badge badge-lg badge-info gap-2">
                                <span className="iconify lucide--pen-line size-4"></span>
                                {signedCount} firmado{signedCount !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                )}

                <div className="divider my-2"></div>

                {/* Content */}
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
                ) : totalCount === 0 ? (
                    <div className="text-center py-16">
                        <span className="iconify lucide--users size-24 text-base-content/20 mb-4"></span>
                        <h3 className="text-xl font-medium text-base-content mb-2">No hay destinatarios</h3>
                        <p className="text-base-content/60">Esta publicación no tiene destinatarios asignados</p>
                    </div>
                ) : isEvent ? (
                    /* Event confirmations table */
                    <div className="overflow-y-auto max-h-[400px]">
                        <table className="table table-zebra w-full">
                            <thead className="sticky top-0 z-10 bg-base-200">
                                <tr>
                                    <th className="bg-base-200">Nombre</th>
                                    <th className="bg-base-200">Tipo</th>
                                    {requiresConfirmation && <th className="bg-base-200 text-center">Confirmado</th>}
                                    {requiresSignature && <th className="bg-base-200 text-center">Firmado</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {confirmations.map((c, index) => (
                                    <tr key={index}>
                                        <td>
                                            <div className="font-medium">
                                                {c.given_name} {c.paternal_surname} {c.maternal_surname}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={`badge ${
                                                c.type === 'STUDENT' ? 'badge-info' :
                                                c.type === 'TEACHER' ? 'badge-success' :
                                                c.type === 'PARENT' ? 'badge-warning' :
                                                'badge-neutral'
                                            }`}>
                                                {c.type}
                                            </div>
                                        </td>
                                        {requiresConfirmation && (
                                            <td className="text-center">
                                                {c.confirmed ? (
                                                    <div className="flex flex-col items-center gap-0.5">
                                                        <span className="iconify lucide--circle-check size-5 text-success"></span>
                                                        {formatDateTime(c.confirmed_at) && (
                                                            <span className="text-xs text-base-content/50">{formatDateTime(c.confirmed_at)}</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="iconify lucide--circle size-5 text-base-content/20"></span>
                                                )}
                                            </td>
                                        )}
                                        {requiresSignature && (
                                            <td className="text-center">
                                                {c.signed ? (
                                                    <div className="flex flex-col items-center gap-0.5">
                                                        <span className="iconify lucide--circle-check size-5 text-info"></span>
                                                        {formatDateTime(c.signed_at) && (
                                                            <span className="text-xs text-base-content/50">{formatDateTime(c.signed_at)}</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="iconify lucide--circle size-5 text-base-content/20"></span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* Announcements / assignments table */
                    <div className="overflow-y-auto max-h-[400px]">
                        <table className="table table-zebra w-full">
                            <thead className="sticky top-0 z-10 bg-base-200">
                                <tr>
                                    <th className="bg-base-200">Foto</th>
                                    <th className="bg-base-200">Nombre</th>
                                    <th className="bg-base-200">Tipo</th>
                                    {publicationType === 'poll' && <th className="bg-base-200 text-center">Respondido</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {recipients.map((recipient, idx) => {
                                    const r = recipient as any;
                                    return (
                                    <tr key={r.person_id ?? r.id ?? String(idx)}>
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
                                                        <span className="text-sm">{recipient.given_name?.[0] || "?"}</span>
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
                                        {publicationType === 'poll' && (
                                            <td className="text-center">
                                                {r.responded ? (
                                                    <div className="flex flex-col items-center gap-0.5">
                                                        <span className="iconify lucide--circle-check size-5 text-success"></span>
                                                        {formatDateTime(r.responded_at) && (
                                                            <span className="text-xs text-base-content/50">{formatDateTime(r.responded_at)}</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="iconify lucide--circle size-5 text-base-content/20"></span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Close button */}
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
