import { IMedicalSupply } from "./IMedicalSupply";

export interface IMedicalConsultation {
    school_id:           number;
    person_id:           string;
    date_created:        string;
    date_modified:       string;
    user_name:           string;
    reason:              string;
    subjective:          string;
    objective:           string;
    heart_rate:          number;
    respiratory_rate:    number;
    blood_preassure_sis: number;
    blood_preassure_dis: number;
    temperature:         number;
    oxygen_saturation:   number;
    diagnostic:          string;
    treatment:           string;
    notes:               string;
    allergies:           string;
    relative_call:       boolean;
    call_response:       string;
    send_back_home:      boolean;
    created_by:          string;
    modified_by:         string;
    category_id:         string;
    sub_category_id:     number;
    id:                  number;
    category:            string;
    supplies:            IMedicalSupply[];
}
