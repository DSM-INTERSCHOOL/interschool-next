import { IAttachmentCreate, IAttachmentRead, IPersonRead } from "./IAnnouncement";

export type { IAttachmentCreate, IAttachmentRead, IPersonRead };

export interface IEventCreate {
  title?: string | null;
  content?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  accept_comments?: boolean;
  views?: number;
  likes?: number;
  comments?: number;
  authorized?: boolean;
  authorized_by?: string | null;
  authorized_on?: string | null;
  academic_years?: string[] | null;
  academic_stages?: string[] | null;
  academic_programs?: string[] | null;
  academic_modalities?: string[] | null;
  academic_program_years?: string[] | null;
  academic_groups?: string[] | null;
  status?: string | null;
  requires_confirmation?: boolean;
  requires_signature?: boolean;
  signature_type?: string | null;
  confirmation_legend?: string | null;
  signature_legend?: string | null;
  event_start_time?: string | null;
  event_end_time?: string | null;
  confirmation_deadline?: string | null;
  event_location?: string | null;
  event_url?: string | null;
  map_url?: string | null;
  option_list_1?: string[] | null;
  option_list_2?: string[] | null;
  label_option_1?: string | null;
  label_option_2?: string | null;
  publisher_person_id: string;
  persons: string[];
  attachments?: IAttachmentCreate[] | null;
}

export interface IEventUpdate {
  title?: string | null;
  content?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  accept_comments?: boolean;
  authorized?: boolean;
  authorized_by?: string | null;
  authorized_on?: string | null;
  academic_years?: string[] | null;
  academic_stages?: string[] | null;
  academic_programs?: string[] | null;
  academic_modalities?: string[] | null;
  academic_program_years?: string[] | null;
  academic_groups?: string[] | null;
  status?: string | null;
  requires_confirmation?: boolean;
  requires_signature?: boolean;
  signature_type?: string | null;
  confirmation_legend?: string | null;
  signature_legend?: string | null;
  event_start_time?: string | null;
  event_end_time?: string | null;
  confirmation_deadline?: string | null;
  event_location?: string | null;
  event_url?: string | null;
  map_url?: string | null;
  option_list_1?: string[] | null;
  option_list_2?: string[] | null;
  label_option_1?: string | null;
  label_option_2?: string | null;
  persons?: string[];
  attachments?: IAttachmentCreate[] | null;
}

export interface IEventRead {
  title?: string | null;
  content?: string | null;
  start_date: string | null;
  end_date: string | null;
  accept_comments?: boolean;
  views?: number;
  likes?: number;
  comments?: number;
  authorized?: boolean;
  authorized_by?: string | null;
  authorized_on?: string | null;
  academic_years?: string[] | null;
  academic_stages?: string[] | null;
  academic_programs?: string[] | null;
  academic_modalities?: string[] | null;
  academic_program_years?: string[] | null;
  academic_groups?: string[] | null;
  status?: string | null;
  requires_confirmation?: boolean;
  requires_signature?: boolean;
  signature_type?: string | null;
  confirmation_legend?: string | null;
  signature_legend?: string | null;
  event_start_time?: string | null;
  event_end_time?: string | null;
  confirmation_deadline?: string | null;
  event_location?: string | null;
  event_url?: string | null;
  map_url?: string | null;
  option_list_1?: string[] | null;
  option_list_2?: string[] | null;
  label_option_1?: string | null;
  label_option_2?: string | null;
  id: string;
  school_id: number;
  created_at: string | null;
  modified_at: string | null;
  created_by: string | null;
  modified_by: string | null;
  attachments?: IAttachmentRead[] | null;
  publisher?: IPersonRead | null;
  user_liked?: boolean | null;
  user_viewed?: boolean;
  total_persons?: number | null;
  confirmed_persons?: number | null;
  signed_persons?: number | null;
}

export interface IEventPersonCreate {
  persons: string[];
}

export interface IEventLikeRead {
  event_id: string;
  person_id: string;
  created_at: string | null;
}

export interface IEventRecipient {
  id: string;
  school_id: number;
  given_name: string | null;
  paternal_surname: string | null;
  maternal_surname: string | null;
  person_internal_id: string | null;
  type: string | null;
  official_picture_url: string | null;
  profile_picture_url: string | null;
}
