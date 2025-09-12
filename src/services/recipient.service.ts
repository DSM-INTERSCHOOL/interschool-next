import api from "./api";
import { 
  IRecipient, 
  IRecipientRequest,
  IRecipientParams, 
  PersonType,
  IRecipientDisplay,
  IRecipientFilters,
  IRecipientGrouped,
  IEnrollmentFilters 
} from "@/interfaces/IRecipient";

const SCHOOL_ID = process.env.NEXT_PUBLIC_SCHOOL_ID || "1000";

/**
 * Build enrollment filters JSON string
 * @param filters - Enrollment filters object
 * @returns JSON string or undefined if no filters
 */
const buildEnrollmentFilters = (filters: IEnrollmentFilters): string | undefined => {
  // Only include filters that have values
  const activeFilters: IEnrollmentFilters = {};
  
  if (filters.academic_years && filters.academic_years.length > 0) {
    activeFilters.academic_years = filters.academic_years;
  }
  if (filters.academic_stages && filters.academic_stages.length > 0) {
    activeFilters.academic_stages = filters.academic_stages;
  }
  if (filters.academic_programs && filters.academic_programs.length > 0) {
    activeFilters.academic_programs = filters.academic_programs;
  }
  if (filters.academic_modalities && filters.academic_modalities.length > 0) {
    activeFilters.academic_modalities = filters.academic_modalities;
  }
  if (filters.program_years && filters.program_years.length > 0) {
    activeFilters.program_years = filters.program_years;
  }
  if (filters.academic_groups && filters.academic_groups.length > 0) {
    activeFilters.academic_groups = filters.academic_groups;
  }
  
  // Return JSON string if we have any filters, undefined otherwise
  return Object.keys(activeFilters).length > 0 ? JSON.stringify(activeFilters) : undefined;
};

/**
 * Get recipients for a school with filters
 * @param params - Query parameters for filtering recipients
 * @param requestBody - Request body with academic filters
 * @returns Promise<IRecipient[]> - Array of recipients
 */
export const getRecipients = async (
  params?: IRecipientParams,
  requestBody?: IRecipientRequest
): Promise<IRecipient[]> => {
  try {
    const response = await api.request({
      method: 'GET',
      url: `/${SCHOOL_ID}/recipients`,
      params,
      data: requestBody
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching recipients:", error);
    throw new Error("Failed to fetch recipients");
  }
};

/**
 * Get recipients by person types
 * @param personTypes - Array of person types to filter by
 * @returns Promise<IRecipient[]> - Array of recipients for specified types
 */
export const getRecipientsByPersonTypes = async (
  personTypes: PersonType[]
): Promise<IRecipient[]> => {
  try {
    if (personTypes.length === 0) {
      return [];
    }

    const personTypesParam = personTypes.join(',');
    
    const response = await api.request({
      method: 'GET',
      url: `/${SCHOOL_ID}/recipients`,
      params: { person_types: personTypesParam }
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching recipients by person types:", error);
    throw new Error("Failed to fetch recipients by person types");
  }
};

/**
 * Get recipients with academic filters (legacy method - keeping for compatibility)
 * @param personTypes - Array of person types
 * @param academicFilters - Academic year, stage, program, etc. filters
 * @returns Promise<IRecipient[]> - Array of filtered recipients
 */
export const getRecipientsWithAcademicFilters = async (
  personTypes: PersonType[],
  academicFilters: {
    academic_years?: number[];
    academic_stages?: number[];
    academic_programs?: number[];
    program_years?: number[];
    academic_groups?: number[];
  }
): Promise<IRecipient[]> => {
  // Use the new enrollment filters method
  return getRecipientsWithEnrollmentFilters(personTypes, academicFilters);
};

/**
 * Get recipients with enrollment filters (new improved method)
 * @param personTypes - Array of person types
 * @param academicFilters - Academic year, stage, program, etc. filters
 * @returns Promise<IRecipient[]> - Array of filtered recipients
 */
export const getRecipientsWithEnrollmentFilters = async (
  personTypes: PersonType[],
  academicFilters: {
    academic_years?: number[];
    academic_stages?: number[];
    academic_programs?: number[];
    program_years?: number[];
    academic_groups?: number[];
  }
): Promise<IRecipient[]> => {
  try {
    if (personTypes.length === 0) {
      return [];
    }

    const personTypesParam = personTypes.join(',');
    
    // Build enrollment filters for different person types
    const enrollmentFilters: IEnrollmentFilters = {
      academic_years: academicFilters.academic_years,
      academic_stages: academicFilters.academic_stages,
      academic_programs: academicFilters.academic_programs,
      program_years: academicFilters.program_years,
      academic_groups: academicFilters.academic_groups,
    };

    const params: IRecipientParams = {};

    // Include person_types=USER only when USER is among the selected types
    // person_types only works for USER, regardless of other types selected
    if (personTypes.includes(PersonType.USER)) {
      params.person_types = PersonType.USER;
    }

    // Add enrollment filters based on person types
    if (personTypes.includes(PersonType.STUDENT) || personTypes.includes(PersonType.TEACHER)) {
      const groupFilters = buildEnrollmentFilters(enrollmentFilters);
      if (groupFilters) {
        params.group_enrollment_filters = groupFilters;
      }
    }

    if (personTypes.includes(PersonType.RELATIVE)) {
      const relativeFilters = buildEnrollmentFilters(enrollmentFilters);
      if (relativeFilters) {
        params.relative_enrollment_filters = relativeFilters;
      }
    }
    
    const response = await api.request({
      method: 'GET',
      url: `/${SCHOOL_ID}/recipients`,
      params
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching recipients with enrollment filters:", error);
    throw new Error("Failed to fetch recipients with enrollment filters");
  }
};

/**
 * Get students only
 * @param academicFilters - Optional academic filters
 * @returns Promise<IRecipient[]> - Array of student recipients
 */
export const getStudentRecipients = async (
  academicFilters?: IRecipientRequest
): Promise<IRecipient[]> => {
  return getRecipientsWithAcademicFilters([PersonType.STUDENT], academicFilters || {});
};

/**
 * Get teachers only  
 * @returns Promise<IRecipient[]> - Array of teacher recipients
 */
export const getTeacherRecipients = async (): Promise<IRecipient[]> => {
  return getRecipientsByPersonTypes([PersonType.TEACHER]);
};

/**
 * Get users only
 * @returns Promise<IRecipient[]> - Array of user recipients
 */
export const getUserRecipients = async (): Promise<IRecipient[]> => {
  return getRecipientsByPersonTypes([PersonType.USER]);
};

/**
 * Get relatives only
 * @param academicFilters - Optional academic filters for related students
 * @returns Promise<IRecipient[]> - Array of relative recipients
 */
export const getRelativeRecipients = async (
  academicFilters?: IRecipientRequest
): Promise<IRecipient[]> => {
  return getRecipientsWithAcademicFilters([PersonType.RELATIVE], academicFilters || {});
};

/**
 * Get recipients for display purposes with simplified data
 * @param personTypes - Person types to filter by
 * @param academicFilters - Academic filters
 * @returns Promise<IRecipientDisplay[]> - Array of simplified recipients
 */
export const getRecipientsForDisplay = async (
  personTypes: PersonType[],
  academicFilters?: IRecipientRequest
): Promise<IRecipientDisplay[]> => {
  try {
    const recipients = await getRecipientsWithAcademicFilters(personTypes, academicFilters || {});
    
    return recipients.map((recipient) => ({
      person_id: recipient.person_id,
      person_internal_id: recipient.person_internal_id,
      full_name: recipient.full_name,
      person_type: recipient.person_type,
      academic_year_key: recipient.academic_year_key,
      academic_stage_key: recipient.academic_stage_key,
      academic_program_key: recipient.academic_program_key,
      program_year_key: recipient.program_year_key,
      academic_group_key: recipient.academic_group_key,
    }));
  } catch (error) {
    console.error("Error fetching recipients for display:", error);
    throw new Error("Failed to fetch recipients for display");
  }
};

/**
 * Get recipients grouped by person type
 * @param personTypes - Person types to filter by
 * @param academicFilters - Academic filters
 * @returns Promise<IRecipientGrouped> - Recipients grouped by person type
 */
export const getRecipientsGrouped = async (
  personTypes: PersonType[],
  academicFilters?: IRecipientRequest
): Promise<IRecipientGrouped> => {
  try {
    const recipients = await getRecipientsWithAcademicFilters(personTypes, academicFilters || {});
    
    // Group by person_type
    const grouped: IRecipientGrouped = {};
    
    recipients.forEach((recipient) => {
      const personType = recipient.person_type;
      if (!grouped[personType]) {
        grouped[personType] = [];
      }
      grouped[personType].push(recipient);
    });
    
    // Sort each group by full_name
    Object.keys(grouped).forEach((personType) => {
      grouped[personType].sort((a, b) => {
        return a.full_name.localeCompare(b.full_name);
      });
    });
    
    return grouped;
  } catch (error) {
    console.error("Error fetching recipients grouped:", error);
    throw new Error("Failed to fetch recipients grouped");
  }
};

/**
 * Get recipients with comprehensive filters
 * @param filters - All available filter options
 * @returns Promise<IRecipient[]> - Array of filtered recipients
 */
export const getFilteredRecipients = async (
  filters: IRecipientFilters
): Promise<IRecipient[]> => {
  try {
    if (!filters.person_types || filters.person_types.length === 0) {
      return [];
    }

    const academicFilters: IRecipientRequest = {
      academic_years: filters.academic_year_ids,
      academic_stages: filters.academic_stage_ids,
      academic_programs: filters.academic_program_ids,
      program_years: filters.program_year_ids,
      academic_groups: filters.academic_group_ids,
    };

    return getRecipientsWithAcademicFilters(filters.person_types, academicFilters);
  } catch (error) {
    console.error("Error fetching filtered recipients:", error);
    throw new Error("Failed to fetch filtered recipients");
  }
};

/**
 * Get recipient by person ID
 * @param personId - The person ID to search for
 * @param personTypes - Optional person types to filter by
 * @returns Promise<IRecipient | null> - Single recipient or null if not found
 */
export const getRecipientByPersonId = async (
  personId: number,
  personTypes?: PersonType[]
): Promise<IRecipient | null> => {
  try {
    const allPersonTypes = personTypes || [PersonType.STUDENT, PersonType.TEACHER, PersonType.USER, PersonType.RELATIVE];
    const recipients = await getRecipientsByPersonTypes(allPersonTypes);
    const found = recipients.find(recipient => recipient.person_id === personId);
    
    return found || null;
  } catch (error) {
    console.error("Error fetching recipient by person ID:", error);
    throw new Error(`Failed to fetch recipient with person ID: ${personId}`);
  }
};