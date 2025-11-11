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
        const diffTime = date.getTime() - now.getTime();
        const isPast = diffTime < 0;
        const absDiffTime = Math.abs(diffTime);

        const diffMinutes = Math.floor(absDiffTime / (1000 * 60));
        const diffHours = Math.floor(absDiffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(absDiffTime / (1000 * 60 * 60 * 24));
        const diffWeeks = Math.floor(diffDays / 7);
        const remainingDaysAfterWeeks = diffDays % 7;
        const diffMonths = Math.floor(diffDays / 30);
        const remainingDaysAfterMonths = diffDays % 30;
        const diffYears = Math.floor(diffDays / 365);
        const remainingDaysAfterYears = diffDays % 365;

        // Para fechas futuras
        if (!isPast) {
            if (diffMinutes < 1) return "En menos de 1 minuto";
            if (diffMinutes < 60) return `En ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`;
            if (diffHours < 24) return `En ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
            if (diffDays === 0) return "Hoy";
            if (diffDays === 1) return "Mañana";
            if (diffDays < 7) return `En ${diffDays} días`;
            if (diffWeeks < 4) {
                const weekText = `En ${diffWeeks} ${diffWeeks === 1 ? 'semana' : 'semanas'}`;
                return remainingDaysAfterWeeks > 0 ? `${weekText} ${remainingDaysAfterWeeks} ${remainingDaysAfterWeeks === 1 ? 'día' : 'días'}` : weekText;
            }
            if (diffMonths < 12) {
                const monthText = `En ${diffMonths} ${diffMonths === 1 ? 'mes' : 'meses'}`;
                return remainingDaysAfterMonths > 0 ? `${monthText} ${remainingDaysAfterMonths} ${remainingDaysAfterMonths === 1 ? 'día' : 'días'}` : monthText;
            }
            const yearText = `En ${diffYears} ${diffYears === 1 ? 'año' : 'años'}`;
            return remainingDaysAfterYears > 0 ? `${yearText} ${remainingDaysAfterYears} ${remainingDaysAfterYears === 1 ? 'día' : 'días'}` : yearText;
        }

        // Para fechas pasadas
        if (diffMinutes < 1) return "Hace menos de 1 minuto";
        if (diffMinutes < 60) return `Hace ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`;
        if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
        if (diffDays === 0) return "Hoy";
        if (diffDays === 1) return "Ayer";
        if (diffDays < 7) return `Hace ${diffDays} días`;
        if (diffWeeks < 4) {
            const weekText = `Hace ${diffWeeks} ${diffWeeks === 1 ? 'semana' : 'semanas'}`;
            return remainingDaysAfterWeeks > 0 ? `${weekText} ${remainingDaysAfterWeeks} ${remainingDaysAfterWeeks === 1 ? 'día' : 'días'}` : weekText;
        }
        if (diffMonths < 12) {
            const monthText = `Hace ${diffMonths} ${diffMonths === 1 ? 'mes' : 'meses'}`;
            return remainingDaysAfterMonths > 0 ? `${monthText} ${remainingDaysAfterMonths} ${remainingDaysAfterMonths === 1 ? 'día' : 'días'}` : monthText;
        }
        const yearText = `Hace ${diffYears} ${diffYears === 1 ? 'año' : 'años'}`;
        return remainingDaysAfterYears > 0 ? `${yearText} ${remainingDaysAfterYears} ${remainingDaysAfterYears === 1 ? 'día' : 'días'}` : yearText;
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
