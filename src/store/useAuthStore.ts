// store/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

interface AuthState {
  // Datos de autenticación
  token: string | null;
  personId: number | null;
  email: string | null;
  name: string | null;
  schoolId: number | null;

  // Credenciales para legacy (encriptadas o hasheadas en producción)
  legacyPersonId: string | null;
  legacyPassword: string | null;

  // Datos adicionales del usuario
  personInternalId: string | null;
  status: string | null;
  personType: string | null;
  personPhoto: string | null;
  timeZone: string | null;
  lastLogin: string | null;

  // Datos legacy
  permisos: Permiso[];
  legacyUrl: string;

  // Acciones
  login: (authData: {
    token: string;
    personId: number;
    email: string;
    name: string;
    schoolId: number;
    personInternalId?: string;
    status?: string;
    personType?: string;
    personPhoto?: string;
    timeZone?: string;
    lastLogin?: string;
    permisos?: Permiso[];
    legacyPersonId?: string;
    legacyPassword?: string;
  }) => void;
  logout: () => void;
  setPermisos: (permisos: Permiso[]) => void;
  setLegacyUrl: (url: string) => void;

  // Utilidades
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      token: null,
      personId: null,
      email: null,
      name: null,
      schoolId: null,
      legacyPersonId: null,
      legacyPassword: null,
      personInternalId: null,
      status: null,
      personType: null,
      personPhoto: null,
      timeZone: null,
      lastLogin: null,
      permisos: [],
      legacyUrl: 'ISMeta/rol/showEdicionRol',

      // Acciones
      login: (authData) => set({
        token: authData.token,
        personId: authData.personId,
        email: authData.email,
        name: authData.name,
        schoolId: authData.schoolId,
        legacyPersonId: authData.legacyPersonId || null,
        legacyPassword: authData.legacyPassword || null,
        personInternalId: authData.personInternalId || null,
        status: authData.status || null,
        personType: authData.personType || null,
        personPhoto: authData.personPhoto || null,
        timeZone: authData.timeZone || null,
        lastLogin: authData.lastLogin || null,
        permisos: authData.permisos || [],
      }),

      logout: () => set({
        token: null,
        personId: null,
        email: null,
        name: null,
        schoolId: null,
        legacyPersonId: null,
        legacyPassword: null,
        personInternalId: null,
        status: null,
        personType: null,
        personPhoto: null,
        timeZone: null,
        lastLogin: null,
        permisos: [],
        legacyUrl: 'ISMeta/rol/showEdicionRol',
      }),
      
      setPermisos: (permisos) => set({ permisos }),
      setLegacyUrl: (url) => set({ legacyUrl: url }),
      
      // Utilidades
      isAuthenticated: () => {
        const state = get();
        return !!(state.token && state.personId);
      },
    }),
    {
      name: 'auth-storage', // localStorage key
    }
  )
);
