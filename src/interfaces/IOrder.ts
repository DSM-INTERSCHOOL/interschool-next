import { OrderMode } from "./ITopCategory";

export type OrderStatus = "PENDING" | "PLACED" | "COMPLETED" | "PARTIALLY_DISPATCHED" | "PAID" | "CANCELLED";
export type DeliveryMethod = "COLLECTION" | "DELIVERY";
export type PaymentMethod = "VENTANILLA" | "SPEI";

export const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "Pendiente" },
  { value: "PLACED", label: "Colocada" },
  { value: "PARTIALLY_DISPATCHED", label: "Parcialmente Entregada" },
  { value: "COMPLETED", label: "Completada" },
  { value: "PAID", label: "Pagada" },
  { value: "CANCELLED", label: "Cancelada" },
];

// Used by the Cobros (payment collection) screen. `status` doubles as both
// a payment milestone (PENDING/PLACED/PAID) and a fulfillment milestone
// (PARTIALLY_DISPATCHED/COMPLETED) -- once dispatch starts on an already-
// paid order, status moves on to one of those and never says PAID again,
// even though it's still fully paid. So "not yet paid" can't be read as
// "status != PAID": PENDING/PLACED are the only statuses an order can have
// before payment (see DISPATCHABLE_STATUSES below for the mutually
// exclusive paid-but-undelivered set Entregas uses).
export const COLLECTIBLE_STATUSES: OrderStatus[] = ["PENDING", "PLACED"];

// Used by the Entregas (delivery) screen: an order can have items dispatched
// against it once it's been paid, through to (but not including) having
// everything already delivered.
export const DISPATCHABLE_STATUSES: OrderStatus[] = ["PAID", "PARTIALLY_DISPATCHED"];

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
  // Which order-entry flow is creating this order -- set explicitly, not
  // inferred server-side.
  order_mode?: OrderMode;
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
  // The product's current title, joined server-side -- null only if the
  // product was deleted after this line was created.
  product_title: string | null;
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
  order_mode: OrderMode | null;
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

export interface OrderDetailUpdate {
  amount?: number;
  color?: string;
  size?: string;
  status?: string;
  price?: number;
  discount?: number;
  discount_type?: "importe" | "porcentaje";
}

export interface CheckoutRequest {
  payment_method: PaymentMethod;
}

// What ConfirmationScreen actually needs to display -- satisfied by the
// backend's PaymentInstructionsRead (VENTANILLA/SPEI, via checkout()) and
// also by a client-built confirmation for a SALDO payment (via
// realizarPago(), which returns a differently-shaped TransactionResult,
// not a PaymentInstructionsRead).
export interface PaymentConfirmation {
  id_orden: number;
  total: string; // Decimal -> string
  message: string;
  clabe: string | null; // SPEI only
  bank: string | null; // SPEI + CLABE única only
  owner_name: string | null; // SPEI + CLABE única only
}

export interface PaymentInstructionsRead extends PaymentConfirmation {
  payment_method: PaymentMethod;
}

export interface DispatchLine {
  detail_id: number;
  quantity: number;
}

export interface DispatchRequest {
  lines: DispatchLine[];
}
