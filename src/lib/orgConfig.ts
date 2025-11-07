/**
 * Obtiene la configuración de la organización desde localStorage
 */
export const getOrgConfig = () => {
  const schoolId = localStorage.getItem('schoolId');
  const portalName = localStorage.getItem('portalName');

  if (!schoolId || !portalName) {
    throw new Error('Configuración de organización no encontrada. Por favor, accede con un parámetro org válido.');
  }

  return {
    schoolId,
    portalName
  };
};
