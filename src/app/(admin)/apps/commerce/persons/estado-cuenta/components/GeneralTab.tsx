import { AccountMovement, AccountMovementFlow, AccountMovementType, AccountStatement } from "@/interfaces/ITransaction";
import { SummaryCards, formatDateTime, methodLabel, money, movementDetail, operator } from "./format";

const TYPE_LABEL: Record<AccountMovementType, string> = {
  PAGO_ORDEN: "Pago de orden",
  RECARGA: "Recarga",
  DEVOLUCION: "Devolución",
  PAGO_SALDO: "Pago con saldo",
  DEVOLUCION_SALDO: "Devolución a saldo",
};

const FLOW_BADGE: Record<AccountMovementFlow, string> = {
  ENTRADA: "badge-success",
  SALIDA: "badge-error",
  SALDO: "badge-ghost",
};

const signed = (m: AccountMovement) =>
  m.flow === "ENTRADA" ? `+${money(m.amount)}` : m.flow === "SALIDA" ? `-${money(m.amount)}` : money(m.amount);

const AMOUNT_CLASS: Record<AccountMovementFlow, string> = {
  ENTRADA: "text-success",
  SALIDA: "text-error",
  SALDO: "text-base-content/50",
};

function GeneralMovementsTable({ movements, print }: { movements: AccountMovement[]; print?: boolean }) {
  return (
    <table className="table table-zebra w-full">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Movimiento</th>
          <th>Forma de pago</th>
          <th>Detalle</th>
          <th>Registró</th>
          <th className="text-right">Importe</th>
        </tr>
      </thead>
      <tbody>
        {movements.map((m) => (
          <tr key={m.id}>
            <td className="text-sm whitespace-nowrap">{formatDateTime(m.created)}</td>
            <td>
              {print ? (
                TYPE_LABEL[m.type]
              ) : (
                <span className={`badge badge-sm ${FLOW_BADGE[m.flow]}`}>{TYPE_LABEL[m.type]}</span>
              )}
            </td>
            <td className="text-sm">{methodLabel(m.payment_method, m.payment_channel)}</td>
            <td className="text-sm text-base-content/70">{movementDetail(m)}</td>
            <td className="text-sm">{operator(m)}</td>
            <td className={`text-right tabular-nums ${AMOUNT_CLASS[m.flow]}`}>{signed(m)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ByMethodTable({ rows }: { rows: AccountStatement["by_method"] }) {
  return (
    <table className="table table-sm w-full">
      <thead>
        <tr>
          <th>Forma de pago</th>
          <th className="text-right">Cobros</th>
          <th className="text-right">Salidas</th>
          <th className="text-right">Neto</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.payment_method}>
            <td>{methodLabel(r.payment_method)}</td>
            <td className="text-right tabular-nums">{money(r.entradas)}</td>
            <td className="text-right tabular-nums">{money(r.salidas)}</td>
            <td className="text-right font-medium tabular-nums">{money(r.neto)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function GeneralTab({ statement, print = false }: { statement: AccountStatement; print?: boolean }) {
  const pendingTotal = statement.pending.reduce((sum, p) => sum + Number(p.amount), 0);
  const hasSaldo = Number(statement.pagado_con_saldo) > 0 || Number(statement.devuelto_a_saldo) > 0;

  return (
    <>
      <SummaryCards
        cards={[
          { label: "Cobros", value: money(statement.total_entradas), className: "text-success" },
          { label: "Salidas (devoluciones)", value: money(statement.total_salidas), className: "text-error" },
          { label: "Neto recibido", value: money(statement.neto) },
          { label: "Saldo actual", value: money(statement.current_balance) },
        ]}
      />

      {hasSaldo && (
        <p className="mb-4 text-sm text-base-content/60">
          Movimientos de saldo (no suman a Cobros/Salidas, ese dinero ya entró como recarga): pagado con saldo{" "}
          {money(statement.pagado_con_saldo)} · devuelto a saldo {money(statement.devuelto_a_saldo)}.
        </p>
      )}

      {!print && statement.pending.length > 0 && (
        <div className="alert alert-warning mb-4">
          <span className="iconify lucide--clock-9 size-5"></span>
          <div>
            {statement.pending.length === 1 ? "1 pago SPEI pendiente" : `${statement.pending.length} pagos SPEI pendientes`}{" "}
            por {money(pendingTotal)} — no se cuentan hasta que se confirmen.
          </div>
        </div>
      )}

      {statement.movements.length === 0 ? (
        <div className="text-center py-10 text-base-content/60">Sin movimientos en el rango seleccionado</div>
      ) : (
        <>
          {statement.by_method.length > 0 && (
            <div className="mb-4 max-w-2xl overflow-x-auto">
              <p className="mb-1 text-sm font-semibold">Por forma de pago</p>
              <ByMethodTable rows={statement.by_method} />
            </div>
          )}
          <div className="overflow-x-auto">
            <GeneralMovementsTable movements={statement.movements} print={print} />
          </div>
        </>
      )}

      {print && statement.pending.length > 0 && (
        <p className="mt-4 text-sm">Pagos SPEI pendientes (no incluidos): {money(pendingTotal)}</p>
      )}
    </>
  );
}
