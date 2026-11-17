// Mirrors the Commerce API's fiscal/transactions pydantic models
// (src/fiscal/models/pydantic.py). Only the "realizar pago"/wallet slice is
// modeled here -- facturación/devoluciones/cambios live elsewhere and
// aren't needed by the cash-register (Cobros) or wallet (Prepago) screens.

import { CONFIGURABLE_PAYMENT_METHOD_LABELS, ConfigurablePaymentMethod } from "./IPaymentMethodConfig";
import { CONFIGURABLE_PAYMENT_CHANNEL_LABELS, ConfigurablePaymentChannel } from "./IPaymentChannelConfig";

// A "forma de pago" (instrument, VENTANILLA-only) plus the "medio de pago"
// (channel) values that can also be a tender: SALDO (spending the
// customer's own wallet) and SPEI (async bank transfer, confirmed later --
// see ConfigurablePaymentChannel). PAYPAL/STRIPE are cart/self-service
// checkout gateways, not a staff-collected tender, so they never appear
// here.
export type TenderMethod = ConfigurablePaymentMethod | ConfigurablePaymentChannel | "SALDO";

// Every forma-de-pago instrument -- shared between Cobros (TENDER_METHODS)
// and Devoluciones' refund tender (REFUND_PAYMENT_METHODS), both of which
// collect/return money in person (medio VENTANILLA) and never accept SPEI
// (async/confirm-later, and never usable as a refund instrument either).
const ORDER_TENDER_METHODS = Object.keys(CONFIGURABLE_PAYMENT_METHOD_LABELS) as ConfigurablePaymentMethod[];

export const TENDER_METHODS: { value: TenderMethod; label: string }[] = ORDER_TENDER_METHODS.map((value) => ({
  value,
  label: CONFIGURABLE_PAYMENT_METHOD_LABELS[value],
}));

// Every forma-de-pago instrument (medio VENTANILLA, immediate) plus SPEI
// (its own medio, PENDING until staff confirms the transfer arrived) -- a
// wallet top-up is the one flow where both medios apply.
export const TOPUP_TENDER_METHODS: { value: TenderMethod; label: string }[] = [
  ...ORDER_TENDER_METHODS.map((value) => ({ value, label: CONFIGURABLE_PAYMENT_METHOD_LABELS[value] })),
  ...(Object.keys(CONFIGURABLE_PAYMENT_CHANNEL_LABELS) as ConfigurablePaymentChannel[]).map((value) => ({
    value,
    label: CONFIGURABLE_PAYMENT_CHANNEL_LABELS[value],
  })),
];

export interface PaymentTender {
  payment_method: TenderMethod;
  amount: number;
  reference?: string;
  notes?: string;
  cambio?: number;
}

export interface RealizarPagoRequest {
  order_id: number;
  payments: PaymentTender[];
  facturar?: boolean;
  require_factura?: boolean;
  receptor_rfc?: string;
  receptor_nombre?: string;
  receptor_uso_cfdi?: string;
  receptor_domicilio_fiscal?: string;
  receptor_regimen_fiscal?: string;
}

export interface RecargarSaldoRequest {
  person_internal_id: string;
  payments: PaymentTender[];
}

// Invoices an already-paid order (backend rejects anything else) --
// require_factura=false issues a PUBLICO EN GENERAL CFDI, true requires
// every receptor_* field (the caller is expected to have filled them from
// the client's own CFDI data first; the backend also falls back to that
// same Person record for whatever's left blank here).
export interface FacturarRequest {
  order_id: number;
  require_factura?: boolean;
  receptor_rfc?: string;
  receptor_nombre?: string;
  receptor_uso_cfdi?: string;
  receptor_domicilio_fiscal?: string;
  receptor_regimen_fiscal?: string;
}

export interface TransactionResult {
  success: boolean;
  message: string | null;
  cfdi_id: number | null;
  uuid_fiscal: string | null;
  new_order_id: number | null;
  new_balance: string | null; // Decimal -> string
  receipt_id: number | null;
  receipt_folio: number | null;
}

// ---- devoluciones y cambios ----

// A physical refund's tender -- same forma-de-pago catalog as TENDER_METHODS
// (SALDO has its own RefundMethod.type instead, and SPEI -- inbound-only,
// async -- was never a valid refund instrument either).
export type RefundPaymentMethod = ConfigurablePaymentMethod;

export const REFUND_PAYMENT_METHODS: { value: RefundPaymentMethod; label: string }[] = ORDER_TENDER_METHODS.map(
  (value) => ({ value, label: CONFIGURABLE_PAYMENT_METHOD_LABELS[value] })
);

// FISICO: money actually handed back (payment_method required). SALDO:
// credited to the customer's wallet instead -- same choice Cobros offers
// for collecting money, just in reverse.
export interface RefundMethod {
  type: "FISICO" | "SALDO";
  payment_method?: RefundPaymentMethod;
}

export interface DevolverLine {
  detail_id: number;
  quantity: number;
}

export interface DevolverPedidosRequest {
  order_id: number;
  lines: DevolverLine[];
  refund: RefundMethod;
}

export interface CambioReturnedLine {
  detail_id: number;
  quantity: number;
}

export interface CambioDeliveredLine {
  product_id: number;
  quantity: number;
  price: number;
  unit_discount?: number;
  color?: string;
  size?: string;
}

export interface RealizarCambiosRequest {
  order_id: number;
  returned_lines: CambioReturnedLine[];
  delivered_lines: CambioDeliveredLine[];
  refund?: RefundMethod;
  payments?: PaymentTender[];
}

export type WalletTopupStatus = "CONFIRMED" | "PENDING" | "CANCELLED";

// An order_payment row still awaiting reconciliation -- either a wallet
// recharge (purpose="WALLET_TOPUP", order_id null) or an order placed via
// the SPEI checkout vía (purpose="ORDER", order_id set). Both land in the
// same Recargas Pendientes queue with the same confirm/cancel actions
// (see TransactionsService.list_pending_payments on the backend). While
// PENDING, payment_method holds the placeholder "SPEI"; confirming
// rewrites it to "TRANSFERENCIA" (the forma that actually settled) and
// leaves payment_channel="SPEI" as the record of how it arrived.
export interface PendingPaymentRead {
  id: number;
  school_id: number;
  order_id: number | null;
  payment_method: TenderMethod;
  payment_channel: string | null;
  amount: string; // Decimal -> string
  reference: string | null;
  notes: string | null;
  person_internal_id: string | null; // the client -- null only for an old guest order
  created_by_person_internal_id: string | null;
  resolved_by_person_internal_id: string | null;
  purpose: "WALLET_TOPUP" | "ORDER";
  status: WalletTopupStatus;
  created: string | null;
}

// Estado de cuenta (GET .../transactions/wallet/{person_internal_id}/statement).
// Decimals arrive as strings. `amount` is signed: + credits the wallet,
// - debits it.
export type WalletMovementType = "RECARGA" | "DEVOLUCION" | "PAGO";

export interface WalletMovement {
  id: number;
  created: string;
  type: WalletMovementType;
  payment_method: string;
  payment_channel: string | null;
  order_id: number | null;
  reference: string | null;
  notes: string | null;
  amount: string;
  balance_after: string;
  created_by_person_internal_id: string | null;
  created_by_name: string | null;
  cash_register_session_id: number | null;
}

export interface WalletPendingTopup {
  id: number;
  created: string;
  amount: string;
  reference: string | null;
  created_by_person_internal_id: string | null;
  created_by_name: string | null;
}

export interface WalletStatement {
  person_internal_id: string;
  name: string;
  current_balance: string;
  start: string | null;
  end: string | null;
  opening_balance: string;
  total_credits: string;
  total_debits: string;
  closing_balance: string;
  movements: WalletMovement[];
  pending_topups: WalletPendingTopup[];
}

// Estado de cuenta general (GET .../transactions/account/{person_internal_id}/statement).
// `amount` is always positive; `flow` gives the direction. SALDO-flow rows
// only move the wallet and are kept out of the totals.
export type AccountMovementType = "PAGO_ORDEN" | "RECARGA" | "DEVOLUCION" | "PAGO_SALDO" | "DEVOLUCION_SALDO";
export type AccountMovementFlow = "ENTRADA" | "SALIDA" | "SALDO";

export interface AccountMovement {
  id: number;
  created: string;
  type: AccountMovementType;
  flow: AccountMovementFlow;
  payment_method: string;
  payment_channel: string | null;
  order_id: number | null;
  reference: string | null;
  notes: string | null;
  amount: string;
  created_by_person_internal_id: string | null;
  created_by_name: string | null;
  cash_register_session_id: number | null;
}

export interface AccountMethodTotal {
  payment_method: string;
  entradas: string;
  salidas: string;
  neto: string;
}

export interface AccountPendingPayment {
  id: number;
  created: string;
  purpose: "ORDER" | "WALLET_TOPUP";
  order_id: number | null;
  amount: string;
  reference: string | null;
}

export interface AccountStatement {
  person_internal_id: string;
  name: string;
  current_balance: string;
  start: string | null;
  end: string | null;
  total_entradas: string;
  total_salidas: string;
  neto: string;
  pagado_con_saldo: string;
  devuelto_a_saldo: string;
  by_method: AccountMethodTotal[];
  movements: AccountMovement[];
  pending: AccountPendingPayment[];
}

// Self-service SPEI top-up: deposit instructions for a PENDING
// WALLET_TOPUP the buyer requested for their own wallet. The balance is
// only credited once staff confirms the transfer (Recargas pendientes).
export interface SolicitarRecargaSpeiRequest {
  amount: number;
}

export interface RecargaSpeiInstructions {
  order_payment_id: number;
  created: string;
  amount: string; // Decimal -> string
  status: string;
  reference: string | null; // concepto to put on the transfer
  message: string;
  clabe: string | null;
  bank: string | null;
  owner_name: string | null;
}
