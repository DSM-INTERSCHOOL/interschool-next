/**
 * Representa la información que envía el cliente para registrar
 * una consulta médica en la escuela.
 */
export interface ICreateMedicalConsultationDto {
    /* Identificadores y metadatos */
    school_id: string;          // "1000"
    person_id: string;          // "224605"
    person_name: string;        // "SANCHEZ CANSECO GAEL"
    user_name: string;          // "HERNANDEZ MARTINEZ MIRNA EDITH"
    created_by: string;         // "INTERSCHOOL"
  
    /* Datos clínicos */
    reason: string;             // Motivo de la consulta
    diagnostic: string;         // Diagnóstico
    treatment: string;          // Tratamiento sugerido
    allergies: string;          // Alergias reportadas
    objective: string;          // Exploración objetiva
    subjective: string;         // Exploración subjetiva
    notes: string;              // Notas adicionales
  
    /* Signos vitales */
    temperature: number;        // °C
    heart_rate: number;         // latidos/min
    respiratory_rate: number;   // respiraciones/min
    blood_preassure_sis: number; // Presión sistólica (mm Hg)
    blood_preassure_dis: number; // Presión diastólica (mm Hg)
    oxygen_saturation: number;   // % SpO₂
  
    /* Clasificación y referencias */
    category_id: number;        // Id de la categoría de consulta
    supply_ids: number[];       // Insumos utilizados (vacío en el ejemplo)
  
    /* Acciones tomadas */
    relative_call: boolean;     // ¿Se llamó a un familiar?
    send_back_home: boolean;    // ¿Se envió al alumno a casa?
  }
  