import { IGroupEnrollment } from "@/interfaces/IGroupEnrollment";
import api from "./api";
import { IMedicalRecord } from "@/interfaces/IMedicalRecord";
import { ICreateMedicalConsultationDto } from "@/interfaces/DTOs/ICreateMedicalConsultationDto";

interface ServiceArgs {
  schoolId: string;
  person_id: string;
  page?: number;
  per_page?: number;
}

interface CreateArgs {
  schoolId: string;
  dto: ICreateMedicalConsultationDto;
}

interface UpdateArgs {
  schoolId: string;
  id: number;
  dto: ICreateMedicalConsultationDto;
}

export const findByPerson = async ({
  schoolId,
  person_id,
  page = 1,
  per_page = 1000,
}: ServiceArgs) => {
  const response = await api.get<[]>(
    `/${schoolId}/persons/${person_id}/consultations?page=${page}&per_page=${per_page}`
  );
  return response.data;
};
export const findGroupEnrollment = async ({
  schoolId,
  person_id,
  page = 1,
  per_page = 1000,
}: ServiceArgs) => {
  const response = await api.get<IGroupEnrollment[]>(
    `/${schoolId}/persons/${person_id}/group-enrollments?page=${page}&per_page=${per_page}`
  );
  return response.data[0];
};

export const findMedicalRecord = async ({
  schoolId,
  person_id,
  page = 1,
  per_page = 1000,
}: ServiceArgs) => {
  const response = await api.get<IMedicalRecord>(
    `/${schoolId}/medical-records/${person_id}?page=${page}&per_page=${per_page}`
  );
  return response.data;
};

export const create = async ({ schoolId, dto }: CreateArgs) => {
  const response = await api.post<IMedicalRecord>(
    `/${schoolId}/consultations`,
    dto
  );
  return response.data;
};

export const update = async ({ schoolId, id, dto }: UpdateArgs) => {
  const response = await api.patch<IMedicalRecord>(
    `/${schoolId}/consultations/${id}`,
    dto
  );
  return response.data;
};
