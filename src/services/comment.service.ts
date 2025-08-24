import { ICommentCreate, ICommentRead, ICommentUpdate, ICommentLikeRead } from "@/interfaces/IComment";
import communicationApi from "./communicationApi";

interface ServiceArgs {
    schoolId: number;
    page?: number;
    per_page?: number;
    filters?: Record<string, any>;
}

interface CreateArgs {
    schoolId: number;
    dto: ICommentCreate;
}

interface UpdateArgs {
    schoolId: number;
    commentId: string;
    dto: ICommentUpdate;
}

interface DeleteArgs {
    schoolId: number;
    commentId: string;
}

interface LikeArgs {
    schoolId: number;
    commentId: string;
}

interface UnlikeArgs {
    schoolId: number;
    commentId: string;
}

// CRUD Operations
export const create = async ({ schoolId, dto }: CreateArgs): Promise<ICommentRead> => {
    const response = await communicationApi.post(`/schools/${schoolId}/comments`, dto);
    return response.data;
};

export const getAll = async ({ schoolId, page = 1, per_page = 10, filters }: ServiceArgs): Promise<{
    data: ICommentRead[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}> => {
    const params = new URLSearchParams({
        page: page.toString(),
        per_page: per_page.toString(),
        ...(filters && { filters: JSON.stringify(filters) })
    });
    
    const response = await communicationApi.get(`/schools/${schoolId}/comments?${params}`);
    return response.data;
};

export const getById = async (schoolId: number, commentId: string): Promise<ICommentRead> => {
    const response = await communicationApi.get(`/schools/${schoolId}/comments/${commentId}`);
    return response.data;
};

export const update = async ({ schoolId, commentId, dto }: UpdateArgs): Promise<ICommentRead> => {
    const response = await communicationApi.put(`/schools/${schoolId}/comments/${commentId}`, dto);
    return response.data;
};

export const remove = async ({ schoolId, commentId }: DeleteArgs): Promise<void> => {
    await communicationApi.delete(`/schools/${schoolId}/comments/${commentId}`);
};

// Comments for specific announcement
export const getByAnnouncement = async (schoolId: number, announcementId: string, page = 1, per_page = 10): Promise<{
    data: ICommentRead[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}> => {
    const params = new URLSearchParams({
        page: page.toString(),
        per_page: per_page.toString()
    });
    
    const response = await communicationApi.get(`/schools/${schoolId}/announcements/${announcementId}/comments?${params}`);
    return response.data;
};

// Like/Unlike operations
export const like = async ({ schoolId, commentId }: LikeArgs): Promise<ICommentLikeRead> => {
    const response = await communicationApi.post(`/schools/${schoolId}/comments/${commentId}/like`);
    return response.data;
};

export const unlike = async ({ schoolId, commentId }: UnlikeArgs): Promise<void> => {
    await communicationApi.delete(`/schools/${schoolId}/comments/${commentId}/like`);
};


