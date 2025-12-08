import { getOrgConfig } from "@/lib/orgConfig";
import communicationApi from "./communicationApi";

export interface View {
    id: string;
    announcement_id?: string;
    assignment_id?: string;
    person_id: string;
    created_at: string;
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
 * Get all views for an announcement
 */
export async function getViewsForAnnouncement(announcementId: string): Promise<View[]> {
    const { schoolId } = getOrgConfig();
    const response = await communicationApi.get(`/v1/schools/${schoolId}/announcements/${announcementId}/views`);
    return response.data;
}

/**
 * Get all views for an assignment
 */
export async function getViewsForAssignment(assignmentId: string): Promise<View[]> {
    const { schoolId } = getOrgConfig();
    const response = await communicationApi.get(`/v1/schools/${schoolId}/assignments/${assignmentId}/views`);
    return response.data;
}
