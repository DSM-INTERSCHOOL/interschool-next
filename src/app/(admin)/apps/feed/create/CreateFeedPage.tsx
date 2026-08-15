"use client";

import { useState, useEffect } from "react";
import { useAppRouter as useRouter } from "@/hooks/useAppRouter";
import { AppLink as Link } from "@/components/AppLink";
import { useAuthStore } from "@/store/useAuthStore";
import { getOrgConfig } from "@/lib/orgConfig";
import { createFeed } from "@/services/feed.service";
import { getActiveAcademicYears } from "@/services/academic-year.service";
import { getRecipientsWithEnrollmentFilters } from "@/services/recipient.service";
import { PersonType, IRecipient } from "@/interfaces/IRecipient";
import { RecipientModeSelector } from "../components/RecipientModeSelector";
import { AttachmentsManager } from "@/app/(admin)/apps/publications/components/AttachmentsManager";
import { communicationService, AttachmentResponse } from "@/services/communication.service";
import {
  RecipientTypeSelector,
  AcademicSelector,
  RecipientTable,
} from "@/app/(admin)/apps/publications/components";
import {
  useAcademicData,
  useSelections,
  useRecipients,
  useUserRole,
} from "@/app/(admin)/apps/publications/hooks";

type RecipientMode = "todos" | "especificos";

const nowISO = () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
const oneYearFromNow = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
};

export default function CreateFeedPage() {
  const router = useRouter();
  const personId = useAuthStore((s) => s.personId);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [content, setContent] = useState("");
  const [acceptComments, setAcceptComments] = useState(true);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Recipient mode ─────────────────────────────────────────────────────────
  const [recipientMode, setRecipientMode] = useState<RecipientMode>("todos");

  // ── "Todos" mode state ─────────────────────────────────────────────────────
  const [allRecipients, setAllRecipients] = useState<IRecipient[]>([]);
  const [loadingAllRecipients, setLoadingAllRecipients] = useState(false);

  // ── "Selección específica" hooks ───────────────────────────────────────────
  const userRole = useUserRole();
  const academicData = useAcademicData();
  const selections = useSelections();
  const recipientsData = useRecipients();
  const isAdmin = userRole === "admin";

  // ── Load all recipients when mode is "todos" ───────────────────────────────
  useEffect(() => {
    if (recipientMode !== "todos") return;
    const loadAllRecipients = async () => {
      setLoadingAllRecipients(true);
      try {
        const activeYears = await getActiveAcademicYears();
        if (activeYears.length === 0) { setAllRecipients([]); return; }
        const recipients = await getRecipientsWithEnrollmentFilters(
          [PersonType.STUDENT, PersonType.RELATIVE, PersonType.TEACHER, PersonType.USER],
          { academic_years: activeYears.map((y) => y.id) }
        );
        setAllRecipients(recipients);
      } catch {
        setAllRecipients([]);
      } finally {
        setLoadingAllRecipients(false);
      }
    };
    loadAllRecipients();
  }, [recipientMode]);

  // ── Cascade effects for "especificos" mode ─────────────────────────────────
  useEffect(() => {
    if (recipientMode !== "especificos") return;
    academicData.loadAcademicPrograms(selections.selectedAcademicStages);
    selections.setSelectedAcademicPrograms(new Set());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selections.selectedAcademicStages]);

  useEffect(() => {
    if (recipientMode !== "especificos") return;
    academicData.loadProgramYears(selections.selectedAcademicStages, selections.selectedAcademicPrograms);
    selections.setSelectedProgramYears(new Set());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selections.selectedAcademicStages, selections.selectedAcademicPrograms]);

  useEffect(() => {
    if (recipientMode !== "especificos") return;
    academicData.loadAcademicGroups(selections.selectedProgramYears);
    selections.setSelectedAcademicGroups(new Set());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selections.selectedProgramYears]);

  useEffect(() => {
    if (recipientMode !== "especificos") return;
    recipientsData.clearRecipients();
    selections.setSelectedRecipients(new Set());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selections.selectedRecipientTypes,
    selections.selectedAcademicYears,
    selections.selectedAcademicStages,
    selections.selectedAcademicPrograms,
    selections.selectedProgramYears,
    selections.selectedAcademicGroups,
  ]);

  const handleModeChange = (mode: RecipientMode) => {
    // Reset specific selections when switching modes
    if (mode === "todos") {
      selections.setSelectedRecipientTypes(new Set());
      selections.setSelectedAcademicYears(new Set());
      selections.setSelectedAcademicStages(new Set());
      selections.setSelectedAcademicPrograms(new Set());
      selections.setSelectedProgramYears(new Set());
      selections.setSelectedAcademicGroups(new Set());
      selections.setSelectedRecipients(new Set());
      recipientsData.clearRecipients();
    }
    setRecipientMode(mode);
  };

  const handleLoadRecipients = () => {
    recipientsData.loadRecipients(
      selections.selectedRecipientTypes,
      {
        academic_years: selections.selectedAcademicYears.size > 0
          ? Array.from(selections.selectedAcademicYears) : undefined,
        academic_stages: selections.selectedAcademicStages.size > 0
          ? Array.from(selections.selectedAcademicStages) : undefined,
        academic_programs: selections.selectedAcademicPrograms.size > 0
          ? Array.from(selections.selectedAcademicPrograms) : undefined,
        program_years: selections.selectedProgramYears.size > 0
          ? Array.from(selections.selectedProgramYears) : undefined,
        academic_groups: selections.selectedAcademicGroups.size > 0
          ? Array.from(selections.selectedAcademicGroups) : undefined,
      },
      userRole
    );
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!content.trim() || !personId) return;
    const { schoolId } = getOrgConfig();
    if (!schoolId) return;

    if (recipientMode === "especificos" && selections.selectedRecipients.size === 0) {
      setError("Debes seleccionar al menos un destinatario.");
      return;
    }

    const personsArray =
      recipientMode === "todos"
        ? allRecipients.map((r) => String(r.person_id))
        : Array.from(selections.selectedRecipients).map(String);

    try {
      setError(null);

      // ── Upload attachments sequentially (abort all on first failure) ──────
      let uploadedAttachments: AttachmentResponse[] = [];
      if (pendingFiles.length > 0) {
        setUploading(true);
        try {
          for (const file of pendingFiles) {
            const res = await communicationService.uploadAttachment(schoolId, file);
            uploadedAttachments.push({ ...res, is_inline: true });
          }
        } catch (uploadErr: unknown) {
          setError(
            uploadErr instanceof Error
              ? `Error al subir archivo: ${uploadErr.message}`
              : "Error al subir un archivo. Intenta de nuevo."
          );
          return;
        } finally {
          setUploading(false);
        }
      }

      setSubmitting(true);
      const newFeed = await createFeed({
        schoolId,
        dto: {
          title: "Noticia App",
          publisher_person_id: String(personId),
          content: `<p>${content.trim()}</p>`,
          start_date: nowISO(),
          end_date: oneYearFromNow(),
          accept_comments: acceptComments,
          created_by: String(personId),
          status: "ACTIVO",
          authorized: true,
          persons: personsArray,
          academic_years: recipientMode === "especificos"
            ? Array.from(selections.selectedAcademicYears).map(String) : [],
          academic_stages: recipientMode === "especificos"
            ? Array.from(selections.selectedAcademicStages).map(String) : [],
          academic_programs: recipientMode === "especificos"
            ? Array.from(selections.selectedAcademicPrograms).map(String) : [],
          academic_modalities: [],
          program_years: recipientMode === "especificos"
            ? Array.from(selections.selectedProgramYears).map(String) : [],
          academic_groups: recipientMode === "especificos"
            ? Array.from(selections.selectedAcademicGroups).map(String) : [],
          attachments: uploadedAttachments,
        },
      });
      router.push(`/apps/feed?highlightId=${newFeed.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "No se pudo publicar la noticia. Intenta de nuevo.");
      setSubmitting(false);
    }
  };

  const isOnlyUser =
    selections.selectedRecipientTypes.size > 0 &&
    !selections.selectedRecipientTypes.has("STUDENT") &&
    !selections.selectedRecipientTypes.has("RELATIVE") &&
    !selections.selectedRecipientTypes.has("TEACHER");

  // Show academic cascade only when at least one academic-type is selected
  const hasAcademicTypes =
    selections.selectedRecipientTypes.has("STUDENT") ||
    selections.selectedRecipientTypes.has("RELATIVE") ||
    selections.selectedRecipientTypes.has("TEACHER");

  const busy = submitting || uploading;
  const canSubmit =
    !!content.trim() &&
    !busy &&
    (recipientMode === "todos"
      ? !loadingAllRecipients
      : selections.selectedRecipients.size > 0);

  return (
    <>
      <div className="mt-6 max-w-2xl mx-auto space-y-4">

        {/* ── Main form card ─────────────────────────────────────────────── */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-5 space-y-4">

            <div className="flex items-center gap-2">
              <span className="iconify lucide--pencil size-5 text-primary" />
              <h2 className="card-title text-lg">Nueva noticia</h2>
            </div>

            {/* Content */}
            <div className="form-control flex flex-col gap-1">
              <p className="text-sm font-medium">
                Contenido <span className="text-error">*</span>
              </p>
              <textarea
                className="textarea textarea-bordered focus:textarea-primary resize-none text-sm w-full"
                rows={6}
                placeholder="¿Qué quieres compartir con tu comunidad?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={busy}
              />
            </div>

            {/* Accept comments */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="toggle toggle-primary toggle-sm"
                  checked={acceptComments}
                  onChange={(e) => setAcceptComments(e.target.checked)}
                  disabled={submitting || uploading}
                />
                <span className="label-text">Permitir comentarios</span>
              </label>
            </div>

            {/* Attachments */}
            <AttachmentsManager
              attachments={pendingFiles}
              existingAttachments={[]}
              onAdd={(file) => setPendingFiles((prev) => [...prev, file])}
              onRemove={(index) =>
                setPendingFiles((prev) => prev.filter((_, i) => i !== index))
              }
              onRemoveExisting={() => {}}
              publicationType="announcement"
              accept="image/*,video/*"
            />

            {/* Recipient mode */}
            <RecipientModeSelector
              mode={recipientMode}
              onChange={handleModeChange}
              totalCount={loadingAllRecipients ? null : allRecipients.length}
              loading={loadingAllRecipients}
              selectedCount={selections.selectedRecipients.size}
              disabled={busy}
            />

            {/* Error */}
            {error && (
              <div className="alert alert-error py-2">
                <span className="iconify lucide--alert-circle size-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-base-200">
              <Link href="/apps/feed" className="btn btn-ghost btn-sm">
                Cancelar
              </Link>
              <button
                className="btn btn-primary btn-sm"
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                {uploading
                  ? <><span className="loading loading-spinner loading-xs" /> Subiendo archivos…</>
                  : submitting
                  ? <><span className="loading loading-spinner loading-xs" /> Publicando…</>
                  : <><span className="iconify lucide--send size-4" /> Publicar</>
                }
              </button>
            </div>
          </div>
        </div>

        {/* ── Recipient selectors (only in "especificos" mode) ────────────── */}
        {recipientMode === "especificos" && (
          <div className="space-y-4">

            {/* Tipo de destinatario */}
            <RecipientTypeSelector
              selected={selections.selectedRecipientTypes}
              onToggle={selections.handleRecipientTypeToggle}
              onSelectAll={selections.handleSelectAllRecipientTypes}
              userRole={userRole}
            />

            {/* Años académicos */}
            {hasAcademicTypes && (
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

            {/* Niveles académicos (admin only) */}
            {isAdmin && hasAcademicTypes && (
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
                emptyMessage="No se encontraron niveles académicos activos"
              />
            )}

            {/* Programas académicos */}
            {isAdmin && selections.selectedAcademicStages.size > 0 && (
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
                renderLabel={(program) => `(${program.academic_program_key}) ${program.description}`}
                emptyMessage="No se encontraron programas académicos para los niveles seleccionados"
              />
            )}

            {/* Años de programa */}
            {selections.selectedAcademicStages.size > 0 &&
              selections.selectedAcademicPrograms.size > 0 && (
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
                renderLabel={(year) =>
                  `${year.description} (${year.academic_stage.academic_stage_key})`
                }
                emptyMessage="No se encontraron años de programa para la combinación seleccionada"
              />
            )}

            {/* Grupos académicos */}
            {selections.selectedProgramYears.size > 0 && (
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
                renderLabel={(group) =>
                  `${group.label} (${group.academic_stage.academic_stage_key})`
                }
                emptyMessage="No se encontraron grupos académicos para los años de programa seleccionados"
              />
            )}

            {/* Tabla de destinatarios */}
            {selections.selectedRecipientTypes.size > 0 && (
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
          </div>
        )}
      </div>
    </>
  );
}
