export interface ColorRead {
  id: number;
  school_id: number;
  description: string;
  created: string | null;
  modified: string | null;
}

export interface ColorCreate {
  description: string;
}

export interface ColorUpdate {
  description?: string;
}
