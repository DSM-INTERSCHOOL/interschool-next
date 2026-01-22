import { SubjectEnrollment } from "@/services/subject-enrollment.service";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface SubjectSelectorProps {
    subjects: SubjectEnrollment[];
    selectedSubjects: Set<string>;
    onToggle: (subjectId: string, isSelected: boolean) => void;
    onSelectAll: (isSelected: boolean) => void;
    loading: boolean;
    error: string | null;
}

export const SubjectSelector = ({
    subjects,
    selectedSubjects,
    onToggle,
    onSelectAll,
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
                        Selecciona las Materias
                    </h3>
                    <div className="text-sm text-base-content/70">
                        {selectedSubjects.size} de {uniqueSubjects.length} seleccionadas
                    </div>
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
                        {/* Checkbox para seleccionar todas */}
                        <div className="flex items-center gap-3 p-3 border border-base-300 rounded-lg bg-base-200">
                            <label className="label cursor-pointer flex items-center gap-3 p-0">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary"
                                    checked={selectedSubjects.size === uniqueSubjects.length && uniqueSubjects.length > 0}
                                    onChange={(e) => onSelectAll(e.target.checked)}
                                />
                                <span className="font-medium text-base-content">
                                    Seleccionar todas las materias
                                </span>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {uniqueSubjects.map((subject) => {
                                const isSelected = selectedSubjects.has(subject.subject_id);

                                return (
                                    <div
                                        key={subject.subject_id}
                                        className={`card border-2 transition-all duration-200 ${
                                            isSelected
                                                ? 'border-primary bg-primary/10'
                                                : 'border-base-300 hover:border-base-400'
                                        }`}
                                    >
                                        <div className="card-body p-4">
                                            <div className="flex items-center gap-3">
                                                <label className="cursor-pointer flex items-center gap-3 flex-1">
                                                    <input
                                                        type="checkbox"
                                                        className="checkbox checkbox-primary checkbox-sm"
                                                        checked={isSelected}
                                                        onChange={(e) => onToggle(subject.subject_id, e.target.checked)}
                                                    />
                                                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                                                        isSelected
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
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
