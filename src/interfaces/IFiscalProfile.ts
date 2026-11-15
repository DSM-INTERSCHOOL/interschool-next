// The school's own CFDI emisor data -- distinct from ICommercePerson's
// fiscal fields, which are the receptor (client) side. One row per school;
// creating it also registers a `cliente` in the factura-electronica
// service (fel_cliente_id), so POST only succeeds while that service is
// reachable.
export interface FiscalProfileRead {
  id: number;
  school_id: number;
  fel_cliente_id: string | null;
  razon_social: string;
  rfc: string;
  calle_numero_fiscal: string;
  colonia_fiscal: string;
  municipio_fiscal: string;
  estado_fiscal: string;
  codigo_postal_fiscal: string;
  estatus: string;
  regimen_fiscal: string | null;
  clave_regimen_fiscal: string | null;
  serie: string;
  // Not stored on our side -- fetched live from factura-electronica on
  // every read of this profile (see FiscalProfileService on the backend).
  has_certificates: boolean;
  has_fel_credentials: boolean;
}

export interface FiscalProfileCreate {
  razon_social: string;
  rfc: string;
  calle_numero_fiscal: string;
  colonia_fiscal: string;
  municipio_fiscal: string;
  estado_fiscal: string;
  codigo_postal_fiscal: string;
  estatus: string;
  regimen_fiscal?: string | null;
  clave_regimen_fiscal?: string | null;
  serie: string;
}

export interface FiscalProfileUpdate {
  razon_social?: string;
  calle_numero_fiscal?: string;
  colonia_fiscal?: string;
  municipio_fiscal?: string;
  estado_fiscal?: string;
  codigo_postal_fiscal?: string;
  estatus?: string;
  regimen_fiscal?: string | null;
  clave_regimen_fiscal?: string | null;
  serie?: string;
}

// CSD cert/key, sent as base64 -- never persisted locally, proxied
// straight through to factura-electronica.
export interface FiscalProfileCertificatesUpload {
  cer_file_base64: string;
  key_file_base64: string;
  key_password: string;
  pem_file_base64?: string;
}

export interface FiscalProfileFelCredentialsUpdate {
  fel_usuario: string;
  fel_password: string;
}

// serie omitted (or blank) sets the default series' starting folio.
export interface FiscalProfileFolioSet {
  folio_inicial: number;
  serie?: string | null;
}

export interface FiscalProfileFolioRead {
  serie: string;
  folio_actual: number;
  tipo: string;
}
