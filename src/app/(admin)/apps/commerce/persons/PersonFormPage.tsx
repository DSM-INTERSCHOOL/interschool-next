"use client";

import { AppLink as Link } from "@/components/AppLink";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PERSON_TYPE_LABELS, REGIMEN_FISCAL_OPTIONS, USO_CFDI_OPTIONS, personTypeLabel } from "./constants";
import { usePersonForm } from "./hooks";

interface PersonFormPageProps {
  personInternalId?: string;
}

export default function PersonFormPage({ personInternalId }: PersonFormPageProps) {
  const { formData, updateFormField, isEdit, loading, error, saveLoading, saveError, handleSave } =
    usePersonForm(personInternalId);

  // id/type are never editable once a person exists (id is the primary
  // key; type is interschool-core's own identity classification, not
  // something this screen should be able to redefine). Role isn't shown
  // here at all -- formData.role still round-trips through save
  // unchanged (defaults to BUYER on create), this screen just doesn't
  // manage it. For an INTERSCHOOL-sourced person, editing here is meant
  // for local corrections only -- identity fields keep coming from that
  // sync, only the commerce-owned fields (CLABE + CFDI billing data) are
  // this screen's to change.
  const generalFieldsDisabled = isEdit && formData.origin === "INTERSCHOOL";

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner message="Cargando cliente..." />
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body gap-6">
        {error && (
          <div className="alert alert-error">
            <span className="iconify lucide--alert-circle size-6"></span>
            <div>{error}</div>
          </div>
        )}
        {saveError && (
          <div className="alert alert-error">
            <span className="iconify lucide--alert-circle size-6"></span>
            <div>{saveError}</div>
          </div>
        )}

        <div className="rounded-xl border border-base-300 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold">Información general</p>
            {isEdit && (
              <span
                className={`badge badge-sm ${formData.origin === "MANUAL" ? "badge-ghost" : "badge-info"}`}
                title="Quién escribió este registro por última vez -- no editable aquí."
              >
                Origen: {formData.origin === "MANUAL" ? "Manual" : "Interschool"}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">ID de cliente</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.person_internal_id}
                disabled={isEdit}
                onChange={(e) => updateFormField("person_internal_id", e.target.value)}
                placeholder="Ej. DSM"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Tipo</span>
              </label>
              {isEdit ? (
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={personTypeLabel(formData.type)}
                  disabled
                />
              ) : (
                <select
                  className="select select-bordered w-full"
                  value={formData.type}
                  onChange={(e) => updateFormField("type", e.target.value)}
                >
                  <option value="">Sin especificar</option>
                  {Object.entries(PERSON_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Nombre(s)</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.given_name}
                disabled={generalFieldsDisabled}
                onChange={(e) => updateFormField("given_name", e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Apellido paterno</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.paternal_name}
                disabled={generalFieldsDisabled}
                onChange={(e) => updateFormField("paternal_name", e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Apellido materno</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.maternal_name}
                disabled={generalFieldsDisabled}
                onChange={(e) => updateFormField("maternal_name", e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                className="input input-bordered w-full"
                value={formData.email}
                disabled={generalFieldsDisabled}
                onChange={(e) => updateFormField("email", e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Teléfono</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.mobile_phone}
                disabled={generalFieldsDisabled}
                onChange={(e) => updateFormField("mobile_phone", e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Código de país (teléfono)</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.mobile_phone_country_code}
                disabled={generalFieldsDisabled}
                onChange={(e) => updateFormField("mobile_phone_country_code", e.target.value)}
                placeholder="Ej. +52"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-base-300 p-4">
          <p className="mb-3 font-semibold">Comercio</p>
          {generalFieldsDisabled && (
            <p className="mb-3 text-sm text-base-content/60">
              Los datos de identidad de este cliente vienen de Interschool -- solo la cuenta CLABE y los
              datos fiscales se pueden corregir aquí.
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Cuenta CLABE (SPEI)</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={18}
                className="input input-bordered w-full"
                value={formData.spei_account}
                onChange={(e) => updateFormField("spei_account", e.target.value)}
                placeholder="18 dígitos"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-base-300 p-4">
          <p className="mb-3 font-semibold">Datos fiscales (CFDI)</p>
          <p className="mb-3 text-sm text-base-content/60">
            Necesarios para poder facturar a este cliente -- aparecen en el comprobante como datos del
            receptor.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text">Razón Social</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.razon_social}
                onChange={(e) => updateFormField("razon_social", e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">RFC</span>
              </label>
              <input
                type="text"
                maxLength={13}
                className="input input-bordered w-full uppercase"
                value={formData.rfc}
                onChange={(e) => updateFormField("rfc", e.target.value.toUpperCase())}
                placeholder="Ej. XAXX010101000"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Código Postal</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                className="input input-bordered w-full"
                value={formData.codigo_postal}
                onChange={(e) => updateFormField("codigo_postal", e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Régimen Fiscal</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.regimen_fiscal}
                onChange={(e) => updateFormField("regimen_fiscal", e.target.value)}
              >
                <option value="">Sin especificar</option>
                {REGIMEN_FISCAL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Uso CFDI</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.uso_cfdi}
                onChange={(e) => updateFormField("uso_cfdi", e.target.value)}
              >
                <option value="">Sin especificar</option>
                {USO_CFDI_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text">Dirección</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full"
                rows={2}
                value={formData.direccion}
                onChange={(e) => updateFormField("direccion", e.target.value)}
                placeholder="Calle, número, colonia, ciudad, estado"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Link href="/apps/commerce/persons" className="btn btn-ghost">
            Cancelar
          </Link>
          <button className="btn btn-primary" onClick={handleSave} disabled={saveLoading}>
            {saveLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : isEdit ? (
              "Actualizar"
            ) : (
              "Guardar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
