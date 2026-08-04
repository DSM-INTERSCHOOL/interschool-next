"use client";

import { useState, useEffect } from "react";
import { IAnnouncement, IAssignment, IEvent } from "@/interfaces/IPublication";
import * as eventService from "@/services/event.service";
import { getOrgConfig } from "@/lib/orgConfig";
import { useAuthStore } from "@/store/useAuthStore";
import { PublicationCommentModal } from "./PublicationCommentModal";
import { formatRelativeDate } from "../utils";

type Publication = IAnnouncement | IAssignment | IEvent;

interface PublicationDetailProps {
    publication: Publication | null;
    type: "announcement" | "assignment" | "event";
    onLike?: (id: string) => void;
    onConfirm?: (id: string) => void;
    onCommentCountChange?: (id: string, delta: number) => void;
}

export const PublicationDetail = ({ publication, type, onLike, onConfirm, onCommentCountChange }: PublicationDetailProps) => {
    const personId = useAuthStore((state) => state.personId);
    const [showComments, setShowComments] = useState(false);

    const [confirmed, setConfirmed] = useState(false);
    const [signed, setSigned] = useState(false);
    const [signatureInput, setSignatureInput] = useState('');
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [signLoading, setSignLoading] = useState(false);
    const [confirmError, setConfirmError] = useState<string | null>(null);
    const [signError, setSignError] = useState<string | null>(null);
    const [selectedOption1, setSelectedOption1] = useState('');
    const [selectedOption2, setSelectedOption2] = useState('');
    const [savingOption1, setSavingOption1] = useState(false);
    const [savingOption2, setSavingOption2] = useState(false);
    const [optionError1, setOptionError1] = useState<string | null>(null);
    const [optionError2, setOptionError2] = useState<string | null>(null);

    useEffect(() => {
        if (!publication || type !== 'event' || !personId) return;

        setSignatureInput('');
        setConfirmError(null);
        setSignError(null);
        setConfirmed(false);
        setSigned(false);
        setSelectedOption1('');
        setSelectedOption2('');
        setOptionError1(null);
        setOptionError2(null);

        const { schoolId } = getOrgConfig();

        eventService.getPersonInEvent({
            schoolId,
            eventId: publication.id,
            personId: personId.toString(),
        }).then((data) => {
            setConfirmed(!!data.confirmed);
            setSigned(!!data.signed);
            setSelectedOption1(data.option_value_1 ?? '');
            setSelectedOption2(data.option_value_2 ?? '');
        }).catch(() => {
            // person record not found or not a recipient — leave as default
        });
    }, [publication?.id]);

    if (!publication) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <span className="iconify lucide--inbox text-base-content/20 size-20" />
                    <p className="text-base-content/40 mt-4">
                        Selecciona {type === "announcement" ? "un aviso" : type === "assignment" ? "una tarea" : "un evento"} para ver los detalles
                    </p>
                </div>
            </div>
        );
    }

    const event = type === 'event' ? (publication as IEvent) : null;

    const getPublisherName = () => {
        const { given_name, paternal_surname, maternal_surname } = publication.publisher;
        return `${given_name} ${paternal_surname} ${maternal_surname}`.trim();
    };

    const getPublisherInitials = () => {
        const { given_name, paternal_surname } = publication.publisher;
        return `${given_name[0]}${paternal_surname?.[0] || ""}`.toUpperCase();
    };

    const formatDateTime = (dateStr: string | null) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("es-MX", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const isDeadlinePassed = event?.confirmation_deadline
        ? new Date() > new Date(event.confirmation_deadline)
        : false;

    const handleToggleConfirm = async (value: boolean) => {
        if (!personId || !publication) return;
        try {
            setConfirmLoading(true);
            setConfirmError(null);
            const { schoolId } = getOrgConfig();
            await eventService.updatePerson({
                schoolId,
                eventId: publication.id,
                personId: personId.toString(),
                dto: { confirmed: value },
            });
            setConfirmed(value);
            onConfirm?.(publication.id);
        } catch (err: any) {
            setConfirmError(err.message || "Error al confirmar");
        } finally {
            setConfirmLoading(false);
        }
    };

    const handleOptionChange = async (listNum: 1 | 2, value: string) => {
        if (!personId || !publication) return;
        const setter = listNum === 1 ? setSelectedOption1 : setSelectedOption2;
        const setSaving = listNum === 1 ? setSavingOption1 : setSavingOption2;
        const setError = listNum === 1 ? setOptionError1 : setOptionError2;
        setter(value);
        try {
            setSaving(true);
            setError(null);
            const { schoolId } = getOrgConfig();
            const dto = listNum === 1
                ? { option_value_1: value || null }
                : { option_value_2: value || null };
            await eventService.updatePerson({
                schoolId,
                eventId: publication.id,
                personId: personId.toString(),
                dto,
            });
        } catch (err: any) {
            setError(err.message || "Error al guardar");
        } finally {
            setSaving(false);
        }
    };

    const handleSign = async () => {
        if (!personId || !publication || !signatureInput.trim()) return;
        try {
            setSignLoading(true);
            setSignError(null);
            const { schoolId } = getOrgConfig();
            await eventService.updatePerson({
                schoolId,
                eventId: publication.id,
                personId: personId.toString(),
                dto: { signed: true },
            });
            setSigned(true);
        } catch (err: any) {
            setSignError(err.message || "Error al firmar");
        } finally {
            setSignLoading(false);
        }
    };

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="border-base-300 flex items-center gap-4 border-b p-6">
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
                    <div>
                        <h2 className="text-xl font-bold">{publication.title}</h2>
                        <p className="text-base-content/60 text-sm">{getPublisherName()}</p>
                    </div>

                    <div className="mt-1 flex items-center gap-4 text-sm text-base-content/60">
                        <div className="flex items-center gap-1">
                            <span className="iconify lucide--calendar size-4" />
                            <span>{formatRelativeDate(publication.created_at)}</span>
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

                    {/* Event metadata */}
                    {event && (
                        <>
                            <div className="divider"></div>
                            <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                {event.event_start_time && (
                                    <div className="flex items-start gap-2 text-sm">
                                        <span className="iconify lucide--clock size-4 text-accent mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-base-content">Inicio del evento</p>
                                            <p className="text-base-content/60">{formatDateTime(event.event_start_time)}</p>
                                        </div>
                                    </div>
                                )}
                                {event.event_end_time && (
                                    <div className="flex items-start gap-2 text-sm">
                                        <span className="iconify lucide--clock-x size-4 text-accent mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-base-content">Fin del evento</p>
                                            <p className="text-base-content/60">{formatDateTime(event.event_end_time)}</p>
                                        </div>
                                    </div>
                                )}
                                {event.event_location && (
                                    <div className="flex items-start gap-2 text-sm">
                                        <span className="iconify lucide--map-pin size-4 text-accent mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-base-content">Lugar</p>
                                            <p className="text-base-content/60">{event.event_location}</p>
                                        </div>
                                    </div>
                                )}
                                {event.confirmation_deadline && (
                                    <div className="flex items-start gap-2 text-sm">
                                        <span className="iconify lucide--calendar-clock size-4 text-accent mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-base-content">Límite de confirmación</p>
                                            <p className={`${isDeadlinePassed ? "text-error" : "text-base-content/60"}`}>
                                                {formatDateTime(event.confirmation_deadline)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {event.event_url && (
                                    <div className="flex items-start gap-2 text-sm sm:col-span-2">
                                        <span className="iconify lucide--link size-4 text-accent mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-base-content">URL del evento</p>
                                            <a href={event.event_url} target="_blank" rel="noopener noreferrer"
                                                className="text-primary hover:underline break-all">
                                                {event.event_url}
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {event.map_url && (
                                    <div className="flex items-start gap-2 text-sm sm:col-span-2">
                                        <span className="iconify lucide--map size-4 text-accent mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-base-content">Cómo llegar</p>
                                            <a href={event.map_url} target="_blank" rel="noopener noreferrer"
                                                className="text-primary hover:underline break-all">
                                                Ver en mapa
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Option lists */}
                    {event && ((event.option_list_1?.length ?? 0) > 0 || (event.option_list_2?.length ?? 0) > 0) && (
                        <>
                            <div className="divider"></div>
                            <div className="not-prose space-y-4 mb-6">
                                {(event.option_list_1?.length ?? 0) > 0 && (
                                    <div className="form-control gap-1">
                                        <label className="label py-0">
                                            <span className="label-text font-medium flex items-center gap-2">
                                                {event.label_option_1 || 'Opciones 1'}
                                                {savingOption1 && <span className="loading loading-spinner loading-xs text-accent" />}
                                            </span>
                                        </label>
                                        <select
                                            className="select select-accent w-full"
                                            value={selectedOption1}
                                            disabled={savingOption1}
                                            onChange={(e) => handleOptionChange(1, e.target.value)}
                                        >
                                            <option value="">Selecciona una opción</option>
                                            {event.option_list_1!.map((opt, i) => (
                                                <option key={i} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                        {optionError1 && <p className="text-xs text-error mt-1">{optionError1}</p>}
                                    </div>
                                )}
                                {(event.option_list_2?.length ?? 0) > 0 && (
                                    <div className="form-control gap-1">
                                        <label className="label py-0">
                                            <span className="label-text font-medium flex items-center gap-2">
                                                {event.label_option_2 || 'Opciones 2'}
                                                {savingOption2 && <span className="loading loading-spinner loading-xs text-accent" />}
                                            </span>
                                        </label>
                                        <select
                                            className="select select-accent w-full"
                                            value={selectedOption2}
                                            disabled={savingOption2}
                                            onChange={(e) => handleOptionChange(2, e.target.value)}
                                        >
                                            <option value="">Selecciona una opción</option>
                                            {event.option_list_2!.map((opt, i) => (
                                                <option key={i} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                        {optionError2 && <p className="text-xs text-error mt-1">{optionError2}</p>}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Confirmation / Signature */}
                    {event && (event.requires_confirmation || event.requires_signature) && (
                        <>
                            <div className="divider"></div>
                            <div className="not-prose space-y-3">

                                {/* Confirmation checkbox */}
                                {event.requires_confirmation && (
                                    <div className="card bg-accent/5 border border-accent/20">
                                        <div className="card-body p-5">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <span className="iconify lucide--check-square size-5 text-accent" />
                                                Confirmación de asistencia
                                            </h3>
                                            <label className={`flex items-center gap-3 mt-2 ${isDeadlinePassed ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox checkbox-accent"
                                                    checked={confirmed}
                                                    disabled={confirmLoading || isDeadlinePassed}
                                                    onChange={(e) => handleToggleConfirm(e.target.checked)}
                                                />
                                                {event.confirmation_legend && (
                                                    <span className="text-sm text-base-content/80">{event.confirmation_legend}</span>
                                                )}
                                                {confirmLoading && <span className="loading loading-spinner loading-xs text-accent" />}
                                            </label>
                                            {isDeadlinePassed && (
                                                <p className="text-xs text-error mt-2">El plazo para confirmar ha vencido.</p>
                                            )}
                                            {confirmed && (
                                                <div className="alert alert-success mt-3 py-2">
                                                    <span className="iconify lucide--circle-check size-4" />
                                                    <span className="text-sm">Asistencia confirmada.</span>
                                                </div>
                                            )}
                                            {confirmError && (
                                                <p className="text-sm text-error mt-2">{confirmError}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Signature */}
                                {event.requires_signature && (
                                    <div className="card bg-accent/5 border border-accent/20">
                                        <div className="card-body p-5">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <span className="iconify lucide--pen-line size-5 text-accent" />
                                                Firma requerida
                                            </h3>
                                            {event.signature_legend && (
                                                <p className="text-sm text-base-content/70 mt-1">{event.signature_legend}</p>
                                            )}
                                            {signed ? (
                                                <div className="alert alert-success mt-3 py-2">
                                                    <span className="iconify lucide--circle-check size-4" />
                                                    <span className="text-sm">Documento firmado.</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <label className="input input-accent w-full mt-3">
                                                        <span className="iconify lucide--lock size-4 text-base-content/60" />
                                                        <input
                                                            type="password"
                                                            placeholder={event.signature_type === 'PIN' ? "Ingresa tu PIN" : "Ingresa tu contraseña"}
                                                            value={signatureInput}
                                                            disabled={signLoading || isDeadlinePassed}
                                                            onChange={(e) => setSignatureInput(e.target.value)}
                                                            className="grow"
                                                        />
                                                    </label>
                                                    {isDeadlinePassed && (
                                                        <p className="text-xs text-error mt-2">El plazo para firmar ha vencido.</p>
                                                    )}
                                                    {signError && (
                                                        <p className="text-sm text-error mt-2">{signError}</p>
                                                    )}
                                                    <button
                                                        className="btn btn-accent mt-3"
                                                        onClick={handleSign}
                                                        disabled={signLoading || isDeadlinePassed || !signatureInput.trim()}>
                                                        {signLoading
                                                            ? <><span className="loading loading-spinner loading-sm" /> Firmando...</>
                                                            : <><span className="iconify lucide--pen-line size-4" /> Firmar</>
                                                        }
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </>
                    )}

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

                    {/* Actions */}
                    <div className="divider mt-6"></div>
                    <div className="not-prose flex items-center gap-2">
                        <button
                            onClick={() => onLike?.(publication.id)}
                            className={`btn btn-sm gap-1.5 ${publication.user_liked ? "btn-primary" : "btn-ghost text-base-content/50"}`}>
                            <span className="iconify lucide--thumbs-up size-4" />
                            <span className="text-sm">{publication.likes}</span>
                        </button>
                        <button
                            className="btn btn-sm btn-ghost gap-1.5 text-base-content/50"
                            disabled={!publication.accept_comments}
                            onClick={() => setShowComments(true)}>
                            <span className="iconify lucide--message-circle size-4" />
                            <span className="text-sm">{publication.comments}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Comments modal */}
            {showComments && (
                <PublicationCommentModal
                    type={type}
                    publication={publication}
                    onClose={() => setShowComments(false)}
                    onCountChange={(delta) => onCommentCountChange?.(publication.id, delta)}
                />
            )}
        </div>
    );
};
