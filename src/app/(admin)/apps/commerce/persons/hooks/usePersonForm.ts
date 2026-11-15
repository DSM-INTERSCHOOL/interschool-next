import { useEffect, useState } from "react";
import { useAppRouter as useRouter } from "@/hooks/useAppRouter";
import { getOrgConfig } from "@/lib/orgConfig";
import { CommercePersonOrigin } from "@/interfaces/ICommercePerson";
import { getCommercePerson, upsertCommercePerson } from "@/services/commercePerson.service";

export interface PersonFormData {
  person_internal_id: string;
  role: "ADMIN" | "CASHIER" | "BUYER";
  // Not user-editable (see PersonFormPage's read-only "Origen" badge) --
  // carried through the form purely so an edit round-trips the person's
  // existing origin instead of accidentally overwriting it.
  origin: CommercePersonOrigin;
  given_name: string;
  paternal_name: string;
  maternal_name: string;
  type: string;
  email: string;
  mobile_phone: string;
  mobile_phone_country_code: string;
  spei_account: string;
  razon_social: string;
  rfc: string;
  regimen_fiscal: string;
  uso_cfdi: string;
  codigo_postal: string;
  direccion: string;
}

const emptyFormData: PersonFormData = {
  person_internal_id: "",
  role: "BUYER",
  origin: "MANUAL",
  given_name: "",
  paternal_name: "",
  maternal_name: "",
  type: "",
  email: "",
  mobile_phone: "",
  mobile_phone_country_code: "",
  spei_account: "",
  razon_social: "",
  rfc: "",
  regimen_fiscal: "",
  uso_cfdi: "",
  codigo_postal: "",
  direccion: "",
};

export const usePersonForm = (personInternalId?: string) => {
  const router = useRouter();
  const isEdit = Boolean(personInternalId);

  const [formData, setFormData] = useState<PersonFormData>(emptyFormData);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!personInternalId) return;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const { schoolId } = getOrgConfig();
        const person = await getCommercePerson({ schoolId, personInternalId });
        setFormData({
          person_internal_id: person.person_internal_id,
          role: person.role,
          origin: person.origin,
          given_name: person.given_name ?? "",
          paternal_name: person.paternal_name ?? "",
          maternal_name: person.maternal_name ?? "",
          type: person.type ?? "",
          email: person.email ?? "",
          mobile_phone: person.mobile_phone ?? "",
          mobile_phone_country_code: person.mobile_phone_country_code ?? "",
          spei_account: person.spei_account ?? "",
          razon_social: person.razon_social ?? "",
          rfc: person.rfc ?? "",
          regimen_fiscal: person.regimen_fiscal ?? "",
          uso_cfdi: person.uso_cfdi ?? "",
          codigo_postal: person.codigo_postal ?? "",
          direccion: person.direccion ?? "",
        });
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message || "Error al cargar el cliente");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [personInternalId]);

  const updateFormField = <K extends keyof PersonFormData>(field: K, value: PersonFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.person_internal_id.trim()) {
      setSaveError("El ID del cliente es obligatorio");
      return;
    }
    try {
      setSaveLoading(true);
      setSaveError(null);
      const { schoolId } = getOrgConfig();
      await upsertCommercePerson({
        schoolId,
        dto: {
          person_internal_id: formData.person_internal_id.trim(),
          role: formData.role,
          origin: formData.origin,
          given_name: formData.given_name.trim() || undefined,
          paternal_name: formData.paternal_name.trim() || undefined,
          maternal_name: formData.maternal_name.trim() || undefined,
          type: formData.type.trim() || undefined,
          email: formData.email.trim() || undefined,
          mobile_phone: formData.mobile_phone.trim() || undefined,
          mobile_phone_country_code: formData.mobile_phone_country_code.trim() || undefined,
          spei_account: formData.spei_account.trim() || undefined,
          razon_social: formData.razon_social.trim() || undefined,
          rfc: formData.rfc.trim() || undefined,
          regimen_fiscal: formData.regimen_fiscal || undefined,
          uso_cfdi: formData.uso_cfdi || undefined,
          codigo_postal: formData.codigo_postal.trim() || undefined,
          direccion: formData.direccion.trim() || undefined,
        },
      });
      router.push("/apps/commerce/persons");
    } catch (err: any) {
      setSaveError(err.response?.data?.detail || err.message || "No se pudo guardar el cliente");
    } finally {
      setSaveLoading(false);
    }
  };

  return { formData, updateFormField, isEdit, loading, error, saveLoading, saveError, handleSave };
};
