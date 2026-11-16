// Mirrors the backend's CfdiRead (src/fiscal/models/pydantic.py) -- one
// row per stamped (or cancelled) comprobante. An order can have more than
// one over its lifetime (e.g. a factura, later cancelled, then re-issued).
export interface CfdiRead {
  id: number;
  school_id: number;
  order_id: number;
  comprobante_id: string | null;
  uuid_fiscal: string | null;
  serie: string | null;
  folio: number | null;
  fecha_hora: string | null;
  rfc: string;
  razon_social: string;
  uso_cfdi: string;
  xml_path: string | null;
  pdf_path: string | null;
  total: string; // Decimal -> string
  estatus: string; // ACTIVO | CANCELADO
  tipo_documento: string; // FACTURA | NOTA DE CREDITO
  cfdi_relacionados: string[] | null;
  folio_sustitucion: string | null;
  created: string | null;
}
