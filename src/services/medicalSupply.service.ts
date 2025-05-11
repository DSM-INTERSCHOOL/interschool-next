import { IMedicalConsultationCategory } from "@/interfaces/IMedicalCategory";
import api from "./api";
import { IMedicalSupply } from "@/interfaces/IMedicalSupply";

export const findAll = async (
  schoolId: string,
  page?: number,
  per_page?: number
) => {
  const response = await api.get<IMedicalSupply[]>(
    `/${schoolId}/supplies?page=${page}&per_page=${per_page}`
  );
  return response.data;
};
