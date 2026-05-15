"use client";

import { useEffect } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  AcademicSelector,
  RecipientTypeSelector,
  RecipientTable,
} from "@/app/(admin)/apps/publications/components";
import {
  useAcademicData,
  useRecipients,
  useSelections,
  useUserRole,
} from "@/app/(admin)/apps/publications/hooks";
import { PollFormCard } from "./components";
import { usePollForm } from "./hooks";

interface PollsAppProps {
  pollId?: string;
}

const PollsApp = ({ pollId }: PollsAppProps) => {
  const userRole = useUserRole();
  const academicData = useAcademicData();
  const selections = useSelections();
  const recipientsData = useRecipients();
  const pollForm = usePollForm(pollId);

  const isAdmin = userRole === "admin";

  useEffect(() => {
    academicData.loadAcademicPrograms(selections.selectedAcademicStages);
    selections.setSelectedAcademicPrograms(new Set());
  }, [selections.selectedAcademicStages]);

  useEffect(() => {
    academicData.loadProgramYears(
      selections.selectedAcademicStages,
      selections.selectedAcademicPrograms
    );
    selections.setSelectedProgramYears(new Set());
  }, [selections.selectedAcademicStages, selections.selectedAcademicPrograms]);

  useEffect(() => {
    academicData.loadAcademicGroups(selections.selectedProgramYears);
    selections.setSelectedAcademicGroups(new Set());
  }, [selections.selectedProgramYears]);

  useEffect(() => {
    recipientsData.clearRecipients();
    selections.setSelectedRecipients(new Set());
  }, [
    selections.selectedRecipientTypes,
    selections.selectedAcademicYears,
    selections.selectedAcademicStages,
    selections.selectedAcademicPrograms,
    selections.selectedProgramYears,
    selections.selectedAcademicGroups,
  ]);

  const handleLoadRecipients = () => {
    recipientsData.loadRecipients(
      selections.selectedRecipientTypes,
      {
        academic_years: selections.selectedAcademicYears.size > 0
          ? Array.from(selections.selectedAcademicYears)
          : undefined,
        academic_stages: selections.selectedAcademicStages.size > 0
          ? Array.from(selections.selectedAcademicStages)
          : undefined,
        academic_programs: selections.selectedAcademicPrograms.size > 0
          ? Array.from(selections.selectedAcademicPrograms)
          : undefined,
        program_years: selections.selectedProgramYears.size > 0
          ? Array.from(selections.selectedProgramYears)
          : undefined,
        academic_groups: selections.selectedAcademicGroups.size > 0
          ? Array.from(selections.selectedAcademicGroups)
          : undefined,
      },
      userRole
    );
  };

  const handleSave = (publish: boolean) => {
    pollForm.handleSave(selections.selectedRecipients, {
      academicYears: selections.selectedAcademicYears,
      academicStages: selections.selectedAcademicStages,
      academicPrograms: selections.selectedAcademicPrograms,
      programYears: selections.selectedProgramYears,
      academicGroups: selections.selectedAcademicGroups,
    }, publish);
  };

  if (pollForm.loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner message="Cargando encuesta..." />
      </div>
    );
  }

  if (pollForm.error) {
    return (
      <div className="alert alert-error">
        <span className="iconify lucide--alert-circle size-6"></span>
        <div>
          <h3 className="font-bold">Error</h3>
          <div className="text-sm">{pollForm.error}</div>
        </div>
      </div>
    );
  }

  const isOnlyUser =
    selections.selectedRecipientTypes.size === 1 &&
    selections.selectedRecipientTypes.has("USER");

  const shouldShowAcademicSelectors = !isOnlyUser;

  const shouldShowForm =
    selections.selectedAcademicYears.size > 0 ||
    selections.selectedAcademicStages.size > 0 ||
    isOnlyUser ||
    !!pollId;

  return (
    <div className="bg-base-100 rounded-lg shadow-sm">
      <div className="p-6 border-b border-base-300">
        <h2 className="text-2xl font-bold text-base-content">
          {pollId ? "Editar encuesta" : "Nueva encuesta"}
        </h2>
        <p className="text-base-content/70 mt-1">
          {pollId
            ? "Modifica los datos y preguntas de la encuesta"
            : "Configura los destinatarios y crea las preguntas"}
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Recipient type selector — create only */}
        {!pollId && (
          <RecipientTypeSelector
            selected={selections.selectedRecipientTypes}
            onToggle={selections.handleRecipientTypeToggle}
            onSelectAll={selections.handleSelectAllRecipientTypes}
            userRole={userRole}
          />
        )}

        {/* Academic selectors — create only */}
        {!pollId && shouldShowAcademicSelectors && (
          <AcademicSelector
            title="Años Académicos"
            icon="lucide--calendar"
            items={academicData.academicYears}
            selected={selections.selectedAcademicYears}
            onToggle={selections.handleAcademicYearToggle}
            onSelectAll={(isSelected) =>
              selections.handleSelectAllAcademicYears(
                academicData.academicYears.map((y) => y.id),
                isSelected
              )
            }
            loading={academicData.loading}
            error={academicData.error}
            renderLabel={(year) => year.academic_year_key}
            emptyMessage="No se encontraron años académicos activos"
          />
        )}

        {!pollId && isAdmin && shouldShowAcademicSelectors && (
          <AcademicSelector
            title="Niveles Académicos"
            icon="lucide--graduation-cap"
            items={academicData.academicStages}
            selected={selections.selectedAcademicStages}
            onToggle={selections.handleAcademicStageToggle}
            onSelectAll={(isSelected) =>
              selections.handleSelectAllAcademicStages(
                academicData.academicStages.map((s) => s.id),
                isSelected
              )
            }
            loading={academicData.loading}
            error={academicData.error}
            renderLabel={(stage) => `(${stage.academic_stage_key}) ${stage.description}`}
            emptyMessage="No se encontraron niveles académicos"
          />
        )}

        {!pollId && isAdmin && selections.selectedAcademicStages.size > 0 && (
          <AcademicSelector
            title="Programas Académicos"
            icon="lucide--book-open"
            items={academicData.academicPrograms}
            selected={selections.selectedAcademicPrograms}
            onToggle={selections.handleAcademicProgramToggle}
            onSelectAll={(isSelected) =>
              selections.handleSelectAllAcademicPrograms(
                academicData.academicPrograms.map((p) => p.id),
                isSelected
              )
            }
            renderLabel={(p) => `(${p.academic_program_key}) ${p.description}`}
            emptyMessage="No se encontraron programas académicos"
          />
        )}

        {!pollId && selections.selectedAcademicStages.size > 0 && selections.selectedAcademicPrograms.size > 0 && (
          <AcademicSelector
            title="Años de Programa"
            icon="lucide--layers"
            items={academicData.programYears}
            selected={selections.selectedProgramYears}
            onToggle={selections.handleProgramYearToggle}
            onSelectAll={(isSelected) =>
              selections.handleSelectAllProgramYears(
                academicData.programYears.map((y) => y.id),
                isSelected
              )
            }
            renderLabel={(y) => `${y.description} (${y.academic_stage.academic_stage_key})`}
            emptyMessage="No se encontraron años de programa"
          />
        )}

        {!pollId && selections.selectedProgramYears.size > 0 && (
          <AcademicSelector
            title="Grupos Académicos"
            icon="lucide--users"
            items={academicData.academicGroups}
            selected={selections.selectedAcademicGroups}
            onToggle={selections.handleAcademicGroupToggle}
            onSelectAll={(isSelected) =>
              selections.handleSelectAllAcademicGroups(
                academicData.academicGroups.map((g) => g.id),
                isSelected
              )
            }
            renderLabel={(g) => `${g.label} (${g.academic_stage.academic_stage_key})`}
            emptyMessage="No se encontraron grupos académicos"
          />
        )}

        {/* Recipient table — create only */}
        {!pollId && selections.selectedRecipientTypes.size > 0 && (
          <RecipientTable
            recipients={recipientsData.recipients}
            selected={selections.selectedRecipients}
            loading={recipientsData.loading}
            error={recipientsData.error}
            onToggle={selections.handleRecipientToggle}
            onSelectAll={(isSelected) =>
              selections.handleSelectAllRecipients(
                recipientsData.recipients.map((r) => r.person_id),
                isSelected
              )
            }
            onLoadRecipients={handleLoadRecipients}
            selectedRecipientTypes={selections.selectedRecipientTypes}
          />
        )}

        {/* Empty state prompt */}
        {!pollId &&
          !academicData.loading &&
          !academicData.error &&
          academicData.academicYears.length > 0 &&
          selections.selectedAcademicYears.size === 0 &&
          selections.selectedAcademicStages.size === 0 &&
          !isOnlyUser && (
            <div className="text-center py-12">
              <span className="iconify lucide--bar-chart-2 size-16 text-base-content/30 mb-4"></span>
              <h3 className="text-lg font-medium text-base-content mb-2">
                Selecciona destinatarios
              </h3>
              <p className="text-base-content/70">
                Para crear una encuesta, selecciona los años académicos y niveles
              </p>
            </div>
          )}

        {/* Two-step form */}
        {shouldShowForm && (
          <PollFormCard
            pollId={pollId}
            formData={pollForm.formData}
            onFieldChange={pollForm.updateFormField}
            questions={pollForm.questions}
            questionTypes={pollForm.questionTypes}
            onAddQuestion={pollForm.addQuestion}
            onUpdateQuestion={(localId, data) => pollForm.updateQuestion(localId, data)}
            onDeleteQuestion={pollForm.deleteQuestion}
            onMoveQuestion={pollForm.moveQuestion}
            onSave={handleSave}
            saveLoading={pollForm.saveLoading}
            saveError={pollForm.saveError}
          />
        )}
      </div>
    </div>
  );
};

export default PollsApp;
