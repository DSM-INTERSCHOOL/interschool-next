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

// Captura de inventario: unlike CostedLine's `quantity` (a relative
// change), `counted_quantity` is the absolute count found on the shelf --
// the backend computes the delta against what's on record.
export interface CaptureLine {
  product_id: number;
  color_id?: number;
  size_id?: number;
  counted_quantity: number;
  costo?: number;
}

export interface CaptureRequest {
  warehouse_id: number;
  lines: CaptureLine[];
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

// "Stock inicial / movimientos / stock final" report for one exact
// product/warehouse/color/size variant, and the warehouse-wide log (every
// movement across every product in a warehouse, no starting/ending
// balance -- that only means something for one fixed variant).
export interface ProductMovementLine {
  id: number;
  created: string | null;
  type: string;
  origin: string;
  quantity: number;
  available: number;
  person_internal_id: string;
  notes: string | null;
  costo: string | null; // Decimal -> string
  product_id: number;
  warehouse_id: number;
  color_id: number | null;
  size_id: number | null;
}

export interface ProductMovementReport {
  product_id: number;
  warehouse_id: number;
  color_id: number | null;
  size_id: number | null;
  start: string | null;
  end: string | null;
  stock_inicial: number;
  stock_final: number;
  movements: ProductMovementLine[];
}

export interface WarehouseMovementReport {
  warehouse_id: number;
  top_category_id: number | null;
  start: string | null;
  end: string | null;
  movements: ProductMovementLine[];
}
