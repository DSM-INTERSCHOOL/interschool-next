"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PrintButton, PrintSection } from "@/components/PrintSection";
import { useMovementCatalogs, useTopCategories, useWarehouseKardexReport } from "./hooks";

const TYPE_BADGE: Record<string, string> = {
  ENTRADA: "badge-success",
  SALIDA: "badge-error",
};

// Infinite scroll is a rendering optimization only -- the full range is
// always fetched in one request (bounded by the 30-day default start/end),
// and the printed report below always uses the complete `movements` array
// regardless of how many rows have been scrolled into view here.
const PAGE_SIZE = 100;

// dd/MM/yyyy HH:mm, in the viewer's own local time -- matches the rest of
// the commerce module's date formatting.
const formatDateTime = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function WarehouseKardexPage() {
  const catalogs = useMovementCatalogs();
  const { topCategories, loading: topCategoriesLoading, error: topCategoriesError } = useTopCategories();
  const report = useWarehouseKardexReport();

  const canSearch = report.warehouseId !== "";

  // Auto-runs once a warehouse is picked (and again if top-category
  // changes) -- date-range changes still need the explicit "Buscar" click,
  // or every keystroke/date pick would fire a request.
  useEffect(() => {
    if (canSearch) report.search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSearch, report.warehouseId, report.topCategoryId]);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [report.report]);

  const totalCount = report.report?.movements.length ?? 0;
  const hasMore = visibleCount < totalCount;
  const sentinelRef = useRef<HTMLTableRowElement>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setVisibleCount((c) => Math.min(c + PAGE_SIZE, totalCount));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, totalCount]);

  const productById = useMemo(() => new Map(catalogs.products.map((p) => [p.id, p])), [catalogs.products]);
  const colorDescription = (id: number | null) =>
    id === null ? "—" : catalogs.colors.find((c) => c.id === id)?.description ?? `#${id}`;
  const sizeDescription = (id: number | null) =>
    id === null ? "—" : catalogs.sizes.find((s) => s.id === id)?.description ?? `#${id}`;

  const loading = catalogs.loading || topCategoriesLoading;

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <p className="text-base-content/60 text-sm mb-4">
          Consulta todos los movimientos de un almacén -- no hay existencia inicial ni final, solo el
          registro de lo que se ha movido, en todos los productos (o acotado a una categoría).
        </p>

        {(report.error || catalogs.error || topCategoriesError) && (
          <div className="alert alert-error mb-4">
            <span className="iconify lucide--alert-circle size-6"></span>
            <div>{report.error || catalogs.error || topCategoriesError}</div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs">Almacén</span>
            </label>
            <select
              className="select select-bordered select-sm w-full"
              value={report.warehouseId}
              onChange={(e) => report.setWarehouseId(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">Selecciona</option>
              {catalogs.warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.description}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs">Categoría</span>
            </label>
            <select
              className="select select-bordered select-sm w-full"
              value={report.topCategoryId}
              onChange={(e) => report.setTopCategoryId(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">Todas</option>
              {topCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.description}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs">Desde</span>
            </label>
            <input
              type="date"
              className="input input-bordered input-sm w-full"
              value={report.start}
              onChange={(e) => report.setStart(e.target.value)}
            />
          </div>
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs">Hasta</span>
            </label>
            <input
              type="date"
              className="input input-bordered input-sm w-full"
              value={report.end}
              onChange={(e) => report.setEnd(e.target.value)}
            />
          </div>
          <div className="form-control justify-end">
            <button type="button" className="btn btn-primary btn-sm" disabled={!canSearch} onClick={report.search}>
              <span className="iconify lucide--search size-4"></span>
              Buscar
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 mb-4">
          <PrintButton
            title="Kardex de Almacén"
            landscape
            disabled={!report.report || report.report.movements.length === 0}
          />
        </div>

        {loading || report.loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner message="Cargando..." />
          </div>
        ) : !report.searched ? (
          <div className="text-center py-16">
            <span className="iconify lucide--warehouse size-24 text-base-content/20 mb-4"></span>
            <h3 className="text-xl font-medium text-base-content mb-2">Selecciona un almacén</h3>
            <p className="text-base-content/60">Sus movimientos aparecerán aquí</p>
          </div>
        ) : report.report ? (
          report.report.movements.length === 0 ? (
            <div className="text-center py-10 text-base-content/60">
              Sin movimientos en el rango seleccionado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Producto</th>
                    <th>Color</th>
                    <th>Talla</th>
                    <th>Tipo</th>
                    <th>Origen</th>
                    <th className="text-right">Cantidad</th>
                    <th className="text-right">Disponible</th>
                    <th>Persona</th>
                    <th>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {report.report.movements.slice(0, visibleCount).map((m) => (
                    <tr key={m.id}>
                      <td className="text-sm text-base-content/60">{formatDateTime(m.created)}</td>
                      <td>{productById.get(m.product_id)?.title ?? `Producto #${m.product_id}`}</td>
                      <td>{colorDescription(m.color_id)}</td>
                      <td>{sizeDescription(m.size_id)}</td>
                      <td>
                        <span className={`badge badge-sm ${TYPE_BADGE[m.type] ?? "badge-ghost"}`}>{m.type}</span>
                      </td>
                      <td className="text-sm">{m.origin}</td>
                      <td className="text-right">
                        {m.type === "SALIDA" ? "-" : "+"}
                        {m.quantity}
                      </td>
                      <td className="text-right font-medium">{m.available}</td>
                      <td className="text-sm">{m.person_internal_id}</td>
                      <td className="text-sm text-base-content/60">{m.notes ?? "—"}</td>
                    </tr>
                  ))}
                  {hasMore && (
                    <tr ref={sentinelRef}>
                      <td colSpan={10} className="py-4 text-center text-sm text-base-content/50">
                        <span className="loading loading-spinner loading-sm"></span> Cargando más movimientos...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <p className="mt-2 text-right text-xs text-base-content/50">
                Mostrando {Math.min(visibleCount, totalCount)} de {totalCount} movimientos
              </p>
            </div>
          )
        ) : null}
      </div>

      {report.report && report.report.movements.length > 0 && (
        <PrintSection
          title="Kardex de Almacén"
          landscape
          meta={[
            {
              label: "Almacén",
              value: catalogs.warehouses.find((w) => w.id === report.warehouseId)?.description ?? "",
            },
            ...(report.topCategoryId !== ""
              ? [{ label: "Categoría", value: topCategories.find((c) => c.id === report.topCategoryId)?.description ?? "" }]
              : []),
            ...(report.start || report.end
              ? [{ label: "Periodo", value: `${report.start || "inicio"} al ${report.end || "hoy"}` }]
              : []),
          ]}
        >
          <table className="table table-zebra w-full text-sm">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Color</th>
                <th>Talla</th>
                <th>Tipo</th>
                <th>Origen</th>
                <th className="text-right">Cantidad</th>
                <th className="text-right">Disponible</th>
                <th>Persona</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              {report.report.movements.map((m) => (
                <tr key={m.id}>
                  <td>{formatDateTime(m.created)}</td>
                  <td>{productById.get(m.product_id)?.title ?? `Producto #${m.product_id}`}</td>
                  <td>{colorDescription(m.color_id)}</td>
                  <td>{sizeDescription(m.size_id)}</td>
                  <td>{m.type}</td>
                  <td>{m.origin}</td>
                  <td className="text-right">
                    {m.type === "SALIDA" ? "-" : "+"}
                    {m.quantity}
                  </td>
                  <td className="text-right font-medium">{m.available}</td>
                  <td>{m.person_internal_id}</td>
                  <td>{m.notes ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </PrintSection>
      )}
    </div>
  );
}
