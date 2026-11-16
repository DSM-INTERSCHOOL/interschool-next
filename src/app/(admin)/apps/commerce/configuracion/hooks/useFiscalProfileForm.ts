import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { REGIMEN_FISCAL_OPTIONS } from "@/lib/satCatalogs";
import { FiscalProfileFolioRead } from "@/interfaces/IFiscalProfile";
import {
  createFiscalProfile,
  deleteFiscalProfile,
  getFiscalProfile,
  getFiscalProfileFolios,
  setFiscalProfileFolio,
  updateFiscalProfile,
  updateFiscalProfileFelCredentials,
  uploadFiscalProfileCertificates,
} from "@/services/fiscalProfile.service";

export interface FiscalProfileFormData {
  razon_social: string;
  rfc: string;
  calle_numero_fiscal: string;
  colonia_fiscal: string;
  municipio_fiscal: string;
  estado_fiscal: string;
  codigo_postal_fiscal: string;
  estatus: "ACTIVO" | "INACTIVO";
  clave_regimen_fiscal: string;
  serie: string;
}

const emptyFormData: FiscalProfileFormData = {
  razon_social: "",
  rfc: "",
  calle_numero_fiscal: "",
  colonia_fiscal: "",
  municipio_fiscal: "",
  estado_fiscal: "",
  codigo_postal_fiscal: "",
  estatus: "ACTIVO",
  clave_regimen_fiscal: "",
  serie: "A",
};

// Matches orders/frontend's own fileToBase64 -- strips the data: URL
// prefix, factura-electronica wants the raw base64 payload only.
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
  });

export const useFiscalProfileForm = () => {
  const [formData, setFormData] = useState<FiscalProfileFormData>(emptyFormData);
  // Whether a profile row already exists -- drives create (POST) vs.
  // update (PUT) on save, and whether `rfc` is editable (immutable once
  // created, same as PersonForm's person_internal_id).
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Fetched live from factura-electronica on every load/save (see
  // FiscalProfileRead on the backend) -- never stored locally.
  const [hasCertificates, setHasCertificates] = useState(false);
  const [hasFelCredentials, setHasFelCredentials] = useState(false);

  const [certSaveLoading, setCertSaveLoading] = useState(false);
  const [certSaveError, setCertSaveError] = useState<string | null>(null);
  const [certSaved, setCertSaved] = useState(false);

  const [felUsuario, setFelUsuario] = useState("");
  const [felPassword, setFelPassword] = useState("");
  const [felSaveLoading, setFelSaveLoading] = useState(false);
  const [felSaveError, setFelSaveError] = useState<string | null>(null);
  const [felSaved, setFelSaved] = useState(false);

  const [folios, setFolios] = useState<FiscalProfileFolioRead[]>([]);
  const [foliosLoading, setFoliosLoading] = useState(false);
  const [folioSerie, setFolioSerie] = useState("");
  const [folioInicial, setFolioInicial] = useState("1");
  const [folioSaveLoading, setFolioSaveLoading] = useState(false);
  const [folioSaveError, setFolioSaveError] = useState<string | null>(null);
  const [folioSaved, setFolioSaved] = useState(false);

  // Fixing a typo'd RFC: rfc is immutable once set, so this is the only
  // path -- scrap the whole profile and let the admin recreate it from
  // scratch with the correct one. The backend blocks it once any CFDI has
  // been stamped for the school.
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadFolios = async () => {
    try {
      setFoliosLoading(true);
      const { schoolId } = getOrgConfig();
      setFolios(await getFiscalProfileFolios({ schoolId }));
    } catch {
      // Non-critical: the folio form still works without a prior list,
      // it just means there's nothing to display above it yet.
    } finally {
      setFoliosLoading(false);
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const profile = await getFiscalProfile({ schoolId });
      setExists(true);
      setHasCertificates(profile.has_certificates);
      setHasFelCredentials(profile.has_fel_credentials);
      setFormData({
        razon_social: profile.razon_social,
        rfc: profile.rfc,
        calle_numero_fiscal: profile.calle_numero_fiscal,
        colonia_fiscal: profile.colonia_fiscal,
        municipio_fiscal: profile.municipio_fiscal,
        estado_fiscal: profile.estado_fiscal,
        codigo_postal_fiscal: profile.codigo_postal_fiscal,
        estatus: profile.estatus === "INACTIVO" ? "INACTIVO" : "ACTIVO",
        clave_regimen_fiscal: profile.clave_regimen_fiscal ?? "",
        serie: profile.serie,
      });
      if (profile.fel_cliente_id) await loadFolios();
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Not configured yet -- not an error, just the starting state.
        setExists(false);
        setFormData(emptyFormData);
      } else {
        setError(err.response?.data?.detail || err.message || "Error al cargar los datos fiscales");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFormField = <K extends keyof FiscalProfileFormData>(field: K, value: FiscalProfileFormData[K]) => {
    setSaved(false);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.razon_social.trim() || !formData.rfc.trim()) {
      setSaveError("Razón Social y RFC son obligatorios");
      return;
    }
    try {
      setSaveLoading(true);
      setSaveError(null);
      const { schoolId } = getOrgConfig();
      const regimenLabel = REGIMEN_FISCAL_OPTIONS.find((o) => o.value === formData.clave_regimen_fiscal)?.label;
      if (exists) {
        const updated = await updateFiscalProfile({
          schoolId,
          dto: {
            razon_social: formData.razon_social.trim(),
            calle_numero_fiscal: formData.calle_numero_fiscal.trim(),
            colonia_fiscal: formData.colonia_fiscal.trim(),
            municipio_fiscal: formData.municipio_fiscal.trim(),
            estado_fiscal: formData.estado_fiscal.trim(),
            codigo_postal_fiscal: formData.codigo_postal_fiscal.trim(),
            estatus: formData.estatus,
            regimen_fiscal: regimenLabel ?? null,
            clave_regimen_fiscal: formData.clave_regimen_fiscal || null,
            serie: formData.serie.trim() || "A",
          },
        });
        setHasCertificates(updated.has_certificates);
        setHasFelCredentials(updated.has_fel_credentials);
      } else {
        const created = await createFiscalProfile({
          schoolId,
          dto: {
            razon_social: formData.razon_social.trim(),
            rfc: formData.rfc.trim().toUpperCase(),
            calle_numero_fiscal: formData.calle_numero_fiscal.trim(),
            colonia_fiscal: formData.colonia_fiscal.trim(),
            municipio_fiscal: formData.municipio_fiscal.trim(),
            estado_fiscal: formData.estado_fiscal.trim(),
            codigo_postal_fiscal: formData.codigo_postal_fiscal.trim(),
            estatus: formData.estatus,
            regimen_fiscal: regimenLabel ?? null,
            clave_regimen_fiscal: formData.clave_regimen_fiscal || null,
            serie: formData.serie.trim() || "A",
          },
        });
        setExists(true);
        setHasCertificates(created.has_certificates);
        setHasFelCredentials(created.has_fel_credentials);
        await loadFolios();
      }
      setSaved(true);
    } catch (err: any) {
      setSaveError(err.response?.data?.detail || err.message || "No se pudieron guardar los datos fiscales");
    } finally {
      setSaveLoading(false);
    }
  };

  const uploadCertificates = async (cerFile: File, keyFile: File, keyPassword: string) => {
    try {
      setCertSaveLoading(true);
      setCertSaveError(null);
      setCertSaved(false);
      const { schoolId } = getOrgConfig();
      const [cerBase64, keyBase64] = await Promise.all([fileToBase64(cerFile), fileToBase64(keyFile)]);
      const updated = await uploadFiscalProfileCertificates({
        schoolId,
        dto: { cer_file_base64: cerBase64, key_file_base64: keyBase64, key_password: keyPassword },
      });
      setHasCertificates(updated.has_certificates);
      setCertSaved(true);
    } catch (err: any) {
      setCertSaveError(err.response?.data?.detail || err.message || "Error al subir certificados");
    } finally {
      setCertSaveLoading(false);
    }
  };

  const saveFelCredentials = async () => {
    if (!felUsuario.trim() || !felPassword.trim()) {
      setFelSaveError("Usuario y contraseña FEL son obligatorios");
      return;
    }
    try {
      setFelSaveLoading(true);
      setFelSaveError(null);
      setFelSaved(false);
      const { schoolId } = getOrgConfig();
      const updated = await updateFiscalProfileFelCredentials({
        schoolId,
        dto: { fel_usuario: felUsuario.trim(), fel_password: felPassword.trim() },
      });
      setHasFelCredentials(updated.has_fel_credentials);
      setFelUsuario("");
      setFelPassword("");
      setFelSaved(true);
    } catch (err: any) {
      setFelSaveError(err.response?.data?.detail || err.message || "Error al guardar credenciales FEL");
    } finally {
      setFelSaveLoading(false);
    }
  };

  const saveFolio = async () => {
    const parsed = Number(folioInicial);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setFolioSaveError("El folio inicial debe ser un número válido");
      return;
    }
    try {
      setFolioSaveLoading(true);
      setFolioSaveError(null);
      setFolioSaved(false);
      const { schoolId } = getOrgConfig();
      const updatedFolios = await setFiscalProfileFolio({
        schoolId,
        dto: { folio_inicial: parsed, serie: folioSerie.trim() || undefined },
      });
      setFolios(updatedFolios);
      setFolioSaved(true);
    } catch (err: any) {
      setFolioSaveError(err.response?.data?.detail || err.message || "Error al configurar el folio");
    } finally {
      setFolioSaveLoading(false);
    }
  };

  // Returns whether it actually succeeded -- the caller (the confirmation
  // modal) needs that synchronously to decide whether to close itself,
  // which reading the hook's own state right after the call can't give it
  // (that state update isn't visible until the next render).
  const handleDeleteProfile = async (): Promise<boolean> => {
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      const { schoolId } = getOrgConfig();
      await deleteFiscalProfile({ schoolId });
      setExists(false);
      setFormData(emptyFormData);
      setHasCertificates(false);
      setHasFelCredentials(false);
      setFolios([]);
      setSaved(false);
      return true;
    } catch (err: any) {
      setDeleteError(err.response?.data?.detail || err.message || "No se pudo eliminar el perfil fiscal");
      return false;
    } finally {
      setDeleteLoading(false);
    }
  };

  return {
    formData,
    updateFormField,
    exists,
    loading,
    error,
    saveLoading,
    saveError,
    saved,
    handleSave,
    deleteLoading,
    deleteError,
    handleDeleteProfile,
    hasCertificates,
    hasFelCredentials,
    certSaveLoading,
    certSaveError,
    certSaved,
    uploadCertificates,
    felUsuario,
    setFelUsuario,
    felPassword,
    setFelPassword,
    felSaveLoading,
    felSaveError,
    felSaved,
    saveFelCredentials,
    folios,
    foliosLoading,
    folioSerie,
    setFolioSerie,
    folioInicial,
    setFolioInicial,
    folioSaveLoading,
    folioSaveError,
    folioSaved,
    saveFolio,
  };
};
