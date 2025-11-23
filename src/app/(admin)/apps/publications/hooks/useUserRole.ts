import { useMemo } from "react";
import { getOrgConfig } from "@/lib/orgConfig";

export type UserRole = 'admin' | 'teacher' | 'alumno' | 'unknown';

export const useUserRole = (): UserRole => {
    return useMemo(() => {
        try {
            const { portalName } = getOrgConfig();

            if (portalName.toLowerCase().includes('meta')) {
                return 'admin';
            }

            if (portalName.toLowerCase().includes('teacher') || portalName.toLowerCase().includes('profesor')) {
                return 'teacher';
            }
             if (portalName.toLowerCase().includes('alumno') || portalName.toLowerCase().includes('profesor')) {
                return 'alumno';
            }

            return 'unknown';
        } catch (error) {
            console.error('Error getting user role:', error);
            return 'unknown';
        }
    }, []);
};
