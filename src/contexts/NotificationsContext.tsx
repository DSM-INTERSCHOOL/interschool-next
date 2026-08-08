"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getAnnouncements, getAssignments, getEvents } from "@/services/publications.service";

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

            const [announcements, assignments, events] = await Promise.all([
                getAnnouncements({ personId: personId.toString(), token }),
                getAssignments({ personId: personId.toString(), token }),
                getEvents({ personId: personId.toString(), token }),
            ]);

            const unread =
                announcements.filter((a) => !a.user_viewed).length +
                assignments.filter((a) => !a.user_viewed).length +
                events.filter((e) => !e.user_viewed).length;

            setUnreadCount(unread);
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
