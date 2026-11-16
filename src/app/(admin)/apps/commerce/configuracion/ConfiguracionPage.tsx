"use client";

import { useRef, useState } from "react";
import { PageTitle } from "@/components/PageTitle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { CONFIGURABLE_PAYMENT_METHOD_LABELS, ConfigurablePaymentMethod } from "@/interfaces/IPaymentMethodConfig";
import { CONFIGURABLE_PAYMENT_CHANNEL_LABELS, ConfigurablePaymentChannel } from "@/interfaces/IPaymentChannelConfig";
import { OrderMode, ORDER_MODES } from "@/interfaces/ITopCategory";
import { REGIMEN_FISCAL_OPTIONS } from "@/lib/satCatalogs";
import { useOrderModesConfig } from "../top-categories/order-modes/hooks";
import { useConfiguracionForm, useFiscalProfileForm } from "./hooks";

const CONFIGURABLE_PAYMENT_METHODS = Object.keys(CONFIGURABLE_PAYMENT_METHOD_LABELS) as ConfigurablePaymentMethod[];
const CONFIGURABLE_PAYMENT_CHANNELS = Object.keys(
  CONFIGURABLE_PAYMENT_CHANNEL_LABELS
) as ConfigurablePaymentChannel[];

// Full names for this table's column headers -- ORDER_MODES.label itself
// stays "AS"/"OP" since that's also used for a compact per-row badge in
// OrdersListPage.tsx, where the full word wouldn't fit.
const ORDER_MODE_TABLE_LABELS: Record<OrderMode, string> = {
  SELF_SERVICE: "Autoservicio",
  OPERATOR: "Operador",
};

export default function ConfiguracionPage() {
  const form = useConfiguracionForm();
  // Same backing table as apps/commerce/top-categories/order-modes
  // (TopCategoryOrderMode) -- embedded here too so it lives alongside the
  // other per-sale-channel settings, not duplicated data.
  const modes = useOrderModesConfig();
  const fiscal = useFiscalProfileForm();

  const cerInputRef = useRef<HTMLInputElement>(null);
  const keyInputRef = useRef<HTMLInputElement>(null);
  const [keyPassword, setKeyPassword] = useState("");
  const [showRfcFixModal, setShowRfcFixModal] = useState(false);

  const handleConfirmRfcFix = async () => {
    const succeeded = await fiscal.handleDeleteProfile();
    // Only close on success -- a block (CFDIs already issued) or a
    // transient failure sets fiscal.deleteError and should keep the modal
    // open so the admin actually sees why nothing happened.
    if (succeeded) setShowRfcFixModal(false);
  };

  const handleUploadCertificates = async () => {
    const cerFile = cerInputRef.current?.files?.[0];
    const keyFile = keyInputRef.current?.files?.[0];
    if (!cerFile || !keyFile || !keyPassword) return;
    await fiscal.uploadCertificates(cerFile, keyFile, keyPassword);
    setKeyPassword("");
    if (cerInputRef.current) cerInputRef.current.value = "";
    if (keyInputRef.current) keyInputRef.current.value = "";
  };

  return (
    <>
      <PageTitle
        title="Configuración"
      />

      <div className="mt-6 flex flex-col gap-6">
        {form.loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner message="Cargando configuración..." />
          </div>
        ) : form.error ? (
          <div className="alert alert-error">
            <span className="iconify lucide--alert-circle size-6"></span>
            <div>{form.error}</div>
          </div>
        ) : (
          <>
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body gap-4!">
                <h2 className="card-title text-2xl">
                  <span className="iconify lucide--credit-card size-6"></span>
                  Formas de pago disponibles
                </h2>
                <p className="text-sm text-base-content/60">
                  Selecciona qué instrumentos acepta esta escuela al cobrar en ventanilla (Cobros, Devoluciones y
                  recargas inmediatas en Prepago) -- un intento de usar una forma de pago no habilitada será
                  rechazado.
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {CONFIGURABLE_PAYMENT_METHODS.map((method) => (
                    <label key={method} className="label w-fit cursor-pointer gap-3">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={form.enabledMethods.has(method)}
                        onChange={() => form.toggleMethod(method)}
                      />
                      <span className="label-text">{CONFIGURABLE_PAYMENT_METHOD_LABELS[method]}</span>
                    </label>
                  ))}
                </div>

                {form.paymentSaveError && <p className="text-sm text-error">{form.paymentSaveError}</p>}
                {form.paymentSaved && !form.paymentSaveError && (
                  <p className="text-sm text-success">Formas de pago actualizadas</p>
                )}

                <div className="card-actions justify-end">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={form.paymentSaveLoading}
                    onClick={form.savePaymentMethods}
                  >
                    {form.paymentSaveLoading && <span className="loading loading-spinner loading-sm"></span>}
                    Guardar
                  </button>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body gap-4!">
                <h2 className="card-title text-2xl">
                  <span className="iconify lucide--landmark size-6"></span>
                  Medios de pago disponibles
                </h2>
                <p className="text-sm text-base-content/60">
                  A diferencia de una forma de pago (el instrumento que se cobra en ventanilla), un medio de pago
                  es un canal propio con su propio flujo -- por ejemplo SPEI, que queda pendiente hasta que se
                  confirme la transferencia. Deshabilitarlo aquí lo quita de Prepago.
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {CONFIGURABLE_PAYMENT_CHANNELS.map((channel) => (
                    <label key={channel} className="label w-fit cursor-pointer gap-3">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={form.enabledChannels.has(channel)}
                        onChange={() => form.toggleChannel(channel)}
                      />
                      <span className="label-text">{CONFIGURABLE_PAYMENT_CHANNEL_LABELS[channel]}</span>
                    </label>
                  ))}
                </div>

                {form.channelSaveError && <p className="text-sm text-error">{form.channelSaveError}</p>}
                {form.channelSaved && !form.channelSaveError && (
                  <p className="text-sm text-success">Medios de pago actualizados</p>
                )}

                <div className="card-actions justify-end">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={form.channelSaveLoading}
                    onClick={form.saveChannels}
                  >
                    {form.channelSaveLoading && <span className="loading loading-spinner loading-sm"></span>}
                    Guardar
                  </button>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body gap-4!">
                <h2 className="card-title text-2xl">
                  <span className="iconify lucide--warehouse size-6"></span>
                  Almacén por defecto para venta
                </h2>
                <p className="text-sm text-base-content/60">
                  Opcional: define un almacén distinto para cada portal de venta. Si no se define uno aquí,
                  se usa el almacén de venta general (Almacenes).
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs">Autoservicio (Self-Service)</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={form.selfServiceWarehouseId}
                      onChange={(e) =>
                        form.setSelfServiceWarehouseId(e.target.value ? Number(e.target.value) : "")
                      }
                    >
                      <option value="">— usar almacén de venta general —</option>
                      {form.warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs">Venta por Operador</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={form.operatorWarehouseId}
                      onChange={(e) =>
                        form.setOperatorWarehouseId(e.target.value ? Number(e.target.value) : "")
                      }
                    >
                      <option value="">— usar almacén de venta general —</option>
                      {form.warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {form.warehouseSaveError && <p className="text-sm text-error">{form.warehouseSaveError}</p>}
                {form.warehouseSaved && !form.warehouseSaveError && (
                  <p className="text-sm text-success">Almacenes por defecto actualizados</p>
                )}

                <div className="card-actions justify-end">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={form.warehouseSaveLoading}
                    onClick={form.saveWarehouses}
                  >
                    {form.warehouseSaveLoading && <span className="loading loading-spinner loading-sm"></span>}
                    Guardar
                  </button>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body gap-4!">
                <h2 className="card-title text-2xl">
                  <span className="iconify lucide--layout-grid size-6"></span>
                  Categorías disponibles por modo de venta
                </h2>
                <p className="text-sm text-base-content/60">
                  Define qué categorías están disponibles para cada portal de venta -- un modo puede
                  ofrecer una o varias. Una categoría sin marcar en un modo no aparece ahí, por ejemplo
                  Uniformes puede ofrecerse solo por Operador, no en autoservicio.
                </p>

                {modes.loading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner message="Cargando categorías..." />
                  </div>
                ) : modes.error ? (
                  <div className="alert alert-error">
                    <span className="iconify lucide--alert-circle size-6"></span>
                    <div>{modes.error}</div>
                  </div>
                ) : modes.categories.length === 0 ? (
                  <p className="text-sm text-base-content/60">
                    Crea al menos una categoría para poder configurar sus modos de venta.
                  </p>
                ) : (
                  <>
                    {modes.saveError && <p className="text-sm text-error">{modes.saveError}</p>}

                    <div className="overflow-x-auto">
                      <table className="table table-zebra w-full">
                        <thead>
                          <tr>
                            <th>Categoría</th>
                            {ORDER_MODES.map((mode) => (
                              <th key={mode.value} className="text-center">
                                {ORDER_MODE_TABLE_LABELS[mode.value]}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {modes.categories.map((category) => (
                            <tr key={category.id}>
                              <td>{category.description}</td>
                              {ORDER_MODES.map((mode) => (
                                <td key={mode.value} className="text-center">
                                  <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary"
                                    checked={modes.enabled[mode.value].has(category.id)}
                                    onChange={() => modes.toggle(mode.value, category.id)}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="card-actions justify-end">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={modes.discard}
                        disabled={!modes.dirty || modes.saving}
                      >
                        Descartar cambios
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={modes.save}
                        disabled={!modes.dirty || modes.saving}
                      >
                        {modes.saving && <span className="loading loading-spinner loading-sm"></span>}
                        Guardar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body gap-4!">
                <h2 className="card-title text-2xl">
                  <span className="iconify lucide--building-2 size-6"></span>
                  Modo de pago SPEI
                </h2>
                <p className="text-sm text-base-content/60">
                  Define a qué cuenta se dirige un pago por transferencia SPEI. CLABE personal usa la cuenta
                  CLABE registrada de cada cliente; CLABE única envía todos los pagos SPEI a una sola cuenta
                  de la escuela.
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`btn btn-sm ${form.speiMode === "CLABE_PERSONAL" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => form.setSpeiMode("CLABE_PERSONAL")}
                  >
                    CLABE personal
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${form.speiMode === "CLABE_UNICA" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => form.setSpeiMode("CLABE_UNICA")}
                  >
                    CLABE única
                  </button>
                </div>

                {form.speiMode === "CLABE_UNICA" && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text text-xs">Cuenta CLABE</span>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={18}
                        className="input input-bordered w-full"
                        placeholder="18 dígitos"
                        value={form.accountNumberClabe}
                        onChange={(e) => form.setAccountNumberClabe(e.target.value)}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text text-xs">Banco</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        placeholder="Ej. BBVA"
                        value={form.bankClabe}
                        onChange={(e) => form.setBankClabe(e.target.value)}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text text-xs">Titular</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        placeholder="Nombre del titular de la cuenta"
                        value={form.ownerNameClabe}
                        onChange={(e) => form.setOwnerNameClabe(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {form.speiSaveError && <p className="text-sm text-error">{form.speiSaveError}</p>}
                {form.speiSaved && !form.speiSaveError && (
                  <p className="text-sm text-success">Configuración de SPEI actualizada</p>
                )}

                <div className="card-actions justify-end">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={form.speiSaveLoading}
                    onClick={form.saveSpeiConfig}
                  >
                    {form.speiSaveLoading && <span className="loading loading-spinner loading-sm"></span>}
                    Guardar
                  </button>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body gap-4!">
                <h2 className="card-title text-2xl">
                  <span className="iconify lucide--timer-off size-6"></span>
                  Cancelación automática de órdenes
                </h2>
                <p className="text-sm text-base-content/60">
                  Si una orden se coloca (self-service u operador) y nadie la cobra dentro de este tiempo, se
                  cancela automáticamente y su inventario se restaura -- aplica sin importar la vía de pago
                  elegida (Ventanilla o SPEI).
                </p>

                <div className="form-control max-w-xs">
                  <label className="label py-1">
                    <span className="label-text text-xs">Horas antes de cancelar</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="input input-bordered w-full"
                    value={form.orderAutoCancelHours}
                    onChange={(e) => form.setOrderAutoCancelHours(Number(e.target.value))}
                  />
                </div>

                {form.autoCancelSaveError && <p className="text-sm text-error">{form.autoCancelSaveError}</p>}
                {form.autoCancelSaved && !form.autoCancelSaveError && (
                  <p className="text-sm text-success">Tiempo límite actualizado</p>
                )}

                <div className="card-actions justify-end">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={form.autoCancelSaveLoading}
                    onClick={form.saveAutoCancelConfig}
                  >
                    {form.autoCancelSaveLoading && <span className="loading loading-spinner loading-sm"></span>}
                    Guardar
                  </button>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body gap-4!">
                <h2 className="card-title text-2xl">
                  <span className="iconify lucide--landmark size-6"></span>
                  Datos fiscales de la escuela
                </h2>
                <p className="text-sm text-base-content/60">
                  Los datos de la escuela como emisor de comprobantes (CFDI) -- razón social, RFC y
                  dirección fiscal aparecen en cada factura que se genere.
                </p>

                {fiscal.loading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner message="Cargando datos fiscales..." />
                  </div>
                ) : fiscal.error ? (
                  <div className="alert alert-error">
                    <span className="iconify lucide--alert-circle size-6"></span>
                    <div>{fiscal.error}</div>
                  </div>
                ) : (
                  <>
                    {!fiscal.exists && (
                      <p className="text-sm text-warning">
                        Esta escuela todavía no tiene datos fiscales configurados -- sin ellos no se pueden
                        generar facturas.
                      </p>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="form-control sm:col-span-2">
                        <label className="label py-1">
                          <span className="label-text text-xs">Razón Social</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={fiscal.formData.razon_social}
                          onChange={(e) => fiscal.updateFormField("razon_social", e.target.value)}
                        />
                      </div>

                      <div className="form-control">
                        <label className="label py-1">
                          <span className="label-text text-xs">RFC</span>
                        </label>
                        <input
                          type="text"
                          maxLength={13}
                          className="input input-bordered w-full uppercase"
                          value={fiscal.formData.rfc}
                          disabled={fiscal.exists}
                          onChange={(e) => fiscal.updateFormField("rfc", e.target.value.toUpperCase())}
                          placeholder="Ej. CCE850101AB1"
                        />
                        {fiscal.exists && (
                          <p className="mt-1 text-xs text-base-content/50">
                            No se puede cambiar una vez registrado ante factura-electronica.{" "}
                            <button
                              type="button"
                              className="link link-primary"
                              onClick={() => setShowRfcFixModal(true)}
                            >
                              ¿Está mal capturado?
                            </button>
                          </p>
                        )}
                      </div>

                      <div className="form-control">
                        <label className="label py-1">
                          <span className="label-text text-xs">Régimen Fiscal</span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          value={fiscal.formData.clave_regimen_fiscal}
                          onChange={(e) => fiscal.updateFormField("clave_regimen_fiscal", e.target.value)}
                        >
                          <option value="">Sin especificar</option>
                          {REGIMEN_FISCAL_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-control sm:col-span-2">
                        <label className="label py-1">
                          <span className="label-text text-xs">Calle y número</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={fiscal.formData.calle_numero_fiscal}
                          onChange={(e) => fiscal.updateFormField("calle_numero_fiscal", e.target.value)}
                        />
                      </div>

                      <div className="form-control">
                        <label className="label py-1">
                          <span className="label-text text-xs">Colonia</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={fiscal.formData.colonia_fiscal}
                          onChange={(e) => fiscal.updateFormField("colonia_fiscal", e.target.value)}
                        />
                      </div>

                      <div className="form-control">
                        <label className="label py-1">
                          <span className="label-text text-xs">Código Postal</span>
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={5}
                          className="input input-bordered w-full"
                          value={fiscal.formData.codigo_postal_fiscal}
                          onChange={(e) => fiscal.updateFormField("codigo_postal_fiscal", e.target.value)}
                        />
                      </div>

                      <div className="form-control">
                        <label className="label py-1">
                          <span className="label-text text-xs">Municipio</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={fiscal.formData.municipio_fiscal}
                          onChange={(e) => fiscal.updateFormField("municipio_fiscal", e.target.value)}
                        />
                      </div>

                      <div className="form-control">
                        <label className="label py-1">
                          <span className="label-text text-xs">Estado</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={fiscal.formData.estado_fiscal}
                          onChange={(e) => fiscal.updateFormField("estado_fiscal", e.target.value)}
                        />
                      </div>

                      <div className="form-control">
                        <label className="label py-1">
                          <span className="label-text text-xs">Serie de folios</span>
                        </label>
                        <input
                          type="text"
                          maxLength={25}
                          className="input input-bordered w-full"
                          value={fiscal.formData.serie}
                          onChange={(e) => fiscal.updateFormField("serie", e.target.value)}
                          placeholder="Ej. A"
                        />
                      </div>

                      <div className="form-control">
                        <label className="label py-1">
                          <span className="label-text text-xs">Estatus</span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          value={fiscal.formData.estatus}
                          onChange={(e) =>
                            fiscal.updateFormField("estatus", e.target.value as "ACTIVO" | "INACTIVO")
                          }
                        >
                          <option value="ACTIVO">Activo</option>
                          <option value="INACTIVO">Inactivo</option>
                        </select>
                      </div>
                    </div>

                    {fiscal.saveError && <p className="text-sm text-error">{fiscal.saveError}</p>}
                    {fiscal.saved && !fiscal.saveError && (
                      <p className="text-sm text-success">Datos fiscales actualizados</p>
                    )}

                    <div className="card-actions justify-end">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={fiscal.saveLoading}
                        onClick={fiscal.handleSave}
                      >
                        {fiscal.saveLoading && <span className="loading loading-spinner loading-sm"></span>}
                        {fiscal.exists ? "Guardar" : "Registrar"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <DeleteConfirmationModal
              isOpen={showRfcFixModal}
              onClose={() => setShowRfcFixModal(false)}
              onConfirm={handleConfirmRfcFix}
              title="Corregir RFC"
              message={
                "El RFC no se puede editar una vez registrado -- la única forma de corregirlo es eliminar " +
                "este perfil fiscal y volver a capturarlo con el RFC correcto. Esto solo es posible mientras " +
                "no se haya emitido ningún CFDI con estos datos." +
                (fiscal.deleteError ? ` ${fiscal.deleteError}` : "")
              }
              itemName={fiscal.formData.razon_social}
              loading={fiscal.deleteLoading}
            />

            {fiscal.exists && (
              <>
                <div className="card bg-base-100 shadow-lg">
                  <div className="card-body gap-4!">
                    <h2 className="card-title text-2xl">
                      <span className="iconify lucide--shield-check size-6"></span>
                      Certificados (CSD)
                      <span
                        className={`badge badge-sm ${fiscal.hasCertificates ? "badge-success" : "badge-ghost"}`}
                      >
                        {fiscal.hasCertificates ? "Configurados" : "No configurados"}
                      </span>
                    </h2>
                    <p className="text-sm text-base-content/60">
                      El Certificado de Sello Digital (.cer/.key) que firma cada CFDI -- se envía directo a
                      factura-electronica, nunca se guarda aquí.
                    </p>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="form-control">
                        <label className="label py-1">
                          <span className="label-text text-xs">Archivo .cer</span>
                        </label>
                        <input
                          ref={cerInputRef}
                          type="file"
                          accept=".cer"
                          className="file-input file-input-bordered file-input-sm w-full"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label py-1">
                          <span className="label-text text-xs">Archivo .key</span>
                        </label>
                        <input
                          ref={keyInputRef}
                          type="file"
                          accept=".key"
                          className="file-input file-input-bordered file-input-sm w-full"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label py-1">
                          <span className="label-text text-xs">Contraseña del .key</span>
                        </label>
                        <input
                          type="password"
                          className="input input-bordered input-sm w-full"
                          value={keyPassword}
                          onChange={(e) => setKeyPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    {fiscal.certSaveError && <p className="text-sm text-error">{fiscal.certSaveError}</p>}
                    {fiscal.certSaved && !fiscal.certSaveError && (
                      <p className="text-sm text-success">Certificados subidos correctamente</p>
                    )}

                    <div className="card-actions justify-end">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={fiscal.certSaveLoading}
                        onClick={handleUploadCertificates}
                      >
                        {fiscal.certSaveLoading && <span className="loading loading-spinner loading-sm"></span>}
                        Subir certificados
                      </button>
                    </div>
                  </div>
                </div>

                <div className="card bg-base-100 shadow-lg">
                  <div className="card-body gap-4!">
                    <h2 className="card-title text-2xl">
                      <span className="iconify lucide--key size-6"></span>
                      Credenciales FEL (Timbrado)
                      <span
                        className={`badge badge-sm ${fiscal.hasFelCredentials ? "badge-success" : "badge-ghost"}`}
                      >
                        {fiscal.hasFelCredentials ? "Configuradas" : "No configuradas"}
                      </span>
                    </h2>
                    <p className="text-sm text-base-content/60">
                      Usuario y contraseña del PAC/servicio de timbrado -- distintas del certificado CSD de
                      arriba.
                    </p>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="form-control">
                        <label className="label py-1">
                          <span className="label-text text-xs">Usuario FEL</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered input-sm w-full"
                          value={fiscal.felUsuario}
                          onChange={(e) => fiscal.setFelUsuario(e.target.value)}
                        />
                      </div>
                      <div className="form-control">
                        <label className="label py-1">
                          <span className="label-text text-xs">Contraseña FEL</span>
                        </label>
                        <input
                          type="password"
                          className="input input-bordered input-sm w-full"
                          value={fiscal.felPassword}
                          onChange={(e) => fiscal.setFelPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    {fiscal.felSaveError && <p className="text-sm text-error">{fiscal.felSaveError}</p>}
                    {fiscal.felSaved && !fiscal.felSaveError && (
                      <p className="text-sm text-success">Credenciales guardadas correctamente</p>
                    )}

                    <div className="card-actions justify-end">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={fiscal.felSaveLoading}
                        onClick={fiscal.saveFelCredentials}
                      >
                        {fiscal.felSaveLoading && <span className="loading loading-spinner loading-sm"></span>}
                        Guardar
                      </button>
                    </div>
                  </div>
                </div>

                <div className="card bg-base-100 shadow-lg">
                  <div className="card-body gap-4!">
                    <h2 className="card-title text-2xl">
                      <span className="iconify lucide--hash size-6"></span>
                      Folios y Series CFDI
                    </h2>
                    <p className="text-sm text-base-content/60">
                      Configura con qué número empieza el folio de una serie -- útil la primera vez, por
                      ejemplo si ya existen folios en papel o de otro sistema hasta cierto número.
                      factura-electronica lo incrementa automáticamente después de cada timbrado.
                    </p>

                    {fiscal.foliosLoading ? (
                      <div className="flex justify-center py-4">
                        <span className="loading loading-spinner loading-sm"></span>
                      </div>
                    ) : fiscal.folios.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="table table-zebra table-sm w-full">
                          <thead>
                            <tr>
                              <th>Serie</th>
                              <th>Tipo</th>
                              <th className="text-right">Folio actual</th>
                            </tr>
                          </thead>
                          <tbody>
                            {fiscal.folios.map((folio) => (
                              <tr key={folio.serie}>
                                <td>{folio.serie}</td>
                                <td>{folio.tipo}</td>
                                <td className="text-right">{folio.folio_actual}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-base-content/60">
                        Sin series configuradas todavía -- usa la serie por defecto o define una abajo.
                      </p>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="form-control">
                        <label className="label py-1">
                          <span className="label-text text-xs">Serie (opcional)</span>
                        </label>
                        <input
                          type="text"
                          maxLength={25}
                          className="input input-bordered input-sm w-full"
                          value={fiscal.folioSerie}
                          onChange={(e) => fiscal.setFolioSerie(e.target.value)}
                          placeholder="Ej. A"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label py-1">
                          <span className="label-text text-xs">Folio inicial</span>
                        </label>
                        <input
                          type="number"
                          min={0}
                          className="input input-bordered input-sm w-full"
                          value={fiscal.folioInicial}
                          onChange={(e) => fiscal.setFolioInicial(e.target.value)}
                        />
                      </div>
                    </div>

                    {fiscal.folioSaveError && <p className="text-sm text-error">{fiscal.folioSaveError}</p>}
                    {fiscal.folioSaved && !fiscal.folioSaveError && (
                      <p className="text-sm text-success">Folio configurado correctamente</p>
                    )}

                    <div className="card-actions justify-end">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={fiscal.folioSaveLoading}
                        onClick={fiscal.saveFolio}
                      >
                        {fiscal.folioSaveLoading && <span className="loading loading-spinner loading-sm"></span>}
                        Configurar folio
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
