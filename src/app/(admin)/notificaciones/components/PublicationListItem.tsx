"use client";

import { IAnnouncement, IAssignment, IEvent } from "@/interfaces/IPublication";
import { formatRelativeDate } from "../utils";

interface PublicationListItemProps {
    publication: IAnnouncement | IAssignment | IEvent;
    isActive: boolean;
    onClick: () => void;
    type?: "announcement" | "assignment" | "event";
}

export const PublicationListItem = ({ publication, isActive, onClick, type }: PublicationListItemProps) => {
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
            className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 transition-all hover:bg-base-200 ${
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
                        {formatRelativeDate(publication.start_date)}
                </span>

                {/* Badges adicionales */}
                <div className="flex items-center gap-2 mt-2">
                    {publication.attachments.length > 0 && (
                        <span className="badge badge-xs badge-ghost">
                            <span className="iconify lucide--paperclip size-3 mr-1" />
                            {publication.attachments.length}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
