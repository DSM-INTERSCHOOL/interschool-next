import { CommercePersonRead } from "@/interfaces/ICommercePerson";
import { usePersonSearch } from "../hooks/usePersonSearch";

interface ClientSearchScreenProps {
  onSelect: (client: CommercePersonRead) => void;
  onSkip: () => void;
}

export const fullName = (person: CommercePersonRead) =>
  [person.given_name, person.paternal_name, person.maternal_name].filter(Boolean).join(" ") ||
  person.person_internal_id;

// person.type is a denormalized copy of interschool-core's PersonType
// (ACADEMIC | TEACHER | STUDENT | RELATIVE | USER | EMPLOYEE) -- labeled
// here for display, falling back to the raw value for anything not in
// this list rather than hiding it.
const PERSON_TYPE_LABELS: Record<string, string> = {
  STUDENT: "Estudiante",
  TEACHER: "Profesor",
  RELATIVE: "Familiar",
  USER: "Usuario",
  ACADEMIC: "Académico",
  EMPLOYEE: "Empleado",
};

export const typeLabel = (type: string | null) => (type ? PERSON_TYPE_LABELS[type] ?? type : null);

export function ClientSearchScreen({ onSelect, onSkip }: ClientSearchScreenProps) {
  const { query, setQuery, results, loading, error } = usePersonSearch();

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center gap-6 overflow-y-auto bg-base-200 p-8">
      <div className="flex w-full max-w-xl flex-col items-center gap-2 text-center">
        <span className="iconify lucide--user-search size-14 text-primary"></span>
        <h1 className="text-3xl font-bold">Buscar cliente</h1>
        <p className="text-base-content/60">Busca por nombre, correo o ID para iniciar la orden</p>
      </div>

      <div className="relative w-full max-w-xl">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nombre, correo o ID del cliente"
          autoFocus
          className="input input-bordered input-lg h-auto w-full rounded-2xl px-6 py-4 text-xl"
        />
        {loading && (
          <span className="loading loading-spinner loading-sm absolute right-5 top-1/2 -translate-y-1/2"></span>
        )}
      </div>

      {error && (
        <div className="alert alert-error w-full max-w-xl">
          <span className="iconify lucide--alert-circle size-5"></span>
          <span>{error}</span>
        </div>
      )}

      <div className="w-full max-w-xl flex-1">
        {results.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {results.map((person) => (
              <li key={person.person_internal_id}>
                <button
                  type="button"
                  onClick={() => onSelect(person)}
                  className="card w-full bg-base-100 p-4 text-left shadow transition hover:shadow-lg active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <span className="iconify lucide--user-round size-8 text-primary"></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold">{fullName(person)}</p>
                        {typeLabel(person.type) && (
                          <span className="badge badge-ghost badge-sm">{typeLabel(person.type)}</span>
                        )}
                      </div>
                      {person.email && <p className="text-sm text-base-content/60">{person.email}</p>}
                      <p className="text-sm text-base-content/50">ID: {person.person_internal_id}</p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          query.trim().length >= 2 &&
          !loading && (
            <p className="text-center text-base-content/50">Sin resultados para &quot;{query}&quot;</p>
          )
        )}
      </div>

      <button type="button" onClick={onSkip} className="btn btn-ghost">
        Continuar sin seleccionar cliente
      </button>
    </div>
  );
}
