"use client";

import Link from "next/link";
import { useNotifications } from "@/contexts/NotificationsContext";

export const TopbarNotificationButton = () => {
    const { unreadCount } = useNotifications();

    return (
        <Link href="/notificaciones">
            <div tabIndex={0} role="button" className="btn btn-circle btn-ghost btn-sm indicator" aria-label="Notifications">
                {unreadCount > 0 && (
                    <span className="indicator-item badge badge-primary badge-sm">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
                <span className="iconify lucide--bell size-4.5" />
            </div>
        </Link>
    );
};
