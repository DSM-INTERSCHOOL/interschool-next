// Official SAT catalogs -- shared between apps/commerce/persons (receptor
// fiscal data) and apps/commerce/configuracion (the school's own emisor
// fiscal profile), not school-specific data.

export const REGIMEN_FISCAL_OPTIONS: { value: string; label: string }[] = [
  { value: "601", label: "601 - General de Ley Personas Morales" },
  { value: "603", label: "603 - Personas Morales con Fines no Lucrativos" },
  { value: "605", label: "605 - Sueldos y Salarios e Ingresos Asimilados a Salarios" },
  { value: "606", label: "606 - Arrendamiento" },
  { value: "607", label: "607 - Régimen de Enajenación o Adquisición de Bienes" },
  { value: "608", label: "608 - Demás ingresos" },
  { value: "610", label: "610 - Residentes en el Extranjero sin Establecimiento Permanente en México" },
  { value: "611", label: "611 - Ingresos por Dividendos (socios y accionistas)" },
  { value: "612", label: "612 - Personas Físicas con Actividades Empresariales y Profesionales" },
  { value: "614", label: "614 - Ingresos por intereses" },
  { value: "615", label: "615 - Régimen de los ingresos por obtención de premios" },
  { value: "616", label: "616 - Sin obligaciones fiscales" },
  { value: "620", label: "620 - Sociedades Cooperativas de Producción que optan por diferir sus ingresos" },
  { value: "621", label: "621 - Incorporación Fiscal" },
  { value: "622", label: "622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras" },
  { value: "623", label: "623 - Opcional para Grupos de Sociedades" },
  { value: "624", label: "624 - Coordinados" },
  { value: "625", label: "625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas" },
  { value: "626", label: "626 - Régimen Simplificado de Confianza (RESICO)" },
];

// c_ClaveUnidad (catálogo oficial SAT) -- no todo el catálogo (~900 claves),
// solo las más relevantes para una tienda escolar: prendas de vestir por
// pieza, alimentos/bebidas vendidos a granel o por servicio.
export const UNIDAD_MEDIDA_SAT_OPTIONS: { value: string; label: string }[] = [
  { value: "H87", label: "H87 - Pieza" },
  { value: "E48", label: "E48 - Unidad de servicio" },
  { value: "ACT", label: "ACT - Actividad" },
  { value: "XUN", label: "XUN - Unidad" },
  { value: "KGM", label: "KGM - Kilogramo" },
  { value: "LTR", label: "LTR - Litro" },
];

export const USO_CFDI_OPTIONS: { value: string; label: string }[] = [
  { value: "G03", label: "G03 - Gastos en general" },
  { value: "P01", label: "P01 - Por definir" },
  { value: "D10", label: "D10 - Pagos por servicios educativos (colegiaturas)" },
  { value: "G01", label: "G01 - Adquisición de mercancías" },
  { value: "G02", label: "G02 - Devoluciones, descuentos o bonificaciones" },
  { value: "I01", label: "I01 - Construcciones" },
  { value: "I02", label: "I02 - Mobiliario y equipo de oficina por inversiones" },
  { value: "I03", label: "I03 - Equipo de transporte" },
  { value: "I04", label: "I04 - Equipo de computo y accesorios" },
  { value: "I05", label: "I05 - Dados, troqueles, moldes, matrices y otros activos" },
  { value: "I06", label: "I06 - Comunicaciones telefónicas" },
  { value: "I07", label: "I07 - Comunicaciones satelitales" },
  { value: "I08", label: "I08 - Otra maquinaria y equipo" },
  { value: "D01", label: "D01 - Honorarios médicos, dentales y gastos hospitalarios" },
  { value: "D02", label: "D02 - Gastos médicos por incapacidad o discapacidad" },
  { value: "D03", label: "D03 - Gastos funerales" },
  { value: "D04", label: "D04 - Donativos" },
  { value: "D05", label: "D05 - Intereses reales pagados por créditos hipotecarios (casa habitación)" },
  { value: "D06", label: "D06 - Aportaciones voluntarias al SAR" },
  { value: "D07", label: "D07 - Primas por seguros de gastos médicos" },
  { value: "D08", label: "D08 - Gastos de transportación escolar obligatoria" },
  { value: "D09", label: "D09 - Depósitos en cuentas para el ahorro, pensiones" },
  { value: "CP01", label: "CP01 - Pagos" },
  { value: "CN01", label: "CN01 - Nómina" },
];
