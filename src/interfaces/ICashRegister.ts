export type CashRegisterSessionStatus = "OPEN" | "CLOSED";

export interface CashRegisterSessionRead {
  id: number;
  school_id: number;
  device_id: string;
  opened_by_person_internal_id: string;
  closed_by_person_internal_id: string | null;
  status: CashRegisterSessionStatus;
  opening_amount: string;
  opening_notes: string | null;
  opened_at: string | null;
  closing_counted_amount: string | null;
  closing_notes: string | null;
  expected_cash_amount: string | null;
  cash_difference: string | null;
  closed_at: string | null;
}

export interface CashMethodTotal {
  payment_method: string;
  purpose: "ORDER" | "REFUND" | "WALLET_TOPUP";
  total: string;
  count: number;
}

export interface CashRegisterWithdrawalRead {
  id: number;
  school_id: number;
  cash_register_session_id: number;
  amount: string;
  reason: string | null;
  person_internal_id: string;
  created: string | null;
}

export interface RetiroCajaRequest {
  amount: number;
  reason?: string;
}

export interface CashRegisterSessionSummary {
  session: CashRegisterSessionRead;
  totals: CashMethodTotal[];
  total_sales: string;
  total_refunds: string;
  total_wallet_topups: string;
  withdrawals: CashRegisterWithdrawalRead[];
  total_withdrawals: string;
  expected_cash: string;
  counted_cash: string | null;
  difference: string | null;
}

export interface AbrirCajaRequest {
  opening_amount: number;
  notes?: string;
}

export interface CerrarCajaRequest {
  counted_amount: number;
  notes?: string;
}
