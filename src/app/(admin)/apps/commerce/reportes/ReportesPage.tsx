"use client";

import { PageTitle } from "@/components/PageTitle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PrintButton, PrintSection } from "@/components/PrintSection";
import { ByCategoryProductReportView, ByProductReportView, GeneralReportView, SimpleSalesTable } from "./components";
import { REPORT_TABS, useReportesForm } from "./hooks";

const formatDate = (value: string) => {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
};

export default function ReportesPage() {
  const form = useReportesForm();
  const activeTabLabel = REPORT_TABS.find((t) => t.value === form.activeReport)?.label ?? "";

  const renderActiveReport = () => {
    switch (form.activeReport) {
      case "general":
        return form.general && <GeneralReportView report={form.general} />;
      case "by-product":
        return form.byProduct && <ByProductReportView rows={form.byProduct} />;
      case "by-top-category":
        return (
          form.byTopCategory && (
            <SimpleSalesTable
              labelHeader="Categoría"
              rows={form.byTopCategory.map((r) => ({
                key: r.top_category_id ?? "none",
                label: r.description,
                quantity: r.quantity,
                amount: r.amount,
              }))}
            />
          )
        );
      case "by-category":
        return (
          form.byCategory && (
            <SimpleSalesTable
              labelHeader="Clasificador"
              rows={form.byCategory.map((r) => ({
                key: r.category_id,
                label: r.description,
                quantity: r.quantity,
                amount: r.amount,
              }))}
            />
          )
        );
      case "by-category-product":
        return form.byCategoryProduct && <ByCategoryProductReportView rows={form.byCategoryProduct} />;
      case "by-user":
        return (
          form.byUser && (
            <SimpleSalesTable
              labelHeader="Usuario"
              extraHeader="Órdenes"
              rows={form.byUser.map((r) => ({
                key: r.person_internal_id ?? "none",
                label: r.name,
                quantity: r.quantity,
                amount: r.amount,
                extra: r.orders_count,
              }))}
            />
          )
        );
    }
  };

  return (
    <>
      <PageTitle
        title="Reportes de Ventas"
      />

      <div className="mt-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body gap-4!">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex flex-wrap items-end gap-3">
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
              </div>
              <PrintButton title={`Reporte de Ventas - ${activeTabLabel}`} disabled={form.loading || !!form.error} />
            </div>

            <div className="tabs tabs-boxed w-fit">
              {REPORT_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  className={`tab ${form.activeReport === tab.value ? "tab-active" : ""}`}
                  onClick={() => form.setActiveReport(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {form.loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner message="Cargando reporte..." />
              </div>
            ) : form.error ? (
              <div className="alert alert-error">
                <span className="iconify lucide--alert-circle size-6"></span>
                <div>{form.error}</div>
              </div>
            ) : (
              renderActiveReport()
            )}
          </div>
        </div>
      </div>

      {!form.loading && !form.error && (
        <PrintSection
          title={`Reporte de Ventas — ${activeTabLabel}`}
          meta={[{ label: "Periodo", value: `${formatDate(form.startDate)} al ${formatDate(form.endDate)}` }]}
        >
          {renderActiveReport()}
        </PrintSection>
      )}
    </>
  );
}
