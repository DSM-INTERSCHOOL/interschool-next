export interface WarehouseRead {
  id: number;
  school_id: number;
  description: string;
  for_sale: boolean;
  created: string | null;
  modified: string | null;
}

export interface WarehouseCreate {
  description: string;
  for_sale?: boolean;
}

export interface WarehouseUpdate {
  description?: string;
  for_sale?: boolean;
}
