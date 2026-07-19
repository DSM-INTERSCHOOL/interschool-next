import communicationApi from "./communicationApi";
import { FeedRead, FeedComment, FeedCreateDto } from "@/interfaces/IFeed";

const nowISO = () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

export const getFeeds = async ({
  schoolId,
  personId,
  offset = 0,
  limit = 5,
}: {
  schoolId: string | number | null;
  personId: string | number | null;
  offset?: number;
  limit?: number;
}): Promise<FeedRead[]> => {
  const now = nowISO();
  const filters = [
    "authorized::eq::true",
    `person_id::eq::${personId}`,
    `start_date::lte::${now}`,
    `end_date::gte::${now}`,
  ].join(",");
  const params = new URLSearchParams({ offset: String(offset), limit: String(limit), filters });
  const response = await communicationApi.get<FeedRead[]>(
    `/v1/schools/${schoolId}/feeds?${params.toString()}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const getFeedById = async ({
  schoolId,
  feedId,
}: {
  schoolId: string | number | null;
  feedId: string;
}): Promise<FeedRead> => {
  const response = await communicationApi.get<FeedRead>(
    `/v1/schools/${schoolId}/feeds/${feedId}`
  );
  return response.data;
};

export const createFeed = async ({
  schoolId,
  dto,
}: {
  schoolId: string | number | null;
  dto: FeedCreateDto;
}): Promise<FeedRead> => {
  const response = await communicationApi.post<FeedRead>(
    `/v1/schools/${schoolId}/feeds`,
    dto
  );
  return response.data;
};

export const deleteFeed = async ({
  schoolId,
  feedId,
}: {
  schoolId: string | number | null;
  feedId: string;
}): Promise<void> => {
  await communicationApi.delete(`/v1/schools/${schoolId}/feeds/${feedId}`);
};

export const likeFeed = async ({
  schoolId,
  feedId,
}: {
  schoolId: string | number | null;
  feedId: string;
}): Promise<{ id: string }> => {
  const response = await communicationApi.post<{ id: string }>(
    `/v1/schools/${schoolId}/feeds/${feedId}/likes`
  );
  return response.data;
};

export const unlikeFeed = async ({
  schoolId,
  feedId,
  likeId,
}: {
  schoolId: string | number | null;
  feedId: string;
  likeId: string;
}): Promise<void> => {
  await communicationApi.delete(
    `/v1/schools/${schoolId}/feeds/${feedId}/likes/${likeId}`
  );
};

export const getFeedComments = async ({
  schoolId,
  feedId,
}: {
  schoolId: string | number | null;
  feedId: string;
}): Promise<FeedComment[]> => {
  const response = await communicationApi.get<FeedComment[]>(
    `/v1/schools/${schoolId}/feeds/${feedId}/comments`
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const createFeedComment = async ({
  schoolId,
  feedId,
  text,
}: {
  schoolId: string | number | null;
  feedId: string;
  text: string;
}): Promise<FeedComment> => {
  const response = await communicationApi.post<FeedComment>(
    `/v1/schools/${schoolId}/feeds/${feedId}/comments`,
    { text }
  );
  return response.data;
};

export const deleteFeedComment = async ({
  schoolId,
  feedId,
  commentId,
}: {
  schoolId: string | number | null;
  feedId: string;
  commentId: string;
}): Promise<void> => {
  await communicationApi.delete(
    `/v1/schools/${schoolId}/feeds/${feedId}/comments/${commentId}`
  );
};
