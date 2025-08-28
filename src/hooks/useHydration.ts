import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Hook para manejar la hidratación y evitar problemas de SSR
 * Retorna true cuando el componente está completamente hidratado en el cliente
 */
export const useHydration = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
};

/**
 * Hook para obtener el estado de autenticación de manera segura durante la hidratación
 */
export const useAuthHydration = () => {
  const isHydrated = useHydration();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  return {
    isHydrated,
    isAuthenticated: isHydrated ? isAuthenticated : false,
  };
};
