export interface IPersonRead {
  id: string;
  given_name: string | null;
  paternal_surname: string | null;
  maternal_surname: string | null;
  type: string | null;
  official_picture_url: string | null;
  profile_picture_url: string | null;
}

export interface IGlobalBlockCreate {
  name: string;
  block_type: string;
  start_date: string;
  end_date: string;
  applies_to_all: boolean;
  recurring: boolean;
  active: boolean;
  created_by: string;
  person_ids: string[];
}

export interface IGlobalBlockUpdate {
  name?: string;
  block_type?: string;
  start_date?: string;
  end_date?: string;
  applies_to_all?: boolean;
  recurring?: boolean;
  active?: boolean;
  person_ids?: string[];
}

export interface IGlobalBlockRead {
  id: string;
  school_id: number;
  name: string;
  block_type: string;
  start_date: string;
  end_date: string;
  applies_to_all: boolean;
  recurring: boolean;
  active: boolean;
  created_by: string | null;
  created_at: string | null;
  modified_at: string | null;
  persons: IPersonRead[];
}

// ── Holidays ──────────────────────────────────────────────────────────────────

export type HolidayType = "FIXED" | "NTH_WEEKDAY" | "LAST_WEEKDAY_BEFORE";

export interface IHolidayCreate {
  name: string;
  holiday_type: HolidayType;
  month: number;
  day?: number | null;
  nth?: number | null;
  day_of_week?: number | null;
  before_day?: number | null;
  active: boolean;
}

export interface IHolidayUpdate {
  name?: string;
  holiday_type?: HolidayType;
  month?: number;
  day?: number | null;
  nth?: number | null;
  day_of_week?: number | null;
  before_day?: number | null;
  active?: boolean;
}

export interface IHolidayRead {
  id: string;
  school_id: number;
  name: string;
  holiday_type: HolidayType;
  month: number;
  day: number | null;
  nth: number | null;
  day_of_week: number | null;
  before_day: number | null;
  active: boolean;
  created_at: string | null;
  modified_at: string | null;
}

export interface IHolidayApply {
  year: number;
  applies_to_all: boolean;
  block_type: string;
}

export interface IHolidayApplyResult {
  created: number;
}

// ── Person Availability ───────────────────────────────────────────────────────

export type AvailabilityType = "OPEN" | "SPECIFIC";
export type ExceptionType = "UNAVAILABLE" | "CUSTOM_HOURS";

export interface IAvailabilityRuleCreate {
  days_of_week: number[];
  start_time: string;
  end_time: string;
  valid_from?: string | null;
  valid_until?: string | null;
  active: boolean;
}

export interface IAvailabilityRuleUpdate {
  days_of_week?: number[];
  start_time?: string;
  end_time?: string;
  valid_from?: string | null;
  valid_until?: string | null;
  active?: boolean;
}

export interface IAvailabilityRuleRead {
  id: string;
  availability_id: string;
  days_of_week: number[];
  start_time: string;
  end_time: string;
  valid_from: string | null;
  valid_until: string | null;
  active: boolean;
  created_at: string | null;
  modified_at: string | null;
}

export interface IAvailabilityExceptionCreate {
  exception_type: ExceptionType;
  start_datetime: string;
  end_datetime: string;
  reason?: string | null;
}

export interface IAvailabilityExceptionUpdate {
  exception_type?: ExceptionType;
  start_datetime?: string;
  end_datetime?: string;
  reason?: string | null;
}

export interface IAvailabilityExceptionRead {
  id: string;
  person_availability_id: string;
  exception_type: ExceptionType;
  start_datetime: string;
  end_datetime: string;
  reason: string | null;
  created_at: string | null;
  modified_at: string | null;
}

export interface IPersonAvailabilityCreate {
  person_id: string;
  availability_type: AvailabilityType;
  slot_duration_minutes: number;
  timezone: string;
  active: boolean;
}

export interface IPersonAvailabilityUpdate {
  availability_type?: AvailabilityType;
  slot_duration_minutes?: number;
  timezone?: string;
  active?: boolean;
}

export interface IPersonAvailabilityRead {
  id: string;
  person_id: string;
  school_id: number;
  availability_type: AvailabilityType;
  slot_duration_minutes: number;
  timezone: string;
  active: boolean;
  created_at: string | null;
  modified_at: string | null;
  rules: IAvailabilityRuleRead[];
  exceptions: IAvailabilityExceptionRead[];
}

export interface IAvailableSlot {
  start: string;
  end: string;
}

export interface IAvailableSlotDay {
  date: string;
  slots: IAvailableSlot[];
}

export interface IPersonSlotsResponse {
  person_id: string;
  from_date: string;
  to_date: string;
  duration_minutes: number;
  days: IAvailableSlotDay[];
}

// ── Appointment recipients ────────────────────────────────────────────────────

export interface IAppointmentRecipient {
  school_id: number;
  person_id: number;
  person_internal_id: string | null;
  given_name: string | null;
  paternal_name: string | null;
  maternal_name: string | null;
  full_name: string | null;
  display_name: string | null;
  job_position: string | null;
  person_type: string;
  enrollment_type: string | null;
  academic_year_key: string | null;
  academic_stage_key: string | null;
  academic_program_key: string | null;
  academic_modality_key: string | null;
  program_year_key: string | null;
  academic_group_key: string | null;
}

export interface IAppointmentRecipientsResponse {
  items: IAppointmentRecipient[];
  total: number;
  skip: number;
  limit: number;
}

// ── Appointments ──────────────────────────────────────────────────────────────

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
export type ParticipantRole = "ORGANIZER" | "ATTENDEE";
export type ParticipantStatus = "PENDING" | "CONFIRMED" | "DECLINED" | "CANCELLED";

export interface IAppointmentParticipantPerson {
  id: string;
  school_id: number;
  given_name: string | null;
  paternal_surname: string | null;
  maternal_surname: string | null;
  person_internal_id: string | null;
  type: string | null;
  official_picture_url: string | null;
  profile_picture_url: string | null;
}

export interface IAppointmentParticipant {
  appointment_id: string;
  person_id: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  responded_at: string | null;
  invitation_sent_at: string | null;
  added_by: string | null;
  added_at: string | null;
  removed_at: string | null;
  removed_by: string | null;
  person: IAppointmentParticipantPerson;
}

export interface IAppointmentRead {
  id: string;
  school_id: number;
  host_person_id: string;
  status: AppointmentStatus;
  title: string | null;
  description: string | null;
  without_time: boolean;
  scheduled_start: string;
  scheduled_end: string;
  duration_minutes: number;
  location: string | null;
  virtual_link: string | null;
  notes: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string | null;
  modified_at: string | null;
  participants: IAppointmentParticipant[];
}

export interface IAppointmentUpdate {
  title?: string | null;
  description?: string | null;
  without_time?: boolean;
  scheduled_start?: string;
  scheduled_end?: string;
  duration_minutes?: number;
  location?: string | null;
  virtual_link?: string | null;
  notes?: string | null;
}

export interface IAppointmentCreate {
  host_person_id: string;
  title: string | null;
  description: string | null;
  without_time: boolean;
  scheduled_start?: string;
  scheduled_end?: string;
  duration_minutes?: number;
  location: string | null;
  virtual_link: string | null;
  notes: string | null;
  participant_ids: string[];
}
