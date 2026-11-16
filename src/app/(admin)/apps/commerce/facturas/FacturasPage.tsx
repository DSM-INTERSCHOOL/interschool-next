"use client";

import { AppLink as Link } from "@/components/AppLink";
import { PageTitle } from "@/components/PageTitle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { getOrgConfig } from "@/lib/orgConfig";
import { downloadCfdiPdf, downloadCfdiXml } from "@/services/cfdi.service";
import { useFacturasHistorial } from "./hooks";

const ESTATUS_BADGE: Record<string, string> = {
  ACTIVO: "badge-success",
  CANCELADO: "badge-error",
};

const formatDateTime = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function FacturasPage() {
  const form = useFacturasHistorial();

  const hasFilters = form.hasFilters;

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <PageTitle title="Facturas" />
        <Link href="/apps/commerce/orders" className="btn btn-ghost btn-sm">
          <span className="iconify lucide--arrow-left size-4"></span>
          Volver a Órdenes
        </Link>
      </div>

      <div className="mt-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body gap-4!">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">Desde</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered input-sm w-full"
                  value={form.startDate}
                  onChange={(e) => form.setStartDate(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">Hasta</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered input-sm w-full"
                  value={form.endDate}
                  onChange={(e) => form.setEndDate(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">Estatus</span>
                </label>
                <select
                  className="select select-bordered select-sm w-full"
                  value={form.estatus}
                  onChange={(e) => form.setEstatus(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="ACTIVO">Activo</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">Orden</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="ID de la orden"
                  className="input input-bordered input-sm w-full"
                  value={form.orderId}
                  onChange={(e) => form.setOrderId(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">RFC</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered input-sm w-full"
                  value={form.rfc}
                  onChange={(e) => form.setRfc(e.target.value)}
                />
              </div>
              <div className="form-control justify-end">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={form.clearFilters}
                  disabled={!hasFilters}
                >
                  <span className="iconify lucide--x size-4"></span>
                  Limpiar filtros
                </button>
              </div>
            </div>

            {form.loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner message="Cargando facturas..." />
              </div>
            ) : form.error ? (
              <div className="alert alert-error">
                <span className="iconify lucide--alert-circle size-6"></span>
                <div>{form.error}</div>
              </div>
            ) : form.cfdis.length === 0 ? (
              <div className="py-16 text-center">
                <span className="iconify lucide--file-text size-24 text-base-content/20 mb-4"></span>
                <h3 className="mb-2 text-xl font-medium text-base-content">Sin facturas</h3>
                <p className="text-base-content/60">
                  {hasFilters
                    ? "Ninguna factura coincide con los filtros seleccionados"
                    : "Todavía no se ha generado ninguna factura"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Serie / Folio</th>
                      <th>RFC</th>
                      <th>Razón Social</th>
                      <th>Fecha</th>
                      <th>Orden</th>
                      <th className="text-right">Total</th>
                      <th>Estatus</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.cfdis.map((cfdi) => (
                      <tr key={cfdi.id}>
                        <td className="font-medium">
                          {cfdi.serie ?? "—"} {cfdi.folio ?? ""}
                        </td>
                        <td>{cfdi.rfc}</td>
                        <td>{cfdi.razon_social}</td>
                        <td className="text-sm text-base-content/60">{formatDateTime(cfdi.fecha_hora ?? cfdi.created)}</td>
                        <td className="text-sm text-base-content/60">#{cfdi.order_id}</td>
                        <td className="text-right font-medium">${Number(cfdi.total).toFixed(2)}</td>
                        <td>
                          <span className={`badge badge-sm ${ESTATUS_BADGE[cfdi.estatus] ?? "badge-ghost"}`}>
                            {cfdi.estatus}
                          </span>
                        </td>
                        <td>
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs"
                              title="Descargar XML"
                              onClick={() => downloadCfdiXml({ schoolId: getOrgConfig().schoolId, cfdiId: cfdi.id })}
                            >
                              <span className="iconify lucide--file-code size-4"></span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs"
                              title="Descargar PDF"
                              onClick={() => downloadCfdiPdf({ schoolId: getOrgConfig().schoolId, cfdiId: cfdi.id })}
                            >
                              <span className="iconify lucide--file-text size-4"></span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
