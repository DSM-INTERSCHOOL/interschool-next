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

interface AlumnoInfo {
  [studentId: string]: string;
}

interface StudentSelectionData {
  person_id?: number;
  person_internal_id?: string;
  token?: string;
  school_id?: number;
  given_name?: string;
  paternal_name?: string;
  maternal_name?: string;
  email?: string;
  status?: string;
  person_type?: string;
  meta_data?: {
    alumnos?: AlumnoInfo[];
    status?: string;
    nombreEscuela?: string;
    baseUrl?: string;
  };
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

  // Caso especial: selección de alumno
  studentSelectionData: StudentSelectionData | null;
  selectedStudentId: string | null;

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
  setAuthData: (authData: any) => void;
  setStudentSelectionData: (data: StudentSelectionData) => void;
  clearStudentSelection: () => void;
  setSelectedStudentId: (studentId: string) => void;

  // Utilidades
  isAuthenticated: () => boolean;
  requiresStudentSelection: () => boolean;
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
      studentSelectionData: null,
      selectedStudentId: null,

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
        studentSelectionData: null,
        selectedStudentId: null,
      }),

      setPermisos: (permisos) => set({ permisos }),
      setLegacyUrl: (url) => set({ legacyUrl: url }),

      setAuthData: (authData) => {
        // Mantener el token y datos básicos del padre si no vienen en la respuesta
        const currentState = get();
        const existingToken = currentState.token;
        const existingPersonId = currentState.personId;

        const fullName = [
          authData.given_name,
          authData.paternal_name,
          authData.maternal_name
        ].filter(Boolean).join(' ') || currentState.name || 'Usuario';

        set({
          // Si no hay token en authData, mantener el token existente (caso de student permissions)
          token: authData.token || existingToken,
          // Si no hay person_id, mantener el existente
          personId: authData.person_id || existingPersonId,
          email: authData.email || currentState.email,
          name: fullName,
          schoolId: authData.school_id || currentState.schoolId,
          personInternalId: authData.person_internal_id || currentState.personInternalId,
          status: authData.status || currentState.status,
          personType: authData.person_type || currentState.personType,
          personPhoto: authData.person_photo || currentState.personPhoto,
          timeZone: authData.time_zone || currentState.timeZone,
          lastLogin: authData.last_login || currentState.lastLogin,
          // Los permisos vienen en diferentes estructuras según el endpoint
          permisos: authData.meta_data?.permisos || authData.permisos || [],
          // Limpiar datos de selección de alumno cuando se completa la autenticación
          studentSelectionData: null,
          selectedStudentId: null,
        });
      },

      setStudentSelectionData: (data) => set({
        studentSelectionData: data
      }),

      clearStudentSelection: () => set({
        studentSelectionData: null,
        selectedStudentId: null
      }),

      setSelectedStudentId: (studentId) => set({
        selectedStudentId: studentId
      }),

      // Utilidades
      isAuthenticated: () => {
        const state = get();
        return !!(state.token && state.personId);
      },

      requiresStudentSelection: () => {
        const state = get();
        return !!(
          state.studentSelectionData &&
          state.studentSelectionData.meta_data?.status === 'seleccion_alumno' &&
          !state.selectedStudentId
        );
      },
    }),
    {
      name: 'auth-storage', // localStorage key
    }
  )
);
