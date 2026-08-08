import { IAttachmentCreate, IAttachmentRead, IPersonRead } from "./IAnnouncement";

export type { IAttachmentCreate, IAttachmentRead, IPersonRead };

export interface PollQuestionType {
  id: number;
  code: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TEXT" | "RATING" | "BOOLEAN" | "LIKERT" | string;
  name: string;
  description: string | null;
  has_options: boolean;
  allows_multiple_responses: boolean;
  active: boolean;
  created_at: string | null;
  modified_at: string | null;
}

export interface PollQuestionTypeCreate {
  code: string;
  name: string;
  description?: string;
  has_options: boolean;
  allows_multiple_responses: boolean;
  active?: boolean;
}

export interface PollQuestionTypeUpdate {
  name?: string;
  description?: string;
  has_options?: boolean;
  allows_multiple_responses?: boolean;
  active?: boolean;
}

export interface PollQuestionOption {
  id: string;
  question_id: string;
  text: string;
  order: number;
  created_at: string | null;
}

export interface PollQuestionOptionCreate {
  text: string;
  order: number;
}

export interface PollQuestion {
  id: string;
  poll_id: string;
  question_type_id: number;
  question_type: PollQuestionType;
  text: string;
  description: string | null;
  required: boolean;
  order: number;
  min_value: number | null;
  max_value: number | null;
  max_length: number | null;
  options: PollQuestionOption[];
  created_at: string | null;
  modified_at: string | null;
}

export interface PollQuestionCreate {
  question_type_id: number;
  text: string;
  description?: string;
  required?: boolean;
  order?: number;
  min_value?: number;
  max_value?: number;
  max_length?: number;
  options?: PollQuestionOptionCreate[];
}

export interface PollQuestionUpdate {
  text?: string;
  description?: string;
  required?: boolean;
  order?: number;
  min_value?: number;
  max_value?: number;
  max_length?: number;
  options?: PollQuestionOptionCreate[];
}

export interface PollRead {
  id: string;
  school_id: number;
  publisher_person_id: string;
  publisher: IPersonRead | null;
  title: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  anonymous: boolean;
  status: "DRAFT" | "PUBLISHED" | "CLOSED" | string | null;
  authorized: boolean;
  authorized_by: string | null;
  authorized_on: string | null;
  academic_years: string[];
  academic_stages: string[];
  academic_programs: string[];
  academic_modalities: string[];
  academic_program_years: string[];
  academic_groups: string[];
  questions: PollQuestion[];
  attachments: IAttachmentRead[];
  total_persons: number | null;
  responded_persons: number | null;
  created_at: string | null;
  modified_at: string | null;
}

export interface PollCreate {
  publisher_person_id: string;
  persons: string[];
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  anonymous?: boolean;
  status?: string;
  authorized?: boolean;
  authorized_by?: string;
  authorized_on?: string;
  academic_years?: string[];
  academic_stages?: string[];
  academic_programs?: string[];
  academic_modalities?: string[];
  academic_program_years?: string[];
  academic_groups?: string[];
  questions?: PollQuestionCreate[];
  attachments?: IAttachmentCreate[];
}

export interface PollUpdate {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  anonymous?: boolean;
  status?: string;
  authorized?: boolean;
  authorized_by?: string;
  authorized_on?: string;
  attachments?: IAttachmentCreate[];
}

export interface PersonPoll {
  poll_id: string;
  person_id: string;
  given_name: string | null;
  paternal_surname: string | null;
  maternal_surname: string | null;
  type: string | null;
  responded: boolean;
  responded_at: string | null;
  modified_at: string;
}

export interface PollResponseCreate {
  question_id: string;
  option_id?: string | null;
  text_response?: string | null;
}

export interface PollResponse {
  id: string;
  poll_id: string;
  question_id: string;
  person_id: string;
  option_id: string | null;
  text_response: string | null;
  created_at: string | null;
  modified_at: string | null;
}

export interface PollQuestionOptionResult {
  option_id: string | null;
  text: string | null;
  count: number;
}

export interface PollQuestionResult {
  question_id: string;
  question_text: string;
  question_type_code: string;
  total_responses: number;
  options: PollQuestionOptionResult[];
  text_responses: string[];
}
