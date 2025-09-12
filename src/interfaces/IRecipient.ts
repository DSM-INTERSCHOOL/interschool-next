export interface IRecipient {
  school_id: number;
  person_id: number;
  person_internal_id: string; // e.g., "9210014", "3180023"
  given_name: string; // e.g., "HUMBERTO", "MARIA FERNANDA"
  paternal_name: string; // e.g., ".CHAVARRIA", "ABARCA"
  maternal_name: string; // e.g., "MORALES", "CHAVEZ"
  full_name: string; // e.g., ".CHAVARRIA MORALES HUMBERTO"
  display_name: string | null;
  person_type: string; // e.g., "STUDENT", "TEACHER", "USER", "RELATIVE"
  enrollment_type: string | null;
  academic_year_key: string | null;
  academic_stage_key: string | null;
  academic_program_key: string | null;
  academic_modality_key: string | null;
  program_year_key: string | null;
  academic_group_key: string | null;
}

export interface IRecipientResponse {
  data: IRecipient[];
  success: boolean;
}

// Request body for recipients endpoint
export interface IRecipientRequest {
  academic_years?: number[]; // Array of academic year IDs
  academic_stages?: number[]; // Array of academic stage IDs
  academic_programs?: number[]; // Array of academic program IDs
  program_years?: number[]; // Array of program year IDs
  academic_groups?: number[]; // Array of academic group IDs
}

// Query parameters for recipients endpoint
export interface IRecipientParams {
  person_types?: string; // e.g., "STUDENT" or "STUDENT,TEACHER"
  academic_years?: string; // Query param version
  academic_stages?: string;
  academic_programs?: string;
  program_years?: string;
  academic_groups?: string;
  group_enrollment_filters?: string; // JSON string with enrollment filters
  relative_enrollment_filters?: string; // JSON string with relative enrollment filters
}

// Enum for person types
export enum PersonType {
  STUDENT = "STUDENT",
  TEACHER = "TEACHER", 
  USER = "USER",
  RELATIVE = "RELATIVE",
}

// Simplified interface for display purposes
export interface IRecipientDisplay {
  person_id: number;
  person_internal_id: string;
  full_name: string;
  person_type: string;
  academic_year_key?: string | null;
  academic_stage_key?: string | null;
  academic_program_key?: string | null;
  program_year_key?: string | null;
  academic_group_key?: string | null;
}

// Filter options for recipients
export interface IRecipientFilters {
  person_types?: PersonType[];
  academic_year_ids?: number[];
  academic_stage_ids?: number[];
  academic_program_ids?: number[];
  program_year_ids?: number[];
  academic_group_ids?: number[];
}

// Grouped recipients by person type
export interface IRecipientGrouped {
  [personType: string]: IRecipient[];
}

// Enrollment filters for group and relative recipients
export interface IEnrollmentFilters {
  academic_years?: number[];
  academic_stages?: number[];
  academic_programs?: number[];
  academic_modalities?: number[];
  program_years?: number[];
  academic_groups?: number[];
}

// Recipients selection state
export interface IRecipientSelection {
  selectedRecipients: Set<number>; // person_id set
  totalRecipients: number;
  recipientsByType: Record<string, number>;
}