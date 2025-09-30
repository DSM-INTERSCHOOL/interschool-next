import { IMedicalConsultationCategory } from "@/interfaces/IMedicalCategory";
import api from "./api";
import { IMedicalSupply } from "@/interfaces/IMedicalSupply";
import { IPersonResponse } from "@/interfaces/IPerson";
import axios from "axios";

export const findAll = async (
  schoolId: string,
  page?: number,
  per_page?: number
) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_COURSE_URL?.replace('/schools', '') || '';
  const response = await axios.get<IPersonResponse>(
    `${baseUrl}/schools/${schoolId}/persons?filters=person_type:eq:STUDENT&order_by=second_name`
  );
  return response.data.data;
};
