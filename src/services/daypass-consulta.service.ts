/**
 * Servicio para consulta de Pases de Salida
 * 
 * Este servicio proporciona funcionalidades para consultar y filtrar pases de salida
 * con diferentes parámetros como fecha, estado, persona, etc.
 * 
 * Endpoint: GET /schools/{school_id}/daypasses
 * 
 * Ejemplo de uso:
 * ```typescript
 * const result = await getDaypassesConsulta({
 *   page: 1,
 *   limit: 10,
 *   status: 'pendiente',
 *   date_from: '2024-01-01',
 *   date_to: '2024-12-31'
 * });
 * ```
 */

import api from "./api";
import { useAuthStore } from "@/store/useAuthStore";
import { getOrgConfig } from "@/lib/orgConfig";
import { getDeviceId } from "@/lib/deviceId";

// Interfaz para el autorizador dentro de authorizers
export interface IDaypassAuthorizer {
  authorizer_person_id: number;
  authorized: boolean;
  authorized_at: string | null;
  authorization_sequence: number;
  authorized_by: string | null;
  note: string | null;
  daypass_id: number;
  created_at: string;
  authorizer: {
    school_id: number;
    id: number;
    type: string;
    person_internal_id: string;
    given_name: string;
    paternal_name: string;
    maternal_name: string;
    display_name: string | null;
    legal_name: string | null;
    email: string;
  };
}

// Interfaz para la persona (estudiante)
export interface IDaypassPerson {
  school_id: number;
  id: number;
  type: string;
  person_internal_id: string;
  given_name: string;
  paternal_name: string;
  maternal_name: string;
  display_name: string | null;
  legal_name: string | null;
  email: string;
}

// Interfaz para información académica
export interface IAcademicInfo {
  id: number;
  key: string;
  description: string;
  label?: string;
}

// Interfaz para la respuesta de consulta de daypasses (estructura real)
export interface IDaypassConsulta {
  school_id: number;
  guardian_person_id: number;
  student_person_id: number;
  reason: string;
  status: string;
  authorized_at: string | null;
  academic_stage_id: number;
  daypass_date: string;
  daypass_time: string;
  id: number;
  created: string;
  modified: string;
  pickup_person: string | null;
  authorizers: IDaypassAuthorizer[];
  person: IDaypassPerson;
  relative: IDaypassPerson;
  academic_year?: IAcademicInfo | null;
  academic_stage?: IAcademicInfo | null;
  academic_program?: IAcademicInfo | null;
  academic_modality?: IAcademicInfo | null;
  program_year?: IAcademicInfo | null;
  academic_group?: IAcademicInfo | null;
}

// Interfaz para los parámetros de consulta
export interface GetDaypassesConsultaParams {
  schoolId?: string;
  skip?: number;
  limit?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  person_id?: string;
  relative_id?: string;
}

// Interfaz para la respuesta (array directo, sin paginación)
export interface DaypassesConsultaResponse {
  data: IDaypassConsulta[];
  total: number;
}

export const getDaypassesConsulta = async (params: GetDaypassesConsultaParams = {}): Promise<DaypassesConsultaResponse> => {
  try {
    const {
      skip = 0,
      limit = 10,
      status,
      date_from,
      date_to,
      person_id,
      relative_id
    } = params;

    // Construir los parámetros de consulta con paginación
    const queryParams: any = {
      filter_by_user_access_scope: true,
      skip,
      limit
    };

    // Agregar filtros opcionales
    if (status) queryParams.status = status;
    if (date_from) queryParams.date_from = date_from;
    if (date_to) queryParams.date_to = date_to;
    if (person_id) queryParams.person_id = person_id;
    if (relative_id) queryParams.relative_id = relative_id;

    // Obtener el token del store
    const token = useAuthStore.getState().token;
    const { portalName, schoolId } = getOrgConfig();

    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const response = await api.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/schools/${schoolId}/daypasses`, {
      params: queryParams,
      headers: {
        'x-device-id': getDeviceId(),
        'x-url-origin': portalName,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Si la respuesta es exitosa, retornar los datos
    if (response.status === 200) {
      // La respuesta es un array directo de daypasses
      const daypasses = Array.isArray(response.data) ? response.data : [];
      
      return {
        data: daypasses,
        total: daypasses.length
      };
    }

    throw new Error('Error al obtener los datos de daypasses');

  } catch (error: any) {
    console.error('Error fetching daypasses consulta:', error);
    
    // Extraer detalles del error del API
    let errorMessage = 'Error al cargar las consultas de pases de salida';
    
    if (error.response?.data) {
      // Si el API devuelve un mensaje específico, usarlo
      if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.detail) {
        errorMessage = error.response.data.detail;
      }
    } else if (error.response?.status) {
      // Si no hay mensaje específico, usar códigos de estado
      switch (error.response.status) {
        case 401:
          errorMessage = 'No tienes permisos para acceder a esta información';
          break;
        case 403:
          errorMessage = 'Acceso denegado';
          break;
        case 404:
          errorMessage = 'No se encontraron pases de salida';
          break;
        case 422:
          errorMessage = 'Parámetros de consulta inválidos';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = `Error del servidor (${error.response.status})`;
      }
    } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      errorMessage = 'Error de conexión. Verifica tu conexión a internet';
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      errorMessage = 'La solicitud tardó demasiado. Intenta de nuevo';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

// Función helper para formatear fechas
export const formatDateForAPI = (date: Date): string => {
  return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
};

// Función helper para validar parámetros
export const validateConsultaParams = (params: GetDaypassesConsultaParams): string[] => {
  const errors: string[] = [];
  
  if (params.date_from && params.date_to) {
    const fromDate = new Date(params.date_from);
    const toDate = new Date(params.date_to);
    
    if (fromDate > toDate) {
      errors.push('La fecha de inicio no puede ser mayor a la fecha de fin');
    }
  }
  
  if (params.limit && (params.limit < 1 || params.limit > 100)) {
    errors.push('El límite debe estar entre 1 y 100');
  }

  if (params.skip !== undefined && params.skip < 0) {
    errors.push('El skip debe ser mayor o igual a 0');
  }

  return errors;
};
