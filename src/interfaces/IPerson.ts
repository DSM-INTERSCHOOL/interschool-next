export interface IPersonResponse {
    data:        IPerson[];
    total_pages: number;
}

export interface IPerson {
    first_name:         string;
    second_name:        string;
    third_name:         string;
    name:               string;
    person_type:        PersonType;
    legacy_person_id:   string;
    school_id:          string;
    person_id:          string;
    person_internal_id: string;
    created:            Date;
    modified:           Date;
}

enum PersonType {
    Student = "STUDENT",
}
