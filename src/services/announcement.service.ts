import {
  IAnnouncementCreate,
  IAnnouncementRead,
  IAnnouncementUpdate,
  IAnnouncementPersonCreate,
  IAnnouncementLikeRead,
} from "@/interfaces/IAnnouncement";
import communicationApi from "./communicationApi";

interface ServiceArgs {
  schoolId: string | number;
  page?: number;
  per_page?: number;
  filters?: string;
}

interface AnnouncementArgs extends ServiceArgs {
  announcementId: string;
}

interface CreateArgs {
  schoolId: string | number;
  dto: IAnnouncementCreate;
}

interface UpdateArgs {
  schoolId: string | number;
  announcementId: string;
  dto: IAnnouncementUpdate;
}

interface PersonArgs {
  schoolId: string | number;
  announcementId: string;
  dto: IAnnouncementPersonCreate;
}

interface LikeArgs {
  schoolId: string | number;
  announcementId: string;
  personId: string;
}

// CRUD básico de anuncios
export const create = async ({ schoolId, dto }: CreateArgs) => {
  const response = await communicationApi.post<IAnnouncementRead>(
    `/v1/schools/${schoolId}/announcements`,
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
    `/v1/schools/${schoolId}/announcements?${params.toString()}`
  );
  return response.data;
};

export const getById = async ({ schoolId, announcementId }: AnnouncementArgs) => {
  const response = await communicationApi.get<IAnnouncementRead>(
    `/v1/schools/${schoolId}/announcements/${announcementId}`
  );
  return response.data;
};

export const update = async ({ schoolId, announcementId, dto }: UpdateArgs) => {
  const response = await communicationApi.put<IAnnouncementRead>(
    `/v1/schools/${schoolId}/announcements/${announcementId}`,
    dto
  );
  return response.data;
};

export const remove = async ({ schoolId, announcementId }: AnnouncementArgs) => {
  const response = await communicationApi.delete(
    `/v1/schools/${schoolId}/announcements/${announcementId}`
  );
  return response.data;
};

// Gestión de personas en anuncios
export const addPersons = async ({ schoolId, announcementId, dto }: PersonArgs) => {
  const response = await communicationApi.post<IAnnouncementRead>(
    `/schools/${schoolId}/announcements/${announcementId}/persons`,
    dto
  );
  return response.data;
};

export const removePersons = async ({ schoolId, announcementId, dto }: PersonArgs) => {
  const response = await communicationApi.delete<IAnnouncementRead>(
    `/schools/${schoolId}/announcements/${announcementId}/persons`,
    { data: dto }
  );
  return response.data;
};

export const getPersons = async ({
  schoolId,
  announcementId,
  page = 1,
  per_page = 10,
  filters,
}: AnnouncementArgs) => {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: per_page.toString(),
  });
  
  if (filters) {
    params.append("filters", filters);
  }

  const response = await communicationApi.get(
    `/schools/${schoolId}/announcements/${announcementId}/persons?${params.toString()}`
  );
  return response.data;
};

// Gestión de likes
export const like = async ({ schoolId, announcementId, personId }: LikeArgs) => {
  const response = await communicationApi.post<IAnnouncementLikeRead>(
    `/v1/schools/${schoolId}/announcements/${announcementId}/likes/${personId}`
  );
  return response.data;
};

export const unlike = async ({ schoolId, announcementId, personId }: LikeArgs) => {
  const response = await communicationApi.delete<IAnnouncementLikeRead>(
    `/v1/schools/${schoolId}/announcements/${announcementId}/likes/${personId}`
  );
  return response.data;
};

export const getLike = async ({ schoolId, announcementId, personId }: LikeArgs) => {
  const response = await communicationApi.get<IAnnouncementLikeRead>(
    `/v1/schools/${schoolId}/announcements/${announcementId}/likes/${personId}`
  );
  return response.data;
};

export const getLikes = async ({
  schoolId,
  announcementId,
  page = 1,
  per_page = 10,
}: AnnouncementArgs) => {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: per_page.toString(),
  });

  const response = await communicationApi.get<IAnnouncementLikeRead[]>(
    `/v1/schools/${schoolId}/announcements/${announcementId}/likes?${params.toString()}`
  );
  return response.data;
};

// Gestión de vistas
export const addView = async ({
  schoolId,
  announcementId,
  personId
}: {
  schoolId: string | number;
  announcementId: string;
  personId: string;
}) => {
  const response = await communicationApi.post(
    `/v1/schools/${schoolId}/announcements/${announcementId}/views`,
    {
      announcement_id: announcementId,
      person_id: personId
    }
  );
  return response.data;
};

export const getViews = async ({
  schoolId,
  announcementId,
  page = 1,
  per_page = 10,
  filters,
}: AnnouncementArgs) => {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: per_page.toString(),
  });
  
  if (filters) {
    params.append("filters", filters);
  }

  const response = await communicationApi.get(
    `/schools/${schoolId}/announcements/${announcementId}/views?${params.toString()}`
  );
  return response.data;
};

export const removeView = async ({ schoolId, announcementId }: AnnouncementArgs) => {
  const response = await communicationApi.delete(
    `/schools/${schoolId}/announcements/${announcementId}/views`
  );
  return response.data;
};

export const getView = async ({ schoolId, announcementId }: AnnouncementArgs) => {
  const response = await communicationApi.get(
    `/schools/${schoolId}/announcements/${announcementId}/views`
  );
  return response.data;
};

// Gestión de comentarios
export const addComment = async ({
  schoolId,
  announcementId,
  dto,
}: {
  schoolId: string | number;
  announcementId: string;
  dto: {
    person_id: string;
    parent_announcement_comment_id?: string | null;
    comment: string;
  };
}) => {
  const response = await communicationApi.post(
    `/schools/${schoolId}/announcements/${announcementId}/comments`,
    dto
  );
  return response.data;
};

export const getComments = async ({
  schoolId,
  announcementId,
  page = 1,
  per_page = 10,
  filters,
}: AnnouncementArgs) => {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: per_page.toString(),
  });
  
  if (filters) {
    params.append("filters", filters);
  }

  const response = await communicationApi.get(
    `/schools/${schoolId}/announcements/${announcementId}/comments?${params.toString()}`
  );
  return response.data;
};

export const removeComment = async ({
  schoolId,
  announcementId,
  commentId,
}: {
  schoolId: string | number;
  announcementId: string;
  commentId: string;
}) => {
  const response = await communicationApi.delete(
    `/schools/${schoolId}/announcements/${announcementId}/comments/${commentId}`
  );
  return response.data;
};

export const getComment = async ({
  schoolId,
  announcementId,
  commentId,
}: {
  schoolId: string | number;
  announcementId: string;
  commentId: string;
}) => {
  const response = await communicationApi.get(
    `/schools/${schoolId}/announcements/${announcementId}/comments/${commentId}`
  );
  return response.data;
};

export const updateComment = async ({
  schoolId,
  announcementId,
  commentId,
  dto,
}: {
  schoolId: string | number;
  announcementId: string;
  commentId: string;
  dto: {
    comment: string;
  };
}) => {
  const response = await communicationApi.patch(
    `/schools/${schoolId}/announcements/${announcementId}/comments/${commentId}`,
    dto
  );
  return response.data;
};

