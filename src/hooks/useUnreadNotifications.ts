import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { getAnnouncements, getAssignments } from "@/services/publications.service";

export const useUnreadNotifications = () => {
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

    useEffect(() => {
        fetchUnreadCount();

        // Refrescar cada 60 segundos
        const interval = setInterval(fetchUnreadCount, 60000);

        return () => clearInterval(interval);
    }, [token, personId]);

    return { unreadCount, loading, refetch: fetchUnreadCount };
};
