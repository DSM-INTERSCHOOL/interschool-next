export interface IPerson {
  school_id: number;
  id: number;
  type: string;
  person_internal_id: string;
  given_name: string;
  paternal_name: string;
  maternal_name: string;
  display_name: string | null;
  legal_name: string | null;
  email: string;
}

export interface IAcademicInfo {
  id: number;
  key: string;
  description: string;
}

export interface IDaypass {
  id: number;
  school_id: number;
  guardian_person_id: number;
  student_person_id: number;
  reason: string;
  status: "PENDIENTE" | "AUTORIZADO" | "CANCELADO";
  created: string;
  modified: string;
  authorized_at: string | null;
  daypass_date: string;
  daypass_time: string;
  academic_stage_id: number;
  person: IPerson;
  relative: IPerson;
}

export interface IAuthorizationOption {
  action: "AUTHORIZE_AND_FORWARD" | "AUTHORIZE_AND_CLOSE";
  description: string;
  next_sequence?: number;
  next_authorizer_id?: number;
}

export interface IAuthorizationStep {
  options: Record<string, IAuthorizationOption>;
  description: string;
  person_authorizer_id: number;
}

export interface IDaypassConfig {
  id: number;
  school_id: number;
  academic_stage_id: number;
  authorization_sequence: Record<string, IAuthorizationStep>;
}

// Interfaz actualizada para coincidir con la respuesta real del API
export interface IDaypassAuthorizer {
  daypass: IDaypass;
  authorizer: IPerson;
  daypass_config: IDaypassConfig;
  authorization_sequence: number;
  academic_year?: IAcademicInfo | null;
  academic_stage?: IAcademicInfo | null;
  academic_program?: IAcademicInfo | null;
  academic_modality?: IAcademicInfo | null;
  program_year?: IAcademicInfo | null;
  academic_group?: IAcademicInfo | null;
}

export interface IDaypassAuthorizeRequest {
  action: string;
  note?: string;
}

export interface IDaypassAuthorizeResponse {
  success: boolean;
  message: string;
  daypass?: IDaypass;
}
