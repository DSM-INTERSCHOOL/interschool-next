import { formatCurrency } from "@/lib/formatCurrency";
import { SalesByProductRow } from "@/interfaces/ISalesReport";

export function ByProductReportView({ rows }: { rows: SalesByProductRow[] }) {
  if (rows.length === 0) {
    return <p className="py-8 text-center text-base-content/60">Sin datos para el rango seleccionado</p>;
  }

  const totalQty = rows.reduce((sum, r) => sum + r.quantity, 0);
  const totalAmount = rows.reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Color</th>
            <th>Talla</th>
            <th className="text-right">Cantidad</th>
            <th className="text-right">Monto</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.product_id}-${r.color ?? ""}-${r.size ?? ""}`}>
              <td>{r.title}</td>
              <td>{r.color ?? "—"}</td>
              <td>{r.size ?? "—"}</td>
              <td className="text-right">{r.quantity}</td>
              <td className="text-right">{formatCurrency(r.amount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold">
            <td colSpan={3}>Total</td>
            <td className="text-right">{totalQty}</td>
            <td className="text-right">{formatCurrency(totalAmount)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
