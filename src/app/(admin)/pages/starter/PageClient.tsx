"use client";
import { escape } from "querystring";
import React, {
  forwardRef,
  ReactElement,
  Suspense,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { useSearchParams } from "next/navigation";

import * as medicalCategoryService from "@/services/medicalCategory.service";
import * as medicalSupplyService from "@/services/medicalSupply.service";
import * as personService from "@/services/person.service";
import * as medicalConsultationService from "@/services/medicalConsultation.service";
import { IMedicalConsultationCategory } from "@/interfaces/IMedicalCategory";
import { IMedicalSupply } from "@/interfaces/IMedicalSupply";
import Head from "next/head";
import { IPerson } from "@/interfaces/IPerson";
import { IMedicalConsultation } from "@/interfaces/IMedicalConsultation";
import { IGroupEnrollment } from "@/interfaces/IGroupEnrollment";
import { IMedicalRecord } from "@/interfaces/IMedicalRecord";
import { ICreateMedicalConsultationDto } from "@/interfaces/DTOs/ICreateMedicalConsultationDto";

// Datos de ejemplo

interface InputRef {
  focus: () => void;
}



function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

const removeAccents = (text: string) =>
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

interface myHeaderProps {
  onSelectPerson: (person: IPerson) => void;
}

const MyHeader = forwardRef<InputRef, myHeaderProps>(
  ({ onSelectPerson }, ref) => {
    const searchParams = useSearchParams();
    const schoolId = searchParams.get("school_id") ?? "";
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [searchValue, setSearchValue] = useState<string>("");
    const [personas, setPersonas] = useState<IPerson[]>([]);

    useEffect(() => {
      personService.findAll(schoolId).then(setPersonas);
    }, []);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
    }));

    const handleChangeSearchValue = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      setSearchValue(e.target.value);
    };

    const debouncedSearchValue = useDebounce(searchValue, 300);

    const filteredPeople = useMemo(() => {
      const value = debouncedSearchValue.trim().toLowerCase();
      if (!value) return [];
      if (value.length <= 3) return [];
      return personas.filter((persona) =>
        removeAccents(persona.name.toLowerCase()).includes(value)
      );
    }, [debouncedSearchValue, personas]);

    return (
      <header>
        <nav className="navbar bg-base-100 shadow-sm">
          <div className="flex-1">
            <a href="#" className="btn btn-ghost text-xl">
              Servicio Medico
            </a>
          </div>
          <div className="flex gap-2">
            <label className="input flex items-center">
              <svg
                className="h-[1em] opacity-50"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <g
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </g>
              </svg>
              <input
                ref={inputRef}
                value={searchValue}
                onChange={handleChangeSearchValue}
                type="search"
                className="grow"
                placeholder="Buscar Alumno..."
              />
              <kbd className="kbd kbd-sm">⌘</kbd>
              <kbd className="kbd kbd-sm">K</kbd>
            </label>
          </div>
        </nav>
        {filteredPeople.length > 0 && (
          <section aria-label="Resultados de búsqueda" className="relative">
            <div className="absolute right-4 w-70 z-50 rounded shadow-lg">
              <ResultadoBusqueda
                filteredPeople={filteredPeople}
                onSelectPerson={(p) => {
                  onSelectPerson(p);
                  setSearchValue("");
                }}
              />
            </div>
          </section>
        )}
      </header>
    );
  }
);

const ResultadoBusqueda = ({
  filteredPeople,
  onSelectPerson,
}: {
  filteredPeople: IPerson[];
  onSelectPerson: (person: IPerson) => void;
}) => {
  const menuRef = useRef<HTMLUListElement | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!menuRef.current) return;
      // Seleccionamos botones en lugar de enlaces, para mayor semántica en elementos interactivos
      const buttons = menuRef.current.querySelectorAll("button");
      if (!buttons.length) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((prev) => (prev + 1) % buttons.length);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((prev) => (prev === 0 ? buttons.length - 1 : prev - 1));
      } else if (event.key === "Enter") {
        event.preventDefault();
        onSelectPerson(filteredPeople[activeIndex]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex]);

  return (
    <ul
      ref={menuRef}
      className="z-50 menu bg-base-100 w-full ml-auto mt-4 p-2 rounded"
    >
      {filteredPeople.map((p, index) => (
        <li key={p.person_id}>
          <button
            type="button"
            onClick={() => onSelectPerson(p)}
            className={`focus:bg-gray-300 p-2 rounded ${
              activeIndex === index ? "bg-gray-300" : ""
            }`}
          >
            {p.name}
          </button>
        </li>
      ))}
    </ul>
  );
};

interface ConsultasProps {
  onClickNuevasConsultas: () => void;
  onClickViewConsulta: (medicalConsultation: IMedicalConsultation) => void;
  medicalConsultations: IMedicalConsultation[];
}
const Consultas = ({
  onClickNuevasConsultas,
  medicalConsultations,
  onClickViewConsulta,
}: ConsultasProps) => {
  return (
    <section aria-labelledby="consultas-title">
      <fieldset className="fieldset bg-base-200 border border-base-300 p-4 rounded-box">
        <legend id="consultas-title" className="fieldset-legend text-base">
          Consultas
        </legend>
        {medicalConsultations.length === 0 && (
          <div role="alert" className="alert alert-info alert-soft">
            <p>Aún no se han registrado consultas</p>
          </div>
        )}

        <div className="ml-auto">
          <button className="btn" onClick={onClickNuevasConsultas}>
            Crear nueva consulta
            <kbd className="kbd kbd-sm">⌘</kbd>
            <kbd className="kbd kbd-sm">M</kbd>
          </button>
        </div>
        <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
          <table className="table table-xs">
            <thead>
              <tr>
                <th></th>
                <th>Fecha</th>
                <th>Motivo consulta</th>
                <th>Diagnóstico</th>
                <th>Atendió</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {medicalConsultations.map((mc, i) => (
                <tr key={mc.id}>
                  <th>{i + 1}</th>
                  <td>{mc.date_created}</td>
                  <td>{mc.reason}</td>
                  <td>{mc.diagnostic}</td>
                  <td>{mc.user_name}</td>
                  <td>
                    <button
                      className="btn btn-ghost"
                      onClick={() => {
                        onClickViewConsulta(mc);
                      }}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </fieldset>
    </section>
  );
};

// Componente DatosAlumnos con semántica mejorada
const DatosAlumnos = ({
  person,
  groupEnrollment,
}: {
  person: IPerson;
  groupEnrollment: IGroupEnrollment;
}) => {
  return (
    <section aria-labelledby="datos-alumno-title">
      <fieldset className="fieldset bg-base-200 border border-base-300 p-4 rounded-box">
        <legend id="datos-alumno-title" className="fieldset-legend text-base">
          Datos Alumno
        </legend>
        <div className="grid grid-cols-12 gap-4 pb-4">
          <div className="col-span-4">
            <label className="fieldset-label">IdAlumno</label>
            <span className="font-bold">{person.person_id}</span>
          </div>
          <div className="col-span-8">
            <label className="fieldset-label">Nombre</label>
            <span className="font-bold">{person.name}</span>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4 pb-4">
          <div className="col-span-4">
            <label className="fieldset-label">Ciclo</label>
            <span className="font-bold">{groupEnrollment.idCiclo}</span>
          </div>
          <div className="col-span-8">
            <label className="fieldset-label">Nivel</label>
            <span className="font-bold">{groupEnrollment.idNivel}</span>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4 pb-4">
          <div className="col-span-4">
            <label className="fieldset-label">Modalidad</label>
            <span className="font-bold">
              {groupEnrollment.idModalidadCarrera}
            </span>
          </div>
          <div className="col-span-4">
            <label className="fieldset-label">Grado</label>
            <span className="font-bold">{groupEnrollment.idGrado}</span>
          </div>
          <div className="col-span-4">
            <label className="fieldset-label">Grupo</label>
            <span className="font-bold">{groupEnrollment.idGrupo}</span>
          </div>
        </div>
      </fieldset>
    </section>
  );
};

// Componente FichaMedica con semántica mejorada

interface FichaMedicaProps {
  medicalRecord?: IMedicalRecord;
}
const FichaMedica: React.FC<FichaMedicaProps> = ({ medicalRecord }) => {
  const getBooleanLabel = (value: boolean | undefined) => (value ? "SI" : "NO");
  return (
    <section aria-labelledby="ficha-medica-title">
      <fieldset className="fieldset bg-base-200 border border-base-300 p-4 rounded-box">
        <legend id="ficha-medica-title" className="fieldset-legend text-base">
          Ficha Medica
        </legend>
        <div className="grid grid-cols-12 gap-4 pb-4">
          <div className="col-span-4">
            <label className="fieldset-label">Peso</label>
            <span className="font-bold">{medicalRecord?.peso}Kg</span>
          </div>
          <div className="col-span-4">
            <label className="fieldset-label">Estatura</label>
            <span className="font-bold">{medicalRecord?.estatura}m</span>
          </div>
          <div className="col-span-4">
            <label className="fieldset-label">Tipo Sanguíneo</label>
            <span className="font-bold">{medicalRecord?.tipoSangre}</span>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4 pb-4">
          <div className="col-span-4">
            <label className="fieldset-label">Es Alergico</label>
            <span className="font-bold">
              {getBooleanLabel(medicalRecord?.esAlergico)}
            </span>
          </div>
          <div className="col-span-8">
            <label className="fieldset-label">Alergias</label>
            <span className="font-bold">{medicalRecord?.alergias}</span>
          </div>
          <div className="col-span-4">
            <label className="fieldset-label">Alérgico Alimento</label>
            <span className="font-bold">
              {getBooleanLabel(medicalRecord?.alergicoAlimento)}
            </span>
          </div>
          <div className="col-span-4">
            <label className="fieldset-label">Alérgia Alimento</label>
            <span className="font-bold">{medicalRecord?.alimentoAlergia}</span>
          </div>
          <div className="col-span-4">
            <label className="fieldset-label">Alérgia Medicamento</label>
            <span className="font-bold">
              {medicalRecord?.medicamentoAlergia}
            </span>
          </div>
          <div className="col-span-4">
            <label className="fieldset-label">Sobrepeso</label>
            <span className="font-bold">{medicalRecord?.sobrepeso}</span>
          </div>
          <div className="col-span-4">
            <label className="fieldset-label">Diabetes</label>
            <span className="font-bold">
              {getBooleanLabel(medicalRecord?.diabetes)}
            </span>
          </div>
          <div className="col-span-4">
            <label className="fieldset-label">Enfermedad Corazón</label>
            <span className="font-bold">
              {getBooleanLabel(medicalRecord?.enfermedadCorazon)}
            </span>
          </div>
          <div className="col-span-4">
            <label className="fieldset-label">Amigdalitis</label>
            <span className="font-bold">
              {getBooleanLabel(medicalRecord?.amigdalitis)}
            </span>
          </div>
          <div className="col-span-4">
            <label className="fieldset-label">Bronquitis</label>
            <span className="font-bold">
              {getBooleanLabel(medicalRecord?.bronquitis)}
            </span>
          </div>
          <div className="col-span-4">
            <label className="fieldset-label">Anemia</label>
            <span className="font-bold">
              {getBooleanLabel(medicalRecord?.anemia)}
            </span>
          </div>
          <div className="col-span-4">
            <label className="fieldset-label">Hemorragias</label>
            <span className="font-bold">
              {getBooleanLabel(medicalRecord?.hemorragias)}
            </span>
          </div>
          <div className="col-span-4">
            <label className="fieldset-label">Hepatitis</label>
            <span className="font-bold">
              {getBooleanLabel(medicalRecord?.hepatitis)}
            </span>
          </div>
          <div className="col-span-4">
            <label className="fieldset-label">Epilepsia</label>
            <span className="font-bold">
              {getBooleanLabel(medicalRecord?.epilepsia)}
            </span>
          </div>
          <div className="col-span-4">
            <label className="fieldset-label">Neoplasias</label>
            <span className="font-bold">
              {getBooleanLabel(medicalRecord?.neoplasias)}
            </span>
          </div>
          <div className="col-span-4">
            <label className="fieldset-label">Fiebre Reumática</label>
            <span className="font-bold">
              {getBooleanLabel(medicalRecord?.fiebrereumatica)}
            </span>
          </div>
          <div className="col-span-4">
            <label className="fieldset-label">Cancer</label>
            <span className="font-bold">
              {getBooleanLabel(medicalRecord?.cancer)}
            </span>
          </div>
          <div className="col-span-4">
            <label className="fieldset-label">Crónicas</label>
            <span className="font-bold">
              {getBooleanLabel(medicalRecord?.controlaDieta)}
            </span>
          </div>
          <div className="col-span-8">
            <label className="fieldset-label">Otras Enfermedades</label>
            <span className="font-bold">{medicalRecord?.otras}</span>
          </div>
        </div>
      </fieldset>
    </section>
  );
};

interface ConsultaFormRef {
  submitForm: () => any;
  focusFirst: () => void;
}

interface ConsultaFormProps {
  medicalConsultation?: IMedicalConsultation;
}
const ConsultaForm = forwardRef<{}, ConsultaFormProps>(
  ({ medicalConsultation }, ref) => {
    const motivoConsultaRef = useRef<HTMLInputElement | null>(null);
    const searchParams = useSearchParams();
    const schoolId = searchParams.get("school_id") ?? "";

    const [medicalConsultationCategories, setMedicalConsultationCategories] =
      useState<IMedicalConsultationCategory[]>([]);
    const [medicalConsultationSubCategories, setMedicalConsultationSubCategories] =
      useState<IMedicalConsultationCategory[]>([]);
    const [insumos, setInsumos] = useState<IMedicalSupply[]>([]);
    const [selectedInsumos, setSelectedInsumos] = useState<IMedicalSupply[]>(
      medicalConsultation?.supplies ?? []
    );
    const [formData, setFormData] = useState({
      reason: medicalConsultation?.reason ?? "",
      diagnostic: medicalConsultation?.diagnostic ?? "",
      heart_rate: medicalConsultation?.heart_rate ?? "",
      respiratory_rate: medicalConsultation?.respiratory_rate ?? "",
      temperature: medicalConsultation?.temperature ?? "",
      blood_preassure_sis: medicalConsultation?.blood_preassure_sis ?? "",
      blood_preassure_dis: medicalConsultation?.blood_preassure_dis ?? "",
      oxygen_saturation: medicalConsultation?.oxygen_saturation ?? "",
      allergies: medicalConsultation?.allergies ?? "",
      category_id: medicalConsultation?.category_id ?? 0,
      sub_category_id: medicalConsultation?.sub_category_id ?? 0,
      treatment: medicalConsultation?.treatment ?? "",
      notes: medicalConsultation?.notes ?? "",
      user_name:
        medicalConsultation?.user_name ?? "GALLARDO HERNANDEZ MITZI MAYADEVI",
      insumo: "",
    });

    useEffect(() => {
      const fetchMedicalConsultationCategories = async () => {
        try {
          const categories = await medicalCategoryService.findAll(
            schoolId,
            1,
            1000
          );
          const subcategories = await medicalCategoryService.findAllSubCategories(
            schoolId,
            1,
            1000
          );
          setMedicalConsultationCategories(categories);
          setMedicalConsultationSubCategories(subcategories)
        } catch (error) {}
      };

      const fetchInsumos = async () => {
        try {
          const response = await medicalSupplyService.findAll(
            schoolId,
            1,
            1000
          );
          setInsumos(response);
        } catch (error) {}
      };

      fetchMedicalConsultationCategories();
      fetchInsumos();
    }, []);

    useImperativeHandle(ref, () => {
      return {
        submitForm: () => {
          return { ...formData, supply_ids: selectedInsumos.map((s) => s.id) };
        },
        focusFirst: () => {
          motivoConsultaRef.current?.focus();
        },
      };
    });

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const { name, value, type } = e.target;

      const isNumber = () => type === "number" || ["category_id", "sub_category_id"].includes(name);

      setFormData({
        ...formData,
        [name]: isNumber() ? Number(value) || "" : value,
      });
    };

    const addInsumo = () => {
      const newInsumo = insumos.find((i) => i.name === formData.insumo);
      if (!newInsumo) return;
      if (selectedInsumos.some((i) => i.name === newInsumo.name)) return;
      setSelectedInsumos((prev) => {
        return [...prev, newInsumo];
      });
      setFormData((prev) => {
        return {
          ...prev,
          insumo: "",
        };
      });
    };

    const deleteInsumo = (insumo: IMedicalSupply) => {
      const newInsumos = selectedInsumos.filter((i) => i.id !== insumo.id);
      setSelectedInsumos(newInsumos);
    };

    return (
      <div className="">
        <div className="grid grid-cols-12 gap-4 pb-4">
          <div className="col-span-12">
            <label className="fieldset-label label-required">
              Motivo Consulta
            </label>
            <input
              ref={motivoConsultaRef}
              className="input input-xs mt-2 w-full"
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
            />
          </div>
          <div className="col-span-12">
            <label className="fieldset-label">Diagnostico</label>
            <input
              className="input input-xs mt-2 w-full"
              type="text"
              name="diagnostic"
              value={formData.diagnostic}
              onChange={handleChange}
            />
          </div>
          <div className="col-span-4">
            <label className="fieldset-label">Frecuencia Cardiaca</label>
            <input
              className="input input-xs mt-2 w-full"
              type="number"
              name="heart_rate"
              value={formData.heart_rate}
              onChange={handleChange}
            />
          </div>
          <div className="col-span-4">
            <label className="fieldset-label">Ritmo Respiratorio</label>
            <input
              className="input input-xs mt-2 w-full"
              type="number"
              name="respiratory_rate"
              value={formData.respiratory_rate}
              onChange={handleChange}
            />
          </div>
          <div className="col-span-4">
            <label className="fieldset-label">Temperatura</label>
            <input
              className="input input-xs mt-2 w-full"
              type="number"
              name="temperature"
              value={formData.temperature}
              onChange={handleChange}
            />
          </div>
          <div className="col-span-4">
            <label className="fieldset-label">Presión Sistótlica</label>
            <input
              className="input input-xs mt-2 w-full"
              type="number"
              name="blood_preassure_sis"
              value={formData.blood_preassure_sis}
              onChange={handleChange}
            />
          </div>
          <div className="col-span-4">
            <label className="fieldset-label">Presión Distólica</label>
            <input
              className="input input-xs mt-2 w-full"
              type="number"
              name="blood_preassure_dis"
              value={formData.blood_preassure_dis}
              onChange={handleChange}
            />
          </div>
          <div className="col-span-4">
            <label className="fieldset-label">Saturación Oxigeno</label>
            <input
              className="input input-xs mt-2 w-full"
              type="number"
              name="oxygen_saturation"
              value={formData.oxygen_saturation}
              onChange={handleChange}
            />
          </div>
          <div className="col-span-12">
            <label className="fieldset-label">Alergias</label>
            <input
              className="input input-xs mt-2 w-full"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
            />
          </div>
          <div className="col-span-6">
            <label className="fieldset-label">Categoria</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="select input-xs mt-2 w-full"
            >
              <option value={0} key={0}>
                  -seleccione-
              </option>
              {medicalConsultationCategories.map((mcc) => (
                <option value={mcc.id} key={mcc.id}>
                  {mcc.description}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-6">
            <label className="fieldset-label">SubCategoria</label>
            <select
              name="sub_category_id"
              value={formData.sub_category_id}
              onChange={handleChange}
              className="select input-xs mt-2 w-full"
            >
              <option value={0} key={0}>
                  -seleccione-
              </option>
              {medicalConsultationSubCategories.map((mcc) => (
                <option value={mcc.id} key={mcc.id}>
                  {mcc.description}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-12">
            <label className="fieldset-label">Tratamiento</label>
            <input
              className="input input-xs mt-2 w-full"
              type="text"
              name="treatment"
              value={formData.treatment}
              onChange={handleChange}
            />
          </div>
          <div className="col-span-12">
            <label className="fieldset-label">Notas</label>
            <input
              className="input input-xs mt-2 w-full"
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
          <div className="col-span-12">
            <label className="fieldset-label">Atendió</label>
            <select
              name="user_name"
              value={formData.user_name}
              onChange={handleChange}
              className="select input-xs mt-2 w-full"
            >
              {[
                {
                  value: "GALLARDO HERNANDEZ MITZI MAYADEVI",
                  text: "GALLARDO HERNANDEZ MITZI MAYADEVI",
                },
                {
                  value: "GUZMAN RAMIREZ MARIBEL",
                  text: "GUZMAN RAMIREZ MARIBEL",
                },
                {
                  value: "HERNANDEZ MARTINEZ MIRNA EDITH",
                  text: "HERNANDEZ MARTINEZ MIRNA EDITH",
                },
                {
                  value: "PADILLA MARQUEZ GUSTAVO ALEJANDRO",
                  text: "PADILLA MARQUEZ GUSTAVO ALEJANDRO",
                },
              ].map((p) => (
                <option key={p.value}>{p.text}</option>
              ))}
            </select>
          </div>

          <div className="col-span-12">
            <label className="fieldset-label">Insumos</label>
            <div className="join">
              <select
                name="insumo"
                value={formData.insumo}
                onChange={handleChange}
                className="select input-xs mt-2 w-full"
              >
                {insumos.map((i) => (
                  <option key={i.id}>{i.name}</option>
                ))}
              </select>
              <button onClick={addInsumo} className="btn join-item btn-xs mt-2">
                Agregar Insumo
              </button>
            </div>
          </div>
        </div>
        <ul className="text-xs divide-y divide-gray-200  rounded w-full ">
          {selectedInsumos.map((insumo) => (
            <li
              key={insumo.id}
              className="flex items-center justify-between  py-2"
            >
              <span>{insumo.name}</span>
              <button
                onClick={() => deleteInsumo(insumo)}
                className="btn btn-square btn-ghost"
              >
                <svg
                  className="size-[1.2em]"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <g
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                  </g>
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
);

interface HeroProps {
  onSubmit: () => void;
}
const Hero: React.FC<HeroProps> = ({ onSubmit }) => {
  return (
    <div
      className="hero bg-base-200"
      style={{ minHeight: "calc(100vh - 70px)" }}
    >
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Servicio Medico</h1>
          <p className="py-6">
            Busca un alumno para consultar su ficha clinica y consultas medicas
          </p>
          <button onClick={onSubmit} className="btn btn-primary">
            Buscar Alumno
          </button>
        </div>
      </div>
    </div>
  );
};


export default function PageClient() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const consultaFormRef = useRef<ConsultaFormRef>(null);
  const [showModalConsulta, setShowModalConsulta] = useState(false);
  const [medicalConsultation, setMedicalConsultation] = useState<
    IMedicalConsultation | undefined
  >();
  const [groupEnrollment, setGroupEnrollment] =
    useState<IGroupEnrollment | null>(null);
  const [medicalConsultations, setMedicalConsultations] = useState<
    IMedicalConsultation[]
  >([]);
  const [person, setPerson] = useState<IPerson | null>(null);
  const [medicalRecord, setMedicalRecord] = useState<IMedicalRecord>();
  const searchParams = useSearchParams();
  const schoolId = searchParams.get("school_id") ?? "";

  useEffect(() => {
    if (showModalConsulta) {
      setTimeout(() => {
        consultaFormRef.current?.focusFirst();
      }, 100);
    }
  }, [showModalConsulta]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === "Escape") {
        setShowModalConsulta(false);
      }
      if (event.ctrlKey && event.key.toLowerCase() === "m") {
        event.preventDefault();
        if (!showModalConsulta) {
          setShowModalConsulta(true);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, []);

  const handleSubmitConsulta = async () => {
    try {
      if (!consultaFormRef.current || !person) return;
      const formData = consultaFormRef.current.submitForm();
      const dto: ICreateMedicalConsultationDto = {
        ...formData,
        ...person,
        relative_call: false,
        send_back_home: false,
      };
      if (medicalConsultation) {
        await medicalConsultationService.update({
          schoolId,
          id: medicalConsultation.id,
          dto,
        });
      } else {
        await medicalConsultationService.create({ schoolId, dto });
      }

      setShowModalConsulta(false);
      await handleSelectPerson(person);
    } catch (error) {
      console.log(error.message);
      alert(error.message);
    }
  };

  const handleSelectPerson = async (person: IPerson) => {
    try {
      const params = {
        person_id: person.person_id,
        schoolId,
      };
      const res = await medicalConsultationService.findByPerson(params);
      const ge = await medicalConsultationService.findGroupEnrollment(params);
      const mr = await medicalConsultationService.findMedicalRecord(params);

      setMedicalRecord(mr);
      setMedicalConsultations(res);
      setGroupEnrollment(ge);
      setPerson(person);
    } catch (error) {
      console.log(error.message);
      alert("Error al cargar medical consultation");
    }
  };

  const handleClickViewConsulta = (mc: IMedicalConsultation) => {
    console.log(mc);
    setMedicalConsultation(mc);
    setShowModalConsulta(true);
  };

  const handleClickNuevaConsulta = () => {
    setMedicalConsultation(undefined);
    setShowModalConsulta(true);
  };

  return (
    <>
      <Head>
        <title>About Uss</title>
      </Head>
      <main data-theme="light" className="h-screen">
          <MyHeader ref={inputRef} onSelectPerson={handleSelectPerson} />
          {person === null ? (
            <Hero
              onSubmit={() => {
                inputRef.current?.focus();
              }}
            />
          ) : (
            <>
              <div className="grid grid-cols-12 gap-4 p-4">
                <aside className="col-span-4">
                  <DatosAlumnos
                    person={person}
                    groupEnrollment={groupEnrollment!}
                  />
                  <FichaMedica medicalRecord={medicalRecord} />
                </aside>
                <section className="col-span-8">
                  <Consultas
                    medicalConsultations={medicalConsultations}
                    onClickNuevasConsultas={handleClickNuevaConsulta}
                    onClickViewConsulta={handleClickViewConsulta}
                  />
                </section>
              </div>
              {showModalConsulta && (
                <dialog
                  id="my_modal_5"
                  className="modal modal-middle modal-open"
                >
                  <div className="modal-box">
                    <h3 className="font-bold text-lg">
                      {medicalConsultation ? "Editar" : "Crear"} consulta
                    </h3>
                    <p className="text-gray-600 text-sm">
                      <span className="font-bold">{person.person_id}</span>{" "}
                      {person.first_name} {person.second_name}
                    </p>
                    <div className="py-4 text-xs">
                      <ConsultaForm
                        ref={consultaFormRef}
                        medicalConsultation={medicalConsultation}
                      />
                    </div>
                    <div className="modal-action">
                      <form method="dialog">
                        <button
                          className={`btn ${
                            medicalConsultation ? "btn-info" : "btn-success"
                          }`}
                          onClick={handleSubmitConsulta}
                        >
                          {medicalConsultation ? "Editar" : "Crear"}
                        </button>
                        <button
                          className="btn ml-4"
                          onClick={() => {
                            setShowModalConsulta(false);
                          }}
                        >
                          Cancelar
                        </button>
                      </form>
                    </div>
                  </div>
                </dialog>
              )}
            </>
          )}
      </main>
    </>
  );
}


