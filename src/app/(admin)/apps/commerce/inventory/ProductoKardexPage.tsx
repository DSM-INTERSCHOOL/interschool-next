"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PrintButton, PrintSection } from "@/components/PrintSection";
import { ProductSearchSelect } from "../components";
import { useMovementCatalogs, useProductoKardexReport } from "./hooks";

const TYPE_BADGE: Record<string, string> = {
  ENTRADA: "badge-success",
  SALIDA: "badge-error",
};

// dd/MM/yyyy HH:mm, in the viewer's own local time -- matches the rest of
// the commerce module's date formatting.
const formatDateTime = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function ProductoKardexPage() {
  const catalogs = useMovementCatalogs();
  const report = useProductoKardexReport();
  const searchParams = useSearchParams();

  // Deep-linked from the Existencias table's "Ver movimientos" action --
  // prefill and run the search immediately instead of making the user
  // re-pick everything that row already told us.
  useEffect(() => {
    const productId = searchParams.get("product_id");
    const warehouseId = searchParams.get("warehouse_id");
    const colorId = searchParams.get("color_id");
    const sizeId = searchParams.get("size_id");
    if (!productId || !warehouseId) return;
    report.setProductId(Number(productId));
    report.setWarehouseId(Number(warehouseId));
    if (colorId) report.setColorId(Number(colorId));
    if (sizeId) report.setSizeId(Number(sizeId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const selectedProduct = useMemo(
    () => catalogs.products.find((p) => p.id === report.productId) ?? null,
    [catalogs.products, report.productId]
  );
  const colorOptions = useMemo(
    () => (selectedProduct ? catalogs.colors.filter((c) => selectedProduct.color_ids.includes(c.id)) : []),
    [catalogs.colors, selectedProduct]
  );
  const sizeOptions = useMemo(
    () => (selectedProduct ? catalogs.sizes.filter((s) => selectedProduct.size_ids.includes(s.id)) : []),
    [catalogs.sizes, selectedProduct]
  );
  const needsColor = colorOptions.length > 0;
  const needsSize = sizeOptions.length > 0;
  const canSearch =
    report.productId !== "" &&
    report.warehouseId !== "" &&
    (!needsColor || report.colorId !== "") &&
    (!needsSize || report.sizeId !== "");

  // Auto-runs once the variant selection is unambiguous (product +
  // warehouse, plus color/size when the product actually has them) --
  // covers both the deep-link prefill above and the user picking filters
  // by hand. Date-range changes are deliberately excluded: those need the
  // explicit "Buscar" click, or every keystroke/date pick would fire a
  // request.
  useEffect(() => {
    if (canSearch) report.search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSearch, report.productId, report.warehouseId, report.colorId, report.sizeId]);

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <p className="text-base-content/60 text-sm mb-4">
          Consulta los movimientos de almacén de un artículo: existencia inicial, cada movimiento (con
          quién lo realizó) y existencia final, para un rango de fechas.
        </p>

        {(report.error || catalogs.error) && (
          <div className="alert alert-error mb-4">
            <span className="iconify lucide--alert-circle size-6"></span>
            <div>{report.error || catalogs.error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 mb-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="form-control lg:col-span-2">
            <label className="label py-1">
              <span className="label-text text-xs">Producto</span>
            </label>
            <ProductSearchSelect
              products={catalogs.products}
              value={report.productId}
              onChange={(id) => {
                report.setProductId(id);
                report.setColorId("");
                report.setSizeId("");
              }}
            />
          </div>
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
              <span className="label-text text-xs">Color</span>
            </label>
            <select
              className="select select-bordered select-sm w-full"
              value={report.colorId}
              disabled={!needsColor}
              onChange={(e) => report.setColorId(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">{needsColor ? "Selecciona" : "— sin color —"}</option>
              {colorOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.description}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs">Talla</span>
            </label>
            <select
              className="select select-bordered select-sm w-full"
              value={report.sizeId}
              disabled={!needsSize}
              onChange={(e) => report.setSizeId(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">{needsSize ? "Selecciona" : "— sin talla —"}</option>
              {sizeOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3 mb-4">
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
          <button type="button" className="btn btn-primary btn-sm" disabled={!canSearch} onClick={report.search}>
            <span className="iconify lucide--search size-4"></span>
            Buscar
          </button>
          <PrintButton title="Producto Kardex" disabled={!report.report || report.report.movements.length === 0} />
        </div>

        {catalogs.loading || report.loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner message="Cargando..." />
          </div>
        ) : !report.searched ? (
          <div className="text-center py-16">
            <span className="iconify lucide--history size-24 text-base-content/20 mb-4"></span>
            <h3 className="text-xl font-medium text-base-content mb-2">Selecciona un artículo</h3>
            <p className="text-base-content/60">
              Elige producto, almacén (y color/talla si aplica) para ver sus movimientos
            </p>
          </div>
        ) : report.report ? (
          <>
            <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2">
              <div className="rounded-lg bg-base-200 px-4 py-3">
                <p className="text-sm text-base-content/60">Stock inicial</p>
                <p className="text-2xl font-bold">{report.report.stock_inicial}</p>
              </div>
              <div className="rounded-lg bg-base-200 px-4 py-3">
                <p className="text-sm text-base-content/60">Stock final</p>
                <p className="text-2xl font-bold">{report.report.stock_final}</p>
              </div>
            </div>

            {report.report.movements.length === 0 ? (
              <div className="text-center py-10 text-base-content/60">
                Sin movimientos en el rango seleccionado
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Fecha</th>
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
                        <td className="text-sm text-base-content/60">{formatDateTime(m.created)}</td>
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
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : null}
      </div>

      {report.report && report.report.movements.length > 0 && (
        <PrintSection
          title="Producto Kardex"
          meta={[
            { label: "Producto", value: selectedProduct?.title ?? "" },
            { label: "Almacén", value: catalogs.warehouses.find((w) => w.id === report.warehouseId)?.description ?? "" },
            ...(report.colorId !== "" ? [{ label: "Color", value: colorOptions.find((c) => c.id === report.colorId)?.description ?? "" }] : []),
            ...(report.sizeId !== "" ? [{ label: "Talla", value: sizeOptions.find((s) => s.id === report.sizeId)?.description ?? "" }] : []),
            { label: "Periodo", value: `${report.start} al ${report.end}` },
          ]}
        >
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-lg bg-base-200 px-4 py-3">
              <p className="text-sm text-base-content/60">Stock inicial</p>
              <p className="text-2xl font-bold">{report.report.stock_inicial}</p>
            </div>
            <div className="rounded-lg bg-base-200 px-4 py-3">
              <p className="text-sm text-base-content/60">Stock final</p>
              <p className="text-2xl font-bold">{report.report.stock_final}</p>
            </div>
          </div>
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Fecha</th>
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
                  <td className="text-sm">{formatDateTime(m.created)}</td>
                  <td>{m.type}</td>
                  <td className="text-sm">{m.origin}</td>
                  <td className="text-right">
                    {m.type === "SALIDA" ? "-" : "+"}
                    {m.quantity}
                  </td>
                  <td className="text-right font-medium">{m.available}</td>
                  <td className="text-sm">{m.person_internal_id}</td>
                  <td className="text-sm">{m.notes ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </PrintSection>
      )}
    </div>
  );
}
