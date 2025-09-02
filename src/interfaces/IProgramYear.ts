export interface IProgramYear {
  school_id: number;
  program_year_key: string; // e.g., "1", "2", "3", "0PF", "4", "5", "6"
  description: string; // e.g., "1", "2", "3", "0PF", "4", "5", "6"
  created_by: string;
  last_modified_by: string;
  academic_stage_id: number; // Foreign key to academic stage
  academic_program_id: number; // Foreign key to academic program
  academic_modality_id: number | null; // Foreign key to academic modality (can be null)
  id: number;
  created: string; // ISO datetime string
  modified: string; // ISO datetime string
}

export interface IProgramYearResponse {
  data: IProgramYear[];
  success: boolean;
}

// Query parameters for the program years endpoint
export interface IProgramYearParams {
  academic_stage_id?: number; // Filter by specific academic stage
  academic_program_id?: number; // Filter by specific academic program
  filters?: string; // Complex filters (e.g., "academic_stage_id::in::[1;2],academic_program_id::in::[1;2]")
}

// Simplified interface for display purposes
export interface IProgramYearDisplay {
  id: number;
  key: string;
  description: string;
  academic_stage_id: number;
  academic_program_id: number;
  academic_modality_id: number | null;
}

// Interface for program year with stage and program information
export interface IProgramYearWithRelations extends IProgramYear {
  academic_stage?: {
    id: number;
    academic_stage_key: string;
    description: string;
    precedence: number;
  };
  academic_program?: {
    id: number;
    academic_program_key: string;
    description: string;
  };
}

// Filter options for program years with dual dependency
export interface IProgramYearFilters {
  academic_stage_ids?: number[]; // Array of academic stage IDs to filter by
  academic_program_ids?: number[]; // Array of academic program IDs to filter by
}

// Grouped program years by stage and program
export interface IProgramYearGrouped {
  [stageId: number]: {
    [programId: number]: IProgramYear[];
  };
}

// Common program year keys/grades
export enum ProgramYearKey {
  GRADE_0PF = "0PF", // Pre-first grade
  GRADE_1 = "1",     // First grade
  GRADE_2 = "2",     // Second grade  
  GRADE_3 = "3",     // Third grade
  GRADE_4 = "4",     // Fourth grade
  GRADE_5 = "5",     // Fifth grade
  GRADE_6 = "6",     // Sixth grade
}