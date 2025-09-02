export interface IAcademicStage {
  school_id: number;
  academic_stage_key: string; // e.g., "BA", "PR", "SE", "KI", "MA", "DC", "FID"
  description: string; // e.g., "BACHILLERATO", "PRIMARIA", "SECUNDARIA"
  precedence: number; // Order/priority of the stage
  grade_class: string; // Grade class controller name
  academic_stage_cert: string; // Certificate info (can be empty)
  academic_stage_iedu: string; // Education level description
  spei_prefix: string; // SPEI system prefix
  spei_cost_center: string; // Cost center code
  created_by: string;
  last_modified_by: string;
  status: string; // e.g., "ACTIVO"
  schedule: any | null; // Schedule configuration (can be null)
  campus_id: number | null; // Campus ID (can be null)
  id: number;
  created: string; // ISO datetime string
  modified: string; // ISO datetime string
  config: any | null; // Additional configuration (can be null)
}

export interface IAcademicStageResponse {
  data: IAcademicStage[];
  success: boolean;
}

// Query parameters for the academic stages endpoint
export interface IAcademicStageParams {
  status?: string; // Filter by status
  campus_id?: number; // Filter by campus
}

// Enum for academic stage status
export enum AcademicStageStatus {
  ACTIVO = "ACTIVO",
  INACTIVO = "INACTIVO",
}

// Enum for common academic stage keys
export enum AcademicStageKey {
  FID = "FID", // FID (precedence 0)
  DAYCARE = "DC", // DAYCARE (precedence 1)
  MATERNAL = "MA", // MATERNAL (precedence 2)
  KINDER = "KI", // KINDER (precedence 3)
  PRIMARIA = "PR", // PRIMARIA (precedence 4)
  SECUNDARIA = "SE", // SECUNDARIA (precedence 5)
  BACHILLERATO = "BA", // BACHILLERATO (precedence 6)
}

// Common education levels for easier filtering
export enum EducationLevel {
  PREESCOLAR = "Preescolar",
  PRIMARIA = "Primaria",
  SECUNDARIA = "Secundaria",
  BACHILLERATO = "Bachillerato o su equivalente",
}

// Simplified interface for display purposes
export interface IAcademicStageDisplay {
  id: number;
  key: string;
  description: string;
  precedence: number;
  educationLevel: string;
  status: string;
}