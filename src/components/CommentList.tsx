"use client";

import { useState, useEffect, useRef } from "react";
import { ICommentRead, ICommentCreate } from "@/interfaces/IComment";
import { CommentItem } from "./CommentItem";
import { CommentInput } from "./CommentInput";
import { create, getByAnnouncement, like, unlike, update, remove } from "@/services/comment.service";

export interface CommentListProps {
    announcementId: string;
    schoolId: number;
    currentUserId?: string;
    allowComments?: boolean;
    className?: string;
}

export const CommentList = ({ 
    announcementId, 
    schoolId, 
    currentUserId,
    allowComments = true,
    className = ""
}: CommentListProps) => {
    const [comments, setComments] = useState<ICommentRead[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [editingComment, setEditingComment] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    
    const commentsEndRef = useRef<HTMLDivElement>(null);

    // Comentarios de placeholder para mocking
    const mockComments: ICommentRead[] = [
        {
            id: "comment-1",
            content: "¡Excelente aviso! Me parece muy importante esta información para todos los padres.",
            announcement_id: announcementId,
            parent_id: null,
            created_at: "2024-01-15T10:30:00Z",
            modified_at: "2024-01-15T10:30:00Z",
            created_by: "user-1",
            modified_by: "user-1",
            author: {
                id: "user-1",
                first_name: "María",
                last_name: "García",
                email: "maria.garcia@escuela.edu",
                avatar: "/images/avatars/1.png"
            },
            likes: 8,
            user_liked: true,
            replies: []
        },
        {
            id: "comment-2",
            content: "¿Podrían proporcionar más detalles sobre los horarios de la reunión?",
            announcement_id: announcementId,
            parent_id: null,
            created_at: "2024-01-15T09:45:00Z",
            modified_at: "2024-01-15T09:45:00Z",
            created_by: "user-3",
            modified_by: "user-3",
            author: {
                id: "user-3",
                first_name: "Ana",
                last_name: "López",
                email: "ana.lopez@escuela.edu",
                avatar: "/images/avatars/3.png"
            },
            likes: 5,
            user_liked: false,
            replies: []
        },
        {
            id: "comment-3",
            content: "Gracias por mantenernos informados. Es muy útil tener esta comunicación directa con la escuela.",
            announcement_id: announcementId,
            parent_id: null,
            created_at: "2024-01-15T08:20:00Z",
            modified_at: "2024-01-15T08:20:00Z",
            created_by: "user-4",
            modified_by: "user-4",
            author: {
                id: "user-4",
                first_name: "Roberto",
                last_name: "Martínez",
                email: "roberto.martinez@escuela.edu"
            },
            likes: 12,
            user_liked: true,
            replies: []
        }
    ];

    // Cargar comentarios
    const loadComments = async (pageNum = 1, append = false) => {
        try {
            setLoading(true);
            
            // Simular delay de red
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Para mocking, usar datos de placeholder
            if (pageNum === 1) {
                setComments(mockComments);
                setHasMore(false); // Solo una página para el ejemplo
            } else {
                setComments(prev => [...prev, ...mockComments]);
                setHasMore(false);
            }
            
            setPage(pageNum);
            
            // En producción, usar esto:
            // const response = await getByAnnouncement(schoolId, announcementId, pageNum, 10);
            // if (append) {
            //     setComments(prev => [...prev, ...response.data]);
            // } else {
            //     setComments(response.data);
            // }
            // setHasMore(pageNum < response.total_pages);
            
        } catch (error) {
            console.error("Error loading comments:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadComments();
    }, [announcementId, schoolId]);

    // Enviar comentario
    const handleSendComment = async (content: string) => {
        if (!content.trim()) return;

        try {
            setSending(true);
            
            // Simular delay de red
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Crear comentario mock
            const mockNewComment: ICommentRead = {
                id: `comment-${Date.now()}`,
                content: content.trim(),
                announcement_id: announcementId,
                parent_id: null, // Siempre null para comentarios al aviso
                created_at: new Date().toISOString(),
                modified_at: new Date().toISOString(),
                created_by: currentUserId || "current-user",
                modified_by: currentUserId || "current-user",
                author: {
                    id: currentUserId || "current-user",
                    first_name: "Usuario",
                    last_name: "Actual",
                    email: "usuario@escuela.edu",
                    avatar: "/images/avatars/1.png"
                },
                likes: 0,
                user_liked: false,
                replies: []
            };
            
            // Agregar el nuevo comentario al inicio de la lista
            setComments(prev => [mockNewComment, ...prev]);
            
            // En producción, usar esto:
            // const newComment: ICommentCreate = {
            //     content: content.trim(),
            //     announcement_id: announcementId,
            //     parent_id: null
            // };
            // const createdComment = await create({ schoolId, dto: newComment });
            
        } catch (error) {
            console.error("Error sending comment:", error);
        } finally {
            setSending(false);
        }
    };

    // Like/Unlike comentario
    const handleLike = async (commentId: string) => {
        try {
            const comment = findComment(commentId);
            if (!comment) return;

            // Simular delay de red
            await new Promise(resolve => setTimeout(resolve, 300));

            if (comment.user_liked) {
                // await unlike({ schoolId, commentId });
                updateCommentLikes(commentId, comment.likes - 1, false);
            } else {
                // await like({ schoolId, commentId });
                updateCommentLikes(commentId, comment.likes + 1, true);
            }
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    // Responder a comentario (deshabilitado - solo comentarios al aviso)
    const handleReply = (commentId: string) => {
        // Función deshabilitada - no se permiten respuestas a comentarios
        console.log("Respuestas a comentarios no están habilitadas");
    };

    // Editar comentario
    const handleEdit = async (commentId: string, content: string) => {
        try {
            // Simular delay de red
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // await update({ schoolId, commentId, dto: { content } });
            updateCommentContent(commentId, content);
            setEditingComment(null);
        } catch (error) {
            console.error("Error updating comment:", error);
        }
    };

    // Eliminar comentario
    const handleDelete = async (commentId: string) => {
        try {
            // Simular delay de red
            await new Promise(resolve => setTimeout(resolve, 600));
            
            // await remove({ schoolId, commentId });
            removeComment(commentId);
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    // Funciones auxiliares para actualizar el estado
    const findComment = (commentId: string): ICommentRead | null => {
        const findInComments = (comments: ICommentRead[]): ICommentRead | null => {
            for (const comment of comments) {
                if (comment.id === commentId) return comment;
                if (comment.replies) {
                    const found = findInComments(comment.replies);
                    if (found) return found;
                }
            }
            return null;
        };
        return findInComments(comments);
    };

    const updateCommentLikes = (commentId: string, likes: number, userLiked: boolean) => {
        const updateInComments = (comments: ICommentRead[]): ICommentRead[] => {
            return comments.map(comment => {
                if (comment.id === commentId) {
                    return { ...comment, likes, user_liked: userLiked };
                }
                if (comment.replies) {
                    return { ...comment, replies: updateInComments(comment.replies) };
                }
                return comment;
            });
        };
        setComments(updateInComments(comments));
    };

    const updateCommentContent = (commentId: string, content: string) => {
        const updateInComments = (comments: ICommentRead[]): ICommentRead[] => {
            return comments.map(comment => {
                if (comment.id === commentId) {
                    return { ...comment, content };
                }
                if (comment.replies) {
                    return { ...comment, replies: updateInComments(comment.replies) };
                }
                return comment;
            });
        };
        setComments(updateInComments(comments));
    };

    const removeComment = (commentId: string) => {
        const removeFromComments = (comments: ICommentRead[]): ICommentRead[] => {
            return comments.filter(comment => {
                if (comment.id === commentId) return false;
                if (comment.replies) {
                    comment.replies = removeFromComments(comment.replies);
                }
                return true;
            });
        };
        setComments(removeFromComments(comments));
    };

    // Cargar más comentarios
    const loadMore = () => {
        if (hasMore && !loading) {
            loadComments(page + 1, true);
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Contador de comentarios */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-base-content">
                        Comentarios ({comments.length})
                    </h3>
                    <span className="badge badge-info badge-sm">Mocking</span>
                </div>
            </div>

            {/* Input para nuevo comentario */}
            {allowComments && (
                <CommentInput
                    onSendComment={handleSendComment}
                    placeholder="Escribe un comentario sobre este aviso..."
                    loading={sending}
                    disabled={!currentUserId}
                />
            )}

            {/* Lista de comentarios */}
            <div className="space-y-4">
                {comments.map((comment) => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        onLike={handleLike}
                        onReply={handleReply}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        currentUserId={currentUserId}
                    />
                ))}
            </div>

            {/* Loading state */}
            {loading && (
                <div className="flex justify-center py-4">
                    <span className="loading loading-spinner loading-md"></span>
                </div>
            )}

            {/* Botón para cargar más */}
            {hasMore && !loading && (
                <div className="flex justify-center">
                    <button
                        onClick={loadMore}
                        className="btn btn-outline btn-sm"
                    >
                        Cargar más comentarios
                    </button>
                </div>
            )}

            {/* Mensaje cuando no hay comentarios */}
            {!loading && comments.length === 0 && (
                <div className="text-center py-8 text-base-content/60">
                    <p>No hay comentarios aún.</p>
                    {allowComments && currentUserId && (
                        <p className="text-sm mt-2">¡Sé el primero en comentar!</p>
                    )}
                    <p className="text-xs mt-2 text-base-content/40">(Modo Mocking - Los comentarios se simulan localmente)</p>
                </div>
            )}

            <div ref={commentsEndRef} />
        </div>
    );
};
