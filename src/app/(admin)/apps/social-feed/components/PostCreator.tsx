"use client";

import { useState, useRef } from "react";
import { Post } from "../SocialFeedApp";

interface PostCreatorProps {
    onCreatePost: (post: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments' | 'shares' | 'isLiked'>) => void;
}

const PostCreator = ({ onCreatePost }: PostCreatorProps) => {
    const [content, setContent] = useState("");
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isPosting, setIsPosting] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        setSelectedImages(prev => [...prev, ...imageFiles]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() && selectedImages.length === 0 && selectedFiles.length === 0) return;

        setIsPosting(true);

        // Simular subida de archivos
        const imageUrls = selectedImages.map((_, index) => `/images/apps/ecommerce/products/${index + 1}.jpg`);
        const fileData = selectedFiles.map(file => ({
            name: file.name,
            url: "#", // En producción, esto sería la URL real del archivo subido
            type: file.type.includes('pdf') ? 'pdf' : file.type.includes('doc') ? 'doc' : 'file'
        }));

        const postData = {
            author: {
                name: "Usuario Actual",
                avatar: "/images/avatars/4.png",
                username: "@usuario.actual"
            },
            content: content.trim(),
            images: imageUrls.length > 0 ? imageUrls : undefined,
            files: fileData.length > 0 ? fileData : undefined
        };

        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));

        onCreatePost(postData);

        // Limpiar formulario
        setContent("");
        setSelectedImages([]);
        setSelectedFiles([]);
        setShowOptions(false);
        setIsPosting(false);
    };

    return (
        <div className="card card-border bg-base-100">
            <div className="card-body">
                <form onSubmit={handleSubmit}>
                    <div className="flex gap-4">
                        <div className="avatar">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-base-200">
                                <img src="/images/avatars/4.png" alt="Mi Avatar" className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <div className="flex-1 space-y-4">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="¿Qué está pasando?"
                                className="textarea textarea-ghost w-full resize-none min-h-[80px] text-base"
                                disabled={isPosting}
                            />

                            {/* Preview de imágenes seleccionadas */}
                            {selectedImages.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {selectedImages.map((image, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={URL.createObjectURL(image)}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 btn btn-xs btn-circle btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <span className="iconify lucide--x size-3"></span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Preview de archivos seleccionados */}
                            {selectedFiles.length > 0 && (
                                <div className="space-y-2">
                                    {selectedFiles.map((file, index) => (
                                        <div key={index} className="flex items-center gap-3 p-2 bg-base-200 rounded-lg">
                                            <span className="iconify lucide--file size-4"></span>
                                            <span className="flex-1 text-sm truncate">{file.name}</span>
                                            <span className="text-xs text-base-content/70">
                                                {(file.size / 1024 / 1024).toFixed(1)} MB
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                className="btn btn-xs btn-ghost btn-circle"
                                            >
                                                <span className="iconify lucide--x size-3"></span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Opciones adicionales */}
                            {showOptions && (
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => imageInputRef.current?.click()}
                                        className="btn btn-sm btn-ghost gap-2"
                                        disabled={isPosting}
                                    >
                                        <span className="iconify lucide--image size-4"></span>
                                        Fotos
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="btn btn-sm btn-ghost gap-2"
                                        disabled={isPosting}
                                    >
                                        <span className="iconify lucide--paperclip size-4"></span>
                                        Archivos
                                    </button>
                                </div>
                            )}

                            {/* Controles del formulario */}
                            <div className="flex justify-between items-center">
                                <button
                                    type="button"
                                    onClick={() => setShowOptions(!showOptions)}
                                    className="btn btn-sm btn-ghost gap-2"
                                    disabled={isPosting}
                                >
                                    <span className="iconify lucide--plus size-4"></span>
                                    Adjuntar
                                </button>
                                
                                <button
                                    type="submit"
                                    disabled={(!content.trim() && selectedImages.length === 0 && selectedFiles.length === 0) || isPosting}
                                    className="btn btn-primary btn-sm gap-2"
                                >
                                    {isPosting ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Publicando...
                                        </>
                                    ) : (
                                        <>
                                            <span className="iconify lucide--send size-4"></span>
                                            Publicar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Inputs ocultos para archivos */}
                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                    />
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </form>
            </div>
        </div>
    );
};

export default PostCreator;
