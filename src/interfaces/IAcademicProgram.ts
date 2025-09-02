export interface IAcademicProgram {
  school_id: number;
  academic_program_key: string; // e.g., "ACTIVIDADES", "PRBASICO", "BABASICO", "SEBASICA"
  description: string; // e.g., "ACTIVIDADES", "PRIMARIA", "BACHILLERATO", "SECUNDARIA"
  schedule: any | null; // Schedule configuration (can be null)
  created_by: string;
  last_modified_by: string;
  status: string; // e.g., "ACTIVO"
  academic_stage_id: number; // Foreign key to academic stage
  id: number;
  created: string; // ISO datetime string
  modified: string; // ISO datetime string
}

export interface IAcademicProgramResponse {
  data: IAcademicProgram[];
  success: boolean;
}

// Query parameters for the academic programs endpoint
export interface IAcademicProgramParams {
  status?: string; // Filter by status
  academic_stage_id?: number; // Filter by specific academic stage
  filters?: string; // Complex filters (e.g., "academic_stage_id::in::[1;2]")
}

// Enum for academic program status
export enum AcademicProgramStatus {
  ACTIVO = "ACTIVO",
  INACTIVO = "INACTIVO",
}

// Enum for common academic program keys
export enum AcademicProgramKey {
  ACTIVIDADES = "ACTIVIDADES", // Activities
  PRBASICO = "PRBASICO", // Primary Basic
  BABASICO = "BABASICO", // Bachillerato Basic
  DCBASICO = "DCBASICO", // Daycare Basic
  KIBASICO = "KIBASICO", // Kinder Basic
  MABASICO = "MABASICO", // Maternal Basic
  SEBASICA = "SEBASICA", // Secundaria Basic
}

// Simplified interface for display purposes
export interface IAcademicProgramDisplay {
  id: number;
  key: string;
  description: string;
  status: string;
  academic_stage_id: number;
}

// Interface for academic program with stage information
export interface IAcademicProgramWithStage extends IAcademicProgram {
  academic_stage?: {
    id: number;
    academic_stage_key: string;
    description: string;
    precedence: number;
  };
}

// Filter options for academic programs by stage
export interface IAcademicProgramFilters {
  academic_stage_ids?: number[]; // Array of academic stage IDs to filter by
  status?: AcademicProgramStatus;
}