import {
  IAnnouncementCreate,
  IAnnouncementRead,
  IAnnouncementUpdate,
} from "@/interfaces/IAnnouncement";
import communicationApi from "./communicationApi";

interface ServiceArgs {
  schoolId: string | number;
  page?: number;
  per_page?: number;
  filters?: string;
}

interface AssignmentArgs extends ServiceArgs {
  assignmentId: string;
}

interface CreateArgs {
  schoolId: string | number;
  dto: IAnnouncementCreate;
}

interface UpdateArgs {
  schoolId: string | number;
  assignmentId: string;
  dto: IAnnouncementUpdate;
}

// CRUD básico de tareas (assignments)
export const create = async ({ schoolId, dto }: CreateArgs) => {
  const response = await communicationApi.post<IAnnouncementRead>(
    `/v1/schools/${schoolId}/assignments`,
    dto
  );
  return response.data;
};

export const getAll = async ({
  schoolId,
  page = 1,
  per_page = 10,
  filters,
}: ServiceArgs) => {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: per_page.toString(),
  });

  if (filters) {
    params.append("filters", filters);
  }

  const response = await communicationApi.get<IAnnouncementRead[]>(
    `/v1/schools/${schoolId}/assignments?${params.toString()}`
  );
  return response.data;
};

export const getById = async ({ schoolId, assignmentId }: AssignmentArgs) => {
  const response = await communicationApi.get<IAnnouncementRead>(
    `/v1/schools/${schoolId}/assignments/${assignmentId}`
  );
  return response.data;
};

export const update = async ({ schoolId, assignmentId, dto }: UpdateArgs) => {
  const response = await communicationApi.put<IAnnouncementRead>(
    `/v1/schools/${schoolId}/assignments/${assignmentId}`,
    dto
  );
  return response.data;
};

export const remove = async ({ schoolId, assignmentId }: AssignmentArgs) => {
  const response = await communicationApi.delete(
    `/v1/schools/${schoolId}/assignments/${assignmentId}`
  );
  return response.data;
};

// Gestión de likes
interface LikeArgs {
  schoolId: string | number;
  assignmentId: string;
  personId: string;
}

export const like = async ({ schoolId, assignmentId, personId }: LikeArgs) => {
  const response = await communicationApi.post(
    `/v1/schools/${schoolId}/assignments/${assignmentId}/likes/${personId}`
  );
  return response.data;
};

export const unlike = async ({ schoolId, assignmentId, personId }: LikeArgs) => {
  const response = await communicationApi.delete(
    `/v1/schools/${schoolId}/assignments/${assignmentId}/likes/${personId}`
  );
  return response.data;
};

export const getLike = async ({ schoolId, assignmentId, personId }: LikeArgs) => {
  const response = await communicationApi.get(
    `/v1/schools/${schoolId}/assignments/${assignmentId}/likes/${personId}`
  );
  return response.data;
};

export const getLikes = async ({
  schoolId,
  assignmentId,
  page = 1,
  per_page = 10,
}: AssignmentArgs) => {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: per_page.toString(),
  });

  const response = await communicationApi.get(
    `/v1/schools/${schoolId}/assignments/${assignmentId}/likes?${params.toString()}`
  );
  return response.data;
};

// Gestión de vistas
export const addView = async ({
  schoolId,
  assignmentId,
  personId
}: {
  schoolId: string | number;
  assignmentId: string;
  personId: string;
}) => {
  const response = await communicationApi.post(
    `/v1/schools/${schoolId}/assignments/${assignmentId}/views`,
    {
      assignment_id: assignmentId,
      person_id: personId
    }
  );
  return response.data;
};

export const getViews = async ({
  schoolId,
  assignmentId,
  page = 1,
  per_page = 10,
  filters,
}: AssignmentArgs) => {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: per_page.toString(),
  });

  if (filters) {
    params.append("filters", filters);
  }

  const response = await communicationApi.get(
    `/v1/schools/${schoolId}/assignments/${assignmentId}/views?${params.toString()}`
  );
  return response.data;
};

export const removeView = async ({
  schoolId,
  assignmentId
}: {
  schoolId: string | number;
  assignmentId: string;
}) => {
  const response = await communicationApi.delete(
    `/v1/schools/${schoolId}/assignments/${assignmentId}/views`
  );
  return response.data;
};

export const getView = async ({
  schoolId,
  assignmentId
}: {
  schoolId: string | number;
  assignmentId: string;
}) => {
  const response = await communicationApi.get(
    `/v1/schools/${schoolId}/assignments/${assignmentId}/views`
  );
  return response.data;
};
