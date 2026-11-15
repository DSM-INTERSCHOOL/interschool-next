import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { OrderRead, PaymentConfirmation, PaymentMethod } from "@/interfaces/IOrder";
import { OrderMode } from "@/interfaces/ITopCategory";
import {
  checkoutOrder,
  createOrder,
  createOrderDetail,
  getOrder,
  getProductAvailability,
} from "@/services/order.service";
import { realizarPago } from "@/services/transaction.service";
import { getPaymentChannelConfig } from "@/services/paymentChannelConfig.service";
import { CartLine } from "./useCart";

// Re-checks fresh stock for every cart line right before the order is
// actually registered -- the picker/cart already cap quantities against
// availability fetched when the catalog loaded, but that can go stale
// (another customer bought the last units in the meantime). Catching it
// here, before any order/order_detail row exists, means a shortfall never
// leaves an orphaned PENDING order behind the way failing later at
// checkout would.
const validateStock = async (
  schoolId: string | number | null,
  lines: CartLine[],
  orderMode: OrderMode
): Promise<string | null> => {
  const productIds = Array.from(new Set(lines.map((l) => l.productId)));
  const availabilityEntries = await Promise.all(
    productIds.map(
      async (productId) => [productId, await getProductAvailability({ schoolId, productId, orderMode })] as const
    )
  );
  const availabilityByProduct = new Map(availabilityEntries);

  for (const line of lines) {
    const availability = availabilityByProduct.get(line.productId);
    if (!availability || !availability.track_inventory) continue;
    const variant = availability.variants.find((v) => v.color_id === line.colorId && v.size_id === line.sizeId);
    const available = variant ? variant.quantity : 0;
    if (line.quantity > available) {
      const variantLabel = [line.colorLabel, line.sizeLabel].filter(Boolean).join(" ");
      return `No hay suficientes existencias de "${line.title}"${
        variantLabel ? ` (${variantLabel})` : ""
      }: disponibles ${available}, solicitados ${line.quantity}`;
    }
  }
  return null;
};

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
  const [instructions, setInstructions] = useState<PaymentConfirmation | null>(null);
  // Optimistic true by default (matches "no config rows = enabled") so the
  // button doesn't flash hidden/shown while this loads, and stays enabled
  // if the fetch itself fails -- a transient network error here shouldn't
  // take away a payment option that was actually fine.
  const [speiEnabled, setSpeiEnabled] = useState(true);

  useEffect(() => {
    const { schoolId } = getOrgConfig();
    getPaymentChannelConfig({ schoolId })
      .then((channels) => {
        const spei = channels.find((c) => c.payment_channel === "SPEI");
        if (spei) setSpeiEnabled(spei.enabled);
      })
      .catch(() => {
        // Keep the optimistic default.
      });
  }, []);

  const createOrderWithDetails = async (
    lines: CartLine[],
    pickupName: string,
    clientPersonInternalId: string | undefined,
    orderMode: OrderMode
  ) => {
    setPhase("creatingOrder");
    setError(null);
    try {
      const { schoolId } = getOrgConfig();

      const stockError = await validateStock(schoolId, lines, orderMode);
      if (stockError) {
        setError(stockError);
        setPhase("error");
        return;
      }

      const sessionId = window.crypto.randomUUID();

      const newOrder = await createOrder({
        schoolId,
        dto: {
          session_id: sessionId,
          description: "Autoservicio",
          delivery_method: "COLLECTION",
          collection_options: { collected_by: pickupName },
          // The client this order is for. Self-service passes the
          // logged-in person's own id (same person places and owns the
          // order); OPERATOR mode passes whichever client was searched
          // and selected -- created_by_person_internal_id is always
          // derived server-side from the bearer token regardless, so
          // these two only match for self-service by deliberate choice,
          // not because the backend forces it.
          person_internal_id: clientPersonInternalId,
          order_mode: orderMode,
        },
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

      // newOrder.total is 0 -- it's the response from creating the order
      // itself, before any line item existed to price it. Re-fetching now
      // picks up the real total the backend computed from the details just
      // added; everything downstream (the SALDO payment amount, the
      // confirmation screen) reads order.total from this state.
      const pricedOrder = await getOrder({ schoolId, orderId: newOrder.id });
      setOrder(pricedOrder);
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

  // Unlike choosePaymentMethod (VENTANILLA/SPEI, which only record intent
  // -- "go pay at the counter" / "here's the CLABE" -- via checkout()),
  // paying with wallet balance is an immediate, completed payment: it goes
  // through realizarPago with a SALDO tender for the full total, which
  // debits the wallet and marks the order PAID directly (not just PLACED).
  const choosePaymentWithBalance = async () => {
    if (!order) return;
    setPhase("submittingPayment");
    setError(null);
    try {
      const { schoolId } = getOrgConfig();
      const result = await realizarPago({
        schoolId,
        dto: {
          order_id: order.id,
          payments: [{ payment_method: "SALDO", amount: Number(order.total), cambio: 0 }],
          facturar: false,
        },
      });
      setInstructions({
        id_orden: order.id_orden,
        total: order.total,
        message:
          result.new_balance !== null
            ? `Tu orden fue pagada con tu saldo prepago. Saldo restante: $${Number(result.new_balance).toFixed(2)}`
            : "Tu orden fue pagada con tu saldo prepago.",
        clabe: null,
        bank: null,
        owner_name: null,
      });
      setPhase("done");
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "No se pudo procesar el pago con saldo");
      setPhase("error");
    }
  };

  const reset = () => {
    setPhase("start");
    setError(null);
    setOrder(null);
    setInstructions(null);
  };

  return {
    phase,
    error,
    order,
    instructions,
    speiEnabled,
    createOrderWithDetails,
    choosePaymentMethod,
    choosePaymentWithBalance,
    reset,
  };
};
