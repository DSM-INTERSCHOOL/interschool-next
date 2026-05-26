export type RecipientScope = "ALL" | "SAME_ACADEMIC_STAGE" | "SAME_ACADEMIC_GROUP" | "NONE";
export type SchedulingPolicy = "FREE_SCHEDULING" | "NO_SLOT_REQUIRED" | "RECIPIENT_SLOT_OPTIONAL" | "RECIPIENT_SLOT_REQUIRED";

export interface IInotyNotificationsConfig {
  announcement_notification_enabled: boolean;
  feed_notification_enabled: boolean;
  poll_notification_enabled: boolean;
  event_notification_enabled: boolean;
  assignment_notification_enabled: boolean;
  chat_message_notification_enabled: boolean;
  direct_message_notification_enabled: boolean;
  daypass_notification_enabled: boolean;
  recipient_comments_notification_enabled: boolean;
  recipient_confirmation_notification_enabled: boolean;
  recipient_delivery_notification_enabled: boolean;
  recipient_likes_notification_enabled: boolean;
  recipient_views_notification_enabled: boolean;
}

export interface IInotyPermissions {
  news_enabled: boolean;
  assignments_enabled: boolean;
  chats_enabled: boolean;
  events_enabled: boolean;
  direct_messages_enabled: boolean;
  post_news_enabled: boolean;
  create_chat_conversations_enabled: boolean;
  statement_enabled: boolean;
  digital_id_enabled: boolean;
  daypass_enabled: boolean;
  post_new_direct_messages_enabled: boolean;
  polls_enabled: boolean;
}

export type IInotyPermissionsConfig = Record<string, IInotyPermissions>;

export type IInotyRecipientsConfig = Record<string, Record<string, RecipientScope | null>>;

export interface IAppointmentPolicy {
  schedulingPolicy: SchedulingPolicy;
  allowed_target_groups: RecipientScope;
}

export type IInotyAppointmentsConfig = Record<string, Record<string, IAppointmentPolicy | null> | null>;

export interface IInotyConfig {
  inoty_notifications_config: IInotyNotificationsConfig;
  inoty_permissions_config: IInotyPermissionsConfig;
  inoty_recipients_config: IInotyRecipientsConfig;
  inoty_appointments_config: IInotyAppointmentsConfig;
}

export interface ISchool {
  id: number;
  name: string;
  school_key: string;
  city: string | null;
  state: string | null;
  contact: string | null;
  email: string | null;
  graphql_endpoint: string | null;
  status: string;
  logo_path: string | null;
  search_key: string | null;
  legacy_url_student: string | null;
  legacy_url_admin: string | null;
  legacy_url_teacher: string | null;
  legacy_url_base_interschool: string | null;
  inoty_config: IInotyConfig | null;
  created: string | null;
  modified: string | null;
  created_by: string | null;
  last_modified_by: string | null;
}
