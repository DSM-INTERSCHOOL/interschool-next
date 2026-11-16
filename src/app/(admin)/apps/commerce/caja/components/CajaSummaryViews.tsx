import { CashRegisterSessionSummary } from "@/interfaces/ICashRegister";

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  EFECTIVO: "Efectivo",
  "TARJETA DE CREDITO": "Tarjeta de crédito",
  "TARJETA DE DEBITO": "Tarjeta de débito",
  TRANSFERENCIA: "Transferencia",
  CHEQUE: "Cheque",
  PAYPAL: "PayPal",
  SPEI: "SPEI",
  SALDO: "Saldo",
};

export const formatDateTime = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// Just the cobros (purpose='ORDER') side of the corte, broken down by
// forma de pago -- devoluciones/recargas/retiros have their own rows in
// CorteTotals below, so mixing them into this table would make "how much
// did EFECTIVO actually collect" harder to read at a glance.
export function CobrosPorFormaPago({ summary }: { summary: CashRegisterSessionSummary }) {
  const cobros = summary.totals.filter((t) => t.purpose === "ORDER");
  const totalCount = cobros.reduce((sum, t) => sum + t.count, 0);
  return (
    <div>
      <p className="mb-2 font-semibold">Cobros por forma de pago</p>
      <div className="overflow-x-auto">
        <table className="table table-sm w-full">
          <thead>
            <tr>
              <th>Forma de pago</th>
              <th className="text-right">Movimientos</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {cobros.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center text-base-content/60">
                  Sin cobros todavía
                </td>
              </tr>
            ) : (
              cobros.map((t) => (
                <tr key={t.payment_method}>
                  <td>{PAYMENT_METHOD_LABELS[t.payment_method] ?? t.payment_method}</td>
                  <td className="text-right">{t.count}</td>
                  <td className="text-right">${Number(t.total).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
          {cobros.length > 0 && (
            <tfoot>
              <tr className="font-bold">
                <td>Total</td>
                <td className="text-right">{totalCount}</td>
                <td className="text-right">${Number(summary.total_sales).toFixed(2)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

export function SessionHeader({
  summary,
  resolveTerminalName,
}: {
  summary: CashRegisterSessionSummary;
  resolveTerminalName?: (deviceId: string) => string;
}) {
  const { session } = summary;
  const terminalLabel = resolveTerminalName ? resolveTerminalName(session.device_id) : session.device_id;
  return (
    <div className="rounded-xl border border-base-300 p-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <p className="text-sm text-base-content/60">
          Terminal: <span className="font-medium text-base-content">{terminalLabel}</span>
        </p>
        <p className="text-sm text-base-content/60">
          Abierta por: <span className="font-medium text-base-content">{session.opened_by_person_internal_id}</span>
        </p>
        <p className="text-sm text-base-content/60">
          Apertura: <span className="font-medium text-base-content">{formatDateTime(session.opened_at)}</span>
        </p>
        <p className="text-sm text-base-content/60">
          Monto inicial: <span className="font-medium text-base-content">${Number(session.opening_amount).toFixed(2)}</span>
        </p>
        {session.status === "CLOSED" && (
          <>
            <p className="text-sm text-base-content/60">
              Cerrada por: <span className="font-medium text-base-content">{session.closed_by_person_internal_id ?? "—"}</span>
            </p>
            <p className="text-sm text-base-content/60">
              Cierre: <span className="font-medium text-base-content">{formatDateTime(session.closed_at)}</span>
            </p>
          </>
        )}
      </div>
      {session.opening_notes && <p className="mt-2 text-sm text-base-content/60">Notas de apertura: {session.opening_notes}</p>}
      {session.closing_notes && <p className="mt-1 text-sm text-base-content/60">Notas de cierre: {session.closing_notes}</p>}
    </div>
  );
}

export function CorteTotals({ summary }: { summary: CashRegisterSessionSummary }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 rounded-lg bg-base-200 px-4 py-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-base-content/70">Ventas</span>
          <span className="font-medium">${Number(summary.total_sales).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-base-content/70">Devoluciones</span>
          <span className="font-medium">${Number(summary.total_refunds).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-base-content/70">Recargas de saldo</span>
          <span className="font-medium">${Number(summary.total_wallet_topups).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-base-content/70">Retiros de caja</span>
          <span className="font-medium">${Number(summary.total_withdrawals).toFixed(2)}</span>
        </div>
      </div>

      {/* Kept visually separate from the breakdown above -- this is
          specifically the row to compare the physically-counted cash
          against, not just one more total among several. */}
      <div className="flex flex-col gap-2 rounded-lg border-2 border-info/40 bg-info/5 px-4 py-3 text-sm">
        <div className="flex items-center justify-between text-base font-bold">
          <span>Efectivo esperado</span>
          <span>${Number(summary.expected_cash).toFixed(2)}</span>
        </div>
        <p className="text-xs text-base-content/60">
          Monto contra el cual se compara el efectivo contado para cuadrar la caja.
        </p>
        {summary.counted_cash !== null && (
          <>
            <div className="flex items-center justify-between border-t border-info/30 pt-2">
              <span className="text-base-content/70">Efectivo contado</span>
              <span className="font-medium">${Number(summary.counted_cash).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-bold">
              <span>Diferencia</span>
              <span
                className={
                  Number(summary.difference ?? 0) === 0
                    ? ""
                    : Number(summary.difference ?? 0) > 0
                      ? "text-success"
                      : "text-error"
                }
              >
                ${Number(summary.difference ?? 0).toFixed(2)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
