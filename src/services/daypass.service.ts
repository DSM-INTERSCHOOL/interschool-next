import api from "./api";
import { IDaypass, IDaypassAuthorizer } from "@/interfaces/IDaypass";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { getOrgConfig } from "@/lib/orgConfig";
import { getDeviceId } from "@/lib/deviceId";

interface GetDaypassAuthorizersParams {
  schoolId: string;
  authorizerPersonId: string;
  status: string;
}

interface AuthorizeDaypassParams {
  daypassId: string;
  authorizerPersonId: string;
  dto: {
    action: string;
  };
}

interface AuthorizeDaypassResponse {
  success: boolean;
  message?: string;
}

export const getDaypassAuthorizers = async (params: GetDaypassAuthorizersParams): Promise<IDaypassAuthorizer[][]> => {
  try {
    const { authorizerPersonId, status } = params;
    const { portalName, schoolId } = getOrgConfig();

    // Usar la URL real del endpoint
    const response = await api.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/schools/${schoolId}/daypass-authorizers`, {
      params: {
        authorizer_person_id: authorizerPersonId,
        status
      },
      headers: {
        'x-device-id': getDeviceId(),
        'x-url-origin': portalName
      }
    });

    // La respuesta real es un array de IDaypassAuthorizer
    const authorizations: IDaypassAuthorizer[] = response.data;
    
    // Agrupar por daypass_id para mantener la estructura esperada
    return groupAuthorizationsByDaypass(authorizations);
  } catch (error) {
    console.error('Error fetching daypass authorizers:', error);
    
    // Extraer detalles del error del API
    let errorMessage = 'Error al cargar las autorizaciones';
    
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
          errorMessage = 'Datos de consulta inválidos';
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

export const authorizeDaypass = async (
  daypassId: number,
  personId: number,
  sequence: number,
  selectedOption: string,
  schoolId?: number
): Promise<any> => {
  try {
    const { schoolId, portalName } = getOrgConfig();

    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/schools/${schoolId}/daypasses/${daypassId}/authorizers/${personId}/sequences/${sequence}`,
      {
        authorized: true,
        selected_option: selectedOption
      },
      {
        headers: {
          'x-device-id': getDeviceId(),
          'x-url-origin': portalName,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error authorizing daypass:', error);
    
    let errorMessage = 'Error al autorizar la solicitud';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.status === 401) {
      errorMessage = 'No autorizado para realizar esta acción';
    } else if (error.response?.status === 404) {
      errorMessage = 'Solicitud no encontrada';
    } else if (error.response?.status >= 500) {
      errorMessage = 'Error del servidor al autorizar';
    } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      errorMessage = 'Error de conexión. Verifica tu conexión a internet';
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      errorMessage = 'La solicitud tardó demasiado. Intenta de nuevo';
    }
    
    throw new Error(errorMessage);
  }
};

// Función helper para agrupar autorizaciones por daypass_id
const groupAuthorizationsByDaypass = (authorizations: IDaypassAuthorizer[]): IDaypassAuthorizer[][] => {
  const grouped: Record<number, IDaypassAuthorizer[]> = {};
  
  authorizations.forEach(auth => {
    const daypassId = auth.daypass.id;
    if (!grouped[daypassId]) {
      grouped[daypassId] = [];
    }
    grouped[daypassId].push(auth);
  });
  
  return Object.values(grouped);
};


