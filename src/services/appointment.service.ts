import communicationApi from "./communicationApi";
import {
  IGlobalBlockCreate,
  IGlobalBlockUpdate,
  IGlobalBlockRead,
  IHolidayCreate,
  IHolidayUpdate,
  IHolidayRead,
  IHolidayApply,
  IHolidayApplyResult,
  IPersonAvailabilityCreate,
  IPersonAvailabilityUpdate,
  IPersonAvailabilityRead,
  IAvailabilityRuleCreate,
  IAvailabilityRuleUpdate,
  IAvailabilityRuleRead,
  IAvailabilityExceptionCreate,
  IAvailabilityExceptionUpdate,
  IAvailabilityExceptionRead,
  IAvailableSlot,
  IPersonSlotsResponse,
  IAppointmentRead,
  IAppointmentUpdate,
  IAppointmentCreate,
  AppointmentStatus,
} from "@/interfaces/IAppointment";

interface SchoolArgs {
  schoolId: string | number | null;
}

interface BlockArgs extends SchoolArgs {
  blockId: string;
}

export const getGlobalBlocks = async ({
  schoolId,
}: SchoolArgs): Promise<IGlobalBlockRead[]> => {
  const response = await communicationApi.get(
    `/v1/schools/${schoolId}/global-blocks`
  );
  return response.data;
};

export const createGlobalBlock = async ({
  schoolId,
  dto,
}: SchoolArgs & { dto: IGlobalBlockCreate }): Promise<IGlobalBlockRead> => {
  const response = await communicationApi.post(
    `/v1/schools/${schoolId}/global-blocks`,
    dto
  );
  return response.data;
};

export const getGlobalBlock = async ({
  schoolId,
  blockId,
}: BlockArgs): Promise<IGlobalBlockRead> => {
  const response = await communicationApi.get(
    `/v1/schools/${schoolId}/global-blocks/${blockId}`
  );
  return response.data;
};

export const updateGlobalBlock = async ({
  schoolId,
  blockId,
  dto,
}: BlockArgs & { dto: IGlobalBlockUpdate }): Promise<IGlobalBlockRead> => {
  const response = await communicationApi.put(
    `/v1/schools/${schoolId}/global-blocks/${blockId}`,
    dto
  );
  return response.data;
};

export const deleteGlobalBlock = async ({
  schoolId,
  blockId,
}: BlockArgs): Promise<void> => {
  await communicationApi.delete(
    `/v1/schools/${schoolId}/global-blocks/${blockId}`
  );
};

// ── Holidays ──────────────────────────────────────────────────────────────────

interface HolidayArgs extends SchoolArgs {
  holidayId: string;
}

export const getHolidays = async ({
  schoolId,
}: SchoolArgs): Promise<IHolidayRead[]> => {
  const response = await communicationApi.get(
    `/v1/schools/${schoolId}/holidays`
  );
  return response.data;
};

export const createHoliday = async ({
  schoolId,
  dto,
}: SchoolArgs & { dto: IHolidayCreate }): Promise<IHolidayRead> => {
  const response = await communicationApi.post(
    `/v1/schools/${schoolId}/holidays`,
    dto
  );
  return response.data;
};

export const getHoliday = async ({
  schoolId,
  holidayId,
}: HolidayArgs): Promise<IHolidayRead> => {
  const response = await communicationApi.get(
    `/v1/schools/${schoolId}/holidays/${holidayId}`
  );
  return response.data;
};

export const updateHoliday = async ({
  schoolId,
  holidayId,
  dto,
}: HolidayArgs & { dto: IHolidayUpdate }): Promise<IHolidayRead> => {
  const response = await communicationApi.put(
    `/v1/schools/${schoolId}/holidays/${holidayId}`,
    dto
  );
  return response.data;
};

export const deleteHoliday = async ({
  schoolId,
  holidayId,
}: HolidayArgs): Promise<void> => {
  await communicationApi.delete(
    `/v1/schools/${schoolId}/holidays/${holidayId}`
  );
};

export const applyHolidays = async ({
  schoolId,
  dto,
}: SchoolArgs & { dto: IHolidayApply }): Promise<IHolidayApplyResult> => {
  const response = await communicationApi.post(
    `/v1/schools/${schoolId}/holidays/apply`,
    dto
  );
  return response.data;
};

// ── Person Availability ───────────────────────────────────────────────────────

export const getPersonAvailability = async ({
  schoolId,
  personId,
}: SchoolArgs & { personId: string }): Promise<IPersonAvailabilityRead> => {
  const response = await communicationApi.get(
    `/v1/schools/${schoolId}/availability/${personId}`
  );
  return response.data;
};

export const createPersonAvailability = async ({
  schoolId,
  personId,
  dto,
}: SchoolArgs & { personId: string; dto: Omit<IPersonAvailabilityCreate, "person_id"> }): Promise<IPersonAvailabilityRead> => {
  const body: IPersonAvailabilityCreate = {
    person_id: personId,
    availability_type: dto.availability_type,
    slot_duration_minutes: dto.slot_duration_minutes,
    timezone: dto.timezone,
    active: dto.active,
  };
  const response = await communicationApi.post(
    `/v1/schools/${schoolId}/availability`,
    body
  );
  return response.data;
};

export const updatePersonAvailability = async ({
  schoolId,
  personId,
  dto,
}: SchoolArgs & { personId: string; dto: IPersonAvailabilityUpdate }): Promise<IPersonAvailabilityRead> => {
  const response = await communicationApi.put(
    `/v1/schools/${schoolId}/availability/${personId}`,
    dto
  );
  return response.data;
};

// Rules
export const createRule = async ({
  schoolId,
  personId,
  dto,
}: SchoolArgs & { personId: string; dto: IAvailabilityRuleCreate }): Promise<IAvailabilityRuleRead> => {
  const response = await communicationApi.post(
    `/v1/schools/${schoolId}/availability/${personId}/rules`,
    dto
  );
  return response.data;
};

export const updateRule = async ({
  schoolId,
  personId,
  ruleId,
  dto,
}: SchoolArgs & { personId: string; ruleId: string; dto: IAvailabilityRuleUpdate }): Promise<IAvailabilityRuleRead> => {
  const response = await communicationApi.put(
    `/v1/schools/${schoolId}/availability/${personId}/rules/${ruleId}`,
    dto
  );
  return response.data;
};

export const deleteRule = async ({
  schoolId,
  personId,
  ruleId,
}: SchoolArgs & { personId: string; ruleId: string }): Promise<void> => {
  await communicationApi.delete(
    `/v1/schools/${schoolId}/availability/${personId}/rules/${ruleId}`
  );
};

// Exceptions
export const createException = async ({
  schoolId,
  personId,
  dto,
}: SchoolArgs & { personId: string; dto: IAvailabilityExceptionCreate }): Promise<IAvailabilityExceptionRead> => {
  const response = await communicationApi.post(
    `/v1/schools/${schoolId}/availability/${personId}/exceptions`,
    dto
  );
  return response.data;
};

export const updateException = async ({
  schoolId,
  personId,
  exceptionId,
  dto,
}: SchoolArgs & { personId: string; exceptionId: string; dto: IAvailabilityExceptionUpdate }): Promise<IAvailabilityExceptionRead> => {
  const response = await communicationApi.put(
    `/v1/schools/${schoolId}/availability/${personId}/exceptions/${exceptionId}`,
    dto
  );
  return response.data;
};

export const deleteException = async ({
  schoolId,
  personId,
  exceptionId,
}: SchoolArgs & { personId: string; exceptionId: string }): Promise<void> => {
  await communicationApi.delete(
    `/v1/schools/${schoolId}/availability/${personId}/exceptions/${exceptionId}`
  );
};

// Slot finder
export const findFreeSlots = async ({
  schoolId,
  personId1,
  personId2,
  targetDate,
  durationMinutes,
}: SchoolArgs & {
  personId1: string;
  personId2: string;
  targetDate: string;
  durationMinutes: number;
}): Promise<IAvailableSlot[]> => {
  const params = new URLSearchParams({
    person_id_1: personId1,
    person_id_2: personId2,
    target_date: targetDate,
    duration_minutes: String(durationMinutes),
  });
  const response = await communicationApi.get(
    `/v1/schools/${schoolId}/availability/slots/find?${params.toString()}`
  );
  return response.data;
};

// ── Appointments ──────────────────────────────────────────────────────────────

export const getPersonSlots = async ({
  schoolId,
  personId,
  fromDate,
  toDate,
}: SchoolArgs & { personId: string; fromDate: string; toDate: string }): Promise<IPersonSlotsResponse> => {
  const params = new URLSearchParams({ from_date: fromDate, to_date: toDate });
  const response = await communicationApi.get<IPersonSlotsResponse>(
    `/v1/schools/${schoolId}/availability/${personId}/slots?${params.toString()}`
  );
  return response.data;
};

export const updateAppointment = async ({
  schoolId,
  appointmentId,
  dto,
}: SchoolArgs & { appointmentId: string; dto: IAppointmentUpdate }): Promise<IAppointmentRead> => {
  const response = await communicationApi.put<IAppointmentRead>(
    `/v1/schools/${schoolId}/appointments/${appointmentId}`,
    dto
  );
  return response.data;
};

export const updateAppointmentStatus = async ({
  schoolId,
  appointmentId,
  status,
}: SchoolArgs & {
  appointmentId: string;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
}): Promise<void> => {
  await communicationApi.put(
    `/v1/schools/${schoolId}/appointments/${appointmentId}`,
    { status }
  );
};

export const updateParticipantStatus = async ({
  schoolId,
  appointmentId,
  personId,
  status,
}: SchoolArgs & {
  appointmentId: string;
  personId: string;
  status: "CONFIRMED" | "DECLINED" | "CANCELLED";
}): Promise<void> => {
  await communicationApi.put(
    `/v1/schools/${schoolId}/appointments/${appointmentId}/participants/${personId}`,
    { status }
  );
};

export const createAppointment = async ({
  schoolId,
  dto,
}: SchoolArgs & { dto: IAppointmentCreate }): Promise<IAppointmentRead> => {
  const response = await communicationApi.post(
    `/v1/schools/${schoolId}/appointments`,
    dto
  );
  return response.data;
};

export const getAppointments = async ({
  schoolId,
  personId,
  startFrom,
  startUntil,
  status,
  offset = 0,
  limit = 50,
}: SchoolArgs & {
  personId: string;
  startFrom: string;
  startUntil: string;
  status?: AppointmentStatus;
  offset?: number;
  limit?: number;
}): Promise<IAppointmentRead[]> => {
  const params = new URLSearchParams({
    person_id: personId,
    start_from: startFrom,
    start_until: startUntil,
    offset: String(offset),
    limit: String(limit),
  });
  if (status) params.set("status", status);
  const response = await communicationApi.get(
    `/v1/schools/${schoolId}/appointments?${params.toString()}`
  );
  return response.data;
};
