import { useMemo } from "react";
import { getOrgConfig } from "@/lib/orgConfig";

export type UserRole = 'admin' | 'teacher' | 'alumno' | 'unknown';

export const useUserRole = (): UserRole => {
    return useMemo(() => {
        try {
            const { portalName } = getOrgConfig();
            console.log('portalName', portalName);

            if (portalName.toLowerCase().includes('meta') || portalName.toLowerCase().includes('mt')) {
                console.log("is admin");
                return 'admin';
            }

            if (portalName.toLowerCase().includes('teacher') || portalName.toLowerCase().includes('profesor') || portalName.toLowerCase().includes('pr')) {
                console.log("is teacher");
                return 'teacher';
            }
             if (portalName.toLowerCase().includes('student') || portalName.toLowerCase().includes('alumno') || portalName.toLowerCase().includes('al')) {
                console.log("is alumno");
                return 'alumno';
            }

            return 'unknown';
        } catch (error) {
            console.error('Error getting user role:', error);
            return 'unknown';
        }
    }, []);
};
