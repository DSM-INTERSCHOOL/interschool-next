export type OrderStatus = "PENDING" | "PLACED" | "COMPLETED" | "PARTIALLY_DISPATCHED" | "PAID" | "CANCELLED";
export type DeliveryMethod = "COLLECTION" | "DELIVERY";
export type PaymentMethod = "VENTANILLA" | "SPEI";

export interface CollectionOptions {
  date?: string;
  collection_point?: string;
  collected_by?: string;
}

export interface DeliveryOptions {
  shipping_address_id?: number;
  received_by?: string;
  notes?: string;
}

export interface OrderCreate {
  session_id: string;
  description: string;
  reference?: string;
  delivery_method?: DeliveryMethod;
  collection_options?: CollectionOptions;
  delivery_options?: DeliveryOptions;
  // Only honored when the caller is staff (ADMIN/CASHIER); ignored for a
  // plain shopper's own token and for guest checkout.
  person_internal_id?: string;
}

export interface OrderUpdate {
  status?: OrderStatus;
  delivery_method?: DeliveryMethod;
  description?: string;
  reference?: string;
  collection_options?: CollectionOptions;
  delivery_options?: DeliveryOptions;
  has_invoice?: boolean;
  has_receipt?: boolean;
}

export interface OrderDetailRead {
  id: number;
  school_id: number;
  order_id: number;
  product_id: number;
  amount: number;
  color: string | null;
  size: string | null;
  status: string | null;
  total: string; // Decimal -> FastAPI serializes as a string, not a number
  price: string;
  discount: string;
  discount_type: string | null;
  dispatched: number;
  returned: number;
  unit_discount: string;
}

export interface OrderRead {
  id: number;
  school_id: number;
  id_orden: number;
  person_internal_id: string | null;
  created_by_person_internal_id: string | null;
  session_id: string;
  delivery_method: DeliveryMethod | null;
  payment_method: PaymentMethod | null;
  status: OrderStatus | null;
  description: string;
  total: string;
  paid: boolean;
  paid_at: string | null;
  reference: string | null;
  has_invoice: boolean;
  has_receipt: boolean;
  collection_date: string | null;
  collection_point: string | null;
  collected_by: string | null;
  shipping_address_id: number | null;
  received_by: string | null;
  delivery_notes: string | null;
  created: string | null;
  details: OrderDetailRead[];
}

export interface OrderDetailCreate {
  order_id: number;
  product_id: number;
  amount: number;
  color?: string;
  size?: string;
  price: number; // write side: Pydantic accepts a plain number for Decimal
  discount?: number;
  discount_type?: "importe" | "porcentaje";
}

export interface CheckoutRequest {
  payment_method: PaymentMethod;
}

export interface PaymentInstructionsRead {
  payment_method: PaymentMethod;
  id_orden: number;
  total: string; // Decimal -> string
  message: string;
  clabe: string | null; // SPEI only
}
