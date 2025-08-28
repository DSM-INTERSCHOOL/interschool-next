import { useAuthStore } from '@/store/useAuthStore';
import { login as loginService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { useHydration } from './useHydration';

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
  const storeLogin = useAuthStore((state) => state.login);
  const storeLogout = useAuthStore((state) => state.logout);

  const login = async (personId: string, password: string, schoolId: string = "1000") => {
    try {
      const authData = await loginService({ person_id: personId, password });
      
      // Construir el nombre completo
      const fullName = authData.name || 'Usuario';
      
      // Guardar en el store
      storeLogin({
        token: authData.token,
        personId: authData.person_id,
        email: authData.email,
        name: fullName,
        schoolId: authData.school_id,
        personInternalId: authData.person_internal_id,
        status: authData.status,
        personType: authData.person_type,
        personPhoto: authData.person_photo,
        timeZone: authData.time_zone,
        lastLogin: authData.last_login,
        permisos: [], // Los permisos se cargan por separado
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error en login:', error);
      return { success: false, message: error.message || 'Hubo un problema. Intenta más tarde' };
    }
  };

  const logout = () => {
    storeLogout();
    router.push('/auth/login');
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
