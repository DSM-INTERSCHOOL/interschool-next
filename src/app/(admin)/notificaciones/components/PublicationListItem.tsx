"use client";

import { IAnnouncement, IAssignment } from "@/interfaces/IPublication";

interface PublicationListItemProps {
    publication: IAnnouncement | IAssignment;
    isActive: boolean;
    onClick: () => void;
}

export const PublicationListItem = ({ publication, isActive, onClick }: PublicationListItemProps) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const timeStr = date.toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });

        if (diffDays === 0) return `Hoy ${timeStr}`;
        if (diffDays === 1) return `Ayer ${timeStr}`;
        if (diffDays < 7) return `hace ${diffDays} días ${timeStr}`;

        const dateStr = date.toLocaleDateString("es-MX", { month: "short", day: "numeric" });
        return `${dateStr} ${timeStr}`;
    };

    const getPublisherInitials = () => {
        const { given_name, paternal_surname } = publication.publisher;
        return `${given_name[0]}${paternal_surname?.[0] || ""}`.toUpperCase();
    };

    const getPublisherName = () => {
        const { given_name, paternal_surname, maternal_surname } = publication.publisher;
        return `${given_name} ${paternal_surname} ${maternal_surname}`.trim();
    };

    // Función para extraer preview del contenido HTML
    const getPreview = (): string => {
        if (!publication.content) return "";
        const tmp = document.createElement("DIV");
        tmp.innerHTML = publication.content;
        const text = tmp.textContent || tmp.innerText || "";
        return text.length > 100 ? text.substring(0, 100) + "..." : text;
    };

    // Determinar si la publicación no ha sido vista
    const isUnread = !publication.user_viewed;

    return (
        <div
            onClick={onClick}
            className={`flex cursor-pointer items-start gap-3 rounded-lg px-3 py-3 transition-all hover:bg-base-200 ${
                isActive ? "bg-base-200" : isUnread ? "bg-primary/5 border-l-4 border-primary" : ""
            }`}>
            <div className="avatar placeholder">
                <div className="bg-neutral text-neutral-content w-10 rounded-full">
                    {publication.publisher.profile_picture_url ? (
                        <img src={publication.publisher.profile_picture_url} alt={getPublisherName()} className="rounded-full" />
                    ) : (
                        <span className="text-xs">{getPublisherInitials()}</span>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <div className="flex items-baseline justify-between gap-2">
                    <h4 className={`text-sm ${isUnread ? "font-bold" : "font-semibold"}`}>
                        {publication.title}
                    </h4>
                    {isUnread && (
                        <div className="badge badge-primary badge-xs">Nuevo</div>
                    )}
                </div>
                <p className="text-base-content/60 text-xs">{getPublisherName()}</p>
                <span className="text-base-content/60 text-xs whitespace-nowrap">
                        {formatDate(publication.start_date)}
                </span>

                {/* Badges adicionales */}
                <div className="flex items-center gap-2 mt-2">
                    {publication.attachments.length > 0 && (
                        <span className="badge badge-xs badge-ghost">
                            <span className="iconify lucide--paperclip size-3 mr-1" />
                            {publication.attachments.length}
                        </span>
                    )}
                    {publication.likes > 0 && (
                        <span className="badge badge-xs badge-ghost">
                            <span className="iconify lucide--thumbs-up size-3 mr-1" />
                            {publication.likes}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
