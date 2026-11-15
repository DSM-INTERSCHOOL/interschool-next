"use client";

import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { CashRegisterSessionSummary } from "@/interfaces/ICashRegister";
import { getCajaSessionSummary } from "@/services/cashRegister.service";
import { CobrosPorFormaPago, CorteTotals, SessionHeader } from "../../components";

interface CorteDetailModalProps {
  sessionId: number;
  resolveTerminalName?: (deviceId: string) => string;
  onClose: () => void;
}

export function CorteDetailModal({ sessionId, resolveTerminalName, onClose }: CorteDetailModalProps) {
  const [summary, setSummary] = useState<CashRegisterSessionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { schoolId } = getOrgConfig();
    getCajaSessionSummary({ schoolId, sessionId })
      .then(setSummary)
      .catch((err) => setError(err.response?.data?.detail || err.message || "No se pudo cargar el corte"))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.3)", backdropFilter: "blur(4px)" }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-base-100 shadow-xl">
        <div className="flex items-center justify-between border-b border-base-300 p-6">
          <h2 className="text-xl font-semibold">Detalle del corte</h2>
          <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <span className="iconify lucide--x size-5"></span>
          </button>
        </div>
        <div className="flex flex-col gap-4 p-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner message="Cargando corte..." />
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <span className="iconify lucide--alert-circle size-6"></span>
              <div>{error}</div>
            </div>
          ) : summary ? (
            <>
              <SessionHeader summary={summary} resolveTerminalName={resolveTerminalName} />
              <CobrosPorFormaPago summary={summary} />
              <CorteTotals summary={summary} />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
