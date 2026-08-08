import { DirectMessageRead, DirectMessageRecipient } from "@/interfaces/IDirectMessage";

export const PERSON_TYPE_LABEL: Record<string, string> = {
  STUDENT:  "Alumno",
  TEACHER:  "Profesor",
  USER:     "Usuario",
  RELATIVE: "Familiar",
  ACADEMIC: "Académico",
};

export const TYPE_COLOR: Record<string, string> = {
  USER:     "#1565C0",
  STUDENT:  "#2E7D32",
  TEACHER:  "#6A1B9A",
  RELATIVE: "#E65100",
  ACADEMIC: "#37474F",
};

export const getSenderName = (msg: DirectMessageRead): string =>
  [msg.given_name, msg.paternal_surname, msg.maternal_surname].filter(Boolean).join(" ");

export const getRecipientName = (msg: DirectMessageRead): string => {
  const r = msg.recipients?.[0];
  if (!r) return "";
  return [r.given_name, r.paternal_surname, r.maternal_surname].filter(Boolean).join(" ");
};

export const getFirstRecipient = (msg: DirectMessageRead): DirectMessageRecipient | null =>
  msg.recipients?.[0] ?? null;

export const isSentByMe = (msg: DirectMessageRead, personId: number | null): boolean =>
  msg.sender_id === String(personId);

export const isUnread = (msg: DirectMessageRead): boolean => {
  const r = getFirstRecipient(msg);
  return r ? r.is_read === false : msg.is_read === false;
};

/** Formats a date for the message list: today → HH:mm, yesterday → "Ayer", older → DD/MM/YY */
export const formatMsgDate = (iso: string): string => {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86_400_000);
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (msgDay.getTime() === today.getTime()) {
    return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false });
  }
  if (msgDay.getTime() === yesterday.getTime()) return "Ayer";
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "2-digit" });
};

/** Full date format for detail view */
export const formatMsgDateFull = (iso: string): string =>
  new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

export const initials = (name: string): string =>
  name.split(" ").slice(0, 2).map((w) => w[0] ?? "").join("").toUpperCase() || "?";
