import { useRouter } from "next/navigation";

import { getPermisos, clearAuthCookies, logOutCore } from "@/services/auth.service";
import { useAuthStore } from "@/store/useAuthStore";

import { useHydration } from "./useHydration";

export const useAuth = () => {
    const router = useRouter();
    const isHydrated = useHydration();

    // Usar selectores individuales para evitar bucles infinitos
    const token = useAuthStore((state) => state.token);
    const personId = useAuthStore((state) => state.personId);
    const email = useAuthStore((state) => state.email);
    const name = useAuthStore((state) => state.name);
    const schoolId = useAuthStore((state) => state.schoolId);
    const personInternalId = useAuthStore((state) => state.personInternalId);
    const status = useAuthStore((state) => state.status);
    const personType = useAuthStore((state) => state.personType);
    const personPhoto = useAuthStore((state) => state.personPhoto);
    const timeZone = useAuthStore((state) => state.timeZone);
    const lastLogin = useAuthStore((state) => state.lastLogin);
    const permisos = useAuthStore((state) => state.permisos);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
    const setAuthData = useAuthStore((state) => state.setAuthData);
    const storeLogout = useAuthStore((state) => state.logout);

    const login = async (personId: string, password: string) => {
        try {
            // Usar getPermisos que nos trae el token y los permisos en una sola llamada
            const authData = await getPermisos({ person_id: personId, password });

            // Verificar si es un caso especial que requiere selección de alumno
            const requiresStudentSelection =
                authData.person_type === "RELATIVE" &&
                authData.meta_data?.status === "seleccion_alumno" &&
                authData.meta_data?.alumnos &&
                Array.isArray(authData.meta_data.alumnos) &&
                authData.meta_data.alumnos.length > 0;

            setAuthData(authData);

            // Guardar credenciales legacy por separado
            useAuthStore.setState({
                legacyPersonId: personId,
                legacyPassword: password, // NOTA: En producción debería estar encriptado
            });

            if (requiresStudentSelection) {
                // Guardar los datos temporales para la selección de alumno
                useAuthStore.getState().setStudentSelectionData(authData);

                // Guardar credenciales legacy temporalmente
                useAuthStore.setState({
                    legacyPersonId: personId,
                    legacyPassword: password,
                });

                return {
                    success: true,
                    requiresStudentSelection: true,
                };
            }

            return { success: true, requiresStudentSelection: false };
        } catch (error: any) {
            console.error("Error en login:", error);
            return { success: false, message: error.message || "Hubo un problema. Intenta más tarde" };
        }
    };

    const logout = () => {
        // Limpiar cookies de autenticación
        logOutCore();
        clearAuthCookies();
        // Limpiar estado del store
        storeLogout();
        router.push("/auth/login");
    };

    return {
        // Estado de hidratación
        isHydrated,

        // Estado (solo disponible después de la hidratación)
        token: isHydrated ? token : null,
        personId: isHydrated ? personId : null,
        email: isHydrated ? email : null,
        name: isHydrated ? name : null,
        schoolId: isHydrated ? schoolId : null,
        personInternalId: isHydrated ? personInternalId : null,
        status: isHydrated ? status : null,
        personType: isHydrated ? personType : null,
        personPhoto: isHydrated ? personPhoto : null,
        timeZone: isHydrated ? timeZone : null,
        lastLogin: isHydrated ? lastLogin : null,
        permisos: isHydrated ? permisos : [],
        isAuthenticated: isHydrated ? isAuthenticated : false,

        // Acciones
        login,
        logout,
    };
};
