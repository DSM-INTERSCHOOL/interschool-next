import api from "./api";
import { 
  IAcademicYear, 
  IAcademicYearParams, 
  AcademicYearFilter 
} from "@/interfaces/IAcademicYear";

const SCHOOL_ID = process.env.NEXT_PUBLIC_SCHOOL_ID || "1000";

/**
 * Get academic years for a school
 * @param params - Query parameters for filtering academic years
 * @returns Promise<IAcademicYear[]> - Array of academic years
 */
export const getAcademicYears = async (
  params?: IAcademicYearParams
): Promise<IAcademicYear[]> => {
  try {
    // Always include date_filter_type=ACTUALES parameter
    const requestParams = {
      ...params,
      date_filter_type: "ACTUALES"
    };

    const response = await api.get(`/${SCHOOL_ID}/academic-years`, { params: requestParams });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching academic years:", error);
    throw new Error("Failed to fetch academic years");
  }
};

/**
 * Get currently active/vigent academic years
 * @returns Promise<IAcademicYear[]> - Array of active academic years
 */
export const getActiveAcademicYears = async (): Promise<IAcademicYear[]> => {
  return getAcademicYears({ academic_year: AcademicYearFilter.VIGENTES });
};

