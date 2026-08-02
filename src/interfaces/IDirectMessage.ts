export interface DirectMessageRecipient {
  direct_message_id: string;
  recipient_id: string;
  is_read: boolean | null;
  read_at: string | null;
  status: string | null;
  created_at: string;
  given_name: string | null;
  paternal_surname: string | null;
  maternal_surname: string | null;
  type: string | null;
}

export interface DirectMessageAttachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  public_url: string;
  is_inline: boolean;
}

export interface DirectMessageRead {
  id: string;
  school_id: number;
  subject: string;
  body: string;
  sender_id: string;
  thread_id: string;
  parent_direct_message_id: string | null;
  has_attachments: boolean;
  created_at: string;
  updated_at: string;
  status: string | null;
  given_name: string | null;
  paternal_surname: string | null;
  maternal_surname: string | null;
  type: string | null;
  attachments: DirectMessageAttachment[];
  recipients: DirectMessageRecipient[];
  recipient_id: string | null;
  recipient_status: string | null;
  is_read: boolean | null;
  read_at: string | null;
}

export interface DirectMessageCreateDto {
  subject: string;
  body: string;
  recipients: string[];
  sender_id: string;
  thread_id?: string;
  parent_direct_message_id?: string;
}
