import { getOrgConfig } from "@/lib/orgConfig";
import communicationApi from "./communicationApi";

export interface Comment {
    id: string;
    person_id: string;
    parent_announcement_comment_id: string | null;
    comment: string;
    created_at: string;
    modified_at: string;
    person?: {
        id: string;
        school_id: number;
        given_name: string;
        paternal_surname: string;
        maternal_surname?: string;
        person_internal_id: string;
        type: string;
        official_picture_url?: string;
        profile_picture_url?: string;
    };
}

/**
 * Get all comments for an announcement
 */
export async function getCommentsForAnnouncement(announcementId: string): Promise<Comment[]> {
    const { schoolId } = getOrgConfig();
    const response = await communicationApi.get(`/v1/schools/${schoolId}/announcements/${announcementId}/comments`);
    return response.data;
}

/**
 * Get all comments for an assignment
 */
export async function getCommentsForAssignment(assignmentId: string): Promise<Comment[]> {
    const { schoolId } = getOrgConfig();
    const response = await communicationApi.get(`/v1/schools/${schoolId}/assignments/${assignmentId}/comments`);
    return response.data;
}
