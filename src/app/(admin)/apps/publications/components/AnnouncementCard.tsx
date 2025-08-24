"use client";

import { useState } from "react";
import { 
    HeartIcon, 
    EyeIcon, 
    ChatBubbleLeftIcon,
    CalendarIcon,
    UserIcon,
    CheckCircleIcon,
    ClockIcon,
    PencilIcon,
    TrashIcon,
    EllipsisVerticalIcon
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { IAnnouncementRead } from "@/interfaces/IAnnouncement";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { CommentList } from "@/components/CommentList";

interface AnnouncementCardProps {
    announcement: IAnnouncementRead;
    onUpdate: (announcement: IAnnouncementRead) => void;
    onDelete: (id: string) => void;
}

const AnnouncementCard = ({ announcement, onUpdate, onDelete }: AnnouncementCardProps) => {
    const [showMenu, setShowMenu] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [liked, setLiked] = useState(announcement.user_liked || false);
    const [likesCount, setLikesCount] = useState(announcement.likes || 0);
    const [showComments, setShowComments] = useState(false);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "No especificada";
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = () => {
        if (announcement.authorized) {
            return (
                <div className="badge badge-success gap-1">
                    <CheckCircleIcon className="w-3 h-3" />
                    Autorizado
                </div>
            );
        }
        
        if (announcement.status === "pending") {
            return (
                <div className="badge badge-warning gap-1">
                    <ClockIcon className="w-3 h-3" />
                    Pendiente
                </div>
            );
        }
        
        return (
            <div className="badge badge-info gap-1">
                <ClockIcon className="w-3 h-3" />
                Activo
            </div>
        );
    };

    const handleLike = () => {
        setLiked(!liked);
        setLikesCount(liked ? likesCount - 1 : likesCount + 1);
        // Aquí se llamaría al servicio para actualizar el like
    };

    const handleDelete = () => {
        setShowDeleteModal(true);
        setShowMenu(false);
    };

    const confirmDelete = async () => {
        setDeleteLoading(true);
        try {
            await onDelete(announcement.id);
            setShowDeleteModal(false);
        } catch (error) {
            console.error("Error deleting announcement:", error);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <>
            <div className="bg-base-100 border border-base-300 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-10">
                            <span className="text-sm font-medium">
                                {announcement.publisher?.first_name?.charAt(0) || "U"}
                            </span>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-base-content">
                            {announcement.publisher?.first_name} {announcement.publisher?.last_name}
                        </h3>
                        <p className="text-sm text-base-content/70">
                            {formatDate(announcement.created_at)}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {getStatusBadge()}
                    
                    <div className="dropdown dropdown-end">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="btn btn-ghost btn-sm btn-circle"
                        >
                            <EllipsisVerticalIcon className="w-5 h-5" />
                        </button>
                        <ul className={`dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 ${showMenu ? 'block' : 'hidden'}`}>
                            <li>
                                <button className="flex items-center gap-2">
                                    <PencilIcon className="w-4 h-4" />
                                    Editar
                                </button>
                            </li>
                            <li>
                                <button 
                                    onClick={handleDelete}
                                    className="flex items-center gap-2 text-error"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                    Eliminar
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Contenido */}
            <div className="mb-4">
                <h4 className="text-lg font-semibold text-base-content mb-2">
                    {announcement.title}
                </h4>
                <p className="text-base-content/80 leading-relaxed">
                    {announcement.content}
                </p>
            </div>

            {/* Fechas */}
            <div className="flex flex-wrap gap-4 mb-4 text-sm text-base-content/70">
                <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>Inicio: {formatDate(announcement.start_date)}</span>
                </div>
                <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>Fin: {formatDate(announcement.end_date)}</span>
                </div>
            </div>

            {/* Configuración académica */}
            {(announcement.academic_stages?.length || announcement.academic_groups?.length) && (
                <div className="mb-4 p-3 bg-base-200 rounded-lg">
                    <h5 className="text-sm font-medium text-base-content mb-2">Destinatarios:</h5>
                    <div className="flex flex-wrap gap-2">
                        {announcement.academic_stages?.map((stage) => (
                            <span key={stage} className="badge badge-outline badge-sm">
                                {stage}
                            </span>
                        ))}
                        {announcement.academic_groups?.map((group) => (
                            <span key={group} className="badge badge-outline badge-sm">
                                {group}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Estadísticas */}
            <div className="flex items-center justify-between pt-4 border-t border-base-300">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-1 btn btn-ghost btn-sm ${
                            liked ? 'text-error' : 'text-base-content/70'
                        }`}
                    >
                        {liked ? (
                            <HeartIconSolid className="w-4 h-4" />
                        ) : (
                            <HeartIcon className="w-4 h-4" />
                        )}
                        <span>{likesCount}</span>
                    </button>
                    
                    <div className="flex items-center gap-1 text-base-content/70">
                        <EyeIcon className="w-4 h-4" />
                        <span>{announcement.views || 0}</span>
                    </div>
                    
                    {announcement.accept_comments && (
                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="flex items-center gap-1 text-base-content/70 hover:text-primary transition-colors"
                        >
                            <ChatBubbleLeftIcon className="w-4 h-4" />
                            <span>{announcement.comments || 0}</span>
                        </button>
                    )}
                </div>

                <div className="text-xs text-base-content/50">
                    ID: {announcement.id}
                </div>
            </div>

            {/* Sección de comentarios */}
            {showComments && announcement.accept_comments && (
                <div className="mt-6 pt-6 border-t border-base-300">
                    <CommentList
                        announcementId={announcement.id}
                        schoolId={announcement.school_id}
                        currentUserId="current-user-id" // Esto vendría del contexto de autenticación
                        allowComments={announcement.accept_comments}
                    />
                </div>
            )}
            </div>

            {/* Modal de confirmación de eliminación */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Eliminar Aviso"
                message="¿Estás seguro de que deseas eliminar este aviso?"
                itemName={announcement.title}
                loading={deleteLoading}
            />
        </>
    );
};

export default AnnouncementCard;
