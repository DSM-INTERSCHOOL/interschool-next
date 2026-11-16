export interface SizeRead {
  id: number;
  school_id: number;
  description: string;
  created: string | null;
  modified: string | null;
}

export interface SizeCreate {
  description: string;
}

export interface SizeUpdate {
  description?: string;
}
