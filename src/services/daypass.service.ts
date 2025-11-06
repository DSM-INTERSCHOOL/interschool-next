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
    const { schoolId, authorizerPersonId, status } = params;
    const { portalName } = getOrgConfig();

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
    const { schoolId: configSchoolId, portalName } = getOrgConfig();
    const finalSchoolId = schoolId || configSchoolId;

    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/schools/${finalSchoolId}/daypasses/${daypassId}/authorizers/${personId}/sequences/${sequence}`,
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

// Función para generar datos mock (mantener para desarrollo/testing)
export const createMockAuthorizations = (): IDaypassAuthorizer[][] => {
  const mockAuthorizations: IDaypassAuthorizer[] = [
    {
      daypass: {
        id: 1,
        school_id: 1000,
        guardian_person_id: 2,
        student_person_id: 1,
        reason: "Pase de Salida con authorizer",
        status: "PENDIENTE",
        created: "2025-08-04T06:30:00Z",
        modified: "2025-08-04T06:30:00Z",
        authorized_at: null,
        daypass_date: "2025-08-04",
        daypass_time: "06:30:00",
        academic_stage_id: 199,
        person: {
          id: 1,
          school_id: 1000,
          type: "STUDENT",
          given_name: "PAOLA SOFIA",
          paternal_name: "CANSECO",
          maternal_name: "PAOLA SOFIA",
          person_internal_id: "5210006",
          display_name: null,
          legal_name: null,
          email: "estudiante@example.com"
        },
        relative: {
          id: 2,
          school_id: 1000,
          type: "RELATIVE",
          given_name: "PAOLA",
          paternal_name: "HERNANDEZ",
          maternal_name: "PAOLA",
          person_internal_id: "REL001",
          display_name: null,
          legal_name: null,
          email: "familiar@example.com"
        }
      },
      authorizer: {
        id: 4487,
        school_id: 1000,
        type: "AUTHORIZER",
        given_name: "Autorizador",
        paternal_name: "Test",
        maternal_name: "",
        person_internal_id: "AUTH001",
        display_name: null,
        legal_name: null,
        email: "autorizador@example.com"
      },
      daypass_config: {
        id: 1,
        school_id: 1000,
        academic_stage_id: 199,
        authorization_sequence: {
          "0": {
            options: {
              "CC": {
                action: "AUTHORIZE_AND_FORWARD",
                description: "Salida por Cilindro Central",
                next_sequence: 1,
                next_authorizer_id: 4487
              },
              "KI": {
                action: "AUTHORIZE_AND_CLOSE",
                description: "Salida por Kinder"
              }
            },
            description: "Recepción Asistente de Dirección",
            person_authorizer_id: 4487
          },
          "1": {
            options: {
              "VIG": {
                action: "AUTHORIZE_AND_FORWARD",
                description: "Salida por Vigilancia",
                next_sequence: 2,
                next_authorizer_id: 4487
              }
            },
            description: "Autorización Recepción",
            person_authorizer_id: 1544
          },
          "2": {
            options: {
              "VIG": {
                action: "AUTHORIZE_AND_CLOSE",
                description: "Salida por Vigilancia"
              }
            },
            description: "Autorización Vigilancia",
            person_authorizer_id: 4487
          }
        }
      },
      authorization_sequence: 0
    },
    {
      daypass: {
        id: 2,
        school_id: 1000,
        guardian_person_id: 4,
        student_person_id: 3,
        reason: "Initial authorizer",
        status: "PENDIENTE",
        created: "2025-08-04T06:41:00Z",
        modified: "2025-08-04T06:41:00Z",
        authorized_at: null,
        daypass_date: "2025-08-04",
        daypass_time: "06:41:00",
        academic_stage_id: 199,
        person: {
          id: 3,
          school_id: 1000,
          type: "STUDENT",
          given_name: "PAOLA SOFIA",
          paternal_name: "CANSECO",
          maternal_name: "PAOLA SOFIA",
          person_internal_id: "5210005",
          display_name: null,
          legal_name: null,
          email: "estudiante2@example.com"
        },
        relative: {
          id: 4,
          school_id: 1000,
          type: "RELATIVE",
          given_name: "PAOLA",
          paternal_name: "HERNANDEZ",
          maternal_name: "PAOLA",
          person_internal_id: "REL002",
          display_name: null,
          legal_name: null,
          email: "familiar2@example.com"
        }
      },
      authorizer: {
        id: 4487,
        school_id: 1000,
        type: "AUTHORIZER",
        given_name: "Autorizador",
        paternal_name: "Test",
        maternal_name: "",
        person_internal_id: "AUTH001",
        display_name: null,
        legal_name: null,
        email: "autorizador@example.com"
      },
      daypass_config: {
        id: 1,
        school_id: 1000,
        academic_stage_id: 199,
        authorization_sequence: {
          "0": {
            options: {
              "CC": {
                action: "AUTHORIZE_AND_FORWARD",
                description: "Salida por Cilindro Central",
                next_sequence: 1,
                next_authorizer_id: 4487
              },
              "KI": {
                action: "AUTHORIZE_AND_CLOSE",
                description: "Salida por Kinder"
              }
            },
            description: "Recepción Asistente de Dirección",
            person_authorizer_id: 4487
          },
          "1": {
            options: {
              "VIG": {
                action: "AUTHORIZE_AND_FORWARD",
                description: "Salida por Vigilancia",
                next_sequence: 2,
                next_authorizer_id: 4487
              }
            },
            description: "Autorización Recepción",
            person_authorizer_id: 1544
          },
          "2": {
            options: {
              "VIG": {
                action: "AUTHORIZE_AND_CLOSE",
                description: "Salida por Vigilancia"
              }
            },
            description: "Autorización Vigilancia",
            person_authorizer_id: 4487
          }
        }
      },
      authorization_sequence: 0
    }
  ];

  return groupAuthorizationsByDaypass(mockAuthorizations);
};
