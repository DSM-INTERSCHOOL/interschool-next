// Mirrors fiscal.constants.CONFIGURABLE_PAYMENT_CHANNELS on the backend --
// the "medio de pago" catalog: *how* money moves, independent of any
// instrument choice (see IPaymentMethodConfig.ts for that separate
// catalog). VENTANILLA (in person) and SALDO (spending the customer's own
// wallet) are always available -- neither is a school's choice to turn
// off, so neither is configurable or listed here. SPEI (async bank
// transfer, confirmed later) is the first channel a school can actually
// disable; STRIPE/PAYPAL will join this catalog once those gateways are
// implemented (see src.integrations.payments.factory on the backend).
export type ConfigurablePaymentChannel = "SPEI";

export const CONFIGURABLE_PAYMENT_CHANNEL_LABELS: Record<ConfigurablePaymentChannel, string> = {
  SPEI: "SPEI",
};

export interface PaymentChannelConfigRead {
  payment_channel: ConfigurablePaymentChannel;
  enabled: boolean;
}

export interface PaymentChannelConfigSet {
  enabled_payment_channels: string[];
}
