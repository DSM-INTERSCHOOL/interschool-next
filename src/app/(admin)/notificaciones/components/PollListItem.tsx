"use client";

import { PollRead } from "@/interfaces/IPoll";

interface PollListItemProps {
    poll: PollRead;
    isActive: boolean;
    onClick: () => void;
}

const formatDate = (iso: string | null): string => {
    if (!iso) return "";
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
    const isPast = diffMs > 0;

    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return isPast ? "Ayer" : "Mañana";
    if (diffDays < 7) return isPast ? `Hace ${diffDays} días` : `En ${diffDays} días`;
    return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
};

export const PollListItem = ({ poll, isActive, onClick }: PollListItemProps) => {
    const publisherName = poll.publisher
        ? `${poll.publisher.given_name ?? ""} ${poll.publisher.paternal_surname ?? ""}`.trim()
        : "Desconocido";

    const initials = poll.publisher
        ? `${poll.publisher.given_name?.[0] ?? ""}${poll.publisher.paternal_surname?.[0] ?? ""}`.toUpperCase()
        : "?";

    return (
        <div
            onClick={onClick}
            className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 transition-all hover:bg-base-200 ${
                isActive ? "bg-base-200" : ""
            }`}
        >
            <div className="avatar placeholder shrink-0">
                <div className="bg-warning/20 text-warning w-10 rounded-full">
                    {poll.publisher?.profile_picture_url ? (
                        <img
                            src={poll.publisher.profile_picture_url}
                            alt={publisherName}
                            className="rounded-full"
                        />
                    ) : (
                        <span className="text-xs">{initials}</span>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <div className="flex items-baseline justify-between gap-2">
                    <h4 className="text-sm font-semibold truncate">{poll.title || "Sin título"}</h4>
                </div>
                <p className="text-base-content/60 text-xs truncate">{publisherName}</p>
                {poll.start_date && (
                    <span className="text-base-content/60 text-xs">
                        {formatDate(poll.start_date)}
                        {poll.end_date && ` – ${formatDate(poll.end_date)}`}
                    </span>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                    {poll.anonymous && (
                        <span className="badge badge-xs badge-ghost">
                            <span className="iconify lucide--eye-off size-3" />
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
