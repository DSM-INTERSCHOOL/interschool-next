import { IMedicalConsultationCategory } from "@/interfaces/IMedicalCategory";
import api from "./api";

export const findAll = async (
  schoolId: string,
  page?: number,
  per_page?: number
) => {
  const response = await api.get<IMedicalConsultationCategory[]>(
    `/${schoolId}/categories?page=${page}&per_page=${per_page}`
  );
  return response.data;
};


export const findAllSubCategories = async (
  schoolId: string,
  page?: number,
  per_page?: number
) => {
  const response = await api.get<IMedicalConsultationCategory[]>(
    `/${schoolId}/sub-categories?page=${page}&per_page=${per_page}`
  );
  return response.data;
};
