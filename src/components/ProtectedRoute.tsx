"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthHydration } from '@/hooks/useHydration';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isHydrated, isAuthenticated } = useAuthHydration();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      // Guardar la ruta actual para redirigir después del login
      const redirectTo = encodeURIComponent(pathname);
      router.push(`/auth/login?redirectTo=${redirectTo}`);
    }
  }, [isHydrated, isAuthenticated, router, pathname]);

  // Durante la hidratación, mostrar un estado de carga
  if (!isHydrated) {
    return <LoadingSpinner fullScreen />;
  }

  // Si no está autenticado, mostrar estado de carga mientras redirige
  if (!isAuthenticated) {
    return <LoadingSpinner message="Redirigiendo al login..." fullScreen />;
  }

  return <>{children}</>;
};
