export interface TopCategoryRead {
  id: number;
  school_id: number;
  description: string;
  created: string | null;
  modified: string | null;
}

export interface TopCategoryCreate {
  description: string;
}

export interface TopCategoryUpdate {
  description?: string;
}
