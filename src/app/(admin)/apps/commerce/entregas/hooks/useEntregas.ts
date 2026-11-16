import { useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { OrderRead } from "@/interfaces/IOrder";
import { dispatchOrder, getOrders } from "@/services/order.service";

export const useEntregas = (onDispatched: () => void) => {
  const [orderNumber, setOrderNumber] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderRead | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // detail_id -> quantity being delivered right now (as typed, not yet confirmed).
  const [quantities, setQuantities] = useState<Record<number, string>>({});

  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const reset = () => {
    setOrderNumber("");
    setSelectedOrder(null);
    setLookupError(null);
    setQuantities({});
    setConfirmError(null);
  };

  const selectOrder = (order: OrderRead) => {
    setSuccessMessage(null);
    if (order.status !== "PAID" && order.status !== "PARTIALLY_DISPATCHED") {
      setLookupError(`La orden ${order.id_orden} no está disponible para entrega (estatus: ${order.status})`);
      return;
    }
    setSelectedOrder(order);
    setOrderNumber(String(order.id_orden));
    setLookupError(null);
    setConfirmError(null);
    setQuantities({});
  };

  const lookupByNumber = async () => {
    const idOrden = Number(orderNumber);
    if (!orderNumber.trim() || Number.isNaN(idOrden)) {
      setLookupError("Ingresa un número de orden válido");
      return;
    }
    try {
      setLookupLoading(true);
      setLookupError(null);
      setSuccessMessage(null);
      const { schoolId } = getOrgConfig();
      const results = await getOrders({ schoolId, filters: `id_orden::eq::${idOrden}` });
      const found = results[0];
      if (!found) {
        setSelectedOrder(null);
        setLookupError(`No se encontró la orden ${idOrden}`);
        return;
      }
      selectOrder(found);
    } catch (err: any) {
      setLookupError(err.response?.data?.detail || err.message || "No se pudo buscar la orden");
    } finally {
      setLookupLoading(false);
    }
  };

  const pendingFor = (detailId: number) => {
    const detail = selectedOrder?.details.find((d) => d.id === detailId);
    return detail ? detail.amount - detail.dispatched : 0;
  };

  const setQuantity = (detailId: number, value: string) => {
    const pending = pendingFor(detailId);
    const numeric = Number(value);
    if (value !== "" && (Number.isNaN(numeric) || numeric < 0)) return;
    if (numeric > pending) {
      setQuantities((prev) => ({ ...prev, [detailId]: String(pending) }));
      return;
    }
    setQuantities((prev) => ({ ...prev, [detailId]: value }));
  };

  const fillAllPending = () => {
    if (!selectedOrder) return;
    const next: Record<number, string> = {};
    for (const detail of selectedOrder.details) {
      const pending = detail.amount - detail.dispatched;
      if (pending > 0) next[detail.id] = String(pending);
    }
    setQuantities(next);
  };

  const linesToDispatch = Object.entries(quantities)
    .map(([detailId, value]) => ({ detail_id: Number(detailId), quantity: Number(value) || 0 }))
    .filter((line) => line.quantity > 0);

  const canConfirm = selectedOrder !== null && linesToDispatch.length > 0 && !confirmLoading;

  const confirmDispatch = async () => {
    if (!selectedOrder || linesToDispatch.length === 0) return;
    try {
      setConfirmLoading(true);
      setConfirmError(null);
      const { schoolId } = getOrgConfig();
      const updated = await dispatchOrder({
        schoolId,
        orderId: selectedOrder.id,
        dto: { lines: linesToDispatch },
      });
      const fullyDelivered = updated.status === "COMPLETED";
      setSuccessMessage(
        fullyDelivered
          ? `Orden ${updated.id_orden} entregada por completo`
          : `Entrega parcial registrada para la orden ${updated.id_orden}`
      );
      if (fullyDelivered) {
        reset();
      } else {
        setSelectedOrder(updated);
        setQuantities({});
      }
      onDispatched();
    } catch (err: any) {
      setConfirmError(err.response?.data?.detail || err.message || "No se pudo registrar la entrega");
    } finally {
      setConfirmLoading(false);
    }
  };

  return {
    orderNumber,
    setOrderNumber,
    selectedOrder,
    lookupLoading,
    lookupError,
    lookupByNumber,
    selectOrder,
    quantities,
    setQuantity,
    pendingFor,
    fillAllPending,
    canConfirm,
    confirmLoading,
    confirmError,
    successMessage,
    confirmDispatch,
    reset,
  };
};
