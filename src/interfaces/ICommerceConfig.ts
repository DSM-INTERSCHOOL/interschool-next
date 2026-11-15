export type SpeiMode = "CLABE_UNICA" | "CLABE_PERSONAL";

export interface CommerceConfigRead {
  id: number;
  school_id: number;
  is_public: boolean;
  slot_duration: number | null;
  dates_by_slot: number | null;
  tasa_cuota: string | null;
  client_name: string | null;
  client_logo: string | null;
  self_service_warehouse_id: number | null;
  operator_warehouse_id: number | null;
  spei_mode: SpeiMode;
  account_number_clabe: string | null;
  bank_clabe: string | null;
  owner_name_clabe: string | null;
  // Minutes an unpaid PLACED order may sit before it's auto-cancelled and
  // its inventory restored -- applies regardless of payment_method
  // (VENTANILLA/SPEI). Defaults to 2880 (48h).
  order_auto_cancel_minutes: number;
}

export interface CommerceConfigUpsert {
  is_public?: boolean;
  slot_duration?: number | null;
  dates_by_slot?: number | null;
  tasa_cuota?: number | null;
  client_name?: string | null;
  client_logo?: string | null;
  self_service_warehouse_id?: number | null;
  operator_warehouse_id?: number | null;
  spei_mode?: SpeiMode;
  account_number_clabe?: string | null;
  bank_clabe?: string | null;
  owner_name_clabe?: string | null;
  order_auto_cancel_minutes?: number;
}
