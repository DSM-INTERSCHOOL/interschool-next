"use client";

import { useEffect, useState } from "react";

import { PageTitle } from "@/components/PageTitle";
import { useAuth } from "@/hooks/useAuth";
import { IAnnouncement, IAssignment, IEvent } from "@/interfaces/IPublication";
import { PollRead } from "@/interfaces/IPoll";
import { getAnnouncements, getAssignments, getEvents } from "@/services/publications.service";
import { getPolls, addPollView } from "@/services/poll.service";
import * as announcementService from "@/services/announcement.service";
import * as assignmentService from "@/services/assignment.service";
import * as eventService from "@/services/event.service";
import { getOrgConfig } from "@/lib/orgConfig";
import { useNotifications } from "@/contexts/NotificationsContext";

import { PublicationDetail, PublicationListItem, PollListItem, PollDetail } from "./components";
import { useAuthStore } from "@/store/useAuthStore";

const LegacyPageHidden = () => {
    const legacyUrl = useAuthStore((state) => state.legacyUrl) as string;
    const setLegacyUrl = useAuthStore((state) => state.setLegacyUrl) as any;

    const { portalName } = getOrgConfig();
    const completPath = legacyUrl?.startsWith('https://')? legacyUrl : `${portalName}${legacyUrl}`;

    console.log({completPath, legacyUrl})

    useEffect(()=> {
        setTimeout(() => {
            setLegacyUrl('/ISMeta/rol/showFindByQueryRol')
        }, 500);
    },[])

    return (
        <>
            <div style={{ width: "100%", height: "0vh" }}>
                <iframe src={completPath} title="Legacy" width="100%" height="100%" style={{ border: "none" }} />
            </div>
        </>
    );
};

type ActiveTab = "announcements" | "assignments" | "events" | "polls";

export default function PublicationsPage() {
    const [activeTab, setActiveTab] = useState<ActiveTab>("announcements");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);
    const [assignments, setAssignments] = useState<IAssignment[]>([]);
    const [events, setEvents] = useState<IEvent[]>([]);
    const [polls, setPolls] = useState<PollRead[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { token, personId } = useAuth();
    const { decrementUnread } = useNotifications();

    useEffect(() => {
        if (!token || !personId) return;

        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const { schoolId } = getOrgConfig();
                if (activeTab === "announcements") {
                    const data = await getAnnouncements({ personId: personId.toString(), token });
                    setAnnouncements(data);
                } else if (activeTab === "assignments") {
                    const data = await getAssignments({ personId: personId.toString(), token });
                    setAssignments(data);
                } else if (activeTab === "events") {
                    const data = await getEvents({ personId: personId.toString(), token });
                    setEvents(data);
                } else {
                    const data = await getPolls({ schoolId, personId: personId.toString() });
                    setPolls(data);
                }
            } catch (err) {
                console.error("Error loading publications:", err);
                setError("Error al cargar. Por favor, intenta de nuevo.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [activeTab, token, personId]);

    const isPollTab = activeTab === "polls";

    const currentList: (IAnnouncement | IAssignment | IEvent)[] =
        activeTab === "announcements" ? announcements
        : activeTab === "assignments" ? assignments
        : activeTab === "events" ? events
        : [];

    const selectedPublication = !isPollTab
        ? (currentList.find((p) => p.id === selectedId) || null)
        : null;

    const selectedPoll = isPollTab
        ? (polls.find((p) => p.id === selectedId) || null)
        : null;

    const listCount = isPollTab ? polls.length : currentList.length;

    const handlePublicationClick = async (id: string) => {
        if (!token || !personId) return;

        setSelectedId(id);

        const publication = currentList.find((p) => p.id === id);
        const wasUnread = publication && !publication.user_viewed;

        const markViewed = <T extends { id: string; user_viewed: boolean }>(list: T[]): T[] =>
            list.map((p) => p.id === id ? { ...p, user_viewed: true } : p);

        if (activeTab === "announcements") {
            setAnnouncements(markViewed(announcements));
        } else if (activeTab === "assignments") {
            setAssignments(markViewed(assignments));
        } else if (activeTab === "events") {
            setEvents(markViewed(events));
        }

        if (wasUnread) decrementUnread();

        try {
            const { schoolId } = getOrgConfig();
            if (activeTab === "announcements") {
                await announcementService.addView({ schoolId: schoolId!, announcementId: id, personId: personId.toString() });
            } else if (activeTab === "assignments") {
                await assignmentService.addView({ schoolId: schoolId!, assignmentId: id, personId: personId.toString() });
            } else if (activeTab === "events") {
                await eventService.addView({ schoolId: schoolId!, eventId: id, personId: personId.toString() });
            }
        } catch (err) {
            console.error("Error registering view:", err);
        }
    };

    const handleLike = async (id: string) => {
        if (!token || !personId) return;

        try {
            const publication = currentList.find((p) => p.id === id);
            if (!publication) return;

            const { schoolId } = getOrgConfig();

            if (activeTab === "announcements") {
                publication.user_liked
                    ? await announcementService.unlike({ schoolId: schoolId!, announcementId: id, personId: personId.toString() })
                    : await announcementService.like({ schoolId: schoolId!, announcementId: id, personId: personId.toString() });
            } else if (activeTab === "assignments") {
                publication.user_liked
                    ? await assignmentService.unlike({ schoolId: schoolId!, assignmentId: id, personId: personId.toString() })
                    : await assignmentService.like({ schoolId: schoolId!, assignmentId: id, personId: personId.toString() });
            } else {
                publication.user_liked
                    ? await eventService.unlike({ schoolId: schoolId!, eventId: id, personId: personId.toString() })
                    : await eventService.like({ schoolId: schoolId!, eventId: id, personId: personId.toString() });
            }

            const toggleLike = <T extends { id: string; user_liked: boolean | null; likes: number }>(list: T[]): T[] =>
                list.map((p) => p.id === id
                    ? { ...p, user_liked: !p.user_liked, likes: p.user_liked ? p.likes - 1 : p.likes + 1 }
                    : p
                );

            if (activeTab === "announcements") {
                setAnnouncements(toggleLike(announcements));
            } else if (activeTab === "assignments") {
                setAssignments(toggleLike(assignments));
            } else {
                setEvents(toggleLike(events));
            }
        } catch (err) {
            console.error("Error toggling like:", err);
        }
    };

    const handlePollClick = async (id: string) => {
        setSelectedId(id);
        if (!personId) return;
        try {
            const { schoolId } = getOrgConfig();
            await addPollView({ schoolId, pollId: id, personId: personId.toString() });
        } catch (err) {
            console.error("Error registering poll view:", err);
        }
    };

    const handleConfirm = (id: string) => {
        setEvents((prev) =>
            prev.map((e) => e.id === id ? { ...e, user_confirmed: true } : e)
        );
    };

    const tabLabel =
        activeTab === "announcements" ? "avisos"
        : activeTab === "assignments" ? "tareas"
        : activeTab === "events" ? "eventos"
        : "encuestas";

    const switchTab = (tab: ActiveTab) => {
        setActiveTab(tab);
        setSelectedId(null);
    };

    if (!token || !personId) {
        return (
            <div className="bg-base-200 flex h-screen items-center justify-center">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body text-center">
                        <span className="iconify lucide--lock text-base-content/40 mx-auto size-16" />
                        <h2 className="card-title justify-center">Autenticación requerida</h2>
                        <p>Debes iniciar sesión para ver las notificaciones.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageTitle title="Notificaciones" />

            <div className="bg-base-100 shadow-lg mt-6 space-y-6">
                <div className="">
                    <div className="bg-base-200 mt-6 flex h-screen flex-col">
                        {/* Tabs */}
                        <header className="bg-base-100 border-base-300 border-b">
                            <div className="border-base-300 flex border-t">
                                <button
                                    onClick={() => switchTab("announcements")}
                                    className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
                                        activeTab === "announcements"
                                            ? "border-primary text-primary"
                                            : "text-base-content/60 hover:text-base-content border-transparent"
                                    }`}>
                                    <span className="iconify lucide--megaphone size-4" />
                                    Avisos
                                </button>
                                <button
                                    onClick={() => switchTab("assignments")}
                                    className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
                                        activeTab === "assignments"
                                            ? "border-primary text-primary"
                                            : "text-base-content/60 hover:text-base-content border-transparent"
                                    }`}>
                                    <span className="iconify lucide--clipboard-list size-4" />
                                    Tareas
                                </button>
                                <button
                                    onClick={() => switchTab("events")}
                                    className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
                                        activeTab === "events"
                                            ? "border-accent text-accent"
                                            : "text-base-content/60 hover:text-base-content border-transparent"
                                    }`}>
                                    <span className="iconify lucide--calendar-days size-4" />
                                    Eventos
                                </button>
                                <button
                                    onClick={() => switchTab("polls")}
                                    className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
                                        activeTab === "polls"
                                            ? "border-warning text-warning"
                                            : "text-base-content/60 hover:text-base-content border-transparent"
                                    }`}>
                                    <span className="iconify lucide--bar-chart-2 size-4" />
                                    Encuestas
                                </button>
                            </div>
                        </header>

                        {/* Two-column layout */}
                        <div className="flex flex-1 overflow-hidden">
                            {/* Left list panel */}
                            <div className="bg-base-100 border-base-300 w-80 flex-shrink-0 overflow-y-auto border-r">
                                <div className="p-3">
                                    <div className="mb-3 px-3">
                                        <p className="text-base-content/60 text-xs font-medium">
                                            {loading ? (
                                                <span className="loading loading-spinner loading-xs mr-2"></span>
                                            ) : (
                                                `${listCount} ${tabLabel}`
                                            )}
                                        </p>
                                    </div>

                                    {error && (
                                        <div className="alert alert-error mb-3">
                                            <span className="iconify lucide--alert-circle size-5" />
                                            <span className="text-sm">{error}</span>
                                        </div>
                                    )}

                                    {loading ? (
                                        <div className="flex justify-center py-8">
                                            <span className="loading loading-spinner loading-lg"></span>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            {isPollTab ? (
                                                polls.length === 0 ? (
                                                    <div className="py-8 text-center">
                                                        <span className="iconify lucide--bar-chart-2 text-base-content/20 mx-auto size-12" />
                                                        <p className="text-base-content/60 mt-2 text-sm">
                                                            No hay encuestas disponibles
                                                        </p>
                                                    </div>
                                                ) : (
                                                    polls.map((poll) => (
                                                        <PollListItem
                                                            key={poll.id}
                                                            poll={poll}
                                                            isActive={selectedId === poll.id}
                                                            onClick={() => handlePollClick(poll.id)}
                                                        />
                                                    ))
                                                )
                                            ) : (
                                                currentList.length === 0 ? (
                                                    <div className="py-8 text-center">
                                                        <span className="iconify lucide--inbox text-base-content/20 mx-auto size-12" />
                                                        <p className="text-base-content/60 mt-2 text-sm">
                                                            No hay {tabLabel} disponibles
                                                        </p>
                                                    </div>
                                                ) : (
                                                    currentList.map((publication) => (
                                                        <PublicationListItem
                                                            key={publication.id}
                                                            publication={publication}
                                                            isActive={selectedId === publication.id}
                                                            onClick={() => handlePublicationClick(publication.id)}
                                                            type={activeTab === "events" ? "event" : activeTab === "assignments" ? "assignment" : "announcement"}
                                                        />
                                                    ))
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right detail panel */}
                            <div className="bg-base-100 flex-1 overflow-hidden">
                                {isPollTab ? (
                                    <PollDetail
                                        key={selectedId}
                                        poll={selectedPoll}
                                        personId={personId.toString()}
                                    />
                                ) : (
                                    <PublicationDetail
                                        key={selectedId}
                                        publication={selectedPublication}
                                        type={activeTab === "announcements" ? "announcement" : activeTab === "assignments" ? "assignment" : "event"}
                                        onLike={handleLike}
                                        onConfirm={handleConfirm}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <LegacyPageHidden/>
        </>
    );
}
