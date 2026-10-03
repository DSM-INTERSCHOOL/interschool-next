import { useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { OrderRead, PaymentInstructionsRead, PaymentMethod } from "@/interfaces/IOrder";
import { checkoutOrder, createOrder, createOrderDetail } from "@/services/order.service";
import { CartLine } from "./useCart";

// start: nothing submitted yet.
// creatingOrder: posting the order + its line items (still PENDING).
// choosingPayment: order exists -- waiting for the customer to pick
//   VENTANILLA or SPEI.
// submittingPayment: posting the chosen payment_method.
// done: checkout endpoint returned instructions to show.
// error: something failed; `order` (if already created) is kept so a
//   payment-method retry doesn't recreate the order from scratch.
type Phase = "start" | "creatingOrder" | "choosingPayment" | "submittingPayment" | "done" | "error";

export const useCheckout = () => {
  const [phase, setPhase] = useState<Phase>("start");
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderRead | null>(null);
  const [instructions, setInstructions] = useState<PaymentInstructionsRead | null>(null);

  const createOrderWithDetails = async (lines: CartLine[]) => {
    setPhase("creatingOrder");
    setError(null);
    try {
      const { schoolId } = getOrgConfig();
      const sessionId = window.crypto.randomUUID();

      const newOrder = await createOrder({
        schoolId,
        dto: { session_id: sessionId, description: "Autoservicio" },
      });

      await Promise.all(
        lines.map((line) =>
          createOrderDetail({
            schoolId,
            dto: {
              order_id: newOrder.id,
              product_id: line.productId,
              amount: line.quantity,
              color: line.colorLabel ?? undefined,
              size: line.sizeLabel ?? undefined,
              price: line.unitPrice,
            },
          })
        )
      );

      setOrder(newOrder);
      setPhase("choosingPayment");
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "No se pudo enviar la orden");
      setPhase("error");
    }
  };

  const choosePaymentMethod = async (paymentMethod: PaymentMethod) => {
    if (!order) return;
    setPhase("submittingPayment");
    setError(null);
    try {
      const { schoolId } = getOrgConfig();
      const result = await checkoutOrder({
        schoolId,
        orderId: order.id,
        dto: { payment_method: paymentMethod },
      });
      setInstructions(result);
      setPhase("done");
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "No se pudo procesar el pago");
      setPhase("error");
    }
  };

  const reset = () => {
    setPhase("start");
    setError(null);
    setOrder(null);
    setInstructions(null);
  };

  return { phase, error, order, instructions, createOrderWithDetails, choosePaymentMethod, reset };
};
