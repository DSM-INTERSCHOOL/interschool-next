export interface ProductSatRead {
  id: number;
  school_id: number;
  key: string;
  description: string;
}

export interface ProductSatCreate {
  key: string;
  description: string;
}

export interface ProductSatUpdate {
  key?: string;
  description?: string;
}
