"use client";

import { CommentList } from "./CommentList";
import { CommentItem } from "./CommentItem";
import { CommentInput } from "./CommentInput";

// Ejemplo de uso de los componentes de comentarios
export const CommentListExample = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Ejemplo de Sistema de Comentarios</h2>
            
            {/* Ejemplo 1: Lista completa de comentarios */}
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h3 className="card-title">Lista Completa de Comentarios</h3>
                    <CommentList
                        announcementId="announcement-123"
                        schoolId={1}
                        currentUserId="user-456"
                        allowComments={true}
                    />
                </div>
            </div>

            {/* Ejemplo 2: Solo lectura de comentarios */}
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h3 className="card-title">Comentarios de Solo Lectura</h3>
                    <CommentList
                        announcementId="announcement-456"
                        schoolId={1}
                        allowComments={false}
                    />
                </div>
            </div>

            {/* Ejemplo 3: Input de comentario independiente */}
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h3 className="card-title">Input de Comentario Independiente</h3>
                    <CommentInput
                        onSendComment={(content) => console.log("Comentario enviado:", content)}
                        placeholder="Escribe tu comentario aquí..."
                    />
                </div>
            </div>

            {/* Ejemplo 4: Item de comentario individual */}
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h3 className="card-title">Item de Comentario Individual</h3>
                    <CommentItem
                        comment={{
                            id: "comment-123",
                            content: "Este es un comentario de ejemplo con contenido extenso para mostrar cómo se ve el componente cuando hay mucho texto.",
                            announcement_id: "announcement-123",
                            parent_id: null,
                            created_at: "2024-01-15T10:30:00Z",
                            modified_at: "2024-01-15T10:30:00Z",
                            created_by: "user-123",
                            modified_by: "user-123",
                            author: {
                                id: "user-123",
                                first_name: "Juan",
                                last_name: "Pérez",
                                email: "juan.perez@escuela.edu",
                                avatar: "/images/avatars/1.png"
                            },
                            likes: 5,
                            user_liked: true,
                            replies: [
                                {
                                    id: "reply-123",
                                    content: "Esta es una respuesta al comentario principal.",
                                    announcement_id: "announcement-123",
                                    parent_id: "comment-123",
                                    created_at: "2024-01-15T11:00:00Z",
                                    modified_at: "2024-01-15T11:00:00Z",
                                    created_by: "user-456",
                                    modified_by: "user-456",
                                    author: {
                                        id: "user-456",
                                        first_name: "María",
                                        last_name: "García",
                                        email: "maria.garcia@escuela.edu"
                                    },
                                    likes: 2,
                                    user_liked: false
                                }
                            ]
                        }}
                        onLike={(commentId) => console.log("Like en comentario:", commentId)}
                        onReply={(commentId) => console.log("Responder a comentario:", commentId)}
                        onEdit={(commentId, content) => console.log("Editar comentario:", commentId, content)}
                        onDelete={(commentId) => console.log("Eliminar comentario:", commentId)}
                        currentUserId="user-123"
                    />
                </div>
            </div>
        </div>
    );
};


