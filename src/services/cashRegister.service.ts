import commerceApi from "./commerceApi";
import {
  AbrirCajaRequest,
  CashRegisterSessionRead,
  CashRegisterSessionSummary,
  CerrarCajaRequest,
  RetiroCajaRequest,
} from "@/interfaces/ICashRegister";

interface ServiceArgs {
  schoolId: string | number | null;
}

// Opens a cash-register session for the caller's own terminal (x-device-id,
// attached automatically by commerceApi) -- fails if that terminal already
// has one open.
export const abrirCaja = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: AbrirCajaRequest }): Promise<CashRegisterSessionRead> => {
  const response = await commerceApi.post<CashRegisterSessionRead>(`/schools/${schoolId}/cash-register/open`, dto);
  return response.data;
};

// null when the caller's terminal has no open session.
export const getCajaActual = async ({ schoolId }: ServiceArgs): Promise<CashRegisterSessionRead | null> => {
  const response = await commerceApi.get<CashRegisterSessionRead | null>(`/schools/${schoolId}/cash-register/current`);
  return response.data;
};

export const getResumenCajaActual = async ({ schoolId }: ServiceArgs): Promise<CashRegisterSessionSummary> => {
  const response = await commerceApi.get<CashRegisterSessionSummary>(
    `/schools/${schoolId}/cash-register/current/summary`
  );
  return response.data;
};

export const retirarCaja = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: RetiroCajaRequest }): Promise<CashRegisterSessionSummary> => {
  const response = await commerceApi.post<CashRegisterSessionSummary>(
    `/schools/${schoolId}/cash-register/withdraw`,
    dto
  );
  return response.data;
};

export const cerrarCaja = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: CerrarCajaRequest }): Promise<CashRegisterSessionSummary> => {
  const response = await commerceApi.post<CashRegisterSessionSummary>(`/schools/${schoolId}/cash-register/close`, dto);
  return response.data;
};

export const getCajaSessions = async ({
  schoolId,
  filters,
}: ServiceArgs & { filters?: string }): Promise<CashRegisterSessionRead[]> => {
  const params = new URLSearchParams();
  if (filters) params.append("filters", filters);
  const response = await commerceApi.get<CashRegisterSessionRead[]>(
    `/schools/${schoolId}/cash-register/sessions?${params.toString()}`
  );
  return response.data;
};

export const getCajaSessionSummary = async ({
  schoolId,
  sessionId,
}: ServiceArgs & { sessionId: number }): Promise<CashRegisterSessionSummary> => {
  const response = await commerceApi.get<CashRegisterSessionSummary>(
    `/schools/${schoolId}/cash-register/sessions/${sessionId}/summary`
  );
  return response.data;
};
