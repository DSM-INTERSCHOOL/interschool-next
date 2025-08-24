export interface IAnnouncementCreate {
  title?: string | null;
  content?: string | null;
  start_date?: string | null; // ISO date-time
  end_date?: string | null; // ISO date-time
  accept_comments?: boolean;
  views?: number;
  likes?: number;
  comments?: number;
  authorized?: boolean;
  authorized_by?: string | null;
  authorized_on?: string | null; // ISO date-time
  academic_year?: string | null;
  academic_stages?: string[] | null;
  academic_programs?: string[] | null;
  academic_modalities?: string[] | null;
  academic_program_years?: string[] | null;
  academic_groups?: string[] | null;
  status?: string | null;
  publisher_person_id: string;
  persons: string[];
  attachments?: IAttachmentCreate[] | null;
}

export interface IAnnouncementUpdate {
  title?: string | null;
  content?: string | null;
  start_date?: string | null; // ISO date-time
  end_date?: string | null; // ISO date-time
  accept_comments?: boolean;
  views?: number;
  likes?: number;
  comments?: number;
  authorized?: boolean;
  authorized_by?: string | null;
  authorized_on?: string | null; // ISO date-time
  academic_year?: string | null;
  academic_stages?: string[] | null;
  academic_programs?: string[] | null;
  academic_modalities?: string[] | null;
  academic_program_years?: string[] | null;
  academic_groups?: string[] | null;
  status?: string | null;
  persons?: string[];
  attachments?: IAttachmentCreate[] | null;
}

export interface IAnnouncementRead {
  title?: string | null ;
  content?: string | null;
  start_date: string | null; // ISO date-time
  end_date: string | null; // ISO date-time
  accept_comments?: boolean;
  views?: number;
  likes?: number;
  comments?: number;
  authorized?: boolean;
  authorized_by?: string | null;
  authorized_on?: string | null; // ISO date-time
  academic_year?: string | null;
  academic_stages?: string[] | null;
  academic_programs?: string[] | null;
  academic_modalities?: string[] | null;
  academic_program_years?: string[] | null;
  academic_groups?: string[] | null;
  status?: string | null;
  id: string; // UUID
  school_id: number;
  created_at: string | null; // ISO date-time
  modified_at: string | null; // ISO date-time
  created_by: string | null;
  modified_by: string | null;
  attachments?: IAttachmentRead[] | null;
  publisher?: IPersonRead | null;
  user_liked?: boolean | null;
}

export interface IAnnouncementPersonCreate {
  persons: string[];
}

export interface IAnnouncementLikeRead {
  announcement_id: string; // UUID
  person_id: string;
  created_at: string | null; // ISO date-time
}

// Interfaces auxiliares que necesitamos
export interface IAttachmentCreate {
  filename: string;
  content_type: string;
  size: number;
  url?: string | null;
}

export interface IAttachmentRead {
  id: string; // UUID
  filename: string;
  content_type: string;
  size: number;
  url?: string | null;
  created_at: string | null; // ISO date-time
  modified_at: string | null; // ISO date-time
}

export interface IPersonRead {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  // Agregar otros campos según sea necesario
}


