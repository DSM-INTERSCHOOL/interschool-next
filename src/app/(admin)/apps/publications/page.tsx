"use client";

import { PageTitle } from "@/components/PageTitle";
import { AppLink as Link } from "@/components/AppLink";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAppRouter as useRouter } from "@/hooks/useAppRouter";
import { FiltersModal } from "./components/FiltersModal";
import { PublicationDetailModal } from "./components/PublicationDetailModal";
import { RecipientsModal } from "./components/RecipientsModal";
import { LikesModal } from "./components/LikesModal";
import { CommentsModal } from "./components/CommentsModal";
import { ViewsModal } from "./components/ViewsModal";
import { EventStatsModal, EventStatType } from "./components/EventStatsModal";
import { EventOptionsModal } from "./components/EventOptionsModal";
import { PollResultsModal } from "./components/PollResultsModal";
import * as announcemntService from "@/services/announcement.service";
import * as assignmentService from "@/services/assignment.service";
import * as eventService from "@/services/event.service";
import { getPolls } from "@/services/poll.service";
import { IAnnouncementRead } from "@/interfaces/IAnnouncement";
import { PollRead } from "@/interfaces/IPoll";
import type { PublicationType } from "./components/PublicationTypeSelector";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { getOrgConfig } from "@/lib/orgConfig";
import { useUserRole } from "./hooks/useUserRole";
import { useAuthStore } from "@/store/useAuthStore";

export default function PublicationsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const highlightId = searchParams.get('highlightId');
    const highlightType = searchParams.get('publicationType') as PublicationType | null;
    const userRole = useUserRole();
    const personId = useAuthStore((state) => state.personId);

    const [publicationType, setPublicationType] = useState<PublicationType>(highlightType || 'announcement');
    const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState<any>(null);
    const [announcements, setAnnouncements] = useState<IAnnouncementRead[]>([]);
    const [polls, setPolls] = useState<PollRead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(100);
    const [totalItems, setTotalItems] = useState(0);
    const [highlightedPublication, setHighlightedPublication] = useState<IAnnouncementRead | null>(null);
    const [highlightedPoll, setHighlightedPoll] = useState<PollRead | null>(null);
    const [selectedPublication, setSelectedPublication] = useState<IAnnouncementRead | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | null>(null);
    const [selectedAnnouncementTitle, setSelectedAnnouncementTitle] = useState<string | null>(null);
    const [selectedRecipientsRequiresConfirmation, setSelectedRecipientsRequiresConfirmation] = useState(false);
    const [selectedRecipientsRequiresSignature, setSelectedRecipientsRequiresSignature] = useState(false);
    const [isRecipientsModalOpen, setIsRecipientsModalOpen] = useState(false);
    const [selectedLikesPublicationId, setSelectedLikesPublicationId] = useState<string | null>(null);
    const [selectedLikesPublicationTitle, setSelectedLikesPublicationTitle] = useState<string | null>(null);
    const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);
    const [selectedCommentsPublicationId, setSelectedCommentsPublicationId] = useState<string | null>(null);
    const [selectedCommentsPublicationTitle, setSelectedCommentsPublicationTitle] = useState<string | null>(null);
    const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
    const [selectedViewsPublicationId, setSelectedViewsPublicationId] = useState<string | null>(null);
    const [selectedViewsPublicationTitle, setSelectedViewsPublicationTitle] = useState<string | null>(null);
    const [isViewsModalOpen, setIsViewsModalOpen] = useState(false);
    const [selectedStatsEventId, setSelectedStatsEventId] = useState<string | null>(null);
    const [selectedStatsEventTitle, setSelectedStatsEventTitle] = useState<string | null>(null);
    const [statsType, setStatsType] = useState<EventStatType | null>(null);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [selectedResultsPollId, setSelectedResultsPollId] = useState<string | null>(null);
    const [selectedResultsPollTitle, setSelectedResultsPollTitle] = useState<string | null>(null);
    const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
    const [selectedOptionsEventId, setSelectedOptionsEventId] = useState<string | null>(null);
    const [selectedOptionsEventTitle, setSelectedOptionsEventTitle] = useState<string | null>(null);
    const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);

    useEffect(() => {
        setCurrentPage(1); // Reset to page 1 when switching types
        loadPublications();
    }, [publicationType]);

    useEffect(() => {
        loadPublications();
    }, [currentPage, itemsPerPage]);

    useEffect(() => {
        document.title = "Publicaciones - Interschool";
    }, []);

    const loadPublications = async () => {
        try {
            setLoading(true);
            setError(null);
            const { schoolId } = getOrgConfig();

            const offset = (currentPage - 1) * itemsPerPage;
            const serviceArgs: any = {
                schoolId,
                offset: offset,
                limit: itemsPerPage
            };

            // Si es profesor, agregar filtro por publisher_person_id
            if (userRole === 'teacher' && personId) {
                serviceArgs.filters = `publisher_person_id::eq::${personId}`;
            }

            let data: any[];
            if (publicationType === 'poll') {
                const pollArgs: any = { schoolId, offset, limit: itemsPerPage };
                if (userRole === 'teacher' && personId) pollArgs.personId = personId.toString();
                data = await getPolls(pollArgs);
                setPolls(data);
                if (highlightId) {
                    const found = data.find((p: PollRead) => p.id === highlightId);
                    if (found) setHighlightedPoll(found as PollRead);
                }
            } else {
                data = publicationType === 'assignment'
                    ? await assignmentService.getAll(serviceArgs)
                    : publicationType === 'event'
                        ? await eventService.getAll(serviceArgs)
                        : await announcemntService.getAll(serviceArgs);
                setAnnouncements(data);

                if (highlightId) {
                    const highlighted = data.find((pub: any) => pub.id === highlightId);
                    if (highlighted) setHighlightedPublication(highlighted);
                }
            }

            if (data.length < itemsPerPage) {
                setTotalItems(offset + data.length);
            } else {
                setTotalItems(offset + data.length + 1);
            }
        } catch (err: any) {
            const typeLabel = publicationType === 'assignment' ? 'las tareas' : publicationType === 'event' ? 'los eventos' : publicationType === 'poll' ? 'las encuestas' : 'los avisos';
            setError(err.message || `Error al cargar ${typeLabel}`);
            console.error("Error loading publications:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFilters = (filters: any) => {
        setAppliedFilters(filters);
        console.log("Filtros aplicados:", filters);
    };

    const handleToggleAuthorization = async (announcement: IAnnouncementRead) => {
        try {
            const { schoolId } = getOrgConfig();
            const newAuthorizedValue = !announcement.authorized;

            // Actualizar en el servidor
            if (publicationType === 'assignment') {
                await assignmentService.update({
                    schoolId: schoolId!,
                    assignmentId: announcement.id,
                    dto: { authorized: newAuthorizedValue }
                });
            } else if (publicationType === 'event') {
                await eventService.update({
                    schoolId: schoolId!,
                    eventId: announcement.id,
                    dto: { authorized: newAuthorizedValue }
                });
            } else {
                await announcemntService.update({
                    schoolId: schoolId!,
                    announcementId: announcement.id,
                    dto: { authorized: newAuthorizedValue }
                });
            }

            // Actualizar localmente
            setAnnouncements(prev =>
                prev.map(a =>
                    a.id === announcement.id
                        ? { ...a, authorized: newAuthorizedValue }
                        : a
                )
            );
        } catch (err: any) {
            console.error("Error updating authorization:", err);
            alert(`Error al actualizar la autorización: ${err.message || 'Error desconocido'}`);
        }
    };

    const handleCloseHighlight = () => {
        setHighlightedPublication(null);
        // Limpiar query parameters de la URL
        router.push('/apps/publications');
    };

    const handleViewPublication = (publication: IAnnouncementRead) => {
        setSelectedPublication(publication);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedPublication(null);
    };

    const handleViewRecipients = (announcementId: string, announcementTitle: string | null | undefined, requiresConfirmation = false, requiresSignature = false) => {
        setSelectedAnnouncementId(announcementId);
        setSelectedAnnouncementTitle(announcementTitle || null);
        setSelectedRecipientsRequiresConfirmation(requiresConfirmation);
        setSelectedRecipientsRequiresSignature(requiresSignature);
        setIsRecipientsModalOpen(true);
    };

    const handleCloseRecipientsModal = () => {
        setIsRecipientsModalOpen(false);
        setSelectedAnnouncementId(null);
        setSelectedAnnouncementTitle(null);
        setSelectedRecipientsRequiresConfirmation(false);
        setSelectedRecipientsRequiresSignature(false);
    };

    const handleViewLikes = (publicationId: string, publicationTitle: string | null | undefined) => {
        setSelectedLikesPublicationId(publicationId);
        setSelectedLikesPublicationTitle(publicationTitle || null);
        setIsLikesModalOpen(true);
    };

    const handleCloseLikesModal = () => {
        setIsLikesModalOpen(false);
        setSelectedLikesPublicationId(null);
        setSelectedLikesPublicationTitle(null);
    };

    const handleViewComments = (publicationId: string, publicationTitle: string | null | undefined) => {
        setSelectedCommentsPublicationId(publicationId);
        setSelectedCommentsPublicationTitle(publicationTitle || null);
        setIsCommentsModalOpen(true);
    };

    const handleCloseCommentsModal = () => {
        setIsCommentsModalOpen(false);
        setSelectedCommentsPublicationId(null);
        setSelectedCommentsPublicationTitle(null);
    };

    const handleViewViews = (publicationId: string, publicationTitle: string | null | undefined) => {
        setSelectedViewsPublicationId(publicationId);
        setSelectedViewsPublicationTitle(publicationTitle || null);
        setIsViewsModalOpen(true);
    };

    const handleCloseViewsModal = () => {
        setIsViewsModalOpen(false);
        setSelectedViewsPublicationId(null);
        setSelectedViewsPublicationTitle(null);
    };

    const handleViewStats = (type: EventStatType, eventId: string, eventTitle: string | null | undefined) => {
        setSelectedStatsEventId(eventId);
        setSelectedStatsEventTitle(eventTitle || null);
        setStatsType(type);
        setIsStatsModalOpen(true);
    };

    const handleCloseStatsModal = () => {
        setIsStatsModalOpen(false);
        setSelectedStatsEventId(null);
        setSelectedStatsEventTitle(null);
        setStatsType(null);
    };

    const handleViewResults = (pollId: string, pollTitle: string | null | undefined) => {
        setSelectedResultsPollId(pollId);
        setSelectedResultsPollTitle(pollTitle || null);
        setIsResultsModalOpen(true);
    };

    const handleCloseResultsModal = () => {
        setIsResultsModalOpen(false);
        setSelectedResultsPollId(null);
        setSelectedResultsPollTitle(null);
    };

    const handleViewOptions = (eventId: string, eventTitle: string | null | undefined) => {
        setSelectedOptionsEventId(eventId);
        setSelectedOptionsEventTitle(eventTitle || null);
        setIsOptionsModalOpen(true);
    };

    const handleCloseOptionsModal = () => {
        setIsOptionsModalOpen(false);
        setSelectedOptionsEventId(null);
        setSelectedOptionsEventTitle(null);
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
            PUBLISHED: { color: "badge-success", text: "Publicado" },
            BORRADOR: { color: "badge-warning", text: "Borrador" },
            DRAFT: { color: "badge-warning", text: "Borrador" },
            CANCELADO: { color: "badge-error", text: "Cancelado" },
            CLOSED: { color: "badge-error", text: "Cerrado" },
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
            <PageTitle title="Publicaciones" />
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
                                    className={`join-item btn ${publicationType === 'event' ? 'btn-accent' : 'btn-outline'}`}
                                    onClick={() => setPublicationType('event')}
                                >
                                    <span className="iconify lucide--calendar-days size-5"></span>
                                    Eventos
                                </button>
                                <button
                                    className={`join-item btn ${publicationType === 'poll' ? 'btn-warning' : 'btn-outline'}`}
                                    onClick={() => setPublicationType('poll')}
                                >
                                    <span className="iconify lucide--bar-chart-2 size-5"></span>
                                    Encuestas
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
                                    publicationType === 'assignment' ? 'lucide--clipboard-list'
                                    : publicationType === 'event' ? 'lucide--calendar-days'
                                    : publicationType === 'poll' ? 'lucide--bar-chart-2'
                                    : 'lucide--megaphone'
                                }`}></span>
                                Lista de {publicationType === 'assignment' ? 'Tareas' : publicationType === 'event' ? 'Eventos' : publicationType === 'poll' ? 'Encuestas' : 'Avisos'}
                            </h2>
                            <div className="flex gap-2">
                                {/* <button
                                    onClick={() => setIsFiltersModalOpen(true)}
                                    className="btn btn-outline"
                                >
                                    <span className="iconify lucide--filter size-5"></span>
                                    Filtros
                                </button> */}
                                {/* <Link href="/apps/publications/create" className="btn btn-primary">
                                    <span className="iconify lucide--plus size-5"></span>
                                    Nueva Publicación
                                </Link> */}
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-16">
                                <LoadingSpinner message={`Cargando ${publicationType === 'assignment' ? 'tareas' : publicationType === 'event' ? 'eventos' : publicationType === 'poll' ? 'encuestas' : 'avisos'}...`} />
                            </div>
                        ) : error ? (
                            <div className="alert alert-error">
                                <span className="iconify lucide--alert-circle size-6"></span>
                                <div>
                                    <h3 className="font-bold">Error</h3>
                                    <div className="text-sm">{error}</div>
                                </div>
                            </div>
                        ) : (publicationType === 'poll' ? polls : announcements).length === 0 ? (
                            <div className="text-center py-16">
                                <span className={`iconify size-24 text-base-content/20 mb-4 ${
                                    publicationType === 'assignment' ? 'lucide--clipboard-list'
                                    : publicationType === 'event' ? 'lucide--calendar-days'
                                    : publicationType === 'poll' ? 'lucide--bar-chart-2'
                                    : 'lucide--inbox'
                                }`}></span>
                                <h3 className="text-xl font-medium text-base-content mb-2">
                                    No hay {publicationType === 'assignment' ? 'tareas' : publicationType === 'event' ? 'eventos' : publicationType === 'poll' ? 'encuestas' : 'avisos'}
                                </h3>
                                <p className="text-base-content/60 mb-6">
                                    No se encontraron {publicationType === 'assignment' ? 'tareas' : publicationType === 'event' ? 'eventos' : publicationType === 'poll' ? 'encuestas' : 'avisos'} publicadas
                                </p>
                                {/* <Link href="/apps/publications/create" className="btn btn-primary btn-sm">
                                    <span className="iconify lucide--plus size-4"></span>
                                    Crear primer{publicationType === 'assignment' ? 'a tarea' : ' aviso'}
                                </Link> */}
                            </div>
                        ) : (
                            <>
                                {/* Non-poll publications: announcements, assignments, events */}
                                {publicationType !== 'poll' && (
                                <>
                                {/* Sección destacada de publicación recién creada/editada */}
                                {highlightedPublication && (
                                    <div className="alert alert-success mb-6">
                                        <span className="iconify lucide--check-circle size-6"></span>
                                        <div className="flex-1">
                                            <h3 className="font-bold">
                                                {publicationType === 'assignment' ? 'Tarea' : publicationType === 'event' ? 'Evento' : 'Aviso'} {highlightId === highlightedPublication.id ? 'guardado' : 'cargado'} exitosamente
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
                                            <th className="bg-base-200">Autorización</th>
                                            <th className="bg-base-200">Vistas</th>
                                            <th className="bg-base-200">Comentarios</th>
                                            <th className="bg-base-200">Likes</th>
                                                            {announcements.some(a => (a as any).requires_confirmation) && (
                                                <th className="bg-base-200 text-center">Confirmados</th>
                                            )}
                                            {announcements.some(a => (a as any).requires_signature) && (
                                                <th className="bg-base-200 text-center">Firmados</th>
                                            )}
                                            {publicationType === 'event' && announcements.some(a => (a as any).option_list_1?.length > 0 || (a as any).option_list_2?.length > 0) && (
                                                <th className="bg-base-200 text-center">Opciones</th>
                                            )}
                                            <th className="bg-base-200">Destinatarios</th>
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
                                                    <div className="flex items-center justify-center">
                                                        <input
                                                            type="checkbox"
                                                            className="checkbox checkbox-primary cursor-pointer"
                                                            checked={announcement.authorized || false}
                                                            onChange={() => handleToggleAuthorization(announcement)}
                                                            title={announcement.authorized ? "Autorizado - Click para desautorizar" : "No autorizado - Click para autorizar"}
                                                        />
                                                    </div>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-ghost btn-xs text-success"
                                                        onClick={() => handleViewViews(announcement.id, announcement.title)}
                                                    >
                                                        <span className="iconify lucide--eye size-4"></span>
                                                        {announcement.views || 0}
                                                    </button>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-ghost btn-xs text-info"
                                                        onClick={() => handleViewComments(announcement.id, announcement.title)}
                                                    >
                                                        <span className="iconify lucide--message-circle size-4"></span>
                                                        {announcement.comments || 0}
                                                    </button>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-ghost btn-xs text-error"
                                                        onClick={() => handleViewLikes(announcement.id, announcement.title)}
                                                    >
                                                        <span className="iconify lucide--heart size-4"></span>
                                                        {announcement.likes || 0}
                                                    </button>
                                                </td>
                                                {announcements.some(a => (a as any).requires_confirmation) && (() => {
                                                    const ev = announcement as any;
                                                    return (
                                                        <td className="text-center text-sm">
                                                            {ev.requires_confirmation ? (
                                                                <button
                                                                    className="btn btn-ghost btn-xs text-success"
                                                                    onClick={() => handleViewStats('confirmations', ev.id, ev.title)}
                                                                >
                                                                    <span className="iconify lucide--circle-check size-4"></span>
                                                                    {ev.confirmed_persons ?? 0}/{ev.total_persons ?? 0}
                                                                </button>
                                                            ) : (
                                                                <span className="text-base-content/30">—</span>
                                                            )}
                                                        </td>
                                                    );
                                                })()}
                                                {announcements.some(a => (a as any).requires_signature) && (() => {
                                                    const ev = announcement as any;
                                                    return (
                                                        <td className="text-center text-sm">
                                                            {ev.requires_signature ? (
                                                                <button
                                                                    className="btn btn-ghost btn-xs text-info"
                                                                    onClick={() => handleViewStats('signatures', ev.id, ev.title)}
                                                                >
                                                                    <span className="iconify lucide--pen-line size-4"></span>
                                                                    {ev.signed_persons ?? 0}/{ev.total_persons ?? 0}
                                                                </button>
                                                            ) : (
                                                                <span className="text-base-content/30">—</span>
                                                            )}
                                                        </td>
                                                    );
                                                })()}
                                                {publicationType === 'event' && announcements.some(a => (a as any).option_list_1?.length > 0 || (a as any).option_list_2?.length > 0) && (() => {
                                                    const ev = announcement as any;
                                                    const hasOptions = ev.option_list_1?.length > 0 || ev.option_list_2?.length > 0;
                                                    return (
                                                        <td className="text-center text-sm">
                                                            {hasOptions ? (
                                                                <button
                                                                    className="btn btn-ghost btn-xs text-accent"
                                                                    onClick={() => handleViewOptions(ev.id, ev.title)}
                                                                    title="Ver opciones"
                                                                >
                                                                    <span className="iconify lucide--list-checks size-4"></span>
                                                                </button>
                                                            ) : (
                                                                <span className="text-base-content/30">—</span>
                                                            )}
                                                        </td>
                                                    );
                                                })()}
                                                <td className="text-center">
                                                    <button
                                                        className="btn btn-ghost btn-xs text-primary"
                                                        onClick={() => {
                                                            const ev = announcement as any;
                                                            handleViewRecipients(ev.id, ev.title, !!ev.requires_confirmation, !!ev.requires_signature);
                                                        }}
                                                        title="Ver destinatarios"
                                                    >
                                                        <span className="iconify lucide--users size-4"></span>
                                                    </button>
                                                </td>
                                                <td>
                                                    <div className="flex gap-1">
                                                        <button
                                                            className="btn btn-ghost btn-xs"
                                                            title="Ver"
                                                            onClick={() => handleViewPublication(announcement)}
                                                        >
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

                            {/* Pagination Controls */}
                            {announcements.length > 0 && (
                                <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                                    {/* Items per page selector */}
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm">Mostrar:</label>
                                        <select
                                            className="select select-bordered select-sm"
                                            value={itemsPerPage}
                                            onChange={(e) => {
                                                setItemsPerPage(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                        <span className="text-sm text-base-content/60">
                                            por página
                                        </span>
                                    </div>

                                    {/* Page info */}
                                    <div className="text-sm text-base-content/60">
                                        Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}
                                    </div>

                                    {/* Page navigation buttons */}
                                    <div className="join">
                                        <button
                                            className="join-item btn btn-sm"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(1)}
                                        >
                                            <span className="iconify lucide--chevrons-left size-4"></span>
                                        </button>
                                        <button
                                            className="join-item btn btn-sm"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(prev => prev - 1)}
                                        >
                                            <span className="iconify lucide--chevron-left size-4"></span>
                                        </button>
                                        <button className="join-item btn btn-sm btn-disabled">
                                            Página {currentPage}
                                        </button>
                                        <button
                                            className="join-item btn btn-sm"
                                            disabled={announcements.length < itemsPerPage}
                                            onClick={() => setCurrentPage(prev => prev + 1)}
                                        >
                                            <span className="iconify lucide--chevron-right size-4"></span>
                                        </button>
                                    </div>
                                </div>
                            )}
                            </>
                            )}

                                {/* Poll type */}
                                {publicationType === 'poll' && (
                                <>
                                    {highlightedPoll && (
                                        <div className="alert alert-success mb-6">
                                            <span className="iconify lucide--check-circle size-6"></span>
                                            <div className="flex-1">
                                                <h3 className="font-bold">Encuesta guardada exitosamente</h3>
                                                <div className="text-sm"><strong>{highlightedPoll.title}</strong></div>
                                            </div>
                                            <button className="btn btn-sm btn-ghost" onClick={() => setHighlightedPoll(null)}>
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
                                                    <th className="bg-base-200">Inicio</th>
                                                    <th className="bg-base-200">Cierre</th>
                                                    <th className="bg-base-200">Estado</th>
                                                    <th className="bg-base-200 text-center">Anónima</th>
                                                    <th className="bg-base-200 text-center">Preguntas</th>
                                                    <th className="bg-base-200 text-center">Respondidos</th>
                                                    <th className="bg-base-200">Vistas</th>
                                                    <th className="bg-base-200">Destinatarios</th>
                                                    <th className="bg-base-200">Resultados</th>
                                                    <th className="bg-base-200">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {polls.map((poll) => (
                                                    <tr key={poll.id}>
                                                        <td>
                                                            <div className="max-w-xs">
                                                                <div className="font-medium">{poll.title || "Sin título"}</div>
                                                                {poll.description && (
                                                                    <div className="text-sm text-base-content/60 truncate">{poll.description.substring(0, 80)}</div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="flex items-center gap-2">
                                                                {poll.publisher?.profile_picture_url ? (
                                                                    <img src={poll.publisher.profile_picture_url} alt="" className="w-8 h-8 rounded-full" />
                                                                ) : (
                                                                    <div className="avatar placeholder">
                                                                        <div className="bg-neutral text-neutral-content rounded-full w-8">
                                                                            <span className="text-xs">{poll.publisher?.given_name?.[0] || "?"}</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <div className="text-sm">
                                                                    {poll.publisher?.given_name} {poll.publisher?.paternal_surname}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="text-sm">{formatDate(poll.start_date)}</td>
                                                        <td className="text-sm">{formatDate(poll.end_date)}</td>
                                                        <td>{getStatusBadge(poll.status)}</td>
                                                        <td className="text-center">
                                                            {poll.anonymous ? (
                                                                <span className="iconify lucide--eye-off size-5 text-base-content/50" title="Anónima"></span>
                                                            ) : (
                                                                <span className="iconify lucide--eye size-5 text-base-content/30" title="No anónima"></span>
                                                            )}
                                                        </td>
                                                        <td className="text-center">
                                                            <div className="badge badge-neutral badge-sm">{poll.questions?.length ?? 0}</div>
                                                        </td>
                                                        <td className="text-center text-sm">
                                                            <span className="text-success font-medium">
                                                                {poll.responded_persons ?? 0}/{poll.total_persons ?? 0}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="btn btn-ghost btn-xs text-success"
                                                                onClick={() => handleViewViews(poll.id, poll.title ?? '')}
                                                            >
                                                                <span className="iconify lucide--eye size-4"></span>
                                                                {(poll as any).views ?? 0}
                                                            </button>
                                                        </td>
                                                        <td className="text-center">
                                                            <button
                                                                className="btn btn-ghost btn-xs text-primary"
                                                                onClick={() => handleViewRecipients(poll.id, poll.title ?? '', false, false)}
                                                                title="Ver destinatarios"
                                                            >
                                                                <span className="iconify lucide--users size-4"></span>
                                                            </button>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="btn btn-ghost btn-xs text-warning"
                                                                onClick={() => handleViewResults(poll.id, poll.title)}
                                                                disabled={!poll.responded_persons || poll.responded_persons === 0}
                                                                title={!poll.responded_persons || poll.responded_persons === 0 ? "Sin respuestas aún" : "Ver resultados"}
                                                            >
                                                                <span className="iconify lucide--bar-chart-2 size-4"></span>
                                                                Ver resultados
                                                            </button>
                                                        </td>
                                                        <td>
                                                            <div className="flex gap-1">
                                                                <Link
                                                                    href={`/apps/polls/${poll.id}`}
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

                                    {polls.length > 0 && (
                                        <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm">Mostrar:</label>
                                                <select
                                                    className="select select-bordered select-sm"
                                                    value={itemsPerPage}
                                                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                                >
                                                    <option value={10}>10</option>
                                                    <option value={25}>25</option>
                                                    <option value={50}>50</option>
                                                    <option value={100}>100</option>
                                                </select>
                                                <span className="text-sm text-base-content/60">por página</span>
                                            </div>
                                            <div className="text-sm text-base-content/60">
                                                Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}
                                            </div>
                                            <div className="join">
                                                <button className="join-item btn btn-sm" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>
                                                    <span className="iconify lucide--chevrons-left size-4"></span>
                                                </button>
                                                <button className="join-item btn btn-sm" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
                                                    <span className="iconify lucide--chevron-left size-4"></span>
                                                </button>
                                                <button className="join-item btn btn-sm btn-disabled">Página {currentPage}</button>
                                                <button
                                                    className="join-item btn btn-sm"
                                                    disabled={polls.length < itemsPerPage}
                                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                                >
                                                    <span className="iconify lucide--chevron-right size-4"></span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                                )}
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

            <PublicationDetailModal
                publication={selectedPublication}
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                publicationType={publicationType}
            />

            <RecipientsModal
                announcementId={selectedAnnouncementId}
                announcementTitle={selectedAnnouncementTitle}
                isOpen={isRecipientsModalOpen}
                onClose={handleCloseRecipientsModal}
                publicationType={publicationType}
                requiresConfirmation={selectedRecipientsRequiresConfirmation}
                requiresSignature={selectedRecipientsRequiresSignature}
            />

            <LikesModal
                publicationId={selectedLikesPublicationId}
                publicationTitle={selectedLikesPublicationTitle}
                publicationType={publicationType}
                isOpen={isLikesModalOpen}
                onClose={handleCloseLikesModal}
            />

            <CommentsModal
                publicationId={selectedCommentsPublicationId}
                publicationTitle={selectedCommentsPublicationTitle}
                publicationType={publicationType}
                isOpen={isCommentsModalOpen}
                onClose={handleCloseCommentsModal}
            />

            <ViewsModal
                publicationId={selectedViewsPublicationId}
                publicationTitle={selectedViewsPublicationTitle}
                publicationType={publicationType}
                isOpen={isViewsModalOpen}
                onClose={handleCloseViewsModal}
            />

            <EventStatsModal
                eventId={selectedStatsEventId}
                eventTitle={selectedStatsEventTitle}
                statType={statsType}
                isOpen={isStatsModalOpen}
                onClose={handleCloseStatsModal}
            />

            <PollResultsModal
                pollId={selectedResultsPollId}
                pollTitle={selectedResultsPollTitle}
                isOpen={isResultsModalOpen}
                onClose={handleCloseResultsModal}
            />

            <EventOptionsModal
                eventId={selectedOptionsEventId}
                eventTitle={selectedOptionsEventTitle}
                isOpen={isOptionsModalOpen}
                onClose={handleCloseOptionsModal}
            />
        </>
    );
}

