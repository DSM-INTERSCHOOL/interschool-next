import { useState } from 'react';
import { getPermisos } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';

interface Permiso {
  IdPermiso: number;
  NombreModulo: string;
  GrupoMenu: string;
  Etiqueta: string;
  Accion: string;
  Namespace: string;
  Contexto: string;
  Discriminator: string;
  OrdenMenu?: number;
  TipoPermiso?: string;
  Legacy?: number;
  Clase?: string;
  IdGrupoMenu?: number;
  Target?: string;
  TipoAccesso?: string;
  Descripcion?: string;
}

export const usePermisos = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const permisos = useAuthStore((state) => state.permisos);
  const setPermisos = useAuthStore((state) => state.setPermisos);
  const legacyPersonId = useAuthStore((state) => state.legacyPersonId);
  const legacyPassword = useAuthStore((state) => state.legacyPassword);

  const loadPermisos = async () => {
    // Ya no es necesario cargar permisos aquí porque se cargan durante el login
    console.log('Permisos ya cargados durante el login');
  };

  // Ya no necesitamos el useEffect porque los permisos se cargan durante el login
  // useEffect(() => {
  //   loadPermisos();
  // }, [legacyPersonId, legacyPassword]);

  const refreshPermisos = async () => {
    // Validar que existan credenciales
    if (!legacyPersonId || !legacyPassword) {
      setError('No hay credenciales legacy disponibles');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Actualizando permisos desde la API...');
      const response = await getPermisos({
        person_id: legacyPersonId,
        password: legacyPassword,
      });
      console.log('Permisos actualizados:', response.meta_data?.permisos);
      setPermisos(response.meta_data?.permisos || []);
    } catch (err: any) {
      console.error('Error al actualizar permisos:', err);
      setError(err.message || 'Error al actualizar permisos');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    permisos,
    isLoading,
    error,
    refreshPermisos,
    loadPermisos
  };
};
