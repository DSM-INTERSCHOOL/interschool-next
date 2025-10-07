"use client";

import { useState, useEffect } from "react";
import { getDaypassesConsulta } from "@/services/daypass-consulta.service";
import { IDaypassConsulta } from "@/services/daypass-consulta.service";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { downloadDaypassPDF, previewDaypassPDF } from "@/utils/pdfGenerator";

export const ConsultaApp = () => {
  const [allDaypasses, setAllDaypasses] = useState<IDaypassConsulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    date: ""
  });
  const [selectedDaypasses, setSelectedDaypasses] = useState<Set<number>>(new Set());

  // Cargar datos iniciales una sola vez
  useEffect(() => {
    loadInitialDaypasses();
  }, []);

  const loadInitialDaypasses = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getDaypassesConsulta();
      setAllDaypasses(result.data);
    } catch (err: any) {
      setError(err.message);
      console.error("Error loading daypasses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: "",
      date: ""
    });
    setSearchTerm("");
  };

  const handleSelectDaypass = (daypassId: number, isSelected: boolean) => {
    setSelectedDaypasses(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(daypassId);
      } else {
        newSet.delete(daypassId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      const allIds = new Set(filteredDaypasses.map(daypass => daypass.id));
      setSelectedDaypasses(allIds);
    } else {
      setSelectedDaypasses(new Set());
    }
  };

  const handlePrint = () => {
    // Obtener los pases seleccionados
    const selectedDaypassData = filteredDaypasses.filter(daypass =>
      selectedDaypasses.has(daypass.id)
    );

    if (selectedDaypassData.length === 0) {
      alert('No hay pases de salida seleccionados para imprimir');
      return;
    }

    try {
      // Generar y descargar el PDF
      downloadDaypassPDF(selectedDaypassData);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Por favor, intenta nuevamente.');
    }
  };

  const handlePreviewPDF = () => {
    // Obtener los pases seleccionados
    const selectedDaypassData = filteredDaypasses.filter(daypass =>
      selectedDaypasses.has(daypass.id)
    );

    if (selectedDaypassData.length === 0) {
      alert('No hay pases de salida seleccionados para previsualizar');
      return;
    }

    try {
      // Abrir vista previa del PDF
      previewDaypassPDF(selectedDaypassData);
    } catch (error) {
      console.error('Error generando vista previa del PDF:', error);
      alert('Error al generar la vista previa del PDF. Por favor, intenta nuevamente.');
    }
  };

  const formatDate = (dateString: string) => {
    // La fecha viene en formato "YYYY-MM-DD", solo cambiar el formato de visualización
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Solo HH:MM
  };

  const formatAcademicInfo = (info: any) => {
    if (!info) return "N/A";
    return `(${info.key}) ${info.description}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDIENTE': { color: 'badge-warning', text: 'Pendiente' },
      'AUTORIZADO': { color: 'badge-success', text: 'Autorizado' },
      'RECHAZADO': { color: 'badge-error', text: 'Rechazado' },
      'CANCELADO': { color: 'badge-neutral', text: 'Cancelado' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'badge-neutral', text: status };
    
    return (
      <div className={`badge ${config.color} gap-1`}>
        <span className="iconify lucide--clock size-3"></span>
        {config.text}
      </div>
    );
  };

  // Filtrado completo del lado del cliente
  const filteredDaypasses = allDaypasses.filter(daypass => {
    // Filtro por término de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        daypass.person.given_name.toLowerCase().includes(searchLower) ||
        daypass.person.paternal_name.toLowerCase().includes(searchLower) ||
        daypass.person.person_internal_id.toLowerCase().includes(searchLower) ||
        daypass.relative.given_name.toLowerCase().includes(searchLower) ||
        daypass.relative.paternal_name.toLowerCase().includes(searchLower) ||
        daypass.reason.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Filtro por estado
    if (filters.status && daypass.status !== filters.status) {
      return false;
    }

    // Filtro por fecha específica - comparación robusta
    if (filters.date) {
      // Normalizar la fecha del daypass para evitar problemas de timezone
      const daypassDate = new Date(daypass.daypass_date + 'T00:00:00');
      const filterDate = new Date(filters.date + 'T00:00:00');
      
      // Comparar solo las fechas (sin tiempo)
      const daypassDateStr = daypassDate.toISOString().split('T')[0];
      const filterDateStr = filterDate.toISOString().split('T')[0];

      console.log({daypassDateStr, filterDateStr })
      
      if (daypassDateStr !== filterDateStr) {
        return false;
      }
    }

    return true;
  });

  if (loading && allDaypasses.length === 0) {
    return (
      <div className="mt-6">
        <LoadingSpinner message="Cargando pases de salida..." />
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Filtros */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title">
            <span className="iconify lucide--filter size-5"></span>
            Filtros de Búsqueda
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda general */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs">Buscar</span>
              </label>
              <input
                type="text"
                placeholder="Nombre, matrícula, motivo..."
                className="input input-bordered input-sm text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Estado */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs">Estado</span>
              </label>
              <select
                className="select select-bordered select-sm text-xs"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="AUTORIZADO">Autorizado</option>
                <option value="RECHAZADO">Rechazado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>

            {/* Fecha */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs">Fecha</span>
              </label>
              <input
                type="date"
                className="input input-bordered input-sm text-xs"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
              />
            </div>

            {/* Botón Limpiar Filtros */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs opacity-0">Acciones</span>
              </label>
              <button
                className="btn btn-outline btn-sm text-xs"
                onClick={handleClearFilters}
              >
                <span className="iconify lucide--refresh-cw size-3"></span>
                Limpiar
              </button>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="flex justify-end mt-2">
            <div className="text-xs text-base-content/70">
              {filteredDaypasses.length} de {allDaypasses.length} pases de salida
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error shadow-lg">
          <span className="iconify lucide--alert-circle size-6"></span>
          <div>
            <h3 className="font-bold">Error</h3>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      )}

      <div className="card bg-base-100 shadow-lg">
        <div className="card-body p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-title text-lg">
              <span className="iconify lucide--list size-5"></span>
              Pases de salida
            </h3>
            <div className="flex items-center gap-4">
              {selectedDaypasses.size > 0 && (
                <div className="flex gap-2">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={handlePreviewPDF}
                    title="Vista previa del PDF"
                  >
                    <span className="iconify lucide--eye size-4"></span>
                    Previsualizar
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handlePrint}
                    title="Descargar PDF"
                  >
                    <span className="iconify lucide--download size-4"></span>
                    Descargar PDF ({selectedDaypasses.size})
                  </button>
                </div>
              )}
              <div className="text-sm text-base-content/70">
                {filteredDaypasses.length} pases de salida encontrados
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner message="Cargando..." />
            </div>
          ) : filteredDaypasses.length === 0 ? (
            <div className="text-center py-8">
              <span className="iconify lucide--inbox size-16 text-base-content/30 mb-4"></span>
              <p className="text-base-content/70">
                {allDaypasses.length === 0 
                  ? "No se encontraron pases de salida" 
                  : "No hay resultados que coincidan con los filtros aplicados"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full text-xs">
                <thead>
                  <tr>
                    <th className="p-2">
                      <label className="label cursor-pointer p-0">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={filteredDaypasses.length > 0 && selectedDaypasses.size === filteredDaypasses.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </label>
                    </th>
                    <th className="p-2">ID</th>
                    <th className="p-2">Alumno</th>
                    <th className="p-2">ID Alumno</th>
                    <th className="p-2">Ciclo</th>
                    <th className="p-2">Nivel</th>
                    <th className="p-2">Programa</th>
                    <th className="p-2">Grado</th>
                    <th className="p-2">Grupo</th>
                    <th className="p-2">Pariente</th>
                    <th className="p-2">Persona que recoge</th>
                    <th className="p-2">Motivo</th>
                    <th className="p-2">Fecha</th>
                    <th className="p-2">Hora</th>
                    <th className="p-2">Estado</th>
                    <th className="p-2">Autorizadores</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDaypasses.map((daypass) => (
                    <tr key={daypass.id}>
                      <td className="p-2">
                        <label className="label cursor-pointer p-0">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={selectedDaypasses.has(daypass.id)}
                            onChange={(e) => handleSelectDaypass(daypass.id, e.target.checked)}
                          />
                        </label>
                      </td>
                      <td className="font-mono text-xs p-2">{daypass.id}</td>
                      <td className="p-2">
                        <div>
                          <div className="font-medium text-xs">
                            {daypass.person.given_name} {daypass.person.paternal_name}
                          </div>
                          {daypass.person.maternal_name && (
                            <div className="text-xs text-base-content/70">
                              {daypass.person.maternal_name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="font-mono text-xs p-2">{daypass.person.person_internal_id}</td>
                      <td className="text-xs p-2">{formatAcademicInfo(daypass.academic_year)}</td>
                      <td className="text-xs p-2">{formatAcademicInfo(daypass.academic_stage)}</td>
                      <td className="text-xs p-2">{formatAcademicInfo(daypass.academic_program)}</td>
                      <td className="text-xs p-2">{formatAcademicInfo(daypass.program_year)}</td>
                      <td className="text-xs p-2">{formatAcademicInfo(daypass.academic_group)}</td>
                      <td className="p-2">
                        <div>
                          <div className="font-medium text-xs">
                            {daypass.relative.given_name} {daypass.relative.paternal_name}
                          </div>
                          {daypass.relative.maternal_name && (
                            <div className="text-xs text-base-content/70">
                              {daypass.relative.maternal_name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-xs">
                          {daypass.pickup_person || '-'}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="max-w-xs truncate text-xs" title={daypass.reason}>
                          {daypass.reason}
                        </div>
                      </td>
                      <td className="font-mono text-xs p-2">{formatDate(daypass.daypass_date)}</td>
                      <td className="font-mono text-xs p-2">{formatTime(daypass.daypass_time)}</td>
                      <td className="p-2">
                        <div className={`badge ${getStatusBadge(daypass.status).props.className.split(' ')[1]} gap-1 text-xs`}>
                          <span className="iconify lucide--clock size-2"></span>
                          {getStatusBadge(daypass.status).props.children[1]}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-xs">
                          <div className="font-medium">{daypass.authorizers.length} autorizador(es)</div>
                          <div className="text-base-content/70">
                            {daypass.authorizers.filter(a => a.authorized).length} autorizado(s)
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};