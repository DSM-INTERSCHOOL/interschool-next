import { useMemo } from "react";
import { formatCurrency } from "@/lib/formatCurrency";
import { SalesByCategoryProductRow } from "@/interfaces/ISalesReport";

export function ByCategoryProductReportView({ rows }: { rows: SalesByCategoryProductRow[] }) {
  const groups = useMemo(() => {
    const byCategory = new Map<number, { description: string; rows: SalesByCategoryProductRow[] }>();
    for (const row of rows) {
      const existing = byCategory.get(row.category_id);
      if (existing) {
        existing.rows.push(row);
      } else {
        byCategory.set(row.category_id, { description: row.category_description, rows: [row] });
      }
    }
    return Array.from(byCategory.values());
  }, [rows]);

  if (groups.length === 0) {
    return <p className="py-8 text-center text-base-content/60">Sin datos para el rango seleccionado</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => {
        const totalQty = group.rows.reduce((sum, r) => sum + r.quantity, 0);
        const totalAmount = group.rows.reduce((sum, r) => sum + Number(r.amount), 0);
        return (
          <div key={group.description}>
            <p className="mb-2 font-semibold">{group.description}</p>
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th className="text-right">Cantidad</th>
                    <th className="text-right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {group.rows.map((r) => (
                    <tr key={r.product_id}>
                      <td>{r.product_title}</td>
                      <td className="text-right">{r.quantity}</td>
                      <td className="text-right">{formatCurrency(r.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold">
                    <td>Total {group.description}</td>
                    <td className="text-right">{totalQty}</td>
                    <td className="text-right">{formatCurrency(totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
