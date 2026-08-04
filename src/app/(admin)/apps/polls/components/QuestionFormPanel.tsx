"use client";

import { useState, useEffect } from "react";
import { PollQuestionType } from "@/interfaces/IPoll";
import { LocalQuestion, BOOLEAN_OPTIONS, LIKERT_OPTIONS, newLocalId } from "../hooks/usePollForm";

interface QuestionFormPanelProps {
  questionTypes: PollQuestionType[];
  initial?: LocalQuestion | null;
  onSave: (q: Omit<LocalQuestion, "_localId" | "_isNew" | "_isDeleted" | "order">) => void;
  onCancel: () => void;
}

interface OptionRow {
  _key: string;
  text: string;
}

const LOCKED_CODES = ["BOOLEAN", "LIKERT"];

const TYPE_ICONS: Record<string, string> = {
  SINGLE_CHOICE: "lucide--circle-dot",
  MULTIPLE_CHOICE: "lucide--check-square",
  TEXT: "lucide--text-cursor-input",
  RATING: "lucide--star",
  BOOLEAN: "lucide--toggle-left",
  LIKERT: "lucide--bar-chart-horizontal",
};

const TYPE_COLORS: Record<string, string> = {
  SINGLE_CHOICE: "badge-primary",
  MULTIPLE_CHOICE: "badge-secondary",
  TEXT: "badge-neutral",
  RATING: "badge-warning",
  BOOLEAN: "badge-success",
  LIKERT: "badge-info",
};

export const QuestionFormPanel = ({
  questionTypes,
  initial,
  onSave,
  onCancel,
}: QuestionFormPanelProps) => {
  const [typeId, setTypeId] = useState<number>(initial?.question_type_id ?? (questionTypes[0]?.id ?? 0));
  const [text, setText] = useState(initial?.text ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [required, setRequired] = useState(initial?.required ?? false);
  const [minValue, setMinValue] = useState<string>(
    initial?.min_value != null ? String(initial.min_value) : "1"
  );
  const [maxValue, setMaxValue] = useState<string>(
    initial?.max_value != null ? String(initial.max_value) : "5"
  );
  const [maxLength, setMaxLength] = useState<string>(
    initial?.max_length != null ? String(initial.max_length) : "500"
  );
  const [options, setOptions] = useState<OptionRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const selectedType = questionTypes.find((t) => t.id === typeId);
  const typeCode = selectedType?.code ?? "";
  const isLocked = LOCKED_CODES.includes(typeCode);

  useEffect(() => {
    if (typeCode === "BOOLEAN") {
      setOptions(BOOLEAN_OPTIONS.map((o) => ({ _key: newLocalId(), text: o.text })));
    } else if (typeCode === "LIKERT") {
      setOptions(LIKERT_OPTIONS.map((o) => ({ _key: newLocalId(), text: o.text })));
    } else if (selectedType?.has_options) {
      if (initial && initial.question_type_code === typeCode) {
        setOptions(initial.options.map((o) => ({ _key: newLocalId(), text: o.text })));
      } else {
        setOptions([{ _key: newLocalId(), text: "" }]);
      }
    } else {
      setOptions([]);
    }
  }, [typeCode]);

  const addOption = () =>
    setOptions((prev) => [...prev, { _key: newLocalId(), text: "" }]);

  const updateOption = (key: string, value: string) =>
    setOptions((prev) => prev.map((o) => (o._key === key ? { ...o, text: value } : o)));

  const removeOption = (key: string) =>
    setOptions((prev) => prev.filter((o) => o._key !== key));

  const handleSubmit = () => {
    setError(null);
    if (!text.trim()) {
      setError("El texto de la pregunta es requerido");
      return;
    }
    if (!typeId) {
      setError("Selecciona un tipo de pregunta");
      return;
    }
    if (selectedType?.has_options) {
      const nonEmpty = options.filter((o) => o.text.trim());
      if (nonEmpty.length === 0) {
        setError("Agrega al menos una opción");
        return;
      }
    }

    onSave({
      id: initial?.id,
      question_type_id: typeId,
      question_type_code: typeCode,
      text: text.trim(),
      description: description.trim(),
      required,
      min_value: typeCode === "RATING" ? (parseInt(minValue) || 1) : null,
      max_value: typeCode === "RATING" ? (parseInt(maxValue) || 5) : null,
      max_length: typeCode === "TEXT" ? (parseInt(maxLength) || 500) : null,
      options: options
        .filter((o) => o.text.trim())
        .map((o, i) => ({ text: o.text.trim(), order: i })),
    });
  };

  return (
    <div className="card bg-base-100 border border-warning/40 shadow-sm">
      <div className="card-body gap-0 p-5">
        {/* Panel header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-warning/10">
            <span className={`iconify size-5 text-warning ${TYPE_ICONS[typeCode] ?? "lucide--help-circle"}`}></span>
          </div>
          <div>
            <h4 className="font-semibold text-base-content">
              {initial ? "Editar pregunta" : "Nueva pregunta"}
            </h4>
            <p className="text-xs text-base-content/50">
              Configura el tipo, enunciado y opciones
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Tipo de pregunta */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend flex items-center gap-2">
              <span className="iconify lucide--layers size-4"></span>
              Tipo de pregunta
            </legend>
            <div className="flex items-center gap-3">
              <select
                className="select select-warning flex-1"
                value={typeId}
                onChange={(e) => setTypeId(Number(e.target.value))}
              >
                {questionTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {typeCode && (
                <span className={`badge ${TYPE_COLORS[typeCode] ?? "badge-neutral"} badge-sm whitespace-nowrap`}>
                  {typeCode}
                </span>
              )}
            </div>
            <p className="fieldset-label">Determina cómo responderá el destinatario</p>
          </fieldset>

          {/* Texto de la pregunta */}
          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend flex items-center gap-2">
              <span className="iconify lucide--message-square size-4"></span>
              Enunciado de la pregunta
            </legend>
            <label className="input input-warning w-full">
              <span className="iconify lucide--edit-3 text-base-content/60 size-5"></span>
              <input
                className="grow w-full"
                type="text"
                placeholder="Escribe tu pregunta aquí..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </label>
            <p className="fieldset-label">* Campo requerido</p>
          </fieldset>

          {/* Descripción */}
          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend flex items-center gap-2">
              <span className="iconify lucide--align-left size-4"></span>
              Descripción adicional
            </legend>
            <textarea
              className="textarea textarea-warning w-full resize-none"
              rows={2}
              placeholder="Instrucción o contexto opcional para el destinatario"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="fieldset-label">Se mostrará debajo del enunciado</p>
          </fieldset>

          {/* TEXT: max_length */}
          {typeCode === "TEXT" && (
            <fieldset className="fieldset">
              <legend className="fieldset-legend flex items-center gap-2">
                <span className="iconify lucide--letter-text size-4"></span>
                Máximo de caracteres
              </legend>
              <label className="input input-warning w-40">
                <span className="iconify lucide--hash text-base-content/60 size-5"></span>
                <input
                  className="grow"
                  type="number"
                  min={1}
                  value={maxLength}
                  onChange={(e) => setMaxLength(e.target.value)}
                />
              </label>
              <p className="fieldset-label">Límite de extensión de la respuesta</p>
            </fieldset>
          )}

          {/* RATING: min / max */}
          {typeCode === "RATING" && (
            <div className="grid grid-cols-2 gap-4">
              <fieldset className="fieldset">
                <legend className="fieldset-legend flex items-center gap-2">
                  <span className="iconify lucide--arrow-down-to-line size-4"></span>
                  Valor mínimo
                </legend>
                <label className="input input-warning w-full">
                  <span className="iconify lucide--minus text-base-content/60 size-5"></span>
                  <input
                    className="grow"
                    type="number"
                    value={minValue}
                    onChange={(e) => setMinValue(e.target.value)}
                  />
                </label>
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend flex items-center gap-2">
                  <span className="iconify lucide--arrow-up-to-line size-4"></span>
                  Valor máximo
                </legend>
                <label className="input input-warning w-full">
                  <span className="iconify lucide--plus text-base-content/60 size-5"></span>
                  <input
                    className="grow"
                    type="number"
                    value={maxValue}
                    onChange={(e) => setMaxValue(e.target.value)}
                  />
                </label>
              </fieldset>
            </div>
          )}

          {/* Options */}
          {selectedType?.has_options && (
            <div className="bg-base-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-sm flex items-center gap-2">
                  <span className="iconify lucide--list size-4 text-warning"></span>
                  Opciones de respuesta
                  {isLocked && (
                    <span className="badge badge-ghost badge-xs">predefinidas</span>
                  )}
                </h5>
              </div>

              {typeCode === "LIKERT" && (
                <div className="flex justify-between text-xs text-base-content/50 px-1 pb-1 border-b border-base-300">
                  <span>{options[0]?.text}</span>
                  <span className="text-base-content/30">···</span>
                  <span>{options[options.length - 1]?.text}</span>
                </div>
              )}

              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={opt._key} className="flex items-center gap-2">
                    <span className="text-xs text-base-content/40 w-5 text-right shrink-0">{idx + 1}.</span>
                    {isLocked ? (
                      <div className="input input-sm input-bordered flex-1 bg-base-100/50 text-base-content/60 cursor-default select-none">
                        {opt.text}
                      </div>
                    ) : (
                      <label className="input input-sm input-warning flex-1">
                        <input
                          type="text"
                          className="grow"
                          value={opt.text}
                          onChange={(e) => updateOption(opt._key, e.target.value)}
                          placeholder={`Opción ${idx + 1}`}
                        />
                      </label>
                    )}
                    {!isLocked && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs btn-circle text-error"
                        onClick={() => removeOption(opt._key)}
                        disabled={options.length <= 1}
                      >
                        <span className="iconify lucide--x size-4"></span>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {!isLocked && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm gap-1 text-warning"
                  onClick={addOption}
                >
                  <span className="iconify lucide--plus size-4"></span>
                  Agregar opción
                </button>
              )}
            </div>
          )}

          {/* Obligatoria */}
          <div className="form-control bg-base-200 rounded-lg p-3">
            <label className="label cursor-pointer flex">
              <div className="flex items-center gap-3">
                <span className="iconify lucide--asterisk size-5 text-warning"></span>
                <div>
                  <span className="label-text font-medium">Respuesta obligatoria</span>
                  <div className="text-xs text-base-content/60">El destinatario no podrá omitir esta pregunta</div>
                </div>
              </div>
              <input
                type="checkbox"
                className="checkbox checkbox-warning"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
              />
            </label>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error py-2 mt-4">
            <span className="iconify lucide--alert-circle size-4"></span>
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-base-300">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="btn btn-warning" onClick={handleSubmit}>
            <span className="iconify lucide--check size-4"></span>
            {initial ? "Guardar cambios" : "Agregar pregunta"}
          </button>
        </div>
      </div>
    </div>
  );
};
