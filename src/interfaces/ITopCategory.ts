// The two general ways an order can be placed (src.catalog.constants on
// the backend) -- gates which top_category(s) are orderable in each mode.
export type OrderMode = "SELF_SERVICE" | "OPERATOR";

export const ORDER_MODES: { value: OrderMode; label: string }[] = [
  { value: "SELF_SERVICE", label: "Autoservicio" },
  { value: "OPERATOR", label: "Operador" },
];

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
