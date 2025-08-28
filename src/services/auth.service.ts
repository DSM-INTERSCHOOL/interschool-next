import axios from "axios";

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
  meta_data?: {
    duration?: number;
    sessionNumber?: number;
    idUsuario?: number;
    nombreEscuela?: string;
    originalSessionId?: string;
    sessionIdEncripted?: string;
    nombreUsuario?: string;
    permisos?: Permiso[];
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
    const response = await axios.post<LoginResponse>(
      'https://core-api.idsm.xyz/web-login',
      credentials,
      {
        headers: {
          'x-device-id': 'mobile-web-client',
          'Content-Type': 'application/json',
          'x-url-origin': 'https://admin.celta.interschool.mx'
        },
      }
    );

    console.log('response headres',response.headers)

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

export const getPermisos = async (): Promise<Permiso[]> => {
  try {
    const response = await axios.post<PermisosResponse>(
      'http://core-api.idsm.xyz:8090/web-login',
      {
        person_id: "DSM",
        password: "DATA2023+"
      },
      {
        headers: {
          'x-device-id': 'agent-postman',
          'x-url-origin': 'https://admin.celta.interschool.mx',
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Respuesta completa de la API:', response.data);
    console.log('Status de la respuesta:', response.data.status);
    console.log('Meta data:', response.data.meta_data);
    console.log('Permisos en meta_data:', response.data.meta_data?.permisos);
    console.log('Tipo de permisos:', typeof response.data.meta_data?.permisos);
    console.log('Es array:', Array.isArray(response.data.meta_data?.permisos));

    // Verificar que la respuesta sea exitosa
    const permisos = response.data.meta_data?.permisos;
    const status = response.data.status;
    
    if (permisos && Array.isArray(permisos)) {
      console.log('Permisos válidos encontrados, retornando:', permisos.length, 'permisos');
      return permisos;
    } else {
      console.error('Respuesta inválida - Status:', status, 'Permisos:', permisos);
      console.error('Estructura completa de la respuesta:', JSON.stringify(response.data, null, 2));
      throw new Error('Respuesta inválida del servidor');
    }
  } catch (error: any) {
    console.error('Error fetching permisos:', error);
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.status === 401) {
      throw new Error('No autorizado para obtener permisos');
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

export const logout = async (): Promise<void> => {
  // Implementar logout en el backend si es necesario
  console.log('Logout realizado');
};
