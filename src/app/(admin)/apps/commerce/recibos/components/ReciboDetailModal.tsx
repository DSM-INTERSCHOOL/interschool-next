"use client";

import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { printPage } from "@/lib/printPage";
import { ReceiptRead } from "@/interfaces/IReceipt";
import { getReceipt } from "@/services/receipt.service";
import { ReciboView } from "./ReciboView";

interface ReciboDetailModalProps {
  receiptId: number;
  orderNumber?: number;
  // Right after a cobro, the natural POS flow is to print the receipt
  // immediately, with no on-screen modal in the way first -- goes straight
  // to the browser's print dialog once the receipt loads, and closes
  // itself once that dialog is dismissed. The Recibos consultation screen
  // (reviewing/reprinting a past receipt) leaves this unset, so there the
  // modal shows normally and printing stays a deliberate "Imprimir" click.
  autoPrint?: boolean;
  onClose: () => void;
}

export function ReciboDetailModal({ receiptId, orderNumber, autoPrint, onClose }: ReciboDetailModalProps) {
  const [receipt, setReceipt] = useState<ReceiptRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [printTriggered, setPrintTriggered] = useState(false);

  useEffect(() => {
    const { schoolId } = getOrgConfig();
    getReceipt({ schoolId, receiptId })
      .then(setReceipt)
      .catch((err) => setError(err.response?.data?.detail || err.message || "No se pudo cargar el recibo"))
      .finally(() => setLoading(false));
  }, [receiptId]);

  useEffect(() => {
    if (!autoPrint || !receipt || printTriggered) return;
    setPrintTriggered(true);
    const handleAfterPrint = () => onClose();
    window.addEventListener("afterprint", handleAfterPrint);
    printPage("80mm auto", "0", `Recibo ${receipt.folio}`);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPrint, receipt, printTriggered]);

  if (autoPrint) {
    // No on-screen UI at all in this mode -- `.print-receipt` (see
    // src/styles/custom/print.css) is the only thing the print stylesheet
    // makes visible, so this never flashes a modal before the print dialog.
    return receipt ? (
      <div className="print-receipt hidden print:block">
        <ReciboView receipt={receipt} orderNumber={orderNumber} />
      </div>
    ) : null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.3)", backdropFilter: "blur(4px)" }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-base-100 shadow-xl">
        <div className="flex items-center justify-between border-b border-base-300 p-6">
          <h2 className="text-xl font-semibold">Recibo</h2>
          <div className="flex gap-2">
            {receipt && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => printPage("80mm auto", "0", `Recibo ${receipt.folio}`)}
              >
                <span className="iconify lucide--printer size-4"></span>
                Imprimir
              </button>
            )}
            <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
              <span className="iconify lucide--x size-5"></span>
            </button>
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner message="Cargando recibo..." />
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <span className="iconify lucide--alert-circle size-6"></span>
              <div>{error}</div>
            </div>
          ) : receipt ? (
            <div className="print-receipt">
              <ReciboView receipt={receipt} orderNumber={orderNumber} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
