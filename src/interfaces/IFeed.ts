export interface FeedPublisher {
  id: string;
  school_id: number;
  given_name: string | null;
  paternal_surname: string | null;
  maternal_surname?: string | null;
  profile_picture_url: string | null;
  official_picture_url?: string | null;
  type?: string | null;
}

export interface FeedAttachment {
  id: string;
  school_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  bucket_name: string;
  public_url: string;
  uploaded_at: string;
  content_id: string | null;
  is_inline: boolean;
  inline_position: number;
}

export interface FeedRead {
  id: string;
  school_id: number;
  title: string | null;
  content: string | null;
  start_date: string | null;
  end_date: string | null;
  accept_comments: boolean;
  views: number;
  likes: number;
  comments: number;
  authorized: boolean;
  status: string | null;
  created_at: string | null;
  modified_at: string | null;
  created_by: string | null;
  user_liked: boolean | null;
  idUserLiked?: string;
  publisher: FeedPublisher | null;
  attachments: FeedAttachment[] | null;
}

export interface FeedComment {
  id: string;
  text: string;
  created_at: string;
  person: {
    id: string;
    given_name: string | null;
    paternal_surname: string | null;
    profile_picture_url: string | null;
  } | null;
}

export interface FeedCreateDto {
  title: string;
  publisher_person_id: string;
  content: string;
  start_date: string;
  end_date: string;
  accept_comments: boolean;
  created_by?: string;
  status: string;
  authorized: boolean;
  persons: string[];
  academic_years: string[];
  academic_stages: string[];
  academic_programs: string[];
  academic_modalities: string[];
  program_years: string[];
  academic_groups: string[];
  attachments: unknown[];
}
