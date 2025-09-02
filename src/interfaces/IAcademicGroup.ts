export interface IAcademicGroup {
  school_id: number;
  label: string; // e.g., "BA1A", "BA1B", "BA2A", "BA2B"
  school_shift: string; // e.g., "MAT" (turno escolar)
  academic_stage_id: number | null; // Foreign key to academic stage (optional)
  program_year_id: number; // Foreign key to program year (required dependency)
  academic_group_key: string; // e.g., "BA1A", "BA1B", "BA2A", "BA2B"
  id: number;
  created: string; // ISO datetime string
  modified: string; // ISO datetime string
}

export interface IAcademicGroupResponse {
  data: IAcademicGroup[];
  success: boolean;
}

// Query parameters for the academic groups endpoint
export interface IAcademicGroupParams {
  program_year_id?: number; // Filter by specific program year
  academic_stage_id?: number; // Filter by specific academic stage
  school_shift?: string; // Filter by school shift
  filters?: string; // Complex filters (e.g., "program_year_id::in::[7;6]")
}

// Enum for school shift
export enum SchoolShift {
  MATUTINO = "MAT",
  VESPERTINO = "VES",
}

// Simplified interface for display purposes
export interface IAcademicGroupDisplay {
  id: number;
  label: string;
  key: string;
  school_shift: string;
  program_year_id: number;
  academic_stage_id: number | null;
}

// Interface for academic group with relations
export interface IAcademicGroupWithRelations extends IAcademicGroup {
  program_year?: {
    id: number;
    program_year_key: string;
    description: string;
    academic_stage_id: number;
    academic_program_id: number;
  };
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

// Filter options for academic groups by program years
export interface IAcademicGroupFilters {
  program_year_ids?: number[]; // Array of program year IDs to filter by (primary dependency)
  academic_stage_ids?: number[]; // Array of academic stage IDs for additional filtering (optional)
  school_shift?: SchoolShift;
}

// Grouped academic groups by program year
export interface IAcademicGroupGrouped {
  [programYearId: number]: IAcademicGroup[];
}

// Common academic group keys/sections
export enum AcademicGroupKey {
  SECTION_A = "A",     // Section A
  SECTION_B = "B",     // Section B
  SECTION_C = "C",     // Section C
  SECTION_D = "D",     // Section D
  SECTION_E = "E",     // Section E
}