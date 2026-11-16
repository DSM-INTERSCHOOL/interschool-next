import { formatCurrency } from "@/lib/formatCurrency";

export interface SimpleSalesRow {
  key: string | number;
  label: string;
  quantity: number;
  amount: string;
  extra?: number;
}

interface SimpleSalesTableProps {
  rows: SimpleSalesRow[];
  labelHeader: string;
  extraHeader?: string;
}

export function SimpleSalesTable({ rows, labelHeader, extraHeader }: SimpleSalesTableProps) {
  const totalQty = rows.reduce((sum, r) => sum + r.quantity, 0);
  const totalAmount = rows.reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>{labelHeader}</th>
            {extraHeader && <th className="text-right">{extraHeader}</th>}
            <th className="text-right">Cantidad</th>
            <th className="text-right">Monto</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={extraHeader ? 4 : 3} className="text-center text-base-content/60">
                Sin datos para el rango seleccionado
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.key}>
                <td>{r.label}</td>
                {extraHeader && <td className="text-right">{r.extra}</td>}
                <td className="text-right">{r.quantity}</td>
                <td className="text-right">{formatCurrency(r.amount)}</td>
              </tr>
            ))
          )}
        </tbody>
        {rows.length > 0 && (
          <tfoot>
            <tr className="font-bold">
              <td>Total</td>
              {extraHeader && <td></td>}
              <td className="text-right">{totalQty}</td>
              <td className="text-right">{formatCurrency(totalAmount)}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
