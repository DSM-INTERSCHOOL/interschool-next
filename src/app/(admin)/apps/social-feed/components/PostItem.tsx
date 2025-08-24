"use client";

import { useState } from "react";
import { Post } from "../SocialFeedApp";

interface PostItemProps {
    post: Post;
    onLike: (postId: string) => void;
}

const PostItem = ({ post, onLike }: PostItemProps) => {
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState("");

    const formatTimestamp = (date: Date) => {
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 1) return "Ahora";
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
        return `${Math.floor(diffInMinutes / 1440)}d`;
    };

    const getFileIcon = (type: string) => {
        if (type === 'pdf') return 'lucide--file-text';
        if (type === 'doc') return 'lucide--file-text';
        return 'lucide--file';
    };

    const getFileColor = (type: string) => {
        if (type === 'pdf') return 'text-red-500';
        if (type === 'doc') return 'text-blue-500';
        return 'text-gray-500';
    };

    return (
        <div className="card card-border bg-base-100">
            <div className="card-body">
                {/* Header del post */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="avatar">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-base-200">
                            <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="font-semibold">{post.author.name}</div>
                        <div className="text-sm text-base-content/70 flex items-center gap-2">
                            <span>{post.author.username}</span>
                            <span>•</span>
                            <span>{formatTimestamp(post.timestamp)}</span>
                        </div>
                    </div>
                    <div className="dropdown dropdown-end">
                        <button className="btn btn-ghost btn-sm btn-circle" role="button" tabIndex={0}>
                            <span className="iconify lucide--more-horizontal size-4"></span>
                        </button>
                        <ul className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg border">
                            <li><a><span className="iconify lucide--bookmark size-4"></span>Guardar</a></li>
                            <li><a><span className="iconify lucide--flag size-4"></span>Reportar</a></li>
                            <li><a><span className="iconify lucide--share size-4"></span>Copiar enlace</a></li>
                        </ul>
                    </div>
                </div>

                {/* Contenido del post */}
                {post.content && (
                    <div className="mb-4">
                        <p className="text-base leading-relaxed whitespace-pre-wrap">
                            {post.content}
                        </p>
                    </div>
                )}

                {/* Imágenes */}
                {post.images && post.images.length > 0 && (
                    <div className="mb-4">
                        {post.images.length === 1 ? (
                            <div className="rounded-lg overflow-hidden">
                                <img 
                                    src={post.images[0]} 
                                    alt="Post image" 
                                    className="w-full h-auto max-h-96 object-cover"
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
                                {post.images.slice(0, 4).map((image, index) => (
                                    <div key={index} className="relative">
                                        <img 
                                            src={image} 
                                            alt={`Post image ${index + 1}`} 
                                            className="w-full h-32 object-cover"
                                        />
                                        {index === 3 && post.images!.length > 4 && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="text-white font-semibold">
                                                    +{post.images!.length - 4}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Archivos adjuntos */}
                {post.files && post.files.length > 0 && (
                    <div className="mb-4 space-y-2">
                        {post.files.map((file, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors cursor-pointer">
                                <span className={`iconify ${getFileIcon(file.type)} size-5 ${getFileColor(file.type)}`}></span>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{file.name}</div>
                                    <div className="text-sm text-base-content/70 capitalize">{file.type}</div>
                                </div>
                                <span className="iconify lucide--download size-4 text-base-content/70"></span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Estadísticas */}
                <div className="flex items-center justify-between text-sm text-base-content/70 mb-3">
                    <div className="flex items-center gap-4">
                        {post.likes > 0 && (
                            <span className="flex items-center gap-1">
                                <span className="iconify lucide--heart size-4 text-red-500"></span>
                                {post.likes}
                            </span>
                        )}
                        {post.comments > 0 && (
                            <span>{post.comments} comentarios</span>
                        )}
                    </div>
                    {post.shares > 0 && (
                        <span>{post.shares} compartidos</span>
                    )}
                </div>

                <div className="divider my-3"></div>

                {/* Acciones */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => onLike(post.id)}
                        className={`btn btn-ghost btn-sm gap-2 flex-1 ${post.isLiked ? 'text-red-500' : ''}`}
                    >
                        <span className={`iconify lucide--heart size-4 ${post.isLiked ? 'text-red-500' : ''}`}></span>
                        Me gusta
                    </button>
                    
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="btn btn-ghost btn-sm gap-2 flex-1"
                    >
                        <span className="iconify lucide--message-circle size-4"></span>
                        Comentar
                    </button>
                    
                    <button className="btn btn-ghost btn-sm gap-2 flex-1">
                        <span className="iconify lucide--share size-4"></span>
                        Compartir
                    </button>
                </div>

                {/* Sección de comentarios */}
                {showComments && (
                    <>
                        <div className="divider my-3"></div>
                        <div className="space-y-4">
                            {/* Formulario para nuevo comentario */}
                            <div className="flex gap-3">
                                <div className="avatar">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-base-200">
                                        <img src="/images/avatars/4.png" alt="Mi avatar" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <div className="flex-1 flex gap-2">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Escribe un comentario..."
                                        className="input input-bordered input-sm flex-1"
                                    />
                                    <button 
                                        className="btn btn-primary btn-sm"
                                        disabled={!newComment.trim()}
                                    >
                                        <span className="iconify lucide--send size-4"></span>
                                    </button>
                                </div>
                            </div>

                            {/* Lista de comentarios (placeholder) */}
                            {post.comments > 0 && (
                                <div className="text-center py-4 text-base-content/70">
                                    <span className="text-sm">Ver {post.comments} comentarios</span>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PostItem;
