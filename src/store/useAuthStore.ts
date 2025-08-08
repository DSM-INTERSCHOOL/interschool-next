// store/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Permiso {
  IdPermiso: number;
  NombreModulo: string;
  GrupoMenu: string;
  Etiqueta: string;
  Accion: string;
  Target: string;
  Url?: string;
  // Agrega más campos si los usas
}

interface AuthState {
  permisos: Permiso[];
  setPermisos: (permisos: Permiso[]) => void;
  legacyUrl: string,
  setLegacyUrl : (url: string)=> void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      permisos: [],
      legacyUrl: 'ISMeta/rol/showEdicionRol',
      setLegacyUrl: (url) => set({legacyUrl: url}),
      setPermisos: (permisos) => set({ permisos })
    }),
    {
      name: 'auth-storage', // localStorage key
    }
  )
);
