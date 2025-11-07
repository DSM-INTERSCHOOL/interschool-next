import axios from "axios";
import { getOrgConfig } from "@/lib/orgConfig";
import { getDeviceId } from "@/lib/deviceId";

interface LoginRequest {
  person_id: string;
  password: string;
}

interface LoginResponse {
  token: string;
  person_id: number;
  email: string;
  name: string;
  school_id: number;
  person_internal_id: string;
  status: string;
  person_type: string;
  person_photo: string;
  time_zone: string;
  last_login: string;
}

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
  [studentId: string]: string; // key: studentId, value: nombre completo del alumno
}

interface PermisosResponse {
  person_id?: number;
  person_internal_id?: string;
  token?: string;
  school_id?: number;
  given_name?: string;
  paternal_name?: string;
  maternal_name?: string;
  email?: string;
  status?: string;
  last_login?: string;
  time_zone?: string;
  person_type?: string;
  profile_picture_url?: string | null;
  academic_year?: number | null;
  academic_stage_id?: number | null;
  cookies?: string[];
  meta_data?: {
    duration?: number;
    sessionNumber?: number;
    idUsuario?: number;
    nombreEscuela?: string;
    originalSessionId?: string;
    sessionIdEncripted?: string;
    nombreUsuario?: string;
    permisos?: Permiso[];
    alumnos?: AlumnoInfo[];
    status?: string; // 'seleccion_alumno' indica que debe elegir alumno
    baseUrl?: string;
  };
  // Campos adicionales que podrían estar presentes
  [key: string]: any;
}

interface AuthError {
  message: string;
  status?: number;
}

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const { schoolId, portalName } = getOrgConfig();

    const response = await axios.post<LoginResponse>(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/schools/${schoolId}/app-login`,
      credentials,
      {
        headers: {
          'x-device-id': getDeviceId(),
          'Content-Type': 'application/json',
          'x-url-origin': portalName
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Credenciales inválidas');
    } else if (error.response?.status >= 500) {
      throw new Error('Hubo un problema. Intenta más tarde');
    } else {
      throw new Error('Error al iniciar sesión');
    }
  }
};

export const getPermisos = async (credentials: LoginRequest): Promise<PermisosResponse> => {
  try {
    const { portalName } = getOrgConfig();

    const response = await axios.post<PermisosResponse>(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/web-login`,
      {
        person_id: credentials.person_id,
        password: credentials.password
      },
      {
        headers: {
          'x-device-id': getDeviceId(),
          'x-url-origin': portalName,
          'Content-Type': 'application/json',
        },
      }
    );


    const cookies = response.data.cookies;
    if (cookies && Array.isArray(cookies)) {
      for (let cookie of cookies) {
        document.cookie = cookie
      }
    }




    console.log('Respuesta completa de la API:', response.data);


    // Verificar que la respuesta sea exitosa
    const permisos = response.data.meta_data?.permisos;
    const status = response.data.status;
    return response.data;
 
  } catch (error: any) {
    console.error('Error fetching permisos:', error);

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.status === 401) {
      throw new Error('Credenciales inválidas');
    } else if (error.response?.status >= 500) {
      throw new Error('Error del servidor al obtener permisos');
    } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      throw new Error('Error de conexión. Verifica tu conexión a internet');
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new Error('La solicitud tardó demasiado. Intenta de nuevo');
    } else {
      throw new Error('Error al obtener permisos');
    }
  }
};

export const getStudentPermissions = async (
  studentId: string,
  token: string,
  legacyUrl: string
): Promise<PermisosResponse> => {
  try {
    const { schoolId, portalName } = getOrgConfig();

    const response = await axios.post<PermisosResponse>(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/schools/${schoolId}/student-permissions`,
      {
        person_id: studentId,
        legacy_url: legacyUrl
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-device-id': getDeviceId(),
          'x-url-origin': portalName,
          'Content-Type': 'application/json',
        },
      }
    );

    const cookies = response.data.cookies;
    if (cookies && Array.isArray(cookies)) {
      for (let cookie of cookies) {
        document.cookie = cookie
      }
    }

    console.log('Permisos del estudiante obtenidos:', response.data);

    return response.data;
  } catch (error: any) {
    console.error('Error fetching student permissions:', error);

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.status === 401) {
      throw new Error('No autorizado para obtener permisos del estudiante');
    } else if (error.response?.status >= 500) {
      throw new Error('Error del servidor al obtener permisos del estudiante');
    } else {
      throw new Error('Error al obtener permisos del estudiante');
    }
  }
};

export const logout = async (): Promise<void> => {
  // Implementar logout en el backend si es necesario
  console.log('Logout realizado');
};

// Exportar tipos para uso en otros archivos
export type { PermisosResponse, Permiso, AlumnoInfo };
