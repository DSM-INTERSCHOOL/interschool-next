export const ROLE_OPTIONS: { value: "ADMIN" | "CASHIER" | "BUYER"; label: string }[] = [
  { value: "ADMIN", label: "Administrador" },
  { value: "CASHIER", label: "Cajero" },
  { value: "BUYER", label: "Comprador" },
];

// interschool-core's own identity-type values -- person.type is never
// editable here (see PersonFormPage), this is purely a display map.
export const PERSON_TYPE_LABELS: Record<string, string> = {
  USER: "Usuario",
  STUDENT: "Estudiante",
  RELATIVE: "Familiar",
  TEACHER: "Profesor",
};

export const personTypeLabel = (type: string | null | undefined) =>
  type ? (PERSON_TYPE_LABELS[type] ?? type) : "—";

// Shared with apps/commerce/configuracion's school fiscal profile card --
// same official SAT catalogs, re-exported here so existing imports of
// REGIMEN_FISCAL_OPTIONS/USO_CFDI_OPTIONS from "./constants" keep working.
export { REGIMEN_FISCAL_OPTIONS, USO_CFDI_OPTIONS } from "@/lib/satCatalogs";
