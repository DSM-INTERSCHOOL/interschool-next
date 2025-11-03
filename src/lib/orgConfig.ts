/**
 * Obtiene la configuración de la organización desde localStorage
 */
export const getOrgConfig = () => {
  const schoolId = localStorage.getItem('schoolId') || '';
  const portalName = localStorage.getItem('portalName') || '';

  return {
    schoolId,
    portalName
  };
};
