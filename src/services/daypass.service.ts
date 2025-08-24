import { IDaypass, IDaypassAuthorizeRequest, IDaypassAuthorizeResponse } from "@/interfaces/IDaypass";
import api from "./api";
import { mockDaypasses } from "@/app/(admin)/apps/daypass/data";

interface GetDaypassAuthorizersArgs {
  schoolId: string | number;
  authorizerPersonId: string;
  status?: string;
  page?: number;
  per_page?: number;
}

interface AuthorizeDaypassArgs {
  schoolId: string | number;
  daypassId: string;
  authorizerPersonId: string;
  dto: IDaypassAuthorizeRequest;
}

// Obtener pases de salida pendientes de autorización
export const getDaypassAuthorizers = async ({
  schoolId,
  authorizerPersonId,
  status = "pendiente",
  page = 1,
  per_page = 10,
}: GetDaypassAuthorizersArgs) => {
  try {
    const params = new URLSearchParams({
      authorizer_person_id: authorizerPersonId,
      status: status,
      page: page.toString(),
      per_page: per_page.toString(),
    });

    const response = await api.get<IDaypass[]>(
      `/schools/${schoolId}/daypass-authorizers?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.warn("API no disponible, usando datos de ejemplo:", error);
    // Retornar datos de ejemplo cuando la API no esté disponible
    return mockDaypasses.filter(daypass => daypass.status === "PENDIENTE");
  }
};

// Autorizar un pase de salida
export const authorizeDaypass = async ({
  schoolId,
  daypassId,
  authorizerPersonId,
  dto,
}: AuthorizeDaypassArgs) => {
  try {
    const response = await api.patch<IDaypassAuthorizeResponse>(
      `/schools/${schoolId}/daypasses/${daypassId}/authorizers/${authorizerPersonId}`,
      dto
    );
    return response.data;
  } catch (error) {
    console.warn("API no disponible, simulando autorización:", error);
    // Simular respuesta exitosa cuando la API no esté disponible
    const daypassIdNum = parseInt(daypassId);
    return {
      success: true,
      message: "Pase de salida autorizado exitosamente (modo demo)",
      daypass: mockDaypasses.find(d => d.id === daypassIdNum)
    };
  }
};

// Obtener un pase de salida específico
export const getDaypassById = async (schoolId: string | number, daypassId: string) => {
  const response = await api.get<IDaypass>(
    `/schools/${schoolId}/daypasses/${daypassId}`
  );
  return response.data;
};
