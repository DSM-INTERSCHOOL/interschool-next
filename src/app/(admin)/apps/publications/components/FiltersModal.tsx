"use client";

import { useState } from "react";

interface FilterOption {
  id: string;
  label: string;
  checked: boolean;
}

interface FilterSection {
  title: string;
  icon: string;
  selectAllLabel: string;
  options: FilterOption[];
}

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
}

export const FiltersModal = ({ isOpen, onClose, onApplyFilters }: FiltersModalProps) => {
  const [academicYears, setAcademicYears] = useState<FilterOption[]>([
    { id: "F2025", label: "F2025", checked: false },
    { id: "2025", label: "2025", checked: false },
    { id: "SEF2025", label: "SEF2025", checked: false },
  ]);

  const [academicLevels, setAcademicLevels] = useState<FilterOption[]>([
    { id: "FID", label: "(FI) FID", checked: false },
    { id: "DAYCARE", label: "(DC) DAYCARE", checked: false },
    { id: "MATERNAL", label: "(MA) MATERNAL", checked: false },
    { id: "KINDER", label: "(KI) KINDER", checked: false },
    { id: "PRIMARIA", label: "(PR) PRIMARIA", checked: false },
    { id: "SECUNDARIA", label: "(SE) SECUNDARIA", checked: false },
    { id: "BACHILLERATO", label: "(BA) BACHILLERATO", checked: false },
  ]);

  const [academicPrograms, setAcademicPrograms] = useState<FilterOption[]>([
    { id: "ACTIVIDADES", label: "(ACTIVIDADES) ACTIVIDADES", checked: false },
  ]);

  const [programYears, setProgramYears] = useState<FilterOption[]>([
    { id: "1", label: "1", checked: false },
  ]);

  const [academicGroups, setAcademicGroups] = useState<FilterOption[]>([
    { id: "ALLACCESS", label: "ALLACCESS", checked: false },
    { id: "ALLACCESSPAPA", label: "ALLACCESSPAPA", checked: false },
    { id: "FID", label: "FID", checked: false },
    { id: "NATACION", label: "NATACION", checked: false },
    { id: "ONEACCESS", label: "ONEACCESS", checked: false },
    { id: "ONEACCESSPAPAS", label: "ONEACCESSPAPAS", checked: false },
  ]);

  const toggleOption = (
    section: FilterOption[],
    setSectionFn: (options: FilterOption[]) => void,
    id: string
  ) => {
    setSectionFn(
      section.map((option) =>
        option.id === id ? { ...option, checked: !option.checked } : option
      )
    );
  };

  const toggleSelectAll = (
    section: FilterOption[],
    setSectionFn: (options: FilterOption[]) => void
  ) => {
    const allSelected = section.every((opt) => opt.checked);
    setSectionFn(section.map((opt) => ({ ...opt, checked: !allSelected })));
  };

  const handleApplyFilters = () => {
    const filters = {
      academicYears: academicYears.filter((opt) => opt.checked).map((opt) => opt.id),
      academicLevels: academicLevels.filter((opt) => opt.checked).map((opt) => opt.id),
      academicPrograms: academicPrograms.filter((opt) => opt.checked).map((opt) => opt.id),
      programYears: programYears.filter((opt) => opt.checked).map((opt) => opt.id),
      academicGroups: academicGroups.filter((opt) => opt.checked).map((opt) => opt.id),
    };
    onApplyFilters(filters);
    onClose();
  };

  const handleClearFilters = () => {
    setAcademicYears(academicYears.map((opt) => ({ ...opt, checked: false })));
    setAcademicLevels(academicLevels.map((opt) => ({ ...opt, checked: false })));
    setAcademicPrograms(academicPrograms.map((opt) => ({ ...opt, checked: false })));
    setProgramYears(programYears.map((opt) => ({ ...opt, checked: false })));
    setAcademicGroups(academicGroups.map((opt) => ({ ...opt, checked: false })));
  };

  const getSelectedCount = (section: FilterOption[]) => {
    return section.filter((opt) => opt.checked).length;
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-2xl">
            <span className="iconify lucide--filter size-6 inline-block mr-2"></span>
            Filtros de Publicación
          </h3>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <span className="iconify lucide--x size-5"></span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Años Académicos */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold flex items-center gap-2">
                <span className="iconify lucide--calendar size-5"></span>
                Años Académicos
              </h4>
              <span className="text-sm text-base-content/60">
                {getSelectedCount(academicYears)} de {academicYears.length} seleccionados
              </span>
            </div>
            <div className="form-control mb-3 bg-base-200 p-2 rounded">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={academicYears.every((opt) => opt.checked)}
                  onChange={() => toggleSelectAll(academicYears, setAcademicYears)}
                />
                <span className="label-text">Seleccionar todos los años académicos</span>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {academicYears.map((option) => (
                <div key={option.id} className="form-control">
                  <label className="label cursor-pointer justify-start gap-2 border rounded p-2 hover:bg-base-200 transition-colors">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-primary"
                      checked={option.checked}
                      onChange={() => toggleOption(academicYears, setAcademicYears, option.id)}
                    />
                    <span className="label-text">{option.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Niveles Académicos */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold flex items-center gap-2">
                <span className="iconify lucide--graduation-cap size-5"></span>
                Niveles Académicos
              </h4>
              <span className="text-sm text-base-content/60">
                {getSelectedCount(academicLevels)} de {academicLevels.length} seleccionados
              </span>
            </div>
            <div className="form-control mb-3 bg-base-200 p-2 rounded">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={academicLevels.every((opt) => opt.checked)}
                  onChange={() => toggleSelectAll(academicLevels, setAcademicLevels)}
                />
                <span className="label-text">Seleccionar todos los niveles académicos</span>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {academicLevels.map((option) => (
                <div key={option.id} className="form-control">
                  <label className="label cursor-pointer justify-start gap-2 border rounded p-2 hover:bg-base-200 transition-colors">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-primary"
                      checked={option.checked}
                      onChange={() => toggleOption(academicLevels, setAcademicLevels, option.id)}
                    />
                    <span className="label-text">{option.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Programas Académicos */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold flex items-center gap-2">
                <span className="iconify lucide--book-open size-5"></span>
                Programas Académicos
              </h4>
              <span className="text-sm text-base-content/60">
                {getSelectedCount(academicPrograms)} de {academicPrograms.length} seleccionados
              </span>
            </div>
            <div className="form-control mb-3 bg-base-200 p-2 rounded">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={academicPrograms.every((opt) => opt.checked)}
                  onChange={() => toggleSelectAll(academicPrograms, setAcademicPrograms)}
                />
                <span className="label-text">Seleccionar todos los programas académicos</span>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {academicPrograms.map((option) => (
                <div key={option.id} className="form-control">
                  <label className="label cursor-pointer justify-start gap-2 border rounded p-2 hover:bg-base-200 transition-colors">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-primary"
                      checked={option.checked}
                      onChange={() => toggleOption(academicPrograms, setAcademicPrograms, option.id)}
                    />
                    <span className="label-text">{option.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Años de Programa */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold flex items-center gap-2">
                <span className="iconify lucide--layers size-5"></span>
                Años de Programa
              </h4>
              <span className="text-sm text-base-content/60">
                {getSelectedCount(programYears)} de {programYears.length} seleccionados
              </span>
            </div>
            <div className="form-control mb-3 bg-base-200 p-2 rounded">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={programYears.every((opt) => opt.checked)}
                  onChange={() => toggleSelectAll(programYears, setProgramYears)}
                />
                <span className="label-text">Seleccionar todos los años de programa</span>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {programYears.map((option) => (
                <div key={option.id} className="form-control">
                  <label className="label cursor-pointer justify-start gap-2 border rounded p-2 hover:bg-base-200 transition-colors">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-primary"
                      checked={option.checked}
                      onChange={() => toggleOption(programYears, setProgramYears, option.id)}
                    />
                    <span className="label-text">{option.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Grupos Académicos */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold flex items-center gap-2">
                <span className="iconify lucide--users size-5"></span>
                Grupos Académicos
              </h4>
              <span className="text-sm text-base-content/60">
                {getSelectedCount(academicGroups)} de {academicGroups.length} seleccionados
              </span>
            </div>
            <div className="form-control mb-3 bg-base-200 p-2 rounded">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={academicGroups.every((opt) => opt.checked)}
                  onChange={() => toggleSelectAll(academicGroups, setAcademicGroups)}
                />
                <span className="label-text">Seleccionar todos los grupos académicos</span>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {academicGroups.map((option) => (
                <div key={option.id} className="form-control">
                  <label className="label cursor-pointer justify-start gap-2 border rounded p-2 hover:bg-base-200 transition-colors">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-primary"
                      checked={option.checked}
                      onChange={() => toggleOption(academicGroups, setAcademicGroups, option.id)}
                    />
                    <span className="label-text">{option.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-action">
          <button onClick={handleClearFilters} className="btn btn-outline">
            <span className="iconify lucide--refresh-cw size-4"></span>
            Limpiar Filtros
          </button>
          <button onClick={onClose} className="btn btn-ghost">
            Cancelar
          </button>
          <button onClick={handleApplyFilters} className="btn btn-primary">
            <span className="iconify lucide--check size-4"></span>
            Aplicar Filtros
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};
