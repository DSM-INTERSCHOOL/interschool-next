import { IAnnouncement, IAssignment } from "@/interfaces/IPublication";

const BASE_URL = "https://stage.communication.idsm.xyz/v1";
const SCHOOL_ID = process.env.NEXT_PUBLIC_SCHOOL_ID || "1000";

interface PublicationParams {
    personId?: string;
    skip?: number;
    limit?: number;
    token: string;
}

/**
 * Construye los filtros para la petición de publicaciones
 */
const buildFilters = (personId?: string): string => {
    const now = new Date().toISOString();

    const filters = [
        "authorized::eq::true",
        `start_date::lte::${now}`,
        `end_date::gte::${now}`,
    ];

    if (personId) {
        filters.push(`person_id::eq::${personId}`);
    }

    return filters.join(",");
};

/**
 * Obtiene los anuncios (avisos) de la institución
 */
export const getAnnouncements = async ({
    personId,
    skip = 0,
    limit = 100,
    token,
}: PublicationParams): Promise<IAnnouncement[]> => {
    const filters = buildFilters(personId);
    const url = `${BASE_URL}/schools/${SCHOOL_ID}/announcements?filters=${encodeURIComponent(filters)}&skip=${skip}&limit=${limit}`;

    const response = await fetch(url, {
        headers: {
            "x-device-id": "web-app",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Error fetching announcements: ${response.statusText}`);
    }

    return response.json();
};

/**
 * Obtiene las tareas (assignments) de la institución
 */
export const getAssignments = async ({
    personId,
    skip = 0,
    limit = 100,
    token,
}: PublicationParams): Promise<IAssignment[]> => {
    const filters = buildFilters(personId);
    const url = `${BASE_URL}/schools/${SCHOOL_ID}/assignments?filters=${encodeURIComponent(filters)}&skip=${skip}&limit=${limit}`;

    const response = await fetch(url, {
        headers: {
            "x-device-id": "mobile-web-client",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Error fetching assignments: ${response.statusText}`);
    }

    return response.json();
};

/**
 * Da like a una publicación
 */
export const likePublication = async (
    publicationId: string,
    type: "announcement" | "assignment",
    token: string,
): Promise<void> => {
    const endpoint = type === "announcement" ? "announcements" : "assignments";
    const url = `${BASE_URL}/schools/${SCHOOL_ID}/${endpoint}/${publicationId}/like`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "x-device-id": "web-app",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Error liking publication: ${response.statusText}`);
    }
};

/**
 * Quita el like de una publicación
 */
export const unlikePublication = async (
    publicationId: string,
    type: "announcement" | "assignment",
    token: string,
): Promise<void> => {
    const endpoint = type === "announcement" ? "announcements" : "assignments";
    const url = `${BASE_URL}/schools/${SCHOOL_ID}/${endpoint}/${publicationId}/like`;

    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            "x-device-id": "web-app",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Error unliking publication: ${response.statusText}`);
    }
};
