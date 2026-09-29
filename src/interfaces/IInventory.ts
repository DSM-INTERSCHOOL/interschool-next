export interface InventoryRead {
  id: number;
  school_id: number;
  product_id: number;
  warehouse_id: number;
  color_id: number | null;
  size_id: number | null;
  quantity: number;
  created: string | null;
  modified: string | null;
}

export interface CostedLine {
  product_id: number;
  color_id?: number;
  size_id?: number;
  quantity: number;
  costo: number;
}

export interface EntradaRequest {
  warehouse_id: number;
  lines: CostedLine[];
  notes?: string;
}

export interface SalidaRequest {
  warehouse_id: number;
  lines: CostedLine[];
  notes?: string;
}

export interface TransferenciaRequest {
  warehouse_origen_id: number;
  warehouse_destino_id: number;
  lines: CostedLine[];
  notes?: string;
}

export interface KardexRead {
  id: number;
  school_id: number;
  id_kardex: number;
  person_internal_id: string;
  created: string | null;
}

export interface ProductKardexRead {
  id: number;
  school_id: number;
  type: string;
  origin: string;
  notes: string | null;
  available: number;
  warehouse_id: number;
  product_id: number;
  quantity: number;
  color_id: number | null;
  size_id: number | null;
  costo: string | null; // Decimal -> FastAPI serializes as a string, not a number
  kardex_id: number | null;
  created: string | null;
}
