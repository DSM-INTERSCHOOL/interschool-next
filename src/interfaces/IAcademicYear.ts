export interface IAcademicYear {
  academic_year_key: string;
  description: string;
  official_start_date: string; // ISO date string (YYYY-MM-DD)
  official_end_date: string;   // ISO date string (YYYY-MM-DD)
  effective_start_date: string; // ISO date string (YYYY-MM-DD)
  effective_end_date: string;   // ISO date string (YYYY-MM-DD)
  initial_charge_date: string;  // ISO date string (YYYY-MM-DD)
  type: string; // e.g., "NORMAL"
  academic_year_cert: string;
  status: string; // e.g., "ACTIVO"
  parent_academic_year_id: number | null;
  id: number;
  school_id: number;
  created: string; // ISO datetime string
  modified: string; // ISO datetime string
  created_by: string;
  last_modified_by: string;
}

export interface IAcademicYearResponse {
  data: IAcademicYear[];
  success: boolean;
}

// Query parameters for the academic years endpoint
export interface IAcademicYearParams {
  academic_year?: string; // e.g., "VIGENTES"
}

// Enum for common academic year filters
export enum AcademicYearFilter {
  VIGENTES = "VIGENTES",
}

// Enum for academic year status
export enum AcademicYearStatus {
  ACTIVO = "ACTIVO",
  INACTIVO = "INACTIVO",
}

// Enum for academic year type
export enum AcademicYearType {
  NORMAL = "NORMAL",
}