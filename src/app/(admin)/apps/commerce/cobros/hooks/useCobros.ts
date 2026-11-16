import { useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { OrderRead, PaymentInstructionsRead } from "@/interfaces/IOrder";
import { CommercePersonRead } from "@/interfaces/ICommercePerson";
import { TenderMethod } from "@/interfaces/ITransaction";
import { checkoutOrder, getOrders } from "@/services/order.service";
import { realizarPago } from "@/services/transaction.service";
import { useEnabledPaymentMethods } from "../../hooks/useEnabledPaymentMethods";

export type CobrosTab = "tender" | "spei";

const round2 = (n: number) => Math.round(n * 100) / 100;

// One payment-method entry added to the order being collected. `amountApplied`
// is always what counts toward the order total; for EFECTIVO it can be less
// than `cashGiven` (the rest comes back as `change`) when the cash handed
// over covers the remaining balance and then some.
export interface TenderEntry {
  id: string;
  method: TenderMethod;
  cashGiven?: number;
  amountApplied: number;
  change: number;
}

export const useCobros = (onPaid: () => void, personsById: Map<string, CommercePersonRead>) => {
  const [orderNumber, setOrderNumber] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderRead | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const [tenders, setTenders] = useState<TenderEntry[]>([]);
  const [addMethod, setAddMethod] = useState<TenderMethod | "">("");
  const [addAmount, setAddAmount] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastReceipt, setLastReceipt] = useState<{ id: number; folio: number; orderNumber: number } | null>(null);

  // "Agregar forma de pago" (split across one or more immediate tenders,
  // the flow above) vs. "SPEI" (a single async bank transfer, see below) --
  // mutually exclusive for a given order, hence the tab instead of just
  // another tender button.
  const [activeTab, setActiveTabState] = useState<CobrosTab>("tender");
  const [speiLoading, setSpeiLoading] = useState(false);
  const [speiError, setSpeiError] = useState<string | null>(null);
  const [speiInstructions, setSpeiInstructions] = useState<PaymentInstructionsRead | null>(null);

  // Both which "forma de pago" buttons to offer and whether SPEI itself is
  // enabled -- Configuración can disable either school-wide, and the
  // backend already rejects a disabled one server-side (ensure_enabled),
  // but nothing was filtering these lists/flags themselves, so a disabled
  // method kept showing up as if it were still a valid choice.
  const { visibleTenderMethods, speiEnabled } = useEnabledPaymentMethods();

  const setActiveTab = (tab: CobrosTab) => {
    setActiveTabState(tab);
    setSpeiError(null);
  };

  const reset = () => {
    setOrderNumber("");
    setSelectedOrder(null);
    setLookupError(null);
    setTenders([]);
    setAddMethod("");
    setAddAmount("");
    setAddError(null);
    setConfirmError(null);
    setActiveTabState("tender");
    setSpeiError(null);
    setSpeiInstructions(null);
  };

  const selectOrder = (order: OrderRead) => {
    setSuccessMessage(null);
    setLastReceipt(null);
    if (order.paid) {
      setLookupError(`La orden ${order.id_orden} ya fue pagada`);
      return;
    }
    if (order.status === "CANCELLED") {
      setLookupError(`La orden ${order.id_orden} está cancelada`);
      return;
    }
    setSelectedOrder(order);
    setOrderNumber(String(order.id_orden));
    setLookupError(null);
    setConfirmError(null);
    setTenders([]);
    setAddMethod("");
    setAddAmount("");
    setAddError(null);
    setActiveTabState("tender");
    setSpeiError(null);
    setSpeiInstructions(null);
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
      setLastReceipt(null);
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

  const total = selectedOrder ? Number(selectedOrder.total) : 0;
  const totalApplied = round2(tenders.reduce((sum, t) => sum + t.amountApplied, 0));
  const remaining = round2(total - totalApplied);
  const totalChange = round2(tenders.reduce((sum, t) => sum + t.change, 0));

  // SALDO can only be used when the order has a client with a wallet to
  // debit -- a guest/self-service order with no person_internal_id has
  // nothing to charge it against.
  const customerBalance = selectedOrder?.person_internal_id
    ? Number(personsById.get(selectedOrder.person_internal_id)?.balance ?? 0)
    : null;
  const saldoAvailable = customerBalance !== null && customerBalance > 0;

  // Picking a method prefills the amount with whatever's left to collect --
  // covers the common single-method case in one less step, while still
  // letting the cashier edit it down to split across methods. For SALDO,
  // also capped by what the customer actually has.
  const pickAddMethod = (method: TenderMethod) => {
    setAddMethod(method);
    setAddError(null);
    if (remaining > 0) {
      const cap = method === "SALDO" ? Math.min(remaining, customerBalance ?? 0) : remaining;
      setAddAmount(cap.toFixed(2));
    }
  };

  const addTender = () => {
    if (!addMethod) return;
    const amount = Number(addAmount);
    if (!addAmount || Number.isNaN(amount) || amount <= 0) {
      setAddError("Ingresa un monto válido");
      return;
    }
    if (remaining <= 0) {
      setAddError("La orden ya está cubierta");
      return;
    }
    if (addMethod === "SALDO" && amount > (customerBalance ?? 0) + 0.005) {
      setAddError("El monto excede el saldo disponible del cliente");
      return;
    }

    let entry: TenderEntry;
    if (addMethod === "EFECTIVO") {
      const amountApplied = Math.min(amount, remaining);
      entry = {
        id: crypto.randomUUID(),
        method: addMethod,
        cashGiven: amount,
        amountApplied,
        change: round2(amount - amountApplied),
      };
    } else {
      if (amount > remaining + 0.005) {
        setAddError("El monto no puede exceder lo que falta por cobrar");
        return;
      }
      entry = { id: crypto.randomUUID(), method: addMethod, amountApplied: amount, change: 0 };
    }

    setTenders((prev) => [...prev, entry]);
    setAddMethod("");
    setAddAmount("");
    setAddError(null);
  };

  const removeTender = (id: string) => {
    setTenders((prev) => prev.filter((t) => t.id !== id));
  };

  // Same endpoint/flow the self-checkout screen uses when a customer picks
  // SPEI (see useCheckout.choosePaymentMethod + PaymentMethodScreen): it
  // sets the order's payment_method, marks it PLACED (deducting inventory
  // first if it hadn't been already), and registers a PENDING order_payment
  // -- the order then shows up in Pagos Pendientes (SPEI) for staff to
  // confirm once the transfer actually arrives, exactly like a SPEI
  // self-checkout order would. Called once per order selection; the button
  // that triggers this is hidden once speiInstructions is set, so retrying
  // requires picking the order again (Cancelar) rather than firing a second
  // PENDING row for the same order.
  const requestSpeiInstructions = async () => {
    if (!selectedOrder) return;
    try {
      setSpeiLoading(true);
      setSpeiError(null);
      const { schoolId } = getOrgConfig();
      const result = await checkoutOrder({
        schoolId,
        orderId: selectedOrder.id,
        dto: { payment_method: "SPEI" },
      });
      setSpeiInstructions(result);
      // The order's payment_method/status just changed server-side (and it
      // picked up a PENDING order_payment) -- same reasoning as onPaid after
      // confirmPayment: refresh the pendientes list so it reflects that.
      onPaid();
    } catch (err: any) {
      setSpeiError(err.response?.data?.detail || err.message || "No se pudieron generar los datos de SPEI");
    } finally {
      setSpeiLoading(false);
    }
  };

  const canConfirm = selectedOrder !== null && tenders.length > 0 && remaining === 0 && !confirmLoading;

  const confirmPayment = async () => {
    if (!selectedOrder || tenders.length === 0 || remaining !== 0) return;
    try {
      setConfirmLoading(true);
      setConfirmError(null);
      const { schoolId } = getOrgConfig();
      const result = await realizarPago({
        schoolId,
        dto: {
          order_id: selectedOrder.id,
          payments: tenders.map((t) => ({
            payment_method: t.method,
            amount: t.method === "EFECTIVO" ? t.cashGiven ?? t.amountApplied : t.amountApplied,
            cambio: t.change,
          })),
          facturar: false,
        },
      });
      const balanceNote =
        result.new_balance !== null ? ` · Saldo restante del cliente: $${Number(result.new_balance).toFixed(2)}` : "";
      setSuccessMessage(`Pago registrado para la orden ${selectedOrder.id_orden}${balanceNote}`);
      setLastReceipt(
        result.receipt_id !== null && result.receipt_folio !== null
          ? { id: result.receipt_id, folio: result.receipt_folio, orderNumber: selectedOrder.id_orden }
          : null
      );
      reset();
      onPaid();
    } catch (err: any) {
      setConfirmError(err.response?.data?.detail || err.message || "No se pudo registrar el pago");
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
    tenders,
    visibleTenderMethods,
    addMethod,
    pickAddMethod,
    addAmount,
    setAddAmount,
    addError,
    addTender,
    removeTender,
    total,
    totalApplied,
    remaining,
    totalChange,
    customerBalance,
    saldoAvailable,
    canConfirm,
    confirmLoading,
    confirmError,
    successMessage,
    lastReceipt,
    confirmPayment,
    activeTab,
    setActiveTab,
    speiEnabled,
    speiLoading,
    speiError,
    speiInstructions,
    requestSpeiInstructions,
    reset,
  };
};
