// The Commerce API's own `person` table (role + denormalized identity
// details within a school) -- unrelated to IPerson.ts, which is
// interschool-core's course-api person concept used by daypasses/
// appointments/etc.
export type CommercePersonOrigin = "MANUAL" | "INTERSCHOOL";

export interface CommercePersonRead {
  school_id: number;
  person_internal_id: string;
  role: "ADMIN" | "CASHIER" | "BUYER";
  // Who last wrote this row: MANUAL (apps/commerce/persons CRUD screen) or
  // INTERSCHOOL (an external caller syncing identity data through the same
  // POST /persons upsert). Caller-stated on write, not inferred -- see
  // PersonCreate.origin on the backend.
  origin: CommercePersonOrigin;
  given_name: string | null;
  paternal_name: string | null;
  maternal_name: string | null;
  type: string | null;
  email: string | null;
  mobile_phone: string | null;
  mobile_phone_country_code: string | null;
  spei_account: string | null;
  // Prepaid wallet balance, Decimal -> FastAPI serializes as a string.
  // Read-only here -- only ever changed via a tracked OrderPayment
  // (top-up/spend), never a direct field edit, same reasoning as the
  // inventory-quantity fix (see src/utils/base_repository.py on the
  // backend): a raw overwrite would silently diverge from the payment
  // ledger it's supposed to mirror.
  balance: string;
  // CFDI billing data (receptor) -- regimen_fiscal/uso_cfdi are SAT
  // catalog codes (c_RegimenFiscal/c_UsoCFDI).
  razon_social: string | null;
  rfc: string | null;
  regimen_fiscal: string | null;
  uso_cfdi: string | null;
  codigo_postal: string | null;
  direccion: string | null;
  created: string | null;
}

// Mirrors the backend's PersonCreate -- the same POST endpoint upserts on
// (school_id, person_internal_id), so this DTO is used for both create and
// edit. balance is deliberately not here (see CommercePersonRead.balance).
export interface CommercePersonUpsert {
  person_internal_id: string;
  role: "ADMIN" | "CASHIER" | "BUYER";
  // Defaults to MANUAL on the backend if omitted. The persons CRUD screen
  // always sends it explicitly: "MANUAL" on create, and the record's own
  // current value round-tripped on edit (so correcting a field on an
  // INTERSCHOOL-sourced person doesn't silently re-tag it as MANUAL).
  origin?: CommercePersonOrigin;
  given_name?: string | null;
  paternal_name?: string | null;
  maternal_name?: string | null;
  type?: string | null;
  email?: string | null;
  mobile_phone?: string | null;
  mobile_phone_country_code?: string | null;
  spei_account?: string | null;
  razon_social?: string | null;
  rfc?: string | null;
  regimen_fiscal?: string | null;
  uso_cfdi?: string | null;
  codigo_postal?: string | null;
  direccion?: string | null;
}
