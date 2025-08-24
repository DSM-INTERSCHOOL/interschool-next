import { IDaypass } from "@/interfaces/IDaypass";

export const mockDaypasses: IDaypass[] = [
    {
        school_id: 1000,
        guardian_person_id: 5114,
        student_person_id: 17,
        reason: "Cita médica con el pediatra para revisión anual",
        status: "PENDIENTE",
        authorized_at: null,
        academic_stage_id: null,
        daypass_date: "2024-01-15",
        daypass_time: "14:30:00",
        id: 1,
        created: "2024-01-10T09:30:00Z",
        modified: "2024-01-10T09:30:00Z",
        authorizers: [
            {
                authorizer_person_id: 2616,
                authorized: false,
                authorized_at: null,
                authorization_sequence: 0,
                authorized_by: null,
                note: null,
                daypass_id: 1,
                created_at: "2024-01-10T10:00:00Z",
                authorizer: {
                    school_id: 1000,
                    id: 2616,
                    type: "USER",
                    person_internal_id: "PATSYL",
                    given_name: "PATSY NADIA",
                    paternal_name: "LUNA",
                    maternal_name: "PATSY NADIA",
                    display_name: null,
                    legal_name: null,
                    email: "patsy.luna@celta.edu.mx"
                }
            },
            {
                authorizer_person_id: 2617,
                authorized: false,
                authorized_at: null,
                authorization_sequence: 1,
                authorized_by: null,
                note: null,
                daypass_id: 1,
                created_at: "2024-01-10T10:00:00Z",
                authorizer: {
                    school_id: 1000,
                    id: 2617,
                    type: "USER",
                    person_internal_id: "PATRICIAH",
                    given_name: "PATRICIA",
                    paternal_name: "HERNANDEZ",
                    maternal_name: "GOMEZ",
                    display_name: null,
                    legal_name: null,
                    email: "patricia.hernandez@celta.edu.mx"
                }
            }
        ],
        person: {
            school_id: 1000,
            id: 17,
            type: "STUDENT",
            person_internal_id: "1050002",
            given_name: "ANDRES",
            paternal_name: "LOZANO",
            maternal_name: "ANDRES",
            display_name: null,
            legal_name: null,
            email: "aida_lozano@prodigy.net.mx"
        },
        relative: {
            school_id: 1000,
            id: 5114,
            type: "RELATIVE",
            person_internal_id: "F13119",
            given_name: "MIGUEL",
            paternal_name: "LOPEZ",
            maternal_name: "MIGUEL",
            display_name: null,
            legal_name: null,
            email: ""
        }
    },
    {
        school_id: 1000,
        guardian_person_id: 5114,
        student_person_id: 18,
        reason: "Salida temprana para asistir a clase de natación",
        status: "PENDIENTE",
        authorized_at: null,
        academic_stage_id: null,
        daypass_date: "2024-01-15",
        daypass_time: "15:00:00",
        id: 2,
        created: "2024-01-10T10:45:00Z",
        modified: "2024-01-10T10:45:00Z",
        authorizers: [
            {
                authorizer_person_id: 2616,
                authorized: false,
                authorized_at: null,
                authorization_sequence: 0,
                authorized_by: null,
                note: null,
                daypass_id: 2,
                created_at: "2024-01-10T11:00:00Z",
                authorizer: {
                    school_id: 1000,
                    id: 2616,
                    type: "USER",
                    person_internal_id: "PATSYL",
                    given_name: "PATSY NADIA",
                    paternal_name: "LUNA",
                    maternal_name: "PATSY NADIA",
                    display_name: null,
                    legal_name: null,
                    email: "patsy.luna@celta.edu.mx"
                }
            }
        ],
        person: {
            school_id: 1000,
            id: 18,
            type: "STUDENT",
            person_internal_id: "1050003",
            given_name: "JUAN",
            paternal_name: "MARTINEZ",
            maternal_name: "PEREZ",
            display_name: null,
            legal_name: null,
            email: "juan.martinez@celta.edu.mx"
        },
        relative: {
            school_id: 1000,
            id: 5114,
            type: "RELATIVE",
            person_internal_id: "F13119",
            given_name: "MIGUEL",
            paternal_name: "LOPEZ",
            maternal_name: "MIGUEL",
            display_name: null,
            legal_name: null,
            email: ""
        }
    },
    {
        school_id: 1000,
        guardian_person_id: 5115,
        student_person_id: 19,
        reason: "Visita al dentista para limpieza dental",
        status: "PENDIENTE",
        authorized_at: null,
        academic_stage_id: null,
        daypass_date: "2024-01-16",
        daypass_time: "13:00:00",
        id: 3,
        created: "2024-01-10T11:30:00Z",
        modified: "2024-01-10T11:30:00Z",
        authorizers: [
            {
                authorizer_person_id: 2617,
                authorized: false,
                authorized_at: null,
                authorization_sequence: 0,
                authorized_by: null,
                note: null,
                daypass_id: 3,
                created_at: "2024-01-10T12:00:00Z",
                authorizer: {
                    school_id: 1000,
                    id: 2617,
                    type: "USER",
                    person_internal_id: "PATRICIAH",
                    given_name: "PATRICIA",
                    paternal_name: "HERNANDEZ",
                    maternal_name: "GOMEZ",
                    display_name: null,
                    legal_name: null,
                    email: "patricia.hernandez@celta.edu.mx"
                }
            }
        ],
        person: {
            school_id: 1000,
            id: 19,
            type: "STUDENT",
            person_internal_id: "1050004",
            given_name: "SOFIA",
            paternal_name: "FERNANDEZ",
            maternal_name: "RAMIREZ",
            display_name: null,
            legal_name: null,
            email: "sofia.fernandez@celta.edu.mx"
        },
        relative: {
            school_id: 1000,
            id: 5115,
            type: "RELATIVE",
            person_internal_id: "F13120",
            given_name: "CARMEN",
            paternal_name: "FERNANDEZ",
            maternal_name: "RAMIREZ",
            display_name: null,
            legal_name: null,
            email: "carmen.fernandez@email.com"
        }
    },
    {
        school_id: 1000,
        guardian_person_id: 5116,
        student_person_id: 20,
        reason: "Salida para asistir a terapia ocupacional",
        status: "PENDIENTE",
        authorized_at: null,
        academic_stage_id: null,
        daypass_date: "2024-01-16",
        daypass_time: "16:00:00",
        id: 4,
        created: "2024-01-10T12:15:00Z",
        modified: "2024-01-10T12:15:00Z",
        authorizers: [
            {
                authorizer_person_id: 2616,
                authorized: false,
                authorized_at: null,
                authorization_sequence: 0,
                authorized_by: null,
                note: null,
                daypass_id: 4,
                created_at: "2024-01-10T13:00:00Z",
                authorizer: {
                    school_id: 1000,
                    id: 2616,
                    type: "USER",
                    person_internal_id: "PATSYL",
                    given_name: "PATSY NADIA",
                    paternal_name: "LUNA",
                    maternal_name: "PATSY NADIA",
                    display_name: null,
                    legal_name: null,
                    email: "patsy.luna@celta.edu.mx"
                }
            },
            {
                authorizer_person_id: 2618,
                authorized: false,
                authorized_at: null,
                authorization_sequence: 1,
                authorized_by: null,
                note: null,
                daypass_id: 4,
                created_at: "2024-01-10T13:00:00Z",
                authorizer: {
                    school_id: 1000,
                    id: 2618,
                    type: "USER",
                    person_internal_id: "LAURAJ",
                    given_name: "LAURA",
                    paternal_name: "JIMENEZ",
                    maternal_name: "VARGAS",
                    display_name: null,
                    legal_name: null,
                    email: "laura.jimenez@celta.edu.mx"
                }
            }
        ],
        person: {
            school_id: 1000,
            id: 20,
            type: "STUDENT",
            person_internal_id: "1050005",
            given_name: "DIEGO",
            paternal_name: "SANCHEZ",
            maternal_name: "TORRES",
            display_name: null,
            legal_name: null,
            email: "diego.sanchez@celta.edu.mx"
        },
        relative: {
            school_id: 1000,
            id: 5116,
            type: "RELATIVE",
            person_internal_id: "F13121",
            given_name: "MIGUEL",
            paternal_name: "SANCHEZ",
            maternal_name: "TORRES",
            display_name: null,
            legal_name: null,
            email: "miguel.sanchez@email.com"
        }
    }
];
