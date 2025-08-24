"use client";

import { useState } from "react";
import PostCreator from "./components/PostCreator";
import PostList from "./components/PostList";

export interface Post {
    id: string;
    author: {
        name: string;
        avatar: string;
        username: string;
    };
    content: string;
    timestamp: Date;
    images?: string[];
    files?: { name: string; url: string; type: string }[];
    likes: number;
    comments: number;
    shares: number;
    isLiked: boolean;
}

const SocialFeedApp = () => {
    const [posts, setPosts] = useState<Post[]>([
        {
            id: "1",
            author: {
                name: "María González",
                avatar: "/images/avatars/1.png",
                username: "@maria.gonzalez"
            },
            content: "¡Excelente trabajo en equipo hoy! Logramos completar el proyecto médico a tiempo. 🏥✨",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            images: ["/images/apps/ecommerce/products/1.jpg"],
            likes: 24,
            comments: 8,
            shares: 3,
            isLiked: false
        },
        {
            id: "2",
            author: {
                name: "Dr. Carlos Mendoza",
                avatar: "/images/avatars/2.png",
                username: "@dr.mendoza"
            },
            content: "Recordatorio: La reunión del equipo médico es mañana a las 9:00 AM. Por favor, traigan los reportes actualizados de sus pacientes.",
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            likes: 16,
            comments: 5,
            shares: 7,
            isLiked: true
        },
        {
            id: "3",
            author: {
                name: "Ana Rodríguez",
                avatar: "/images/avatars/3.png",
                username: "@ana.rodriguez"
            },
            content: "Nuevo protocolo de emergencias implementado exitosamente. Todos los miembros del staff han sido capacitados. 📋👩‍⚕️",
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            files: [
                { name: "protocolo_emergencias.pdf", url: "#", type: "pdf" },
                { name: "capacitacion_staff.docx", url: "#", type: "doc" }
            ],
            likes: 31,
            comments: 12,
            shares: 8,
            isLiked: false
        }
    ]);

    const handleNewPost = (postData: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments' | 'shares' | 'isLiked'>) => {
        const newPost: Post = {
            ...postData,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
            likes: 0,
            comments: 0,
            shares: 0,
            isLiked: false
        };
        setPosts([newPost, ...posts]);
    };

    const handleLike = (postId: string) => {
        setPosts(posts.map(post => 
            post.id === postId 
                ? { 
                    ...post, 
                    isLiked: !post.isLiked,
                    likes: post.isLiked ? post.likes - 1 : post.likes + 1
                }
                : post
        ));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar izquierdo - Información del usuario */}
            <div className="lg:col-span-1">
                <div className="card card-border bg-base-100 sticky top-24 h-fit">
                    <div className="card-body">
                        <div className="flex items-center gap-4">
                            <div className="avatar">
                                <div className="w-14 h-14 rounded-lg overflow-hidden bg-base-200">
                                    <img src="/images/avatars/4.png" alt="Mi Avatar" className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold">Usuario Actual</h3>
                                <p className="text-sm text-base-content/70">@usuario.actual</p>
                            </div>
                        </div>
                        
                        <div className="divider"></div>
                        
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm">Posts</span>
                                <span className="text-sm font-medium">{posts.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Seguidores</span>
                                <span className="text-sm font-medium">2.4k</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Siguiendo</span>
                                <span className="text-sm font-medium">180</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido principal - Feed */}
            <div className="lg:col-span-2">
                <div className="space-y-6">
                    {/* Creador de posts */}
                    <PostCreator onCreatePost={handleNewPost} />
                    
                    {/* Lista de posts */}
                    <PostList posts={posts} onLike={handleLike} />
                </div>
            </div>
        </div>
    );
};

export default SocialFeedApp;
