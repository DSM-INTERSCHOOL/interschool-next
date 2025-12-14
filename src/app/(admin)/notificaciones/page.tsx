"use client";

import { useEffect, useState } from "react";

import { PageTitle } from "@/components/PageTitle";
import { useAuth } from "@/hooks/useAuth";
import { IAnnouncement, IAssignment } from "@/interfaces/IPublication";
import { getAnnouncements, getAssignments } from "@/services/publications.service";
import * as announcementService from "@/services/announcement.service";
import * as assignmentService from "@/services/assignment.service";
import { getOrgConfig } from "@/lib/orgConfig";
import { useNotifications } from "@/contexts/NotificationsContext";

import { PublicationDetail, PublicationListItem } from "./components";
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
        }, 3000);
    },[])

    return (
        <>
            <div style={{ width: "100%", height: "35vh" }}>
                <iframe src={completPath} title="Legacy" width="100%" height="100%" style={{ border: "none" }} />
            </div>
        </>
    );
};

export default function PublicationsPage() {
    const [activeTab, setActiveTab] = useState<"announcements" | "assignments">("announcements");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);
    const [assignments, setAssignments] = useState<IAssignment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { token, personId } = useAuth();
    const { decrementUnread } = useNotifications();

    // Cargar datos cuando cambia el tab, token o personId
    useEffect(() => {
        if (!token || !personId) return;

        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                if (activeTab === "announcements") {
                    const data = await getAnnouncements({
                        personId: personId.toString(),
                        token,
                    });
                    setAnnouncements(data);
                } else {
                    const data = await getAssignments({
                        personId: personId.toString(),
                        token,
                    });
                    setAssignments(data);
                }
            } catch (err) {
                console.error("Error loading publications:", err);
                setError("Error al cargar las publicaciones. Por favor, intenta de nuevo.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [activeTab, token, personId]);

    const currentList = activeTab === "announcements" ? announcements : assignments;
    const selectedPublication = currentList.find((p) => p.id === selectedId) || null;

    const handlePublicationClick = async (id: string) => {
        if (!token || !personId) return;

        // Seleccionar la publicación
        setSelectedId(id);

        // Verificar si la publicación no ha sido vista
        const publication = currentList.find((p) => p.id === id);
        const wasUnread = publication && !publication.user_viewed;

        // Actualizar user_viewed localmente
        const updateList = (list: (IAnnouncement | IAssignment)[]) =>
            list.map((p) =>
                p.id === id
                    ? {
                          ...p,
                          user_viewed: true,
                      }
                    : p,
            );

        if (activeTab === "announcements") {
            setAnnouncements(updateList(announcements) as IAnnouncement[]);
        } else {
            setAssignments(updateList(assignments) as IAssignment[]);
        }

        // Decrementar el contador si la publicación no había sido vista
        if (wasUnread) {
            decrementUnread();
        }

        // Registrar la vista
        try {
            const { schoolId } = getOrgConfig();

            if (activeTab === "announcements") {
                await announcementService.addView({
                    schoolId,
                    announcementId: id,
                    personId: personId.toString(),
                });
            } else {
                await assignmentService.addView({
                    schoolId,
                    assignmentId: id,
                    personId: personId.toString(),
                });
            }
        } catch (err) {
            console.error("Error registering view:", err);
            // No mostramos error al usuario, es una acción silenciosa
        }
    };

    const handleLike = async (id: string) => {
        if (!token || !personId) return;

        try {
            const publication = currentList.find((p) => p.id === id);
            if (!publication) return;

            const { schoolId } = getOrgConfig();

            // Llamar al servicio correspondiente
            if (activeTab === "announcements") {
                if (publication.user_liked) {
                    await announcementService.unlike({
                        schoolId,
                        announcementId: id,
                        personId: personId.toString(),
                    });
                } else {
                    await announcementService.like({
                        schoolId,
                        announcementId: id,
                        personId: personId.toString(),
                    });
                }
            } else {
                if (publication.user_liked) {
                    await assignmentService.unlike({
                        schoolId,
                        assignmentId: id,
                        personId: personId.toString(),
                    });
                } else {
                    await assignmentService.like({
                        schoolId,
                        assignmentId: id,
                        personId: personId.toString(),
                    });
                }
            }

            // Actualizar la lista localmente
            const updateList = (list: (IAnnouncement | IAssignment)[]) =>
                list.map((p) =>
                    p.id === id
                        ? {
                              ...p,
                              user_liked: !p.user_liked,
                              likes: p.user_liked ? p.likes - 1 : p.likes + 1,
                          }
                        : p,
                );

            if (activeTab === "announcements") {
                setAnnouncements(updateList(announcements) as IAnnouncement[]);
            } else {
                setAssignments(updateList(assignments) as IAssignment[]);
            }
        } catch (err) {
            console.error("Error toggling like:", err);
        }
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

            <div className=" bg-base-100 shadow-lg mt-6 space-y-6">
                <div className="">
                    <div className="bg-base-200 mt-6 flex h-screen flex-col">
                        {/* Header con tabs integrados */}
                        <header className="bg-base-100 border-base-300 border-b">
                            {/* Tabs como navegación principal */}
                            <div className="border-base-300 flex border-t">
                                <button
                                    onClick={() => {
                                        setActiveTab("announcements");
                                        setSelectedId(null);
                                    }}
                                    className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
                                        activeTab === "announcements"
                                            ? "border-primary text-primary"
                                            : "text-base-content/60 hover:text-base-content border-transparent"
                                    }`}>
                                    <span className="iconify lucide--megaphone size-4" />
                                    Avisos
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab("assignments");
                                        setSelectedId(null);
                                    }}
                                    className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
                                        activeTab === "assignments"
                                            ? "border-primary text-primary"
                                            : "text-base-content/60 hover:text-base-content border-transparent"
                                    }`}>
                                    <span className="iconify lucide--clipboard-list size-4" />
                                    Tareas
                                </button>
                            </div>
                        </header>

                        {/* Layout de dos columnas */}
                        <div className="flex flex-1 overflow-hidden">
                            {/* Lista lateral */}
                            <div className="bg-base-100 border-base-300 w-80 flex-shrink-0 overflow-y-auto border-r">
                                <div className="p-3">
                                    <div className="mb-3 px-3">
                                        <p className="text-base-content/60 text-xs font-medium">
                                            {loading ? (
                                                <span className="loading loading-spinner loading-xs mr-2"></span>
                                            ) : (
                                                `${currentList.length} ${activeTab === "announcements" ? "avisos" : "tareas"}`
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
                                            {currentList.length === 0 ? (
                                                <div className="py-8 text-center">
                                                    <span className="iconify lucide--inbox text-base-content/20 mx-auto size-12" />
                                                    <p className="text-base-content/60 mt-2 text-sm">
                                                        No hay {activeTab === "announcements" ? "avisos" : "tareas"}{" "}
                                                        disponibles
                                                    </p>
                                                </div>
                                            ) : (
                                                currentList.map((publication) => (
                                                    <PublicationListItem
                                                        key={publication.id}
                                                        publication={publication}
                                                        isActive={selectedId === publication.id}
                                                        onClick={() => handlePublicationClick(publication.id)}
                                                    />
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Panel de detalle */}
                            <div className="bg-base-100 flex-1">
                                <PublicationDetail
                                    publication={selectedPublication}
                                    type={activeTab === "announcements" ? "announcement" : "assignment"}
                                    onLike={handleLike}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <LegacyPageHidden/>
        </>
    );
}
