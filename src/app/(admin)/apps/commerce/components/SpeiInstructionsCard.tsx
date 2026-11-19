"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { RecargaSpeiInstructions } from "@/interfaces/ITransaction";
import { printPage } from "@/lib/printPage";

import { formatDateTime, money } from "../persons/estado-cuenta/components/format";

function CopyField({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (insecure context / permissions) -- the value is still visible to copy by hand.
    }
  };
  return (
    <div className="rounded-box bg-base-200 flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="text-base-content/60 text-xs">{label}</p>
        <p className={`text-lg font-bold break-all ${mono ? "font-mono tracking-wider" : ""}`}>{value}</p>
      </div>
      <button type="button" onClick={copy} className="btn btn-ghost btn-sm shrink-0" aria-label={`Copiar ${label}`}>
        <span className={`iconify size-4 ${copied ? "lucide--check text-success" : "lucide--copy"}`}></span>
        {copied ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}

const TicketField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p>{label}:</p>
    <p className="text-sm font-bold break-all">{value}</p>
  </div>
);

// 80mm thermal ticket of the ficha -- same look as the receipt/order ticket,
// so the customer can take the deposit data with them.
function SpeiTicket({ data, customerName }: { data: RecargaSpeiInstructions; customerName?: string }) {
  return (
    <div className="text-base-content mx-auto box-border flex w-[80mm] flex-col gap-2 p-2 font-mono text-xs">
      <div className="flex flex-col items-center gap-0.5 text-center">
        <p className="text-sm font-bold">FICHA DE DEPÓSITO SPEI</p>
        <p>{formatDateTime(data.created)}</p>
      </div>
      <div className="border-base-content/40 border-t border-dashed" />
      {customerName && <p className="truncate">Cliente: {customerName}</p>}
      <div className="flex justify-between text-sm font-bold">
        <span>MONTO</span>
        <span>{money(data.amount)}</span>
      </div>
      <div className="border-base-content/40 border-t border-dashed" />
      {data.clabe ? (
        <>
          <TicketField label="CLABE" value={data.clabe} />
          {data.bank && <TicketField label="Banco" value={data.bank} />}
          {data.owner_name && <TicketField label="Beneficiario" value={data.owner_name} />}
          {data.reference && <TicketField label="Concepto / referencia" value={data.reference} />}
        </>
      ) : (
        <p>{data.message}</p>
      )}
      <div className="border-base-content/40 border-t border-dashed" />
      <p>
        Transfiere exactamente {money(data.amount)}
        {data.reference ? ` y escribe ${data.reference} en el concepto` : ""}. El saldo se acreditará cuando la escuela
        confirme el depósito.
      </p>
    </div>
  );
}

interface SpeiInstructionsCardProps {
  data: RecargaSpeiInstructions;
  onClose: () => void;
  // Who the ficha is shown to -- in Prepago the cashier hands it to the
  // customer, so it names them.
  customerName?: string;
}

// SPEI deposit ficha for a PENDING wallet top-up: CLABE, banco,
// beneficiario and concepto. Used by self-service (Recargar saldo) and by
// Prepago when the cashier registers a SPEI tender.
export function SpeiInstructionsCard({ data, onClose, customerName }: SpeiInstructionsCardProps) {
  // The ticket is only mounted while printing, so with several fichas on
  // screen only the one clicked gets printed.
  const [printing, setPrinting] = useState(false);
  useEffect(() => {
    if (!printing) return;
    const done = () => setPrinting(false);
    window.addEventListener("afterprint", done);
    const timer = setTimeout(
      () => printPage("80mm auto", "0", `Ficha SPEI ${data.reference ?? data.order_payment_id}`),
      0,
    );
    return () => {
      clearTimeout(timer);
      window.removeEventListener("afterprint", done);
    };
  }, [printing, data]);

  return (
    <div className="card border-base-300 bg-base-100 border shadow-sm">
      <div className="card-body gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="card-title">Instrucción de transferencia SPEI</h2>
            {customerName && <p className="font-medium">{customerName}</p>}
            <p className="text-base-content/60 text-sm">Generada el {formatDateTime(data.created)}</p>
          </div>
          <span className="badge badge-warning">Pendiente de confirmar</span>
        </div>

        <div>
          <p className="text-base-content/60 text-sm">Monto a transferir</p>
          <p className="text-3xl font-bold">{money(data.amount)}</p>
        </div>

        <p className="text-base-content/80 text-sm">{data.message}</p>

        {data.clabe && (
          <div className="flex flex-col gap-2">
            <CopyField label="CLABE interbancaria" value={data.clabe} />
            {data.bank && <CopyField label="Banco" value={data.bank} mono={false} />}
            {data.owner_name && <CopyField label="Beneficiario" value={data.owner_name} mono={false} />}
            {data.reference && <CopyField label="Concepto / referencia" value={data.reference} />}
          </div>
        )}

        <div className="alert alert-info text-sm">
          <span className="iconify lucide--info size-5"></span>
          <div>
            Transfiere exactamente {money(data.amount)}
            {data.reference ? (
              <>
                {" "}
                y escribe <b>{data.reference}</b> en el concepto
              </>
            ) : null}
            . El saldo se acreditará cuando la escuela confirme que recibió el depósito.
          </div>
        </div>

        <div className="card-actions mt-4 justify-end">
          <button type="button" onClick={() => setPrinting(true)} disabled={printing} className="btn btn-outline">
            <span className="iconify lucide--printer size-4"></span>
            Imprimir
          </button>
          <button type="button" onClick={onClose} className="btn btn-primary">
            Listo
          </button>
        </div>
      </div>
      {printing &&
        createPortal(
          <div className="print-receipt hidden print:block">
            <SpeiTicket data={data} customerName={customerName} />
          </div>,
          document.body,
        )}
    </div>
  );
}
