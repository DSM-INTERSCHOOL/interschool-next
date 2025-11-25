import api from "./api";

export interface SubjectEnrollment {
  enrollment_id: string;
  subject_id: string;
  subject_name: string;
  enrollment_type: string;
  enrollment_date: string;
  curriculum_id: string;
  created: string;
  modified: string;
  created_by: string;
  last_modified_by: string;
  school_id: number;
  campus_id: number;
  person_id: number;
  academic_year_id: number;
  academic_stage_id: number;
  academic_program_id: number;
  academic_modality_id: number | null;
  program_year_id: number;
  academic_group_id: number;
  person_internal_id: string;
  person_type: string;
  legacy_person_id: string;
  given_name: string;
  paternal_name: string;
  maternal_name: string;
  display_name: string | null;
  legal_name: string | null;
  email: string;
  date_of_birth: string;
  full_name: string;
  academic_year_key: string;
  academic_year_description: string;
  academic_stage_key: string;
  academic_stage_description: string;
  academic_program_key: string;
  academic_program_description: string;
  academic_modality_key: string | null;
  academic_modality_description: string | null;
  program_year_key: string;
  program_year_description: string;
  academic_group_key: string;
  academic_group_label: string;
}

export interface GetDistinctEnrollmentsParams {
  academic_years?: number | number[];
  person_ids?: number | number[];
}

export interface GetSubjectEnrollmentsParams {
  academic_years?: number | number[];
  subject_ids?: string | string[];
}

export const subjectEnrollmentService = {
  /**
   * Get subject enrollments (students enrolled by teacher)
   * Returns the students that a teacher teaches
   * @param schoolId - School ID
   * @param params - Query parameters (academic_years, subject_ids)
   * @returns Promise with subject enrollments
   */
  getSubjectEnrollments: async (
    schoolId: string | number,
    params: GetSubjectEnrollmentsParams
  ): Promise<SubjectEnrollment[]> => {
    const queryParams = new URLSearchParams();

    if (params.academic_years) {
      const years = Array.isArray(params.academic_years)
        ? params.academic_years
        : [params.academic_years];
      queryParams.append("academic_years", years.join(","));
    }

    if (params.subject_ids) {
      const subjectIds = Array.isArray(params.subject_ids)
        ? params.subject_ids
        : [params.subject_ids];
      queryParams.append("subject_ids", subjectIds.join(","));
    }

    const response = await api.get(
      `/${schoolId}/subject-enrollments?${queryParams.toString()}`
    );

    return response.data;
  },

  /**
   * Get distinct subject enrollments for teachers
   * Returns the subjects taught by a teacher
   * @param schoolId - School ID
   * @param params - Query parameters (academic_years, person_ids)
   * @returns Promise with subject enrollments
   */
  getDistinctEnrollments: async (
    schoolId: string | number,
    params: GetDistinctEnrollmentsParams
  ): Promise<SubjectEnrollment[]> => {
    const queryParams = new URLSearchParams();

    // Para arrays, agregar cada valor como un parámetro separado
    if (params.academic_years) {
      const years = Array.isArray(params.academic_years)
        ? params.academic_years
        : [params.academic_years];
      years.forEach(year => queryParams.append("academic_years", year.toString()));
    }

    if (params.person_ids) {
      const personIds = Array.isArray(params.person_ids)
        ? params.person_ids
        : [params.person_ids];
      personIds.forEach(id => queryParams.append("person_ids", id.toString()));
    }

    const response = await api.get(
      `/${schoolId}/subject-enrollments/distinct-enrollments?${queryParams.toString()}`
    );

    return response.data;
  },
};
