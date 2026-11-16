import commerceApi from "./commerceApi";
import { TerminalCreate, TerminalRead, TerminalUpdate } from "@/interfaces/ITerminal";

interface ServiceArgs {
  schoolId: string | number | null;
}

interface TerminalArgs extends ServiceArgs {
  terminalId: number;
}

export const getTerminals = async ({ schoolId }: ServiceArgs): Promise<TerminalRead[]> => {
  const response = await commerceApi.get<TerminalRead[]>(`/schools/${schoolId}/terminals`);
  return response.data;
};

export const getTerminal = async ({ schoolId, terminalId }: TerminalArgs): Promise<TerminalRead> => {
  const response = await commerceApi.get<TerminalRead>(`/schools/${schoolId}/terminals/${terminalId}`);
  return response.data;
};

export const createTerminal = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: TerminalCreate }): Promise<TerminalRead> => {
  const response = await commerceApi.post<TerminalRead>(`/schools/${schoolId}/terminals`, dto);
  return response.data;
};

export const updateTerminal = async ({
  schoolId,
  terminalId,
  dto,
}: TerminalArgs & { dto: TerminalUpdate }): Promise<TerminalRead> => {
  const response = await commerceApi.put<TerminalRead>(`/schools/${schoolId}/terminals/${terminalId}`, dto);
  return response.data;
};

export const deleteTerminal = async ({ schoolId, terminalId }: TerminalArgs): Promise<void> => {
  await commerceApi.delete(`/schools/${schoolId}/terminals/${terminalId}`);
};
