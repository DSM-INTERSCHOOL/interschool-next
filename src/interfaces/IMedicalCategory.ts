

export interface IMedicalConsultationCategory {
    school_id?: string,
    id: number,
    description: string,  
    date_created?: string,
    date_modified?: string,
    created_by: string,
    modified_by: string,
    _operation?: 'created' | 'edited';
  }