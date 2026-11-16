import { useCallback, useEffect, useMemo, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { OrderRead } from "@/interfaces/IOrder";
import { ProductRead } from "@/interfaces/IProduct";
import { ColorRead } from "@/interfaces/IColor";
import { SizeRead } from "@/interfaces/ISize";
import { CommercePersonRead } from "@/interfaces/ICommercePerson";
import { RefundPaymentMethod, TenderMethod } from "@/interfaces/ITransaction";
import { getOrders } from "@/services/order.service";
import { getProducts } from "@/services/product.service";
import { getColors } from "@/services/color.service";
import { getSizes } from "@/services/size.service";
import { getCommercePersons } from "@/services/commercePerson.service";
import { devolverPedidos, realizarCambios } from "@/services/transaction.service";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";
import { useEnabledPaymentMethods } from "../../hooks/useEnabledPaymentMethods";

const round2 = (n: number) => Math.round(n * 100) / 100;

export interface NewItemLine {
  key: string;
  productId: number;
  title: string;
  colorId: number | null;
  colorLabel: string | null;
  sizeId: number | null;
  sizeLabel: string | null;
  unitPrice: number;
  quantity: number;
}

// Devoluciones y Cambios: search a paid (and not cancelled) order, pick how
// much of each line to return, optionally pick new article(s) in exchange
// for it, then settle the difference -- a refund (FISICO/SALDO, same
// choice Cobros offers for collecting money) if the customer is owed
// money, or a charge (same tender capture as Cobros, including SALDO) if
// the new article(s) cost more. Zero difference needs neither.
export const useDevolucionesForm = () => {
  // ---- order search ----
  const [orderNumber, setOrderNumber] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderRead | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // ---- catalogs (for the "new article" picker + client balance) ----
  const [products, setProducts] = useState<ProductRead[]>([]);
  const [colors, setColors] = useState<ColorRead[]>([]);
  const [sizes, setSizes] = useState<SizeRead[]>([]);
  const [personsById, setPersonsById] = useState<Map<string, CommercePersonRead>>(new Map());
  const [catalogsLoading, setCatalogsLoading] = useState(true);

  const loadCatalogs = useCallback(() => {
    const { schoolId } = getOrgConfig();
    setCatalogsLoading(true);
    Promise.all([
      getProducts({ schoolId, status: "ACTIVO", limit: 500 }),
      getColors({ schoolId }),
      getSizes({ schoolId }),
      getCommercePersons({ schoolId }),
    ])
      .then(([productsData, colorsData, sizesData, personsData]) => {
        setProducts(productsData);
        setColors(colorsData);
        setSizes(sizesData);
        setPersonsById(new Map(personsData.map((p) => [p.person_internal_id, p])));
      })
      .catch(() => {
        // Non-critical for lookup; the exchange-item picker just won't
        // have anything to show.
      })
      .finally(() => setCatalogsLoading(false));
  }, []);

  useEffect(() => {
    loadCatalogs();
  }, [loadCatalogs]);

  // Reloaded on window focus (see useRefetchOnFocus) so a product/price
  // created elsewhere is pickable here without a hard refresh.
  useRefetchOnFocus(loadCatalogs);

  // Which "forma de pago" buttons to offer for the charge (diff > 0) and
  // refund (diff < 0, FISICO) tenders -- Configuración can disable one
  // school-wide, and the backend already rejects a disabled method
  // (ensure_enabled, called from realizar_cambios/devolver_pedidos), but
  // nothing was filtering these button lists themselves.
  const { visibleTenderMethods, visibleRefundMethods } = useEnabledPaymentMethods();

  // ---- return quantities, per order_detail id ----
  const [returnQuantities, setReturnQuantities] = useState<Record<number, string>>({});

  // ---- exchange toggle + new items ----
  const [isExchange, setIsExchange] = useState(false);
  const [newItems, setNewItems] = useState<NewItemLine[]>([]);

  // ---- payment/refund state ----
  const [chargeMethod, setChargeMethod] = useState<TenderMethod | "">("");
  const [cashTendered, setCashTendered] = useState("");
  const [refundType, setRefundType] = useState<"FISICO" | "SALDO" | "">("");
  const [refundPaymentMethod, setRefundPaymentMethod] = useState<RefundPaymentMethod | "">("");

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetSelection = () => {
    setReturnQuantities({});
    setIsExchange(false);
    setNewItems([]);
    setChargeMethod("");
    setCashTendered("");
    setRefundType("");
    setRefundPaymentMethod("");
    setSubmitError(null);
  };

  const selectOrder = (order: OrderRead) => {
    setSuccessMessage(null);
    if (!order.paid) {
      setLookupError(`La orden ${order.id_orden} no está pagada`);
      return;
    }
    if (order.status === "CANCELLED") {
      setLookupError(`La orden ${order.id_orden} está cancelada`);
      return;
    }
    setSelectedOrder(order);
    setOrderNumber(String(order.id_orden));
    setLookupError(null);
    resetSelection();
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

  const reset = () => {
    setOrderNumber("");
    setSelectedOrder(null);
    setLookupError(null);
    resetSelection();
  };

  // ---- return quantity helpers ----
  const maxReturnable = (detailId: number) => {
    const detail = selectedOrder?.details.find((d) => d.id === detailId);
    return detail ? detail.dispatched - detail.returned : 0;
  };

  const setReturnQuantity = (detailId: number, value: string) => {
    const max = maxReturnable(detailId);
    const numeric = Number(value);
    if (value !== "" && (Number.isNaN(numeric) || numeric < 0)) return;
    if (numeric > max) {
      setReturnQuantities((prev) => ({ ...prev, [detailId]: String(max) }));
      return;
    }
    setReturnQuantities((prev) => ({ ...prev, [detailId]: value }));
  };

  // The cost associated with the quantity currently entered for this line
  // -- shown live next to the input, same price/unit_discount math as
  // totalADevolver uses for the order-wide total.
  const returnCostFor = (detailId: number) => {
    const detail = selectedOrder?.details.find((d) => d.id === detailId);
    if (!detail) return 0;
    const qty = Number(returnQuantities[detailId] || 0);
    if (qty <= 0) return 0;
    return round2(qty * (Number(detail.price) - Number(detail.unit_discount)));
  };

  // True once we know the order has nothing eligible to return at all
  // (nothing dispatched yet, or everything already returned) -- used to
  // show a clear explanation instead of a table that just looks broken.
  const noneDeliverable = selectedOrder ? selectedOrder.details.every((d) => maxReturnable(d.id) <= 0) : false;

  // ---- new item (exchange) helpers ----
  const addNewItem = (line: NewItemLine) => {
    setNewItems((prev) => {
      const existing = prev.find((l) => l.key === line.key);
      if (existing) {
        return prev.map((l) => (l.key === line.key ? { ...l, quantity: l.quantity + line.quantity } : l));
      }
      return [...prev, line];
    });
  };
  const removeNewItem = (key: string) => setNewItems((prev) => prev.filter((l) => l.key !== key));

  // ---- totals ----
  const totalADevolver = useMemo(() => {
    if (!selectedOrder) return 0;
    return round2(
      selectedOrder.details.reduce((sum, d) => {
        const qty = Number(returnQuantities[d.id] || 0);
        if (qty <= 0) return sum;
        return sum + qty * (Number(d.price) - Number(d.unit_discount));
      }, 0)
    );
  }, [selectedOrder, returnQuantities]);

  const totalAEntregar = useMemo(() => {
    if (!isExchange) return 0;
    return round2(newItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0));
  }, [isExchange, newItems]);

  const hasReturnLines = Object.values(returnQuantities).some((v) => Number(v) > 0);
  const diff = round2(totalAEntregar - totalADevolver);

  const clientPersonInternalId = selectedOrder?.person_internal_id ?? null;
  const customerBalance = clientPersonInternalId
    ? Number(personsById.get(clientPersonInternalId)?.balance ?? 0)
    : null;

  const cashAmount = Number(cashTendered) || 0;
  const chargeTarget = diff > 0 ? diff : 0;
  const change = chargeMethod === "EFECTIVO" ? round2(Math.max(cashAmount - chargeTarget, 0)) : 0;
  const cashInsufficient = chargeMethod === "EFECTIVO" && cashAmount < chargeTarget;

  const canSubmit = (() => {
    if (!selectedOrder || !hasReturnLines || submitLoading) return false;
    if (diff > 0) {
      if (!chargeMethod) return false;
      if (chargeMethod === "EFECTIVO" && cashInsufficient) return false;
      return true;
    }
    if (diff < 0) {
      if (!refundType) return false;
      if (refundType === "FISICO" && !refundPaymentMethod) return false;
      return true;
    }
    return true; // diff === 0: even exchange or nothing owed either way
  })();

  const submit = async () => {
    if (!selectedOrder || !canSubmit) return;
    try {
      setSubmitLoading(true);
      setSubmitError(null);
      const { schoolId } = getOrgConfig();

      const returnLines = selectedOrder.details
        .filter((d) => Number(returnQuantities[d.id] || 0) > 0)
        .map((d) => ({ detail_id: d.id, quantity: Number(returnQuantities[d.id]) }));

      if (!isExchange) {
        const result = await devolverPedidos({
          schoolId,
          dto: {
            order_id: selectedOrder.id,
            lines: returnLines,
            refund: {
              type: refundType as "FISICO" | "SALDO",
              payment_method: refundType === "FISICO" ? (refundPaymentMethod as RefundPaymentMethod) : undefined,
            },
          },
        });
        setSuccessMessage(
          result.new_balance !== null
            ? `Devolución registrada. Saldo del cliente: $${Number(result.new_balance).toFixed(2)}`
            : `Devolución registrada para la orden ${selectedOrder.id_orden}`
        );
      } else {
        const result = await realizarCambios({
          schoolId,
          dto: {
            order_id: selectedOrder.id,
            returned_lines: returnLines,
            delivered_lines: newItems.map((item) => ({
              product_id: item.productId,
              quantity: item.quantity,
              price: item.unitPrice,
              color: item.colorLabel ?? undefined,
              size: item.sizeLabel ?? undefined,
            })),
            payments:
              diff > 0
                ? [
                    {
                      payment_method: chargeMethod as TenderMethod,
                      amount: chargeMethod === "EFECTIVO" ? cashAmount : chargeTarget,
                      cambio: chargeMethod === "EFECTIVO" ? change : 0,
                    },
                  ]
                : undefined,
            refund:
              diff < 0
                ? {
                    type: refundType as "FISICO" | "SALDO",
                    payment_method:
                      refundType === "FISICO" ? (refundPaymentMethod as RefundPaymentMethod) : undefined,
                  }
                : undefined,
          },
        });
        const parts: string[] = [`Cambio registrado para la orden ${selectedOrder.id_orden}`];
        if (result.new_order_id) parts.push(`nueva orden ${result.new_order_id}`);
        if (result.new_balance !== null) parts.push(`saldo del cliente: $${Number(result.new_balance).toFixed(2)}`);
        setSuccessMessage(parts.join(" · "));
      }

      reset();
    } catch (err: any) {
      setSubmitError(err.response?.data?.detail || err.message || "No se pudo registrar la operación");
    } finally {
      setSubmitLoading(false);
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
    reset,
    catalogsLoading,
    personsById,
    products,
    colors,
    sizes,
    returnQuantities,
    maxReturnable,
    setReturnQuantity,
    returnCostFor,
    noneDeliverable,
    isExchange,
    setIsExchange,
    newItems,
    addNewItem,
    removeNewItem,
    totalADevolver,
    totalAEntregar,
    diff,
    hasReturnLines,
    customerBalance,
    chargeMethod,
    setChargeMethod,
    visibleTenderMethods,
    cashTendered,
    setCashTendered,
    change,
    cashInsufficient,
    refundType,
    setRefundType,
    refundPaymentMethod,
    setRefundPaymentMethod,
    visibleRefundMethods,
    canSubmit,
    submitLoading,
    submitError,
    successMessage,
    submit,
  };
};
