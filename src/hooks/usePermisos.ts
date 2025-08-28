import { useEffect, useState } from 'react';
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

  const loadPermisos = async () => {
    // Solo cargar si no hay permisos y no se está cargando
    if (permisos.length === 0 && !isLoading) {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Cargando permisos desde la API...');
        const permisosData = await getPermisos();
        console.log('Permisos cargados:', permisosData);
        setPermisos(permisosData);
      } catch (err: any) {
        console.error('Error al cargar permisos:', err);
        setError(err.message || 'Error al cargar permisos');
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadPermisos();
  }, []); // Solo ejecutar una vez al montar el componente

  const refreshPermisos = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Actualizando permisos desde la API...');
      const permisosData = await getPermisos();
      console.log('Permisos actualizados:', permisosData);
      setPermisos(permisosData);
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
