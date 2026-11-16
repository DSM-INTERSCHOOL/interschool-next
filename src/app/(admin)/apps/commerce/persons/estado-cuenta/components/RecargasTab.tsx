import { WalletMovement, WalletMovementType, WalletStatement } from "@/interfaces/ITransaction";
import { SummaryCards, formatDateTime, methodLabel, money, movementDetail, operator } from "./format";

const TYPE_LABEL: Record<WalletMovementType, string> = {
  RECARGA: "Recarga",
  DEVOLUCION: "Devolución",
  PAGO: "Pago",
};

const TYPE_BADGE: Record<WalletMovementType, string> = {
  RECARGA: "badge-success",
  DEVOLUCION: "badge-info",
  PAGO: "badge-error",
};

const signedMoney = (value: string) => `${Number(value) > 0 ? "+" : ""}${money(value)}`;

function WalletMovementsTable({ movements, print }: { movements: WalletMovement[]; print?: boolean }) {
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
          <th className="text-right">Saldo</th>
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
                <span className={`badge badge-sm ${TYPE_BADGE[m.type]}`}>{TYPE_LABEL[m.type]}</span>
              )}
            </td>
            <td className="text-sm">{methodLabel(m.payment_method, m.payment_channel)}</td>
            <td className="text-sm text-base-content/70">{movementDetail(m)}</td>
            <td className="text-sm">{operator(m)}</td>
            <td className={`text-right tabular-nums ${Number(m.amount) < 0 ? "text-error" : "text-success"}`}>
              {signedMoney(m.amount)}
            </td>
            <td className="text-right font-medium tabular-nums">{money(m.balance_after)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function RecargasTab({ statement, print = false }: { statement: WalletStatement; print?: boolean }) {
  const pendingTotal = statement.pending_topups.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <>
      <SummaryCards
        cards={[
          { label: "Saldo inicial", value: money(statement.opening_balance) },
          { label: "Abonos", value: money(statement.total_credits), className: "text-success" },
          { label: "Cargos", value: money(statement.total_debits), className: "text-error" },
          { label: "Saldo final", value: money(statement.closing_balance) },
        ]}
      />

      {!print && statement.pending_topups.length > 0 && (
        <div className="alert alert-warning mb-4">
          <span className="iconify lucide--clock-9 size-5"></span>
          <div>
            {statement.pending_topups.length === 1
              ? "1 recarga SPEI pendiente"
              : `${statement.pending_topups.length} recargas SPEI pendientes`}{" "}
            por {money(pendingTotal)} — no suman al saldo hasta que se confirmen en Recargas pendientes.
          </div>
        </div>
      )}

      {statement.movements.length === 0 ? (
        <div className="text-center py-10 text-base-content/60">Sin movimientos en el rango seleccionado</div>
      ) : (
        <div className="overflow-x-auto">
          <WalletMovementsTable movements={statement.movements} print={print} />
        </div>
      )}

      {print && statement.pending_topups.length > 0 && (
        <p className="mt-4 text-sm">Recargas SPEI pendientes (no incluidas en el saldo): {money(pendingTotal)}</p>
      )}
    </>
  );
}
