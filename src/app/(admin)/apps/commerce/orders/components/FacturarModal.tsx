"use client";

import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { REGIMEN_FISCAL_OPTIONS, USO_CFDI_OPTIONS } from "@/lib/satCatalogs";
import { OrderRead } from "@/interfaces/IOrder";
import { TransactionResult } from "@/interfaces/ITransaction";
import { getCommercePerson } from "@/services/commercePerson.service";
import { facturarOrder } from "@/services/transaction.service";
import { downloadCfdiPdf, downloadCfdiXml } from "@/services/cfdi.service";

interface FacturarModalProps {
  order: OrderRead;
  onClose: () => void;
  onSuccess: () => void;
}

// Prefills from the order's own client (apps/commerce/persons CFDI data)
// when available -- the backend falls back to that same record for
// whatever's left blank, this just lets the user see/adjust it up front.
export function FacturarModal({ order, onClose, onSuccess }: FacturarModalProps) {
  const [loadingClient, setLoadingClient] = useState(true);
  const [requireFactura, setRequireFactura] = useState(true);
  const [rfc, setRfc] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [usoCfdi, setUsoCfdi] = useState("");
  const [regimenFiscal, setRegimenFiscal] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TransactionResult | null>(null);

  useEffect(() => {
    if (!order.person_internal_id) {
      setLoadingClient(false);
      return;
    }
    const { schoolId } = getOrgConfig();
    getCommercePerson({ schoolId, personInternalId: order.person_internal_id })
      .then((person) => {
        setRfc(person.rfc ?? "");
        setRazonSocial(person.razon_social ?? "");
        setUsoCfdi(person.uso_cfdi ?? "");
        setRegimenFiscal(person.regimen_fiscal ?? "");
        setCodigoPostal(person.codigo_postal ?? "");
      })
      .catch(() => {
        // No client record, or it has no CFDI data yet -- the fields just
        // stay blank and the user can fill them in manually.
      })
      .finally(() => setLoadingClient(false));
  }, [order.person_internal_id]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const res = await facturarOrder({
        schoolId,
        dto: {
          order_id: order.id,
          require_factura: requireFactura,
          ...(requireFactura
            ? {
                receptor_rfc: rfc.trim() || undefined,
                receptor_nombre: razonSocial.trim() || undefined,
                receptor_uso_cfdi: usoCfdi || undefined,
                receptor_regimen_fiscal: regimenFiscal || undefined,
                receptor_domicilio_fiscal: codigoPostal.trim() || undefined,
              }
            : {}),
        },
      });
      setResult(res);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "No se pudo generar la factura");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.3)", backdropFilter: "blur(4px)" }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-base-100 shadow-xl">
        <div className="flex items-center justify-between border-b border-base-300 p-6">
          <h2 className="text-xl font-semibold">Facturar orden #{order.id_orden}</h2>
          <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <span className="iconify lucide--x size-5"></span>
          </button>
        </div>
        <div className="p-6">
          {result ? (
            <div className="flex flex-col gap-4">
              <div className="alert alert-success">
                <span className="iconify lucide--check-circle size-6"></span>
                <div>Factura generada correctamente{result.uuid_fiscal ? ` (UUID ${result.uuid_fiscal})` : ""}.</div>
              </div>
              <div className="flex gap-2">
                {result.cfdi_id && (
                  <>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => downloadCfdiXml({ schoolId: getOrgConfig().schoolId, cfdiId: result.cfdi_id! })}
                    >
                      <span className="iconify lucide--file-code size-4"></span>
                      Descargar XML
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => downloadCfdiPdf({ schoolId: getOrgConfig().schoolId, cfdiId: result.cfdi_id! })}
                    >
                      <span className="iconify lucide--file-text size-4"></span>
                      Descargar PDF
                    </button>
                  </>
                )}
              </div>
              <div className="flex justify-end">
                <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
                  Cerrar
                </button>
              </div>
            </div>
          ) : loadingClient ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner message="Cargando datos del cliente..." />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {error && (
                <div className="alert alert-error">
                  <span className="iconify lucide--alert-circle size-6"></span>
                  <div>{error}</div>
                </div>
              )}

              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  className="toggle toggle-sm mt-0.5 shrink-0"
                  checked={requireFactura}
                  onChange={(e) => setRequireFactura(e.target.checked)}
                />
                <span className="label-text min-w-0 whitespace-normal break-words">
                  Factura con datos fiscales (desmarcar para Público en general)
                </span>
              </label>

              {requireFactura && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="form-control sm:col-span-2">
                    <label className="label py-1">
                      <span className="label-text text-xs">Razón Social</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full"
                      value={razonSocial}
                      onChange={(e) => setRazonSocial(e.target.value)}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs">RFC</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full"
                      value={rfc}
                      onChange={(e) => setRfc(e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs">Código Postal</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full"
                      value={codigoPostal}
                      onChange={(e) => setCodigoPostal(e.target.value)}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs">Régimen Fiscal</span>
                    </label>
                    <select
                      className="select select-bordered select-sm w-full"
                      value={regimenFiscal}
                      onChange={(e) => setRegimenFiscal(e.target.value)}
                    >
                      <option value="">Selecciona...</option>
                      {REGIMEN_FISCAL_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs">Uso CFDI</span>
                    </label>
                    <select
                      className="select select-bordered select-sm w-full"
                      value={usoCfdi}
                      onChange={(e) => setUsoCfdi(e.target.value)}
                    >
                      <option value="">Selecciona...</option>
                      {USO_CFDI_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={submitting}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={submitting}>
                  {submitting && <span className="loading loading-spinner loading-xs"></span>}
                  Generar factura
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
