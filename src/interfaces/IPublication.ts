export interface IPublisher {
    school_id: number;
    given_name: string;
    paternal_surname: string;
    maternal_surname: string;
    person_internal_id: string;
    type: string;
    official_picture_url: string;
    profile_picture_url: string;
    id: string;
}

export interface IAttachment {
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: number;
    content_id: string | null;
    is_inline: boolean;
    inline_position: number;
    bucket_name: string;
    public_url: string;
    id: string;
    school_id: number;
    uploaded_at: string;
}

export interface IAnnouncement {
    title: string;
    content: string;
    start_date: string;
    end_date: string;
    accept_comments: boolean;
    views: number;
    likes: number;
    comments: number;
    authorized: boolean;
    authorized_by: string | null;
    authorized_on: string | null;
    academic_years: string[];
    academic_stages: string[];
    academic_programs: string[];
    academic_modalities: string[];
    academic_program_years: string[];
    academic_groups: string[];
    status: string;
    id: string;
    school_id: number;
    created_at: string;
    modified_at: string;
    created_by: string;
    modified_by: string;
    attachments: IAttachment[];
    publisher: IPublisher;
    user_liked: boolean;
    user_viewed: boolean;
}

export interface IAssignment {
    title: string;
    content: string;
    start_date: string;
    end_date: string;
    accept_comments: boolean;
    views: number;
    likes: number;
    comments: number;
    authorized: boolean;
    authorized_by: string | null;
    authorized_on: string | null;
    academic_years: string[];
    academic_stages: string[];
    academic_programs: string[];
    academic_modalities: string[];
    academic_program_years: string[];
    academic_groups: string[];
    status: string;
    id: string;
    school_id: number;
    created_at: string;
    modified_at: string;
    created_by: string;
    modified_by: string;
    attachments: IAttachment[];
    publisher: IPublisher;
    user_liked: boolean;
    user_viewed: boolean;
}

export interface IPublicationFilters {
    authorized?: boolean;
    person_id?: number;
    start_date?: string;
    end_date?: string;
}

export interface IPublicationParams {
    filters?: IPublicationFilters;
    skip?: number;
    limit?: number;
}
