"use client";

import { useState } from "react";
import { 
    HeartIcon, 
    ChatBubbleLeftIcon, 
    PencilIcon, 
    TrashIcon, 
    EllipsisVerticalIcon,
    UserIcon
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { ICommentRead } from "@/interfaces/IComment";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

export interface CommentItemProps {
    comment: ICommentRead;
    onLike?: (commentId: string) => void;
    onReply?: (commentId: string) => void;
    onEdit?: (commentId: string, content: string) => void;
    onDelete?: (commentId: string) => void;
    currentUserId?: string;
    showReplies?: boolean;
    className?: string;
}

export const CommentItem = ({ 
    comment, 
    onLike, 
    onReply, 
    onEdit, 
    onDelete,
    currentUserId,
    showReplies = true,
    className = ""
}: CommentItemProps) => {
    const [showMenu, setShowMenu] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return "Ahora";
        if (diffInHours < 24) return `Hace ${diffInHours}h`;
        if (diffInHours < 48) return "Ayer";
        return date.toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'short',
            year: 'numeric'
        });
    };

    const handleLike = () => {
        if (onLike) {
            onLike(comment.id);
        }
    };

    const handleReply = () => {
        if (onReply) {
            onReply(comment.id);
            setShowMenu(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setShowMenu(false);
    };

    const handleSaveEdit = () => {
        if (onEdit && editContent.trim() !== comment.content) {
            onEdit(comment.id, editContent.trim());
        }
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditContent(comment.content);
        setIsEditing(false);
    };

    const handleDelete = () => {
        setShowDeleteModal(true);
        setShowMenu(false);
    };

    const confirmDelete = async () => {
        if (!onDelete) return;
        
        setDeleteLoading(true);
        try {
            await onDelete(comment.id);
            setShowDeleteModal(false);
        } catch (error) {
            console.error("Error deleting comment:", error);
        } finally {
            setDeleteLoading(false);
        }
    };

    const isAuthor = currentUserId === comment.created_by;

    return (
        <>
            <div className={`bg-base-100 border border-base-300 rounded-lg p-4 ${className}`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="avatar">
                            <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center">
                                {comment.author.avatar ? (
                                    <img 
                                        src={comment.author.avatar} 
                                        alt={`${comment.author.first_name} ${comment.author.last_name}`}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <UserIcon className="w-4 h-4 text-base-content/60" />
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-base-content">
                                {comment.author.first_name} {comment.author.last_name}
                            </p>
                            <p className="text-xs text-base-content/60">
                                {formatDate(comment.created_at)}
                            </p>
                        </div>
                    </div>

                    {/* Menu de opciones */}
                    <div className="dropdown dropdown-end">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="btn btn-ghost btn-xs btn-circle"
                        >
                            <EllipsisVerticalIcon className="w-4 h-4" />
                        </button>
                        <ul className="dropdown-content menu bg-base-100 rounded-box shadow-lg w-40 z-50">
                            {isAuthor && (
                                <>
                                    <li>
                                        <button
                                            onClick={handleEdit}
                                            className="flex items-center gap-2 text-base-content"
                                        >
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
                                </>
                            )}
                                                         {/* Opción de responder deshabilitada */}
                             {/* <li>
                                 <button
                                     onClick={handleReply}
                                     className="flex items-center gap-2 text-base-content"
                                 >
                                     <ChatBubbleLeftIcon className="w-4 h-4" />
                                     Responder
                                 </button>
                             </li> */}
                        </ul>
                    </div>
                </div>

                {/* Contenido */}
                <div className="mb-3">
                    {isEditing ? (
                        <div className="space-y-2">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="textarea textarea-bordered w-full min-h-20"
                                placeholder="Editar comentario..."
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveEdit}
                                    className="btn btn-primary btn-sm"
                                    disabled={!editContent.trim() || editContent.trim() === comment.content}
                                >
                                    Guardar
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    className="btn btn-ghost btn-sm"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-base-content leading-relaxed">
                            {comment.content}
                        </p>
                    )}
                </div>

                                 {/* Acciones */}
                 <div className="flex items-center gap-4 text-xs">
                     <button
                         onClick={handleLike}
                         className={`flex items-center gap-1 hover:text-primary transition-colors ${
                             comment.user_liked ? 'text-primary' : 'text-base-content/60'
                         }`}
                     >
                         {comment.user_liked ? (
                             <HeartIconSolid className="w-4 h-4" />
                         ) : (
                             <HeartIcon className="w-4 h-4" />
                         )}
                         <span>{comment.likes}</span>
                     </button>
                 </div>

                {/* Respuestas - Deshabilitadas */}
                {/* {showReplies && comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-base-300 space-y-3">
                        {comment.replies.map((reply) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                onLike={onLike}
                                onReply={onReply}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                currentUserId={currentUserId}
                                showReplies={false}
                            />
                        ))}
                    </div>
                )} */}
            </div>

            {/* Modal de confirmación de eliminación */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Eliminar Comentario"
                message="¿Estás seguro de que deseas eliminar este comentario?"
                itemName="comentario"
                loading={deleteLoading}
            />
        </>
    );
};
