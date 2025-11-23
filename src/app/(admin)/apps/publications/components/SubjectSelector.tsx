import { SubjectEnrollment } from "@/services/subject-enrollment.service";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface SubjectSelectorProps {
    subjects: SubjectEnrollment[];
    selectedSubject: string | null;
    onSelect: (subjectId: string | null) => void;
    loading: boolean;
    error: string | null;
}

export const SubjectSelector = ({
    subjects,
    selectedSubject,
    onSelect,
    loading,
    error
}: SubjectSelectorProps) => {
    // Agrupar materias únicas por subject_id
    const uniqueSubjects = subjects.reduce((acc, enrollment) => {
        if (!acc.find(s => s.subject_id === enrollment.subject_id)) {
            acc.push(enrollment);
        }
        return acc;
    }, [] as SubjectEnrollment[]);

    return (
        <div className="card card-border bg-base-100 shadow-lg">
            <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="card-title text-lg">
                        <span className="iconify lucide--book-open size-5"></span>
                        Selecciona la Materia
                    </h3>
                    {selectedSubject && (
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => onSelect(null)}
                        >
                            <span className="iconify lucide--x size-4"></span>
                            Limpiar selección
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <LoadingSpinner message="Cargando materias..." />
                    </div>
                ) : error ? (
                    <div className="alert alert-error shadow-lg">
                        <span className="iconify lucide--alert-circle size-6"></span>
                        <div>
                            <h3 className="font-bold">Error</h3>
                            <div className="text-sm">{error}</div>
                        </div>
                    </div>
                ) : uniqueSubjects.length === 0 ? (
                    <div className="text-center py-8">
                        <span className="iconify lucide--book-open size-16 text-base-content/30 mb-4"></span>
                        <p className="text-base-content/70">
                            No se encontraron materias para los años académicos seleccionados
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {uniqueSubjects.map((subject) => (
                                <div
                                    key={subject.subject_id}
                                    className={`card border-2 cursor-pointer transition-all duration-200 ${
                                        selectedSubject === subject.subject_id
                                            ? 'border-primary bg-primary/10'
                                            : 'border-base-300 hover:border-base-400'
                                    }`}
                                    onClick={() => onSelect(subject.subject_id)}
                                >
                                    <div className="card-body p-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                                                selectedSubject === subject.subject_id
                                                    ? 'bg-primary text-primary-content'
                                                    : 'bg-base-200'
                                            }`}>
                                                <span className="iconify lucide--book size-5"></span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-sm truncate">
                                                    {subject.subject_name || 'Sin nombre'}
                                                </h4>
                                                <p className="text-xs text-base-content/60">
                                                    Código: {subject.subject_id}
                                                </p>
                                                {subject.academic_group_label && (
                                                    <p className="text-xs text-base-content/60">
                                                        Grupo: {subject.academic_group_label}
                                                    </p>
                                                )}
                                                <p className="text-xs text-base-content/60">
                                                    {subject.program_year_description} - {subject.academic_program_description}
                                                </p>
                                            </div>
                                            {selectedSubject === subject.subject_id && (
                                                <span className="iconify lucide--check-circle size-5 text-primary flex-shrink-0"></span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
