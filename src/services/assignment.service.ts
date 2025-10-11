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
