export interface TerminalRead {
  id: number;
  school_id: number;
  device_id: string;
  name: string;
  created: string | null;
  modified: string | null;
}

export interface TerminalCreate {
  device_id: string;
  name: string;
}

export interface TerminalUpdate {
  device_id?: string;
  name?: string;
}
