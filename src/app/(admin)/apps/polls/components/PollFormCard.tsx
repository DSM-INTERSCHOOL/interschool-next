"use client";

import { useState } from "react";
import { PollFormData, LocalQuestion } from "../hooks/usePollForm";
import { PollQuestionType } from "@/interfaces/IPoll";
import { QuestionFormPanel } from "./QuestionFormPanel";

const TYPE_LABELS: Record<string, string> = {
  SINGLE_CHOICE: "Opción única",
  MULTIPLE_CHOICE: "Opción múltiple",
  TEXT: "Texto libre",
  RATING: "Calificación",
  BOOLEAN: "Sí / No",
  LIKERT: "Escala Likert",
};

const TYPE_COLORS: Record<string, string> = {
  SINGLE_CHOICE: "badge-primary",
  MULTIPLE_CHOICE: "badge-secondary",
  TEXT: "badge-neutral",
  RATING: "badge-warning",
  BOOLEAN: "badge-success",
  LIKERT: "badge-info",
};

interface PollFormCardProps {
  pollId?: string;
  formData: PollFormData;
  onFieldChange: <K extends keyof PollFormData>(field: K, value: PollFormData[K]) => void;
  questions: LocalQuestion[];
  questionTypes: PollQuestionType[];
  onAddQuestion: (q: Omit<LocalQuestion, "_localId" | "_isNew" | "_isDeleted" | "order">) => void;
  onUpdateQuestion: (localId: string, q: Omit<LocalQuestion, "_localId" | "_isNew" | "_isDeleted" | "order">) => void;
  onDeleteQuestion: (localId: string) => void;
  onMoveQuestion: (localId: string, dir: "up" | "down") => void;
  onSave: (publish: boolean) => void;
  saveLoading: boolean;
  saveError: string | null;
}

export const PollFormCard = ({
  pollId,
  formData,
  onFieldChange,
  questions,
  questionTypes,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onMoveQuestion,
  onSave,
  saveLoading,
  saveError,
}: PollFormCardProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);

  const activeQuestions = questions
    .filter((q) => !q._isDeleted)
    .sort((a, b) => a.order - b.order);

  const handleSaveNew = (q: Omit<LocalQuestion, "_localId" | "_isNew" | "_isDeleted" | "order">) => {
    onAddQuestion(q);
    setShowAddPanel(false);
  };

  const handleSaveEdit = (localId: string, q: Omit<LocalQuestion, "_localId" | "_isNew" | "_isDeleted" | "order">) => {
    onUpdateQuestion(localId, q);
    setEditingId(null);
  };

  return (
    <div className="card card-border bg-base-100 shadow-xl">
      <div className="card-body">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-warning/10">
            <span className="iconify lucide--bar-chart-2 size-6 text-warning"></span>
          </div>
          <div>
            <h3 className="card-title text-xl text-base-content">
              {pollId ? "Edición de Encuesta" : "Crear Nueva Encuesta"}
            </h3>
            <p className="text-sm text-base-content/60">
              {pollId
                ? "Edita la información y preguntas de tu encuesta"
                : "Configura los datos de la encuesta y agrega las preguntas"}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Título */}
          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend flex items-center gap-2">
              <span className="iconify lucide--type size-4"></span>
              Título de la encuesta
            </legend>
            <label className="input input-warning w-full">
              <span className="iconify lucide--edit-3 text-base-content/60 size-5"></span>
              <input
                className="grow w-full"
                type="text"
                placeholder="Ej: Encuesta de satisfacción, Sondeo de opinión..."
                value={formData.title}
                onChange={(e) => onFieldChange("title", e.target.value)}
              />
            </label>
            <p className="fieldset-label">* Campo requerido</p>
          </fieldset>

          {/* Descripción */}
          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend flex items-center gap-2">
              <span className="iconify lucide--file-text size-4"></span>
              Descripción
            </legend>
            <textarea
              className="textarea textarea-warning w-full resize-none"
              rows={3}
              placeholder="Describe el propósito de la encuesta (opcional)"
              value={formData.description}
              onChange={(e) => onFieldChange("description", e.target.value)}
            />
            <p className="fieldset-label">Instrucciones o contexto para los destinatarios</p>
          </fieldset>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <fieldset className="fieldset">
              <legend className="fieldset-legend flex items-center gap-2">
                <span className="iconify lucide--calendar size-4"></span>
                Fecha y hora de inicio
              </legend>
              <label className="input input-warning w-full">
                <span className="iconify lucide--calendar-days text-base-content/60 size-5"></span>
                <input
                  className="grow"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => onFieldChange("startDate", e.target.value)}
                />
              </label>
              <p className="fieldset-label">Cuándo abre la encuesta</p>
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend flex items-center gap-2">
                <span className="iconify lucide--calendar-x size-4"></span>
                Fecha y hora de cierre
              </legend>
              <label className="input input-warning w-full">
                <span className="iconify lucide--calendar-clock text-base-content/60 size-5"></span>
                <input
                  className="grow"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => onFieldChange("endDate", e.target.value)}
                />
              </label>
              <p className="fieldset-label">Cuándo cierra la encuesta</p>
            </fieldset>
          </div>

          {/* Estado + Anónima */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <fieldset className="fieldset">
              <legend className="fieldset-legend flex items-center gap-2">
                <span className="iconify lucide--activity size-4"></span>
                Estado
              </legend>
              <select
                className="select select-warning w-full"
                value={formData.status}
                onChange={(e) => onFieldChange("status", e.target.value)}
              >
                <option value="DRAFT">Borrador</option>
                <option value="PUBLISHED">Publicado</option>
                <option value="CLOSED">Cerrado</option>
              </select>
              <p className="fieldset-label">Visibilidad actual de la encuesta</p>
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend flex items-center gap-2">
                <span className="iconify lucide--eye-off size-4"></span>
                Encuesta anónima
              </legend>
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-warning"
                  checked={formData.anonymous}
                  onChange={(e) => onFieldChange("anonymous", e.target.checked)}
                />
                <span className="label-text">Las respuestas no se atribuyen a personas</span>
              </label>
            </fieldset>
          </div>

          {/* Preguntas */}
          <div className="bg-warning/5 border border-warning/20 rounded-xl p-5 space-y-4">
            <h4 className="font-medium text-base-content flex items-center gap-2">
              <span className="iconify lucide--list-plus size-4 text-warning"></span>
              Preguntas
              {activeQuestions.length > 0 && (
                <span className="badge badge-warning badge-sm">{activeQuestions.length}</span>
              )}
            </h4>

            {activeQuestions.length === 0 && !showAddPanel && (
              <div className="text-center py-10 border-2 border-dashed border-warning/30 rounded-xl">
                <span className="iconify lucide--list-plus size-12 text-base-content/20 mb-3"></span>
                <p className="text-base-content/50 text-sm">No hay preguntas aún. Agrega la primera.</p>
              </div>
            )}

            {activeQuestions.map((q, idx) => {
              const typeLabel = TYPE_LABELS[q.question_type_code] ?? q.question_type_code;
              const typeColor = TYPE_COLORS[q.question_type_code] ?? "badge-neutral";
              const isEditing = editingId === q._localId;

              return (
                <div key={q._localId}>
                  {isEditing ? (
                    <QuestionFormPanel
                      questionTypes={questionTypes}
                      initial={q}
                      onSave={(data) => handleSaveEdit(q._localId, data)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div className="card bg-base-100 border border-base-300">
                      <div className="card-body py-3 px-4">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center gap-1 pt-1">
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs btn-circle"
                              onClick={() => onMoveQuestion(q._localId, "up")}
                              disabled={idx === 0}
                            >
                              <span className="iconify lucide--chevron-up size-4"></span>
                            </button>
                            <span className="text-sm font-bold text-base-content/50">{idx + 1}</span>
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs btn-circle"
                              onClick={() => onMoveQuestion(q._localId, "down")}
                              disabled={idx === activeQuestions.length - 1}
                            >
                              <span className="iconify lucide--chevron-down size-4"></span>
                            </button>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className={`badge badge-sm ${typeColor}`}>{typeLabel}</span>
                              {q.required && (
                                <span className="badge badge-sm badge-error">Obligatoria</span>
                              )}
                            </div>
                            <p className="font-medium">{q.text}</p>
                            {q.description && (
                              <p className="text-sm text-base-content/60">{q.description}</p>
                            )}
                            {q.options.length > 0 && (
                              <ul className="mt-1 space-y-0.5">
                                {q.options.slice(0, 4).map((o, i) => (
                                  <li key={i} className="text-xs text-base-content/60 flex gap-1">
                                    <span className="text-base-content/30">•</span> {o.text}
                                  </li>
                                ))}
                                {q.options.length > 4 && (
                                  <li className="text-xs text-base-content/40">+{q.options.length - 4} más</li>
                                )}
                              </ul>
                            )}
                            {q.question_type_code === "RATING" && (
                              <p className="text-xs text-base-content/50 mt-1">
                                Rango: {q.min_value ?? 1} – {q.max_value ?? 5}
                              </p>
                            )}
                            {q.question_type_code === "TEXT" && q.max_length !== null && (
                              <p className="text-xs text-base-content/50 mt-1">Máx. {q.max_length} caracteres</p>
                            )}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs"
                              title="Editar"
                              onClick={() => { setEditingId(q._localId); setShowAddPanel(false); }}
                            >
                              <span className="iconify lucide--pencil size-4"></span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs text-error"
                              title="Eliminar"
                              onClick={() => onDeleteQuestion(q._localId)}
                            >
                              <span className="iconify lucide--trash-2 size-4"></span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {showAddPanel && !editingId && (
              <QuestionFormPanel
                questionTypes={questionTypes}
                onSave={handleSaveNew}
                onCancel={() => setShowAddPanel(false)}
              />
            )}

            {!showAddPanel && !editingId && (
              <button
                type="button"
                className="btn btn-outline btn-warning w-full gap-2"
                onClick={() => setShowAddPanel(true)}
              >
                <span className="iconify lucide--plus size-4"></span>
                Agregar pregunta
              </button>
            )}
          </div>
        </div>

        {saveError && (
          <div className="alert alert-error shadow-lg mt-6">
            <span className="iconify lucide--alert-circle size-6"></span>
            <div>
              <h3 className="font-bold">Error de validación</h3>
              <div className="text-sm">{saveError}</div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-base-300">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => onSave(false)}
            disabled={saveLoading || activeQuestions.length === 0}
          >
            {saveLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <span className="iconify lucide--save size-4"></span>
            )}
            Salvar
          </button>
          <button
            type="button"
            className="btn btn-warning"
            onClick={() => onSave(true)}
            disabled={saveLoading || activeQuestions.length === 0}
          >
            {saveLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <span className="iconify lucide--send size-4"></span>
            )}
            Publicar
          </button>
        </div>
      </div>
    </div>
  );
};
