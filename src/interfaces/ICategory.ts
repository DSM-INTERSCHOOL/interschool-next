export interface CategoryRead {
  id: number;
  school_id: number;
  description: string;
  created: string | null;
  modified: string | null;
}

export interface CategoryCreate {
  description: string;
}

export interface CategoryUpdate {
  description?: string;
}
