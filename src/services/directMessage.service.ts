import axios from "axios";
import communicationApi from "./communicationApi";
import { getDeviceId } from "@/lib/deviceId";
import { getOrgConfig } from "@/lib/orgConfig";
import { useAuthStore } from "@/store/useAuthStore";
import { DirectMessageRead, DirectMessageCreateDto } from "@/interfaces/IDirectMessage";

export interface RecipientCandidate {
  person_id: number;
  person_internal_id: string;
  full_name: string;
  given_name: string | null;
  paternal_name: string | null;
  maternal_name: string | null;
  person_type: string;
  job_position: string | null;
  academic_year_key: string | null;
  academic_stage_key: string | null;
  academic_group_key: string | null;
}

export interface RecipientSearchResponse {
  items: RecipientCandidate[];
  total: number;
  skip: number;
  limit: number;
}

export const getReceivedMessages = async (schoolId: string, personId: number): Promise<DirectMessageRead[]> => {
  const filters = `recipient_person_id::eq::${personId},only_active_recipient::eq::True`;
  const res = await communicationApi.get<DirectMessageRead[]>(
    `/v1/schools/${schoolId}/direct-messages`, { params: { filters } }
  );
  return Array.isArray(res.data) ? res.data : [];
};

export const getSentMessages = async (schoolId: string, personId: number): Promise<DirectMessageRead[]> => {
  const filters = `sender_person_id::eq::${personId}`;
  const res = await communicationApi.get<DirectMessageRead[]>(
    `/v1/schools/${schoolId}/direct-messages`, { params: { filters } }
  );
  return Array.isArray(res.data) ? res.data : [];
};

export const getMessageById = async (schoolId: string, messageId: string): Promise<DirectMessageRead> => {
  const res = await communicationApi.get<DirectMessageRead>(
    `/v1/schools/${schoolId}/direct-messages/${messageId}`
  );
  return res.data;
};

export const sendMessage = async (schoolId: string, dto: DirectMessageCreateDto): Promise<DirectMessageRead> => {
  const res = await communicationApi.post<DirectMessageRead>(
    `/v1/schools/${schoolId}/direct-messages`, dto
  );
  return res.data;
};

export const markAsRead = async (schoolId: string, messageId: string, recipientId: string): Promise<void> => {
  await communicationApi.post(
    `/v1/schools/${schoolId}/direct-messages/${messageId}/recipients/${recipientId}/reads`
  );
};

export const deleteMessage = async (schoolId: string, messageId: string, personId: number): Promise<void> => {
  await communicationApi.delete(
    `/v1/schools/${schoolId}/direct-messages/${messageId}`,
    { params: { person_id: String(personId) } }
  );
};

export const searchRecipients = async (
  schoolId: string,
  personId: number,
  personType: string,
  searchTerm: string,
  targetPersonType?: string,
  skip = 0,
  limit = 20,
): Promise<RecipientSearchResponse> => {
  const { portalName } = getOrgConfig();
  const token = useAuthStore.getState().token;
  const params = new URLSearchParams({
    person_id: String(personId),
    person_type: personType,
    skip: String(skip),
    limit: String(limit),
  });
  if (searchTerm.trim()) params.set("search_term", searchTerm.trim());
  if (targetPersonType) params.set("target_person_type", targetPersonType);
  const res = await axios.get<RecipientSearchResponse>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/schools/${schoolId}/message-recipients?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-device-id": getDeviceId(),
        "x-url-origin": portalName,
        "Content-Type": "application/json",
      },
    }
  );
  return res.data;
};
