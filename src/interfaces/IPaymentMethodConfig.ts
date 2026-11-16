// Mirrors fiscal.constants.CONFIGURABLE_PAYMENT_METHODS on the backend --
// the "forma de pago" catalog: the physical instrument a staff member
// collects at the counter. Only meaningful under the VENTANILLA payment
// channel -- see IPaymentChannelConfig.ts for the separate "how does the
// money move" catalog (SPEI, etc.). Fixed in code rather than a free-form
// catalog: each one has predefined backend behavior, so letting a school
// "add" an arbitrary new one wouldn't actually do anything.
// TENDER_METHODS/TOPUP_TENDER_METHODS/REFUND_PAYMENT_METHODS (see
// ITransaction.ts) are each derived from this same catalog.
export type ConfigurablePaymentMethod =
  | "EFECTIVO"
  | "CHEQUE"
  | "TRANSFERENCIA"
  | "TARJETA DE CREDITO"
  | "TARJETA DE DEBITO";

export const CONFIGURABLE_PAYMENT_METHOD_LABELS: Record<ConfigurablePaymentMethod, string> = {
  EFECTIVO: "Efectivo",
  CHEQUE: "Cheque",
  TRANSFERENCIA: "Transferencia",
  "TARJETA DE CREDITO": "Tarjeta de crédito",
  "TARJETA DE DEBITO": "Tarjeta de débito",
};

export interface PaymentMethodConfigRead {
  payment_method: ConfigurablePaymentMethod;
  enabled: boolean;
}

export interface PaymentMethodConfigSet {
  enabled_payment_methods: string[];
}
