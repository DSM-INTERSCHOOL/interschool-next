import communicationApi from "./communicationApi";
import {
  PollRead,
  PollCreate,
  PollUpdate,
  PollQuestion,
  PollQuestionCreate,
  PollQuestionUpdate,
  PollQuestionType,
  PollQuestionTypeCreate,
  PollQuestionTypeUpdate,
  PersonPoll,
  PollResponseCreate,
  PollResponse,
  PollQuestionResult,
} from "@/interfaces/IPoll";

interface ServiceArgs {
  schoolId: string | number | null;
  offset?: number;
  limit?: number;
}

interface PollArgs extends ServiceArgs {
  pollId: string;
}

// ── Question Types ─────────────────────────────────────────────────────────────

export const getQuestionTypes = async ({
  schoolId,
  activeOnly = true,
}: {
  schoolId: string | number | null;
  activeOnly?: boolean;
}): Promise<PollQuestionType[]> => {
  const params = new URLSearchParams({ active_only: activeOnly.toString() });
  const response = await communicationApi.get<PollQuestionType[]>(
    `/v1/schools/${schoolId}/polls/question-types?${params.toString()}`
  );
  return response.data;
};

export const createQuestionType = async ({
  schoolId,
  dto,
}: {
  schoolId: string | number | null;
  dto: PollQuestionTypeCreate;
}): Promise<PollQuestionType> => {
  const response = await communicationApi.post<PollQuestionType>(
    `/v1/schools/${schoolId}/polls/question-types`,
    dto
  );
  return response.data;
};

export const updateQuestionType = async ({
  schoolId,
  typeId,
  dto,
}: {
  schoolId: string | number | null;
  typeId: number;
  dto: PollQuestionTypeUpdate;
}): Promise<PollQuestionType> => {
  const response = await communicationApi.put<PollQuestionType>(
    `/v1/schools/${schoolId}/polls/question-types/${typeId}`,
    dto
  );
  return response.data;
};

export const deleteQuestionType = async ({
  schoolId,
  typeId,
}: {
  schoolId: string | number | null;
  typeId: number;
}): Promise<PollQuestionType> => {
  const response = await communicationApi.delete<PollQuestionType>(
    `/v1/schools/${schoolId}/polls/question-types/${typeId}`
  );
  return response.data;
};

// ── Polls ──────────────────────────────────────────────────────────────────────

export const createPoll = async ({
  schoolId,
  dto,
}: {
  schoolId: string | number | null;
  dto: PollCreate;
}): Promise<PollRead> => {
  const response = await communicationApi.post<PollRead>(
    `/v1/schools/${schoolId}/polls`,
    dto
  );
  return response.data;
};

export const getPolls = async ({
  schoolId,
  personId,
  offset = 0,
  limit = 100,
}: ServiceArgs & { personId?: string }): Promise<PollRead[]> => {
  const params = new URLSearchParams({
    offset: offset.toString(),
    limit: limit.toString(),
  });
  if (personId) params.append("person_id", personId);
  const response = await communicationApi.get<PollRead[]>(
    `/v1/schools/${schoolId}/polls?${params.toString()}`
  );
  return response.data;
};

export const getPollById = async ({
  schoolId,
  pollId,
}: PollArgs): Promise<PollRead> => {
  const response = await communicationApi.get<PollRead>(
    `/v1/schools/${schoolId}/polls/${pollId}`
  );
  return response.data;
};

export const updatePoll = async ({
  schoolId,
  pollId,
  dto,
}: PollArgs & { dto: PollUpdate }): Promise<PollRead> => {
  const response = await communicationApi.put<PollRead>(
    `/v1/schools/${schoolId}/polls/${pollId}`,
    dto
  );
  return response.data;
};

export const deletePoll = async ({
  schoolId,
  pollId,
}: PollArgs): Promise<void> => {
  await communicationApi.delete(`/v1/schools/${schoolId}/polls/${pollId}`);
};

// ── Questions ──────────────────────────────────────────────────────────────────

export const getPollQuestions = async ({
  schoolId,
  pollId,
}: PollArgs): Promise<PollQuestion[]> => {
  const response = await communicationApi.get<PollQuestion[]>(
    `/v1/schools/${schoolId}/polls/${pollId}/questions`
  );
  return response.data;
};

export const createPollQuestion = async ({
  schoolId,
  pollId,
  dto,
}: PollArgs & { dto: PollQuestionCreate }): Promise<PollQuestion> => {
  const response = await communicationApi.post<PollQuestion>(
    `/v1/schools/${schoolId}/polls/${pollId}/questions`,
    dto
  );
  return response.data;
};

export const updatePollQuestion = async ({
  schoolId,
  pollId,
  questionId,
  dto,
}: PollArgs & { questionId: string; dto: PollQuestionUpdate }): Promise<PollQuestion> => {
  const response = await communicationApi.put<PollQuestion>(
    `/v1/schools/${schoolId}/polls/${pollId}/questions/${questionId}`,
    dto
  );
  return response.data;
};

export const deletePollQuestion = async ({
  schoolId,
  pollId,
  questionId,
}: PollArgs & { questionId: string }): Promise<void> => {
  await communicationApi.delete(
    `/v1/schools/${schoolId}/polls/${pollId}/questions/${questionId}`
  );
};

// ── Persons ────────────────────────────────────────────────────────────────────

export const addPollPersons = async ({
  schoolId,
  pollId,
  persons,
}: PollArgs & { persons: string[] }): Promise<void> => {
  await communicationApi.post(
    `/v1/schools/${schoolId}/polls/${pollId}/persons`,
    { persons }
  );
};

export const getPollPersons = async ({
  schoolId,
  pollId,
  offset = 0,
  limit = 100,
}: PollArgs): Promise<PersonPoll[]> => {
  const params = new URLSearchParams({
    offset: offset.toString(),
    limit: limit.toString(),
  });
  const response = await communicationApi.get<PersonPoll[]>(
    `/v1/schools/${schoolId}/polls/${pollId}/persons?${params.toString()}`
  );
  return response.data;
};

export const getPollPerson = async ({
  schoolId,
  pollId,
  personId,
}: PollArgs & { personId: string }): Promise<PersonPoll> => {
  const response = await communicationApi.get<PersonPoll>(
    `/v1/schools/${schoolId}/polls/${pollId}/persons/${personId}`
  );
  return response.data;
};

// ── Responses ─────────────────────────────────────────────────────────────────

export const submitPollResponses = async ({
  schoolId,
  pollId,
  personId,
  responses,
}: PollArgs & { personId: string; responses: PollResponseCreate[] }): Promise<PollResponse[]> => {
  const response = await communicationApi.post<PollResponse[]>(
    `/v1/schools/${schoolId}/polls/${pollId}/persons/${personId}/responses`,
    responses
  );
  return response.data;
};

export const getPollResponses = async ({
  schoolId,
  pollId,
  personId,
}: PollArgs & { personId: string }): Promise<PollResponse[]> => {
  const response = await communicationApi.get<PollResponse[]>(
    `/v1/schools/${schoolId}/polls/${pollId}/persons/${personId}/responses`
  );
  return response.data;
};

// ── Views ─────────────────────────────────────────────────────────────────────

export const addPollView = async ({
  schoolId,
  pollId,
  personId,
}: PollArgs & { personId: string }): Promise<void> => {
  await communicationApi.post(
    `/v1/schools/${schoolId}/polls/${pollId}/views`,
    { person_id: personId }
  );
};

// ── Results ───────────────────────────────────────────────────────────────────

export const getPollResults = async ({
  schoolId,
  pollId,
}: PollArgs): Promise<PollQuestionResult[]> => {
  const response = await communicationApi.get<PollQuestionResult[]>(
    `/v1/schools/${schoolId}/polls/${pollId}/results`
  );
  return response.data;
};
