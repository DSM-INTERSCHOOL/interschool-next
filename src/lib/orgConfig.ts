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

export const schoolMap: Record<string, SchoolInfo> = {
    "10": {
        school_name: "COLEGIO INTERNACIONAL",
        school_image: "https://s3.us-east-2.amazonaws.com/app.content.interschool.mx/app_content/CNH/1659028648192_logocelta.png"
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
            "MT": "https://mt.demo.idsm.xyz",
            "ST": "https://al.demo.idsm.xyz",
            "TC": "https://pr.demo.idsm.xyz"
        },
        "1000": {
            "MT": "https://meta.celta.idsm.xyz",
            "ST": "https://alumno.celta.idsm.xyz",
            "TC": "https://profesor.celta.idsm.xyz"
        },
        "1001": {
            "MT": "https://meta.spongies.idsm.xyz",
            "ST": "https://alumno.spongies.idsm.xyz",
            "TC": "https://profesor.spongies.idsm.xyz"
        },
        "1002": {
            "MT": "https://meta.helenkeller.idsm.xyz",
            "ST": "https://alumno.helenkeller.idsm.xyz",
            "TC": "https://profesor.helenkeller.idsm.xyz"
        },
        "1003": {
            "MT": "https://meta.liceoannafreud.idsm.xyz",
            "ST": "https://alumno.liceoannafreud.idsm.xyz",
            "TC": "https://profesor.liceoannafreud.idsm.xyz"
        },
        "1004": {
            "MT": "https://meta.cfe.idsm.xyz",
            "ST": "https://alumno.cfe.idsm.xyz",
            "TC": "https://profesor.cfe.idsm.xyz"
        },
        "1005": {
            "MT": "https://meta.wch.idsm.xyz",
            "ST": "https://alumno.wch.idsm.xyz",
            "TC": "https://profesor.wch.idsm.xyz"
        },
        "1006": {
            "MT": "https://meta.cf.idsm.xyz",
            "ST": "https://alumno.cf.idsm.xyz",
            "TC": "https://profesor.cf.idsm.xyz"
        },
        "1007": {
            "MT": "https://meta.grupocudec.idsm.xyz",
            "ST": "https://alumno.grupocudec.idsm.xyz",
            "TC": "https://profesor.grupocudec.idsm.xyz"
        },
        "1008": {
            "MT": "https://meta.ipia.idsm.xyz",
            "ST": "https://alumno.ipia.idsm.xyz",
            "TC": "https://profesor.ipia.idsm.xyz"
        },
        "1009": {
            "MT": "https://meta.dali.idsm.xyz",
            "ST": "https://alumno.dali.idsm.xyz",
            "TC": "https://profesor.dali.idsm.xyz"
        },
        "1010": {
            "MT": "https://meta.vizcaino.idsm.xyz",
            "ST": "https://alumno.vizcaino.idsm.xyz",
            "TC": "https://profesor.vizcaino.idsm.xyz"
        },
        "1011": {
            "MT": "https://meta.chk-qro.idsm.xyz",
            "ST": "https://alumno.chk-qro.idsm.xyz",
            "TC": "https://profesor.chk-qro.idsm.xyz"
        },
        "1013": {
            "MT": "https://meta.montessori-pachuca.idsm.xyz",
            "ST": "https://alumno.montessori-pachuca.idsm.xyz",
            "TC": "https://profesor.montessori-pachuca.idsm.xyz"
        },
        "1014": {
            "MT": "https://meta.dicormo.idsm.xyz",
            "ST": "https://alumno.dicormo.idsm.xyz",
            "TC": "https://profesor.dicormo.idsm.xyz"
        },
        "1015": {
            "MT": "https://meta.uc.idsm.xyz",
            "ST": "https://alumno.uc.idsm.xyz",
            "TC": "https://profesor.uc.idsm.xyz"
        },
        "1016": {
            "MT": "https://meta.iamb.idsm.xyz",
            "ST": "https://alumno.iamb.idsm.xyz",
            "TC": "https://profesor.iamb.idsm.xyz"
        },
        "1017": {
            "MT": "https://meta.ccolumbia.idsm.xyz",
            "ST": "https://alumno.ccolumbia.idsm.xyz",
            "TC": "https://profesor.ccolumbia.idsm.xyz"
        },
        "1018": {
            "MT": "https://meta.plata.idsm.xyz",
            "ST": "https://alumno.plata.idsm.xyz",
            "TC": "https://profesor.plata.idsm.xyz"
        },
        "1019": {
            "MT": "https://meta.nitamani.idsm.xyz",
            "ST": "https://alumno.nitamani.idsm.xyz",
            "TC": "https://profesor.nitamani.idsm.xyz"
        }
    }

