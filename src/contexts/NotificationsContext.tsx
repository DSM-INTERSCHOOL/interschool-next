"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getAnnouncements, getAssignments } from "@/services/publications.service";

interface NotificationsContextType {
    unreadCount: number;
    loading: boolean;
    refetch: () => Promise<void>;
    decrementUnread: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const { token, personId } = useAuth();

    const fetchUnreadCount = async () => {
        if (!token || !personId) {
            setUnreadCount(0);
            return;
        }

        try {
            setLoading(true);

            // Obtener avisos y tareas en paralelo
            const [announcements, assignments] = await Promise.all([
                getAnnouncements({ personId: personId.toString(), token }),
                getAssignments({ personId: personId.toString(), token }),
            ]);

            // Contar los que tienen user_viewed en false
            const unreadAnnouncements = announcements.filter((a) => !a.user_viewed).length;
            const unreadAssignments = assignments.filter((a) => !a.user_viewed).length;

            setUnreadCount(unreadAnnouncements + unreadAssignments);
        } catch (err) {
            console.error("Error fetching unread notifications:", err);
            setUnreadCount(0);
        } finally {
            setLoading(false);
        }
    };

    const decrementUnread = () => {
        setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    useEffect(() => {
        fetchUnreadCount();

        // Refrescar cada 60 segundos
        const interval = setInterval(fetchUnreadCount, 60000);

        return () => clearInterval(interval);
    }, [token, personId]);

    return (
        <NotificationsContext.Provider
            value={{
                unreadCount,
                loading,
                refetch: fetchUnreadCount,
                decrementUnread,
            }}
        >
            {children}
        </NotificationsContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationsContext);
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationsProvider");
    }
    return context;
};
