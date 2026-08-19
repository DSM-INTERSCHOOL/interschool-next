/**
 * Obtiene la configuración de la organización desde localStorage
 * Seguro para SSR - retorna valores por defecto si no está disponible
 */
export const getOrgConfig = () => {
  // Verificar si estamos en el cliente
  if (typeof window === 'undefined') {
    return {
      schoolId: null,
      portalName: null
    };
  }

  const schoolId = localStorage.getItem('schoolId');
  const portalName = localStorage.getItem('portalName');

  if (!schoolId || !portalName) {
    return {
      schoolId: null,
      portalName: null
    };
  }

  return {
    schoolId,
    portalName
  };
};
export type PortalCode = "MT" | "ST" | "TC";
export type PortalMap = Record<PortalCode, string>;
export type OrgsMap = Record<string, PortalMap>;

export interface SchoolInfo {
    school_name: string;
    school_image: string;
}

// ── Path-based tenant routing (see docs/interschool-path-migration-plan.md) ──
//
// Maps the friendly `tenant` URL segment (e.g. /admin/cfe/...) to the numeric
// schoolId used everywhere else in the app (orgsMap, schoolMap, API calls).
export const VALID_PORTAL_NAMES = ["admin", "alumno", "profesor"] as const;
export type PortalName = (typeof VALID_PORTAL_NAMES)[number];

// URL portal segment -> legacy portal code used by orgsMap/schoolMap.
export const PORTAL_NAME_TO_CODE: Record<PortalName, PortalCode> = {
    admin: "MT",
    alumno: "ST",
    profesor: "TC",
};

// tenant slug (e.g. "cfe") -> schoolId (e.g. "1004")
export const TENANT_TO_SCHOOL_ID: Record<string, string> = {
    stjames: "10",
    celta: "1000",
    spongies: "1001",
    "chk-mx": "1002",
    annafreud: "1003",
    cfe: "1004",
    wch: "1005",
    cf: "1006",
    grupocudec: "1007",
    ipia: "1008",
    dali: "1009",
    vizcaino: "1010",
    "chk-qro": "1011",
    "montessori-pachuca": "1013",
    dicormo: "1014",
    uc: "1015",
    iamb: "1016",
    ccolumbia: "1017",
    plata: "1018",
    nitamani: "1019",
};

export const isValidPortalName = (value: string): value is PortalName =>
    (VALID_PORTAL_NAMES as readonly string[]).includes(value);

/**
 * Resolves a `/[portalName]/[tenant]` path pair to the same
 * { schoolId, portalName } shape the legacy `?org=` flow persists to
 * localStorage (see app/page.tsx and getOrgConfig() above). Returns null if
 * the portal segment or tenant slug isn't recognized.
 */
export const resolveTenantRoute = (
    portalSegment: string,
    tenantSlug: string
): { schoolId: string; portalName: string } | null => {
    if (!isValidPortalName(portalSegment)) return null;

    const schoolId = TENANT_TO_SCHOOL_ID[tenantSlug];
    if (!schoolId) return null;

    const portalCode = PORTAL_NAME_TO_CODE[portalSegment];
    const portalName = orgsMap[schoolId]?.[portalCode];
    if (!portalName) return null;

    return { schoolId, portalName };
};

export const schoolMap: Record<string, SchoolInfo> = {
    "10": {
        school_name: "ST JAMES COLLEGE",
        school_image: "https://s3.us-east-2.amazonaws.com/app.content.interschool.mx/app_content/app_static_files/LOGO+INTERSCHOOL+color1+c%3Af.png"
    },
    "1000": {
        school_name: "COLEGIO CELTA",
        school_image: "https://s3.us-east-2.amazonaws.com/app.content.interschool.mx/app_content/CNH/1659028648192_logocelta.png"
    },
    "1001": {
        school_name: "Spongies + SouthPeak",
        school_image: "https://s3.us-east-2.amazonaws.com/app.content.interschool.mx/app_content/app_static_files/spongies_southpeak.jpeg"
    },
    "1002": {
        school_name: "COLEGIO HELEN KELLER",
        school_image: "https://s3.us-east-2.amazonaws.com/app.content.interschool.mx/app_content/app_static_files/chk_logo.png"
    },
    "1003": {
        school_name: "INICIAL Y PREESCOLAR ANNA FREUD",
        school_image: "https://s3.us-east-2.amazonaws.com/app.content.interschool.mx/app_content/app_static_files/WhatsApp+Image+2025-10-23+at+3.06.27+PM.jpeg"
    },
    "1004": {
        school_name: "COLEGIO FRANCO ESPAÑOL",
        school_image: "https://s3.us-east-2.amazonaws.com/app.content.interschool.mx/app_content/app_static_files/cfe-logo.png"
    },
    "1005": {
        school_name: "COLEGIO WINSTON CHURCHILL",
        school_image: "https://s3.us-east-2.amazonaws.com/app.content.interschool.mx/app_content/app_static_files/escudo_winston.png"
    },
    "1006": {
        school_name: "COLEGIO FLORENCIA",
        school_image: "https://s3.us-east-2.amazonaws.com/app.content.interschool.mx/app_content/app_static_files/logo_florencia.jpeg"
    },
    "1007": {
        school_name: "GRUPO CUDEC",
        school_image: "https://s3.us-east-2.amazonaws.com/app.content.interschool.mx/app_content/app_static_files/CUDEC.jpeg"
    },
    "1008": {
        school_name: "INSTITUTO PEDAGOGICO IBEROAMERICANO",
        school_image: "https://s3.us-east-2.amazonaws.com/app.content.interschool.mx/app_content/app_static_files/logo_ipia.jpeg"
    },
    "1009": {
        school_name: "SALVADOR DALI",
        school_image: "https://s3.us-east-2.amazonaws.com/app.content.interschool.mx/app_content/app_static_files/dali_logo.png"
    },
    "1010": {
        school_name: "INSTITUTO REAL VIZCAINO",
        school_image: "https://s3.us-east-2.amazonaws.com/app.content.interschool.mx/app_content/app_static_files/logo_vizcaino.jpeg"
    },
    "1011": {
        school_name: "COLEGIO HELEN KELLER QUERETARO",
        school_image: "https://s3.us-east-2.amazonaws.com/app.content.interschool.mx/app_content/app_static_files/Logo-CHKQRO.png"
    },
    "1013": {
        school_name: "MONTESSORI PACHUCA",
        school_image: "https://s3.us-east-2.amazonaws.com/app.content.interschool.mx/app_content/app_static_files/montessori_pachuca_logo.jpeg"
    },
    "1014": {
        school_name: "DICORMO",
        school_image: "https://s3.us-east-2.amazonaws.com/app.content.interschool.mx/app_content/app_static_files/dicormo_logo.jpeg"
    },
    "1015": {
        school_name: "Universidad de la Comunicación",
        school_image: ""
    },
    "1016": {
        school_name: "MONTESSORI PIEDRAS NEGRAS",
        school_image: ""
    },
    "1017": {
        school_name: "COLEGIO COLUMBIA PACHUCA",
        school_image: "https://s3.us-east-2.amazonaws.com/app.content.interschool.mx/app_content/app_static_files/logo_columbia.jpeg"
    },
    "1018": {
        school_name: "COLEGIO PLATA",
        school_image: ""
    },
    "1019": {
        school_name: "NITAMANI",
        school_image: ""
    }
};

 export const orgsMap: OrgsMap = {
       "10": {
            "MT": "https://mt.dmo.interschool.mx",
            "ST": "https://al.dmo.interschool.mx",
            "TC": "https://pr.dmo.interschool.mx"
        },
        "1000": {
            "MT": "https://mt.celta.interschool.mx",
            "ST": "https://al.celta.interschool.mx",
            "TC": "https://pr.celta.interschool.mx"
        },
        "1001": {
            "MT": "https://mt.spongies.interschool.mx",
            "ST": "https://al.spongies.interschool.mx",
            "TC": "https://pr.spongies.interschool.mx"
        },
        "1002": {
            "MT": "https://mt.helenkeller.interschool.mx",
            "ST": "https://al.helenkeller.interschool.mx",
            "TC": "https://pr.helenkeller.interschool.mx"
        },
        "1003": {
            "MT": "https://mt.liceoannafreud.interschool.mx",
            "ST": "https://al.liceoannafreud.interschool.mx",
            "TC": "https://pr.liceoannafreud.interschool.mx"
        },
        "1004": {
            "MT": "https://mt.cfe.interschool.mx",
            "ST": "https://al.cfe.interschool.mx",
            "TC": "https://pr.cfe.interschool.mx"
        },
        "1005": {
            "MT": "https://mt.wch.interschool.mx",
            "ST": "https://al.wch.interschool.mx",
            "TC": "https://pr.wch.interschool.mx"
        },
        "1006": {
            "MT": "https://mt.cf.interschool.mx",
            "ST": "https://al.cf.interschool.mx",
            "TC": "https://pr.cf.interschool.mx"
        },
        "1007": {
            "MT": "https://mt.grupocudec.interschool.mx",
            "ST": "https://al.grupocudec.interschool.mx",
            "TC": "https://pr.grupocudec.interschool.mx"
        },
        "1008": {
            "MT": "https://mt.ipia.interschool.mx",
            "ST": "https://al.ipia.interschool.mx",
            "TC": "https://pr.ipia.interschool.mx"
        },
        "1009": {
            "MT": "https://mt.dali.interschool.mx",
            "ST": "https://al.dali.interschool.mx",
            "TC": "https://pr.dali.interschool.mx"
        },
        "1010": {
            "MT": "https://mt.vizcaino.interschool.mx",
            "ST": "https://al.vizcaino.interschool.mx",
            "TC": "https://pr.vizcaino.interschool.mx"
        },
        "1011": {
            "MT": "https://mt.chk-qro.interschool.mx",
            "ST": "https://al.chk-qro.interschool.mx",
            "TC": "https://pr.chk-qro.interschool.mx"
        },
        "1013": {
            "MT": "https://mt.montessori-pachuca.interschool.mx",
            "ST": "https://al.montessori-pachuca.interschool.mx",
            "TC": "https://pr.montessori-pachuca.interschool.mx"
        },
        "1014": {
            "MT": "https://mt.dicormo.interschool.mx",
            "ST": "https://al.dicormo.interschool.mx",
            "TC": "https://pr.dicormo.interschool.mx"
        },
        "1015": {
            "MT": "https://mt.uc.interschool.mx",
            "ST": "https://al.uc.interschool.mx",
            "TC": "https://pr.uc.interschool.mx"
        },
        "1016": {
            "MT": "https://mt.iamb.interschool.mx",
            "ST": "https://al.iamb.interschool.mx",
            "TC": "https://pr.iamb.interschool.mx"
        },
        "1017": {
            "MT": "https://mt.ccolumbia.interschool.mx",
            "ST": "https://al.ccolumbia.interschool.mx",
            "TC": "https://pr.ccolumbia.interschool.mx"
        },
        "1018": {
            "MT": "https://mt.plata.interschool.mx",
            "ST": "https://al.plata.interschool.mx",
            "TC": "https://pr.plata.interschool.mx"
        },
        "1019": {
            "MT": "https://mt.nitamani.interschool.mx",
            "ST": "https://al.nitamani.interschool.mx",
            "TC": "https://pr.nitamani.interschool.mx"
        }
    }

// schoolId -> tenant slug (reverse of TENANT_TO_SCHOOL_ID)
const SCHOOL_ID_TO_TENANT: Record<string, string> = Object.fromEntries(
    Object.entries(TENANT_TO_SCHOOL_ID).map(([tenant, schoolId]) => [schoolId, tenant])
);



// portal code -> URL segment (reverse of PORTAL_NAME_TO_CODE)
const PORTAL_CODE_TO_NAME: Record<PortalCode, PortalName> = {
    MT: "admin",
    ST: "alumno",
    TC: "profesor",
};

/**
 * Builds the `/[portalName]/[tenant]` prefix for the currently resolved
 * org (whichever flow set it — legacy `?org=` or a path-based tenant route),
 * by reversing schoolId/portalName back through the same maps used to
 * resolve them. Returns null when there's no resolved org yet, or the
 * school/portal isn't (yet) in the tenant slug map — callers should fall
 * back to an unprefixed path in that case, never throw.
 */
export const getCurrentTenantPrefix = (): string | null => {
    const { schoolId, portalName } = getOrgConfig();
    if (!schoolId || !portalName) return null;

    const tenantSlug = SCHOOL_ID_TO_TENANT[schoolId];
    if (!tenantSlug) return null;

    const portalCode = (Object.keys(orgsMap[schoolId] ?? {}) as PortalCode[])
        .find((code) => orgsMap[schoolId][code] === portalName);
    if (!portalCode) return null;

    return `/${PORTAL_CODE_TO_NAME[portalCode]}/${tenantSlug}`;
};

/**
 * Decodes the legacy `?org=` query param (base64 of `${schoolId}_${portalCode}`)
 * into its parts, validating both against orgsMap. Shared by app/page.tsx
 * (client-side resolution + error UI) and middleware.ts (server-side
 * redirect) so the two never drift. Returns null on any malformed input or
 * unknown schoolId/portalCode — callers should treat that as "show the
 * existing invalid-access error", not throw.
 */
export const decodeOrgParam = (
    orgParam: string
): { schoolId: string; portalCode: PortalCode; portalName: string } | null => {
    try {
        const decoded = atob(decodeURIComponent(orgParam));
        const [schoolId, portalCode] = decoded.split("_");
        if (schoolId in orgsMap && portalCode in orgsMap[schoolId]) {
            return {
                schoolId,
                portalCode: portalCode as PortalCode,
                portalName: orgsMap[schoolId][portalCode as PortalCode],
            };
        }
    } catch {
        // fall through
    }
    return null;
};

/**
 * schoolId + portalCode -> `/[portalName]/[tenant]` prefix, without touching
 * localStorage (unlike getCurrentTenantPrefix) — usable from middleware,
 * which has no access to the browser's storage.
 */
export const tenantPrefixFor = (schoolId: string, portalCode: PortalCode): string | null => {
    const tenantSlug = SCHOOL_ID_TO_TENANT[schoolId];
    if (!tenantSlug) return null;
    return `/${PORTAL_CODE_TO_NAME[portalCode]}/${tenantSlug}`;
};

