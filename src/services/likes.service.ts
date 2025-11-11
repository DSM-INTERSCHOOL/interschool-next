import { getOrgConfig } from "@/lib/orgConfig";
import communicationApi from "./communicationApi";

export interface Like {
    id: string;
    person_id: number;
    person?: {
        given_name: string;
        paternal_surname: string;
        maternal_surname?: string;
        profile_picture_url?: string;
    };
    created_at: string;
}

/**
 * Get all likes for an announcement
 */
export async function getLikesForAnnouncement(announcementId: string): Promise<Like[]> {
    const { schoolId } = getOrgConfig();
    const response = await communicationApi.get(`/v1/schools/${schoolId}/announcements/${announcementId}/likes`);
    return response.data;
}

/**
 * Get all likes for an assignment
 */
export async function getLikesForAssignment(assignmentId: string): Promise<Like[]> {
    const { schoolId } = getOrgConfig();
    const response = await communicationApi.get(`/v1/schools/${schoolId}/assignments/${assignmentId}/likes`);
    return response.data;
}
