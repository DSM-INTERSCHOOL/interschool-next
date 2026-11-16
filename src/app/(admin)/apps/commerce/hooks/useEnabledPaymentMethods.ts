import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { REFUND_PAYMENT_METHODS, TENDER_METHODS, TOPUP_TENDER_METHODS } from "@/interfaces/ITransaction";
import { getPaymentChannelConfig } from "@/services/paymentChannelConfig.service";
import { getPaymentMethodConfig } from "@/services/paymentMethodConfig.service";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";

// Filters the fixed TENDER_METHODS/TOPUP_TENDER_METHODS/REFUND_PAYMENT_METHODS
// catalogs (see ITransaction.ts) down to what Configuración > Medios de pago
// currently has enabled for this school. The backend already rejects a
// disabled "forma de pago" or a disabled SPEI "vía" at the point of payment
// (ensure_enabled, called from realizar_pago/recargar_saldo/devolver_pedidos/
// realizar_cambios), but nothing was filtering the button lists that offer
// them in the first place -- a disabled method kept showing up as if it
// were still a valid choice, only to fail once confirmed. Shared by every
// screen that offers one of these lists: Cobros, Devoluciones, Prepago.
export const useEnabledPaymentMethods = () => {
  // Optimistic "everything enabled" default, matching the backend's own
  // "no config rows = enabled" fallback (PaymentMethodConfigService
  // .get_enabled) -- so a transient fetch error doesn't hide a method
  // that's actually fine.
  const [visibleTenderMethods, setVisibleTenderMethods] = useState(TENDER_METHODS);
  const [visibleTopupTenderMethods, setVisibleTopupTenderMethods] = useState(TOPUP_TENDER_METHODS);
  const [visibleRefundMethods, setVisibleRefundMethods] = useState(REFUND_PAYMENT_METHODS);
  const [speiEnabled, setSpeiEnabled] = useState(true);

  const load = () => {
    const { schoolId } = getOrgConfig();
    Promise.all([getPaymentMethodConfig({ schoolId }), getPaymentChannelConfig({ schoolId })])
      .then(([methodConfigs, channelConfigs]) => {
        const disabledMethods = new Set<string>(
          methodConfigs.filter((c) => !c.enabled).map((c) => c.payment_method)
        );
        const speiChannel = channelConfigs.find((c) => c.payment_channel === "SPEI");
        const speiIsEnabled = speiChannel ? speiChannel.enabled : true;

        setVisibleTenderMethods(TENDER_METHODS.filter((m) => !disabledMethods.has(m.value)));
        setVisibleRefundMethods(REFUND_PAYMENT_METHODS.filter((m) => !disabledMethods.has(m.value)));
        setVisibleTopupTenderMethods(
          TOPUP_TENDER_METHODS.filter((m) => (m.value === "SPEI" ? speiIsEnabled : !disabledMethods.has(m.value)))
        );
        setSpeiEnabled(speiIsEnabled);
      })
      .catch(() => {
        // Keep the optimistic defaults.
      });
  };

  useEffect(load, []);
  useRefetchOnFocus(load);

  return { visibleTenderMethods, visibleTopupTenderMethods, visibleRefundMethods, speiEnabled };
};
