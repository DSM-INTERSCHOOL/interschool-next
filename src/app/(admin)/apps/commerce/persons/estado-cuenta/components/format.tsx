import { CONFIGURABLE_PAYMENT_METHOD_LABELS } from "@/interfaces/IPaymentMethodConfig";

export const money = (value: string | number) =>
  Number(value).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

// dd/MM/yyyy HH:mm, in the viewer's own local time -- matches the rest of
// the commerce module's date formatting.
export const formatDateTime = (value: string) => {
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const methodLabel = (method: string, channel?: string | null) => {
  const label =
    method === "SALDO"
      ? "Saldo"
      : CONFIGURABLE_PAYMENT_METHOD_LABELS[method as keyof typeof CONFIGURABLE_PAYMENT_METHOD_LABELS] ?? method;
  return channel === "SPEI" && method !== "SPEI" ? `${label} (SPEI)` : label;
};

export const movementDetail = (m: { order_id: number | null; reference: string | null; notes: string | null }) => {
  const parts = [m.order_id ? `Orden #${m.order_id}` : null, m.reference, m.notes].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
};

export const operator = (m: { created_by_person_internal_id: string | null; created_by_name: string | null }) =>
  m.created_by_name ?? m.created_by_person_internal_id ?? "—";

export interface SummaryCard {
  label: string;
  value: string;
  className?: string;
}

export function SummaryCards({ cards }: { cards: SummaryCard[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-4 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-lg bg-base-200 px-4 py-3">
          <p className="text-sm text-base-content/60">{c.label}</p>
          <p className={`text-2xl font-bold tabular-nums ${c.className ?? ""}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}
