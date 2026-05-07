import {
  IEventCreate,
  IEventRead,
  IEventUpdate,
  IEventPersonCreate,
  IEventLikeRead,
  IEventRecipient,
} from "@/interfaces/IEvent";
import communicationApi from "./communicationApi";

interface ServiceArgs {
  schoolId: string | number;
  offset?: number;
  limit?: number;
  filters?: string;
}

interface EventArgs extends ServiceArgs {
  eventId: string;
}

interface CreateArgs {
  schoolId: string | number;
  dto: IEventCreate;
}

interface UpdateArgs {
  schoolId: string | number;
  eventId: string;
  dto: IEventUpdate;
}

interface PersonArgs {
  schoolId: string | number;
  eventId: string;
  dto: IEventPersonCreate;
}

interface LikeArgs {
  schoolId: string | number;
  eventId: string;
  personId: string;
}

// CRUD básico de eventos
export const create = async ({ schoolId, dto }: CreateArgs) => {
  const response = await communicationApi.post<IEventRead>(
    `/v1/schools/${schoolId}/events`,
    dto
  );
  return response.data;
};

export const getAll = async ({
  schoolId,
  offset = 0,
  limit = 100,
  filters,
}: ServiceArgs) => {
  const params = new URLSearchParams({
    offset: offset.toString(),
    limit: limit.toString(),
  });

  if (filters) {
    params.append("filters", filters);
  }

  const response = await communicationApi.get<IEventRead[]>(
    `/v1/schools/${schoolId}/events?${params.toString()}`
  );
  return response.data;
};

export const getById = async ({ schoolId, eventId }: EventArgs) => {
  const response = await communicationApi.get<IEventRead>(
    `/v1/schools/${schoolId}/events/${eventId}`
  );
  return response.data;
};

export const update = async ({ schoolId, eventId, dto }: UpdateArgs) => {
  const response = await communicationApi.put<IEventRead>(
    `/v1/schools/${schoolId}/events/${eventId}`,
    dto
  );
  return response.data;
};

export const remove = async ({ schoolId, eventId }: EventArgs) => {
  const response = await communicationApi.delete(
    `/v1/schools/${schoolId}/events/${eventId}`
  );
  return response.data;
};

// Gestión de personas en eventos
export interface IEventConfirmation {
  event_id: string;
  given_name: string;
  paternal_surname: string;
  maternal_surname: string;
  type: string;
  confirmed: boolean;
  confirmed_at: string | null;
  signed: boolean;
  signed_at: string | null;
  modified_at: string;
}

export interface IEventStat {
  row_level: number;
  type: string;
  person_id: string | null;
  total: string;
}

export const getConfirmationStats = async ({
  schoolId,
  eventId,
}: {
  schoolId: string | number | null;
  eventId: string;
}): Promise<IEventStat[]> => {
  const response = await communicationApi.get(
    `/v1/schools/${schoolId}/events/${eventId}/confirmations/stats`
  );
  return response.data;
};

export const getSignatureStats = async ({
  schoolId,
  eventId,
}: {
  schoolId: string | number | null;
  eventId: string;
}): Promise<IEventStat[]> => {
  const response = await communicationApi.get(
    `/v1/schools/${schoolId}/events/${eventId}/signatures/stats`
  );
  return response.data;
};

export const getEventConfirmations = async ({
  schoolId,
  eventId,
}: {
  schoolId: string | number | null;
  eventId: string;
}): Promise<IEventConfirmation[]> => {
  const response = await communicationApi.get(
    `/v1/schools/${schoolId}/events/${eventId}/confirmations`
  );
  return response.data;
};

export const getPersonInEvent = async ({
  schoolId,
  eventId,
  personId,
}: {
  schoolId: string | number | null;
  eventId: string;
  personId: string;
}) => {
  const response = await communicationApi.get(
    `/v1/schools/${schoolId}/events/${eventId}/persons/${personId}`
  );
  return response.data as { confirmed: boolean; signed: boolean; [key: string]: any };
};

export const updatePerson = async ({
  schoolId,
  eventId,
  personId,
  dto,
}: {
  schoolId: string | number | null;
  eventId: string;
  personId: string;
  dto: { confirmed?: boolean; signed?: boolean };
}) => {
  const response = await communicationApi.put(
    `/v1/schools/${schoolId}/events/${eventId}/persons/${personId}`,
    dto
  );
  return response.data;
};

export const addPersons = async ({ schoolId, eventId, dto }: PersonArgs) => {
  const response = await communicationApi.post<IEventRead>(
    `/v1/schools/${schoolId}/events/${eventId}/persons`,
    dto
  );
  return response.data;
};

export const removePersons = async ({ schoolId, eventId, dto }: PersonArgs) => {
  const response = await communicationApi.delete<IEventRead>(
    `/v1/schools/${schoolId}/events/${eventId}/persons`,
    { data: dto }
  );
  return response.data;
};

export const getPersons = async ({
  schoolId,
  eventId,
}: {
  schoolId: string | number;
  eventId: string;
}) => {
  const response = await communicationApi.get<IEventRecipient[]>(
    `/v1/schools/${schoolId}/events/${eventId}/persons`
  );
  return response.data;
};

// Gestión de likes
export const like = async ({ schoolId, eventId, personId }: LikeArgs) => {
  const response = await communicationApi.post<IEventLikeRead>(
    `/v1/schools/${schoolId}/events/${eventId}/likes/${personId}`
  );
  return response.data;
};

export const unlike = async ({ schoolId, eventId, personId }: LikeArgs) => {
  const response = await communicationApi.delete<IEventLikeRead>(
    `/v1/schools/${schoolId}/events/${eventId}/likes/${personId}`
  );
  return response.data;
};

export const getLike = async ({ schoolId, eventId, personId }: LikeArgs) => {
  const response = await communicationApi.get<IEventLikeRead>(
    `/v1/schools/${schoolId}/events/${eventId}/likes/${personId}`
  );
  return response.data;
};

export const getLikes = async ({
  schoolId,
  eventId,
  offset = 0,
  limit = 100,
}: EventArgs) => {
  const params = new URLSearchParams({
    offset: offset.toString(),
    limit: limit.toString(),
  });

  const response = await communicationApi.get<IEventLikeRead[]>(
    `/v1/schools/${schoolId}/events/${eventId}/likes?${params.toString()}`
  );
  return response.data;
};

// Gestión de vistas
export const addView = async ({
  schoolId,
  eventId,
  personId,
}: {
  schoolId: string | number;
  eventId: string;
  personId: string;
}) => {
  const response = await communicationApi.post(
    `/v1/schools/${schoolId}/events/${eventId}/views`,
    {
      event_id: eventId,
      person_id: personId,
    }
  );
  return response.data;
};

export const getViews = async ({
  schoolId,
  eventId,
  offset = 0,
  limit = 100,
  filters,
}: EventArgs) => {
  const params = new URLSearchParams({
    offset: offset.toString(),
    limit: limit.toString(),
  });

  if (filters) {
    params.append("filters", filters);
  }

  const response = await communicationApi.get(
    `/v1/schools/${schoolId}/events/${eventId}/views?${params.toString()}`
  );
  return response.data;
};

export const removeView = async ({
  schoolId,
  eventId,
}: {
  schoolId: string | number;
  eventId: string;
}) => {
  const response = await communicationApi.delete(
    `/v1/schools/${schoolId}/events/${eventId}/views`
  );
  return response.data;
};

export const getView = async ({
  schoolId,
  eventId,
}: {
  schoolId: string | number;
  eventId: string;
}) => {
  const response = await communicationApi.get(
    `/v1/schools/${schoolId}/events/${eventId}/views`
  );
  return response.data;
};

// Gestión de comentarios
export const addComment = async ({
  schoolId,
  eventId,
  dto,
}: {
  schoolId: string | number;
  eventId: string;
  dto: {
    person_id: string;
    parent_event_comment_id?: string | null;
    comment: string;
  };
}) => {
  const response = await communicationApi.post(
    `/v1/schools/${schoolId}/events/${eventId}/comments`,
    dto
  );
  return response.data;
};

export const getComments = async ({
  schoolId,
  eventId,
  offset = 0,
  limit = 100,
  filters,
}: EventArgs) => {
  const params = new URLSearchParams({
    offset: offset.toString(),
    limit: limit.toString(),
  });

  if (filters) {
    params.append("filters", filters);
  }

  const response = await communicationApi.get(
    `/v1/schools/${schoolId}/events/${eventId}/comments?${params.toString()}`
  );
  return response.data;
};

export const removeComment = async ({
  schoolId,
  eventId,
  commentId,
}: {
  schoolId: string | number;
  eventId: string;
  commentId: string;
}) => {
  const response = await communicationApi.delete(
    `/v1/schools/${schoolId}/events/${eventId}/comments/${commentId}`
  );
  return response.data;
};

export const getComment = async ({
  schoolId,
  eventId,
  commentId,
}: {
  schoolId: string | number;
  eventId: string;
  commentId: string;
}) => {
  const response = await communicationApi.get(
    `/v1/schools/${schoolId}/events/${eventId}/comments/${commentId}`
  );
  return response.data;
};

export const updateComment = async ({
  schoolId,
  eventId,
  commentId,
  dto,
}: {
  schoolId: string | number;
  eventId: string;
  commentId: string;
  dto: {
    comment: string;
  };
}) => {
  const response = await communicationApi.patch(
    `/v1/schools/${schoolId}/events/${eventId}/comments/${commentId}`,
    dto
  );
  return response.data;
};
