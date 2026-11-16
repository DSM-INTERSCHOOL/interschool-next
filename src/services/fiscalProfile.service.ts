import commerceApi from "./commerceApi";
import {
  FiscalProfileCertificatesUpload,
  FiscalProfileCreate,
  FiscalProfileFelCredentialsUpdate,
  FiscalProfileFolioRead,
  FiscalProfileFolioSet,
  FiscalProfileRead,
  FiscalProfileUpdate,
} from "@/interfaces/IFiscalProfile";

interface ServiceArgs {
  schoolId: string | number | null;
}

// 404s (via the shared error-handling path) when the school hasn't set
// this up yet -- the caller is expected to catch that and show a
// "not configured" state rather than treat it as a load failure.
export const getFiscalProfile = async ({ schoolId }: ServiceArgs): Promise<FiscalProfileRead> => {
  const response = await commerceApi.get<FiscalProfileRead>(`/schools/${schoolId}/fiscal-profile`);
  return response.data;
};

export const createFiscalProfile = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: FiscalProfileCreate }): Promise<FiscalProfileRead> => {
  const response = await commerceApi.post<FiscalProfileRead>(`/schools/${schoolId}/fiscal-profile`, dto);
  return response.data;
};

export const updateFiscalProfile = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: FiscalProfileUpdate }): Promise<FiscalProfileRead> => {
  const response = await commerceApi.put<FiscalProfileRead>(`/schools/${schoolId}/fiscal-profile`, dto);
  return response.data;
};

export const uploadFiscalProfileCertificates = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: FiscalProfileCertificatesUpload }): Promise<FiscalProfileRead> => {
  const response = await commerceApi.post<FiscalProfileRead>(
    `/schools/${schoolId}/fiscal-profile/certificates`,
    dto
  );
  return response.data;
};

export const updateFiscalProfileFelCredentials = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: FiscalProfileFelCredentialsUpdate }): Promise<FiscalProfileRead> => {
  const response = await commerceApi.post<FiscalProfileRead>(
    `/schools/${schoolId}/fiscal-profile/fel-credentials`,
    dto
  );
  return response.data;
};

// The only way to fix a typo'd RFC (immutable once set) -- scraps the whole
// profile so it can be recreated from scratch. The backend blocks this once
// any CFDI has been stamped for the school.
export const deleteFiscalProfile = async ({ schoolId }: ServiceArgs): Promise<void> => {
  await commerceApi.delete(`/schools/${schoolId}/fiscal-profile`);
};

export const getFiscalProfileFolios = async ({ schoolId }: ServiceArgs): Promise<FiscalProfileFolioRead[]> => {
  const response = await commerceApi.get<FiscalProfileFolioRead[]>(`/schools/${schoolId}/fiscal-profile/folios`);
  return response.data;
};

export const setFiscalProfileFolio = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: FiscalProfileFolioSet }): Promise<FiscalProfileFolioRead[]> => {
  const response = await commerceApi.post<FiscalProfileFolioRead[]>(
    `/schools/${schoolId}/fiscal-profile/folios`,
    dto
  );
  return response.data;
};
