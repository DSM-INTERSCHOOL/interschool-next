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

export interface IDaypassAuthorizer {
  authorizer_person_id: number;
  authorized: boolean;
  authorized_at: string | null;
  authorization_sequence: number;
  authorized_by: string | null;
  note: string | null;
  daypass_id: number;
  created_at: string;
  authorizer: IPerson;
}

export interface IDaypass {
  school_id: number;
  guardian_person_id: number;
  student_person_id: number;
  reason: string;
  status: 'PENDIENTE' | 'AUTORIZADO' | 'RECHAZADO' | 'COMPLETADO' | 'CANCELADO';
  authorized_at: string | null;
  academic_stage_id: number | null;
  daypass_date: string;
  daypass_time: string;
  id: number;
  created: string;
  modified: string;
  authorizers: IDaypassAuthorizer[];
  person: IPerson;
  relative: IPerson;
}

export interface IDaypassAuthorizeRequest {
  authorized: boolean;
  authorized_at: string;
}

export interface IDaypassAuthorizeResponse {
  success: boolean;
  message: string;
  daypass?: IDaypass;
}
