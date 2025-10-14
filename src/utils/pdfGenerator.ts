import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IDaypassConsulta } from '@/services/daypass-consulta.service';

export interface PDFOptions {
  title?: string;
}

export const generateDaypassPDF = (
  daypasses: IDaypassConsulta[],
  options: PDFOptions = {}
) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Configuración por defecto
  const config = {
    title: options.title || 'Pases de Salida'
  };

  // Encabezado
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(config.title, 105, 20, { align: 'center' });

  // Información del reporte
  doc.setFontSize(10);
  doc.text(`Total de pases: ${daypasses.length}`, 20, 35);

  // Preparar datos para la tabla
  const tableData = daypasses.map(daypass => [
    daypass.id.toString(),
    `${daypass.person.given_name} ${daypass.person.paternal_name}`,
    daypass.person.person_internal_id,
    formatAcademicInfo(daypass.academic_year),
    formatAcademicInfo(daypass.academic_stage),
    formatAcademicInfo(daypass.academic_program),
    formatAcademicInfo(daypass.program_year),
    formatAcademicInfo(daypass.academic_group),
    `${daypass.relative.given_name} ${daypass.relative.paternal_name}`,
    daypass.pickup_person || '-',
    daypass.reason.length > 15 ? daypass.reason.substring(0, 15) + '...' : daypass.reason,
    formatDateTime(daypass.created),
    formatDate(daypass.daypass_date),
    formatTime(daypass.daypass_time),
    getStatusText(daypass.status),
    `${daypass.authorizers.filter(a => a.authorized).length}/${daypass.authorizers.length}`
  ]);

  // Generar tabla
  autoTable(doc, {
    head: [['ID', 'Alumno', 'Matrícula', 'Ciclo', 'Nivel', 'Programa', 'Grado', 'Grupo', 'Pariente', 'Recoge', 'Motivo', 'F.Solicitud', 'Fecha Pase', 'Hora Pase', 'Estado', 'Autorizaciones']],
    body: tableData,
    startY: 45,
    styles: {
      fontSize: 6,
      cellPadding: 1.5,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 6,
    },
    tableWidth: 'auto',
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { top: 45, left: 5, right: 5 },
  });

  // Pie de página
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() - 30,
      doc.internal.pageSize.getHeight() - 10
    );
    doc.text(
      `Generado el ${new Date().toLocaleString('es-ES')}`,
      20,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  return doc;
};

export const downloadDaypassPDF = (
  daypasses: IDaypassConsulta[],
  filename?: string,
  options: PDFOptions = {}
) => {
  const doc = generateDaypassPDF(daypasses, options);
  const finalFilename = filename || `pases-salida-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(finalFilename);
};

export const previewDaypassPDF = (
  daypasses: IDaypassConsulta[],
  options: PDFOptions = {}
) => {
  const doc = generateDaypassPDF(daypasses, options);
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
};

// Funciones auxiliares
const formatDate = (dateString: string): string => {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

const formatDateTime = (dateTimeString: string): string => {
  // Para fechas con timestamp ISO como "2025-09-26T17:42:42.814105Z"
  const date = new Date(dateTimeString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatTime = (timeString: string): string => {
  return timeString.substring(0, 5); // Solo HH:MM
};

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'PENDIENTE': 'Pendiente',
    'AUTORIZADO': 'Autorizado',
    'RECHAZADO': 'Rechazado',
    'CANCELADO': 'Cancelado'
  };
  return statusMap[status] || status;
};

const formatAcademicInfo = (info: any): string => {
  if (!info) return "N/A";
  return `(${info.key}) ${info.description}`;
};