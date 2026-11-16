import { formatCurrency } from "@/lib/formatCurrency";
import { SalesGeneralReport } from "@/interfaces/ISalesReport";

const formatDateTime = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export function GeneralReportView({ report }: { report: SalesGeneralReport }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-base-200 p-4">
          <p className="text-xs text-base-content/60">Órdenes</p>
          <p className="text-2xl font-bold">{report.orders_count}</p>
        </div>
        <div className="rounded-lg bg-base-200 p-4">
          <p className="text-xs text-base-content/60">Artículos vendidos</p>
          <p className="text-2xl font-bold">{report.items_count}</p>
        </div>
        <div className="rounded-lg bg-base-200 p-4">
          <p className="text-xs text-base-content/60">Total vendido</p>
          <p className="text-2xl font-bold">{formatCurrency(report.total_amount)}</p>
        </div>
        <div className="rounded-lg bg-base-200 p-4">
          <p className="text-xs text-base-content/60">Ticket promedio</p>
          <p className="text-2xl font-bold">{formatCurrency(report.average_ticket)}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th className="text-right">Artículos</th>
              <th className="text-right">Monto</th>
            </tr>
          </thead>
          <tbody>
            {report.orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-base-content/60">
                  Sin ventas para el rango seleccionado
                </td>
              </tr>
            ) : (
              report.orders.map((order) => (
                <tr key={order.order_id}>
                  <td className="font-medium">{order.id_orden}</td>
                  <td className="text-sm text-base-content/60">{formatDateTime(order.paid_at)}</td>
                  <td>{order.client_name}</td>
                  <td className="text-right">{order.items_count}</td>
                  <td className="text-right">{formatCurrency(order.total_amount)}</td>
                </tr>
              ))
            )}
          </tbody>
          {report.orders.length > 0 && (
            <tfoot>
              <tr className="font-bold">
                <td colSpan={3}>Total</td>
                <td className="text-right">{report.items_count}</td>
                <td className="text-right">{formatCurrency(report.total_amount)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
