"use client";

import { useState, useEffect } from "react";
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { IAnnouncementRead } from "@/interfaces/IAnnouncement";
import { getAll } from "@/services/announcement.service";
import AnnouncementCard from "./AnnouncementCard";
import CreateAnnouncementModal from "./CreateAnnouncementModal";

const AnnouncementsTab = () => {
    const [announcements, setAnnouncements] = useState<IAnnouncementRead[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    // Mock data para desarrollo
    const mockAnnouncements: IAnnouncementRead[] = [
        {
            id: "1",
            school_id: 1,
            title: "Reunión de Padres - Marzo 2024",
            content: "Se convoca a todos los padres de familia a la reunión mensual que se llevará a cabo el próximo viernes 15 de marzo a las 6:00 PM en el auditorio principal.",
            start_date: "2024-03-15T18:00:00Z",
            end_date: "2024-03-15T20:00:00Z",
            accept_comments: true,
            views: 45,
            likes: 12,
            comments: 8,
            authorized: true,
            authorized_by: "admin-123",
            authorized_on: "2024-03-10T10:00:00Z",
            academic_year: "2024-2025",
            academic_stages: ["primaria", "secundaria"],
            academic_programs: ["general"],
            academic_modalities: ["presencial"],
            academic_program_years: ["1", "2", "3"],
            academic_groups: ["1A", "1B", "2A"],
            status: "active",
            created_at: "2024-03-10T09:00:00Z",
            modified_at: "2024-03-10T10:00:00Z",
            created_by: "teacher-123",
            modified_by: "admin-123",
            publisher: {
                id: "teacher-123",
                first_name: "María",
                last_name: "González",
                email: "maria.gonzalez@escuela.edu",
                phone: "+1234567890"
            },
            user_liked: false
        },
        {
            id: "2",
            school_id: 1,
            title: "Suspensión de Clases - Día del Maestro",
            content: "Informamos que el próximo lunes 6 de mayo no habrá clases debido a la celebración del Día del Maestro. Las clases se reanudarán el martes 7 de mayo.",
            start_date: "2024-05-06T00:00:00Z",
            end_date: "2024-05-06T23:59:59Z",
            accept_comments: false,
            views: 89,
            likes: 23,
            comments: 0,
            authorized: true,
            authorized_by: "admin-123",
            authorized_on: "2024-03-08T14:30:00Z",
            academic_year: "2024-2025",
            academic_stages: ["primaria", "secundaria"],
            academic_programs: ["general"],
            academic_modalities: ["presencial"],
            academic_program_years: ["1", "2", "3", "4", "5", "6"],
            academic_groups: ["1A", "1B", "2A", "2B", "3A", "3B"],
            status: "active",
            created_at: "2024-03-08T14:00:00Z",
            modified_at: "2024-03-08T14:30:00Z",
            created_by: "admin-123",
            modified_by: "admin-123",
            publisher: {
                id: "admin-123",
                first_name: "Carlos",
                last_name: "Mendoza",
                email: "carlos.mendoza@escuela.edu",
                phone: "+1234567891"
            },
            user_liked: true
        },
        {
            id: "3",
            school_id: 1,
            title: "Inscripciones Abiertas - Actividades Extraescolares",
            content: "Ya están abiertas las inscripciones para las actividades extraescolares del segundo semestre. Incluye: deportes, música, arte, tecnología y más.",
            start_date: "2024-03-01T00:00:00Z",
            end_date: "2024-03-31T23:59:59Z",
            accept_comments: true,
            views: 156,
            likes: 34,
            comments: 15,
            authorized: false,
            authorized_by: null,
            authorized_on: null,
            academic_year: "2024-2025",
            academic_stages: ["primaria", "secundaria"],
            academic_programs: ["general"],
            academic_modalities: ["presencial"],
            academic_program_years: ["1", "2", "3", "4", "5", "6"],
            academic_groups: ["1A", "1B", "2A", "2B", "3A", "3B"],
            status: "pending",
            created_at: "2024-03-01T08:00:00Z",
            modified_at: "2024-03-01T08:00:00Z",
            created_by: "coordinator-123",
            modified_by: "coordinator-123",
            publisher: {
                id: "coordinator-123",
                first_name: "Ana",
                last_name: "Rodríguez",
                email: "ana.rodriguez@escuela.edu",
                phone: "+1234567892"
            },
            user_liked: false
        }
    ];

    useEffect(() => {
        // Simular carga de datos
        const loadAnnouncements = async () => {
            try {
                setLoading(true);
                // En producción, usar el servicio real:
                // const data = await getAll({ schoolId: 1, page: 1, per_page: 20 });
                // setAnnouncements(data);
                
                // Por ahora usar datos mock
                setTimeout(() => {
                    setAnnouncements(mockAnnouncements);
                    setLoading(false);
                }, 1000);
            } catch (error) {
                console.error("Error loading announcements:", error);
                setLoading(false);
            }
        };

        loadAnnouncements();
    }, []);

    const filteredAnnouncements = announcements.filter(announcement => {
        const matchesSearch = announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            announcement.content?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === "all" || 
                            (filterStatus === "active" && announcement.status === "active") ||
                            (filterStatus === "pending" && announcement.status === "pending") ||
                            (filterStatus === "authorized" && announcement.authorized);

        return matchesSearch && matchesStatus;
    });

    const handleCreateSuccess = (newAnnouncement: IAnnouncementRead) => {
        setAnnouncements([newAnnouncement, ...announcements]);
        setShowCreateModal(false);
    };

    return (
        <div className="space-y-6">
            {/* Header con acciones */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex-1">
                    <h2 className="text-xl font-semibold text-base-content">
                        Avisos y Comunicaciones
                    </h2>
                    <p className="text-sm text-base-content/70">
                        {filteredAnnouncements.length} avisos encontrados
                    </p>
                </div>
                
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary gap-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    Crear Aviso
                </button>
            </div>

            {/* Filtros y búsqueda */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                    <input
                        type="text"
                        placeholder="Buscar avisos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input input-bordered w-full pl-10"
                    />
                </div>
                
                <div className="flex gap-2">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="select select-bordered"
                    >
                        <option value="all">Todos</option>
                        <option value="active">Activos</option>
                        <option value="pending">Pendientes</option>
                        <option value="authorized">Autorizados</option>
                    </select>
                </div>
            </div>

            {/* Lista de avisos */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : filteredAnnouncements.length === 0 ? (
                <div className="text-center py-12">
                    <MegaphoneIcon className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
                    <h3 className="text-lg font-medium text-base-content mb-2">
                        No se encontraron avisos
                    </h3>
                    <p className="text-base-content/70 mb-4">
                        {searchTerm || filterStatus !== "all" 
                            ? "Intenta ajustar los filtros de búsqueda"
                            : "Crea el primer aviso para comenzar"
                        }
                    </p>
                    {!searchTerm && filterStatus === "all" && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn btn-primary"
                        >
                            Crear Primer Aviso
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredAnnouncements.map((announcement) => (
                        <AnnouncementCard
                            key={announcement.id}
                            announcement={announcement}
                            onUpdate={(updatedAnnouncement) => {
                                setAnnouncements(announcements.map(a => 
                                    a.id === updatedAnnouncement.id ? updatedAnnouncement : a
                                ));
                            }}
                            onDelete={(id) => {
                                setAnnouncements(announcements.filter(a => a.id !== id));
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Modal de creación */}
            {showCreateModal && (
                <CreateAnnouncementModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}
        </div>
    );
};

export default AnnouncementsTab;

