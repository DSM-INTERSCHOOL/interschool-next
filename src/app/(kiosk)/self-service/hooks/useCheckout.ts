import { useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { OrderRead } from "@/interfaces/IOrder";
import { createOrder, createOrderDetail, updateOrder } from "@/services/order.service";
import { CartLine } from "./useCart";

type Status = "idle" | "submitting" | "error";

export const useCheckout = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<OrderRead | null>(null);

  const submit = async (lines: CartLine[]) => {
    setStatus("submitting");
    setError(null);
    try {
      const { schoolId } = getOrgConfig();
      // Fresh per checkout attempt -- reusing one across retries would make
      // the backend's get_or_create_pending_for_session return the SAME
      // (already-PLACED) order instead of a new one.
      const sessionId = window.crypto.randomUUID();

      const order = await createOrder({
        schoolId,
        dto: { session_id: sessionId, description: "Autoservicio" },
      });

      await Promise.all(
        lines.map((line) =>
          createOrderDetail({
            schoolId,
            dto: {
              order_id: order.id,
              product_id: line.productId,
              amount: line.quantity,
              color: line.colorLabel ?? undefined,
              size: line.sizeLabel ?? undefined,
              price: line.unitPrice,
            },
          })
        )
      );

      const placed = await updateOrder({
        schoolId,
        orderId: order.id,
        dto: { status: "PLACED" },
      });

      setPlacedOrder(placed);
      setStatus("idle");
      return placed;
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "No se pudo enviar la orden");
      setStatus("error");
      return null;
    }
  };

  const reset = () => {
    setStatus("idle");
    setError(null);
    setPlacedOrder(null);
  };

  return { status, error, placedOrder, submit, reset };
};
