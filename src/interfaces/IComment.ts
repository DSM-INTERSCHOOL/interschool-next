export interface ICommentCreate {
    content: string;
    announcement_id: string;
    parent_id?: string | null; // Para comentarios anidados
}

export interface ICommentRead {
    id: string;
    content: string;
    announcement_id: string;
    parent_id: string | null;
    created_at: string;
    modified_at: string;
    created_by: string;
    modified_by: string;
    author: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        avatar?: string | null;
    };
    likes: number;
    user_liked: boolean;
    replies?: ICommentRead[];
}

export interface ICommentUpdate {
    content: string;
}

export interface ICommentLikeRead {
    comment_id: string;
    person_id: string;
    created_at: string;
}


