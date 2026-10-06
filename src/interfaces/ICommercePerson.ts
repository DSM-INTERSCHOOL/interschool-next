// The Commerce API's own `person` table (role + denormalized identity
// details within a school) -- unrelated to IPerson.ts, which is
// interschool-core's course-api person concept used by daypasses/
// appointments/etc.
export interface CommercePersonRead {
  school_id: number;
  person_internal_id: string;
  role: "ADMIN" | "CASHIER" | "BUYER";
  given_name: string | null;
  paternal_name: string | null;
  maternal_name: string | null;
  type: string | null;
  email: string | null;
  mobile_phone: string | null;
  mobile_phone_country_code: string | null;
  spei_account: string | null;
  created: string | null;
}
