"use client";

import { FormEvent, useState } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

export interface CommentInputProps {
    onSendComment: (content: string) => void;
    placeholder?: string;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
}

export const CommentInput = ({ 
    onSendComment, 
    placeholder = "Escribe un comentario...", 
    disabled = false,
    loading = false,
    className = ""
}: CommentInputProps) => {
    const [content, setContent] = useState("");

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!content.trim() || disabled || loading) return;
        
        onSendComment(content.trim());
        setContent("");
    };

    return (
        <form 
            className={`bg-base-200 flex items-center gap-3 p-4 rounded-lg ${className}`} 
            onSubmit={handleSubmit}
        >
            <input
                className="input input-bordered grow"
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                disabled={disabled || loading}
                required
            />
            <button 
                className="btn btn-primary btn-circle btn-sm" 
                type="submit" 
                disabled={disabled || loading || !content.trim()}
                aria-label="Enviar comentario"
            >
                {loading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                ) : (
                    <PaperAirplaneIcon className="w-4 h-4" />
                )}
            </button>
        </form>
    );
};




