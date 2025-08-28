import { IDaypass } from "@/interfaces/IDaypass";

export const mockDaypasses: IDaypass[] = [
  {
    id: 22,
    school_id: 1000,
    guardian_person_id: 4487,
    student_person_id: 1222,
    reason: "Pase de Salida con authorizer",
    status: "PENDIENTE",
    created: "2025-08-05T10:59:55.859601Z",
    modified: "2025-08-05T10:59:55.859604Z",
    authorized_at: null,
    daypass_date: "2025-08-05",
    daypass_time: "06:30:00",
    academic_stage_id: 199,
    person: {
      school_id: 1000,
      id: 1222,
      type: "STUDENT",
      person_internal_id: "5210005",
      given_name: "PAOLA SOFIA",
      paternal_name: "CANSECO",
      maternal_name: "PAOLA SOFIA",
      display_name: null,
      legal_name: null,
      email: "renedsm@gmail.com"
    },
    relative: {
      school_id: 1000,
      id: 4487,
      type: "RELATIVE",
      person_internal_id: "F11957",
      given_name: "PAOLA",
      paternal_name: "HERNANDEZ",
      maternal_name: "PAOLA",
      display_name: null,
      legal_name: null,
      email: "renedsm@gmail.com"
    }
  },
  {
    id: 23,
    school_id: 1000,
    guardian_person_id: 4487,
    student_person_id: 1222,
    reason: "Initial authorizer",
    status: "PENDIENTE",
    created: "2025-08-05T11:01:29.728137Z",
    modified: "2025-08-05T11:01:29.728142Z",
    authorized_at: null,
    daypass_date: "2025-08-05",
    daypass_time: "06:41:00",
    academic_stage_id: 199,
    person: {
      school_id: 1000,
      id: 1222,
      type: "STUDENT",
      person_internal_id: "5210005",
      given_name: "PAOLA SOFIA",
      paternal_name: "CANSECO",
      maternal_name: "PAOLA SOFIA",
      display_name: null,
      legal_name: null,
      email: "renedsm@gmail.com"
    },
    relative: {
      school_id: 1000,
      id: 4487,
      type: "RELATIVE",
      person_internal_id: "F11957",
      given_name: "PAOLA",
      paternal_name: "HERNANDEZ",
      maternal_name: "PAOLA",
      display_name: null,
      legal_name: null,
      email: "renedsm@gmail.com"
    }
  },
  {
    id: 24,
    school_id: 1000,
    guardian_person_id: 4487,
    student_person_id: 1222,
    reason: "Salida con autorizador inicial",
    status: "AUTORIZADO",
    created: "2025-08-05T20:45:10.403039Z",
    modified: "2025-08-05T22:26:21.915536Z",
    authorized_at: "2025-08-05T22:26:21.914691Z",
    daypass_date: "2025-08-05",
    daypass_time: "16:44:00",
    academic_stage_id: 199,
    person: {
      school_id: 1000,
      id: 1222,
      type: "STUDENT",
      person_internal_id: "5210005",
      given_name: "PAOLA SOFIA",
      paternal_name: "CANSECO",
      maternal_name: "PAOLA SOFIA",
      display_name: null,
      legal_name: null,
      email: "renedsm@gmail.com"
    },
    relative: {
      school_id: 1000,
      id: 4487,
      type: "RELATIVE",
      person_internal_id: "F11957",
      given_name: "PAOLA",
      paternal_name: "HERNANDEZ",
      maternal_name: "PAOLA",
      display_name: null,
      legal_name: null,
      email: "renedsm@gmail.com"
    }
  }
];
